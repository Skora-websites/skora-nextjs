'use server';

import crypto from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { logAudit } from '@/lib/audit';
import { connectDB } from '@/lib/db/db';
import {
  Tenant, User, UserDocument, Attendance, LeaveRequest, Project, Task, Timesheet, Payroll,
  SuperAdminSettings, HRAdminSettings, ManagerSettings, EmployeeSettings
} from '@/lib/db/models';
import { isWithinGeofence } from '@/lib/utils/geofence';
import { evaluatePunchStatus, calculateOvertimeHours, calculateEffectiveWorkHours, getEscalationTargetRole } from '@/lib/utils/attendance-rules';
import { auth } from '@/lib/auth';
import { getAdminAuth } from '@/lib/firebase-admin';
import { usersService } from '@/lib/firestore';
import { hashPassword } from '@/lib/security';
import { stripSecrets } from '@/lib/secret-strip';
import { requireSession, type ActingUser } from '@/lib/auth-server';
import { tenantFilter, withTenant } from '@/lib/tenant';
import { assertRole, assertSelfOrManagerOrHR, assertTenant } from '@/lib/guards';
import { notify } from '@/lib/notifications';
import {
  CreateEmployeeSchema, CreateProjectSchema, CreateTaskSchema,
  SubmitLeaveRequestSchema, ReviewLeaveRequestSchema,
  RunPayrollSchema, RequestRegularizationSchema, LogTimesheetSchema,
  formDataToObject,
} from '@/lib/validation';
import mongoose from 'mongoose';

// ── Helper: map Firebase/custom-claim roles to HRMS MongoDB roles ──
function mapFirebaseRoleToHRMS(role?: string | null): 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE' {
  const norm = (role || '').toUpperCase();
  if (norm === 'SUPER_ADMIN' || norm === 'SUPERADMIN' || norm === 'SUPER_ADMINISTRATOR') return 'SUPER_ADMIN';
  if (norm === 'HR_ADMIN' || norm === 'HRADMIN' || norm === 'ADMIN') return 'HR_ADMIN';
  if (norm === 'MANAGER') return 'MANAGER';
  return 'EMPLOYEE';
}

// Connect to DB cleanly without seeding fake data
export async function initHRMSSystem() {
  await connectDB();
  return { success: true };
}

// Reset all HRMS data to complete zero for clean start
// SECURITY: SUPER_ADMIN only. Previously callable by anyone.
export async function resetAllHRMSDataToZero() {
  await assertRole(["SUPER_ADMIN"]);
  await connectDB();
  await Tenant.deleteMany({});
  await User.deleteMany({});
  await Attendance.deleteMany({});
  await UserDocument.deleteMany({});
  await LeaveRequest.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  await Timesheet.deleteMany({});
  await Payroll.deleteMany({});
  await SuperAdminSettings.deleteMany({});
  await HRAdminSettings.deleteMany({});
  await ManagerSettings.deleteMany({});
  await EmployeeSettings.deleteMany({});
  return { success: true, message: "All HRMS data wiped clean to 0." };
}

// Register user in MongoDB
// SECURITY: SUPER_ADMIN only. Previously any visitor could call this and,
// because the first registered user becomes SUPER_ADMIN, an unauthenticated
// caller could probe an empty User collection to elevate themselves.
export async function registerHRMSUser(formData: {
  name: string;
  email: string;
  password: string;
  role?: 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
}) {
  await assertRole(["SUPER_ADMIN"]);
  await connectDB();
  const email = formData.email.toLowerCase().trim();
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new Error('An account with this email already exists');
  }

  const existingCount = await User.countDocuments();
  // First user is always Super Admin
  const role = existingCount === 0 ? 'SUPER_ADMIN' : (formData.role || 'SUPER_ADMIN');

  const user = await User.create({
    name: formData.name,
    email,
    password: hashPassword(String(formData.password)),
    role,
    department: role === 'SUPER_ADMIN' ? 'Executive Board' : 'General',
    onboardingStatus: 'VERIFIED',
    baseSalary: 0
  });

  return {
    success: true,
    user: JSON.parse(JSON.stringify(user)),
    role
  };
}

// Create Tenant and assign HR Admin (Executed by Super Admin)
export async function createTenantWithHRAdmin(data: {
  // SECURITY: SUPER_ADMIN only.
  name: string;
  domain: string;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  hrAdminName: string;
  hrAdminEmail: string;
  hrAdminPassword?: string;
  hrAdminSalary?: number;
}) {
  await assertRole(['SUPER_ADMIN']);
  await connectDB();
  
  const tenant = await Tenant.create({
    name: data.name,
    domain: data.domain.toLowerCase().trim(),
    officeCoordinates: {
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      radiusMeters: Number(data.radiusMeters) || 100
    },
    moduleToggles: {
      pmsEnabled: true,
      payrollEnabled: true,
      overtimeEnabled: true,
      geofencingEnabled: true
    }
  });

  const hrEmail = data.hrAdminEmail.toLowerCase().trim();
  // SECURITY: never use a hardcoded default. Generate a strong one-time password
  // and force a change on first login.
  const hrPassword = data.hrAdminPassword || `Tmp-${crypto.randomBytes(9).toString("base64url")}!`;
  let hrAdmin = await User.findOne({ email: hrEmail });
  if (!hrAdmin) {
    hrAdmin = await User.create({
      tenantId: tenant._id,
      name: data.hrAdminName,
      email: hrEmail,
      password: hashPassword(String(hrPassword)),
      role: 'HR_ADMIN',
      employeeCode: 'HR-0001',
      department: 'Human Resources',
      onboardingStatus: 'VERIFIED',
      baseSalary: Number(data.hrAdminSalary) || 95000,
      // SECURITY: force a password change on first login
      mustChangePassword: true,
    });
  } else {
    hrAdmin.tenantId = tenant._id;
    hrAdmin.role = 'HR_ADMIN';
    await hrAdmin.save();
  }

  // ── Provision Firebase Auth & Firestore so the HR Admin can log in ──
  try {
    let firebaseUid: string | undefined;

    // Check if a Firebase Auth user already exists for this email
    try {
      const existingFirebaseUser = await getAdminAuth().getUserByEmail(hrEmail);
      firebaseUid = existingFirebaseUser.uid;
    } catch {
      // No existing Firebase user — create one
      const firebaseUser = await getAdminAuth().createUser({
        email: hrEmail,
        password: hrPassword,
        displayName: data.hrAdminName,
      });
      firebaseUid = firebaseUser.uid;
    }

    // Set custom claims so the session includes the hr_admin role
    await getAdminAuth().setCustomUserClaims(firebaseUid, { role: 'hr_admin' });

    // Create or update Firestore user profile (login flow looks up users in Firestore by UID)
    const existingFirestoreUser = await usersService.findById(firebaseUid);
    if (!existingFirestoreUser) {
      await usersService.createWithId(firebaseUid, {
        name: data.hrAdminName,
        email: hrEmail,
        role: 'hr_admin' as any,
        status: 'active' as const,
      });
    } else {
      await usersService.update(firebaseUid, {
        role: 'hr_admin' as any,
        name: data.hrAdminName,
      });
    }

    // Store Firebase UID on the MongoDB user for reference
    if (!(hrAdmin as any).firebaseUid) {
      (hrAdmin as any).firebaseUid = firebaseUid;
      await hrAdmin.save();
    }
  } catch (firebaseErr) {
    // Don't fail the entire operation if Firebase provisioning fails —
    // log the error so it can be investigated, but the MongoDB user is still created.
    console.error('[createTenantWithHRAdmin] Firebase Auth provisioning failed:', (firebaseErr as Error).message);
  }

  tenant.hrAdminId = hrAdmin._id as any;
  await tenant.save();

  return {
    success: true,
    tenant: JSON.parse(JSON.stringify(tenant)),
    // SECURITY: never return the password hash to the client.
    hrAdmin: stripSecrets(JSON.parse(JSON.stringify(hrAdmin)))
  };
}

// Fetch all tenants — SUPER_ADMIN only.
export async function getTenantsList() {
  await assertRole(['SUPER_ADMIN']);
  await connectDB();
  const tenants = await Tenant.find().populate('hrAdminId').sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(tenants));
}

// Fetch Active User profile by Role or Email
/**
 * Get the current logged-in HRMS user from the session.
 * If called with an email, looks up that specific user.
 * Auto-provisions a MongoDB user from the Firebase session if one doesn't exist yet.
 *
 * Returns `null` when no Mongo user exists and auto-provision fails.
 * Pages MUST check for null and redirect to /hrms/login.
 */
export async function getHRMSUser(emailOrRole?: string): Promise<any | null> {
  await connectDB();

  // 1. If an explicit email is passed, look up that user directly
  if (emailOrRole && emailOrRole.includes('@')) {
    const user = await User.findOne({ email: emailOrRole.toLowerCase().trim() }).populate('tenantId reportingManagerId');
    if (user) return stripSecrets(JSON.parse(JSON.stringify(user)));
    return null;
  }

  // 2. Get the current session
  const session = await auth();
  if (!session?.user?.email) {
    return null;
  }

  const sessionEmail = session.user.email.toLowerCase().trim();
  const sessionRole = mapFirebaseRoleToHRMS(session.user.role);

  // 3. Look up MongoDB user by session email
  let user = null;
  try {
    user = await User.findOne({ email: sessionEmail }).populate('tenantId reportingManagerId').maxTimeMS(5000);
  } catch (qErr) {
    console.warn('[getHRMSUser] MongoDB query failed:', (qErr as Error).message);
    return null;
  }

  // 4. Auto-provision MongoDB user from session if not found
  if (!user) {
    try {
      const userCount = await User.countDocuments().maxTimeMS(5000);
      // SECURITY: bootstrap-to-SUPER_ADMIN must be opt-in. Without an explicit
      // env flag, the first login is provisioned as EMPLOYEE, matching the
      // /api/auth/register path.
      const allowBootstrap = process.env.REGISTER_BOOTSTRAP_SUPERADMIN === '1';
      const assignedRole =
        userCount === 0 && allowBootstrap ? 'SUPER_ADMIN' : sessionRole;
      user = await User.create({
        name: session.user.name || sessionEmail.split('@')[0],
        email: sessionEmail,
        password: hashPassword('firebase-managed-' + sessionEmail),
        role: assignedRole,
        department: assignedRole === 'SUPER_ADMIN' ? 'Executive Board' : 'General',
        onboardingStatus: 'VERIFIED',
        baseSalary: 0
      });
      user = await user.populate('tenantId reportingManagerId');
    } catch (createErr) {
      console.warn('[getHRMSUser] MongoDB auto-provision failed:', (createErr as Error).message);
      return null;
    }
  }

  // SECURITY: deactivated users must not be treated as authenticated.
  if (user && (user as any).loginStatus === false) {
    return null;
  }

  // SECURITY: never return password hash (or any other secret field) to client.
  return stripSecrets(JSON.parse(JSON.stringify(user)));
}

/**
 * Get a specific user by email (for HR Admin looking up employees, etc.)
 */
export async function getHRMSUserByEmail(email: string) {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase().trim() }).populate('tenantId reportingManagerId');
  if (!user) throw new Error(`User not found: ${email}`);
  return stripSecrets(JSON.parse(JSON.stringify(user)));
}

/**
 * Get all users (for directory, team roster, etc.)
 * Tenant-scoped: SUPER_ADMIN sees all (no tenantId), everyone else sees only their tenant.
 */
export async function getAllHRMSUsers(role?: string) {
  const { actor, filter } = await withTenant();
  const query: any = { ...filter };
  if (role) query.role = role;
  // SECURITY: HR_ADMIN and MANAGER must never see SUPER_ADMIN rows in their
  // tenant (no legitimate UI needs it, and it leaks a global-tenant account).
  if (actor.role !== 'SUPER_ADMIN') {
    query.role = query.role ? query.role : { $ne: 'SUPER_ADMIN' };
    if (typeof query.role === 'string') {
      if (query.role === 'SUPER_ADMIN') return [];
      // single other role: still fine
    } else if (query.role.$ne) {
      // already $ne: keep
    }
  }
  const users = await User.find(query).populate('tenantId reportingManagerId').sort({ name: 1 });
  return stripSecrets(JSON.parse(JSON.stringify(users)));
}

/**
 * Get today's attendance for a user (F-32: feeds GeofencedPunchWidget so it can
 * decide punch-in vs punch-out + show correct CTA).
 */
export async function getTodayAttendance(userId: string) {
  await assertSelfOrManagerOrHR(userId);
  await connectDB();
  const today = new Date().toISOString().split('T')[0];
  const a = await Attendance.findOne({ userId, date: today });
  if (!a) return null;
  return JSON.parse(JSON.stringify(a));
}

/**
 * Get the onboarding documents uploaded by a user.
 * SECURITY: HR_ADMIN+ in the same tenant, or SUPER_ADMIN. Returns the storage
 * PATH (not a URL) — the client must call /api/uploads/[id] to get a signed URL.
 */
export async function getOnboardingDocumentsForUser(userId: string) {
  const actor = await requireSession();
  if (!['HR_ADMIN', 'SUPER_ADMIN'].includes(actor.role)) {
    throw new Error('FORBIDDEN: HR_ADMIN+ only');
  }
  await connectDB();
  const target = await User.findById(userId).select('_id tenantId').lean();
  if (!target) return [];
  // Tenant guard. Global SUPER_ADMIN (no tenantId) may read any.
  if (actor.role !== 'SUPER_ADMIN' || actor.tenantId) {
    if (!actor.tenantId || String(target.tenantId) !== String(actor.tenantId)) {
      throw new Error('FORBIDDEN: cross-tenant');
    }
  }
  const docs = await UserDocument.find({ userId })
    .select('_id userId docType fileName fileUrl status uploadedAt rejectionReason')
    .sort({ uploadedAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(docs));
}

/**
 * Get users with pending onboarding (for HR Admin verification queue)
 */
export async function getPendingOnboardingUsers() {
  const { actor } = await withTenant();
  await connectDB();
  const q: any = {
    onboardingStatus: { $in: ['PENDING_REVIEW', 'PENDING_UPLOAD'] },
  };
  // Tenant scoping: HR_ADMIN sees their own tenant, SUPER_ADMIN (with tenant) too,
  // global SUPER_ADMIN sees all.
  if (actor.role !== 'SUPER_ADMIN' || actor.tenantId) {
    q.tenantId = actor.tenantId;
  }
  const users = await User.find(q).populate('tenantId reportingManagerId').sort({ createdAt: -1 });
  return stripSecrets(JSON.parse(JSON.stringify(users)));
}

/**
 * Get team members reporting to a specific manager
 */
export async function getTeamMembers(managerId: string) {
  // SECURITY: a manager can only list their own team; HR+ can list anyone's.
  const actor = await requireSession();
  if (actor.role === 'MANAGER' && actor.id !== managerId) {
    throw new Error('FORBIDDEN: not your team');
  }
  if (actor.role !== 'MANAGER' && actor.role !== 'HR_ADMIN' && actor.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN');
  }
  await connectDB();
  const q: any = { reportingManagerId: managerId };
  if (actor.tenantId) q.tenantId = actor.tenantId;
  const members = await User.find(q)
    .populate('tenantId reportingManagerId')
    .sort({ name: 1 });
  return stripSecrets(JSON.parse(JSON.stringify(members)));
}

/**
 * Create a new employee (HR Admin / Super Admin action).
 * SECURITY:
 *  - role is NOT taken from input. Server assigns EMPLOYEE.
 *  - SUPER_ADMIN may pass role: 'HR_ADMIN' | 'MANAGER' to elevate on creation.
 *  - tenantId is forced to actor's tenant (or input only for SUPER_ADMIN).
 *  - A one-time password is generated and returned ONCE so the creator can
 *    communicate it to the new user. The user must change it on first login
 *    (F-14).
 */
export async function createEmployee(data: unknown): Promise<{ success: true; user: any; employeeCode: string; temporaryPassword: string }> {
  const { actor } = await withTenant();
  const parsed = CreateEmployeeSchema.parse(data);

  await connectDB();
  const email = parsed.email;
  const existing = await User.findOne({ email });
  if (existing) throw new Error('A user with this email already exists');

  // Actor role determines the target role ceiling.
  //   SUPER_ADMIN → can create HR_ADMIN / MANAGER / EMPLOYEE (we default EMPLOYEE if not given)
  //   HR_ADMIN    → can only create MANAGER or EMPLOYEE
  //   others      → FORBIDDEN
  const allowedTargetRoles: Record<typeof actor.role, ReadonlyArray<string>> = {
    SUPER_ADMIN: ['HR_ADMIN', 'MANAGER', 'EMPLOYEE'],
    HR_ADMIN: ['MANAGER', 'EMPLOYEE'],
    MANAGER: [],
    EMPLOYEE: [],
  };
  const requestedRole = (parsed as any).role as string | undefined;
  const targetRole = (requestedRole && allowedTargetRoles[actor.role].includes(requestedRole)
    ? requestedRole
    : 'EMPLOYEE') as 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';

  // Generate a one-time password: 12 chars, mixed case + digits
  const tempPassword = `Tmp-${crypto.randomBytes(6).toString('base64url')}`;

  const count = await User.countDocuments();
  const employeeCode = `EMP-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;

  // Compute the target tenantId up front and reject cross-tenant assignment
  // BEFORE we create the row, so we never orphan a user.
  const targetTenantId = actor.role === 'SUPER_ADMIN'
    ? (parsed.tenantId || actor.tenantId)
    : actor.tenantId;
  if (actor.tenantId && targetTenantId && String(targetTenantId) !== String(actor.tenantId)) {
    throw new Error('FORBIDDEN: cross-tenant employee creation');
  }

  const user = await User.create({
    name: parsed.name,
    email,
    password: hashPassword(tempPassword),
    role: targetRole,
    department: parsed.department,
    employeeCode,
    baseSalary: parsed.baseSalary ?? 0,
    reportingManagerId: parsed.reportingManagerId || undefined,
    tenantId: targetTenantId,
    onboardingStatus: 'PENDING_UPLOAD',
    mustChangePassword: true,
  });

  // F-34 / audit: best-effort notify the new user with their temp password.
  await notify({
    to: email,
    subject: 'Welcome to Skora HRMS',
    body: `Your account is ready.\nEmployee code: ${employeeCode}\nTemporary password: ${tempPassword}\nPlease log in and change your password immediately.`,
  }).catch(() => {});

  const result = {
    success: true as const,
    // SECURITY: never return password hash to the client.
    user: stripSecrets(JSON.parse(JSON.stringify(user))),
    employeeCode,
    temporaryPassword: tempPassword,
  };
  logAudit(actor, 'createEmployee', { userId: user._id, email, targetRole, employeeCode });
  return result;
}

// ----------------------------------------------------
// 1. GEOFENCED ATTENDANCE & REGULARIZATION & OVERTIME
// ----------------------------------------------------
export async function handleGeofencedPunchIn(userId: string, userLat: number, userLng: number) {
  // SECURITY: require session + self-or-elevated. Previously any logged-in
  // user could punch anyone in by passing a different userId.
  const actor = await assertSelfOrManagerOrHR(userId);
  await connectDB();
  const user = await User.findById(userId).populate('tenantId');
  if (!user) throw new Error('User not found');
  assertTenant(actor, user, false);

  const tenant = user.tenantId as any;
  // Require real office coords. No more silent Delhi fallback that would let
  // any tenant punch pass against Skora HQ.
  if (!tenant?.officeCoordinates?.latitude || !tenant?.officeCoordinates?.longitude) {
    throw new Error('Office geofence not configured for this tenant. Contact HR.');
  }
  const officeLat = tenant.officeCoordinates.latitude;
  const officeLng = tenant.officeCoordinates.longitude;
  const maxRadius = tenant.officeCoordinates.radiusMeters || 100;

  const { isWithin, distanceMeters } = isWithinGeofence(userLat, userLng, officeLat, officeLng, maxRadius);

  if (!isWithin) {
    return {
      success: false,
      message: `Geofence violation! You are ${distanceMeters} meters away from the office. Maximum allowed radius is ${maxRadius}m.`
    };
  }

  const today = new Date().toISOString().split('T')[0];
  let attendance = await Attendance.findOne({ userId: user._id, date: today });

  // F-33: guard against double-punch-in
  if (attendance && attendance.punchIn && !attendance.punchOut) {
    return { success: false, message: 'You have already punched in today. Punch out first.' };
  }
  if (attendance && attendance.punchIn && attendance.punchOut) {
    return { success: false, message: 'Day already completed. Contact HR for adjustments.' };
  }

  const now = new Date();
  let status = evaluatePunchStatus(now);
  const escalationRole = getEscalationTargetRole(user.role);

  // Check for approved half-day leave today
  const halfDayLeave = await LeaveRequest.findOne({
    userId: user._id,
    status: 'APPROVED',
    isHalfDay: true,
    startDate: { $lte: today },
    endDate: { $gte: today }
  });
  if (halfDayLeave) {
    status = 'HALF_DAY' as any;
  }

  if (!attendance) {
    attendance = await Attendance.create({
      userId: user._id,
      tenantId: user.tenantId,
      date: today,
      punchIn: now,
      punchInLocation: { latitude: userLat, longitude: userLng, distanceMeters },
      status,
      escalationTargetRole: escalationRole
    });
  } else {
    attendance.punchIn = now;
    attendance.punchInLocation = { latitude: userLat, longitude: userLng, distanceMeters };
    attendance.status = status;
    await attendance.save();
  }

  return {
    success: true,
    message: `Punched in successfully at ${now.toLocaleTimeString()} (${status})! Geofence verified (${distanceMeters}m from office).`,
    attendance: JSON.parse(JSON.stringify(attendance))
  };
}

export async function handleGeofencedPunchOut(userId: string, userLat: number, userLng: number) {
  const actor = await assertSelfOrManagerOrHR(userId);
  await connectDB();
  const user = await User.findById(userId).populate('tenantId');
  if (!user) throw new Error('User not found');
  assertTenant(actor, user, false);

  const tenant = user.tenantId as any;
  if (!tenant?.officeCoordinates?.latitude || !tenant?.officeCoordinates?.longitude) {
    throw new Error('Office geofence not configured for this tenant. Contact HR.');
  }
  const officeLat = tenant.officeCoordinates.latitude;
  const officeLng = tenant.officeCoordinates.longitude;
  const maxRadius = tenant.officeCoordinates.radiusMeters || 100;

  const { isWithin, distanceMeters } = isWithinGeofence(userLat, userLng, officeLat, officeLng, maxRadius);

  if (!isWithin) {
    return {
      success: false,
      message: `Geofence violation! You are ${distanceMeters} meters away from the office. Maximum allowed radius is ${maxRadius}m.`
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const attendance = await Attendance.findOne({ userId: user._id, date: today });
  if (!attendance || !attendance.punchIn) {
    return { success: false, message: 'You have not punched in today yet.' };
  }
  // F-33: guard against double-punch-out
  if (attendance.punchOut) {
    return { success: false, message: 'You have already punched out today.' };
  }

  const now = new Date();
  attendance.punchOut = now;
  attendance.punchOutLocation = { latitude: userLat, longitude: userLng, distanceMeters };

  // Calculate effective work hours (auto-deducts 30min lunch if applicable)
  const effectiveHours = calculateEffectiveWorkHours(new Date(attendance.punchIn), now);
  (attendance as any).effectiveHours = effectiveHours;

  // Calculate Overtime past 7:00 PM
  const otHours = calculateOvertimeHours(now);
  if (otHours > 0) {
    attendance.overtimeHours = otHours;
    attendance.overtimeStatus = 'PENDING';
  }

  await attendance.save();

  return {
    success: true,
    message: `Punched out successfully at ${now.toLocaleTimeString()}! Effective hours: ${effectiveHours}h (30min lunch deducted).${otHours > 0 ? ` Logged ${otHours}h of Pending Overtime past 7:00 PM.` : ''}`,
    attendance: JSON.parse(JSON.stringify(attendance))
  };
}

export async function requestAttendanceRegularization(userId: string, date: string, reason: string) {
  const actor = await assertSelfOrManagerOrHR(userId);
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  assertTenant(actor, user, false);

  const escalationRole = getEscalationTargetRole(user.role);
  let attendance = await Attendance.findOne({ userId, date });

  if (!attendance) {
    attendance = await Attendance.create({
      userId,
      tenantId: user.tenantId,
      date,
      status: 'PRESENT',
      regularizationStatus: 'PENDING',
      regularizationReason: reason,
      escalationTargetRole: escalationRole
    });
  } else {
    attendance.regularizationStatus = 'PENDING';
    attendance.regularizationReason = reason;
    await attendance.save();
  }

  return { success: true, message: 'Attendance regularization requested successfully.' };
}

export async function approveRegularizationOrOvertime(input: unknown) {
  const { attendanceId, type, status } = z.object({
    attendanceId: z.string().min(1),
    type: z.enum(['REGULARIZATION', 'OVERTIME']),
    status: z.enum(['APPROVED', 'REJECTED']),
  }).parse(input);
  const { actor } = await withTenant();
  await connectDB();
  // F-20: tenant-scoped lookup
  const attendance = await Attendance.findOne({ _id: attendanceId, ...tenantFilter(actor) });
  if (!attendance) throw new Error('Attendance record not found');

  if (type === 'REGULARIZATION') {
    attendance.regularizationStatus = status;
    if (status === 'APPROVED') {
      attendance.status = 'PRESENT';
    } else {
      // REJECTED: clear stale state so the employee can re-request cleanly.
      attendance.regularizationReason = undefined;
    }
  } else {
    attendance.overtimeStatus = status;
  }
  await attendance.save();
  revalidatePath('/hrms/manager/approvals');
  logAudit(actor, 'approveRegularizationOrOvertime', { attendanceId, type, status });

  return { success: true, message: `${type} request has been ${status.toLowerCase()}.` };
}

/**
 * F-39: server-computed leave balance for a user. Uses HRAdminSettings
 * quotas and current-year APPROVED leaves.
 */
export async function getLeaveBalance(userId: string) {
  // SECURITY: self or HR+ can read another user's balance.
  await assertSelfOrManagerOrHR(userId);
  const { actor } = await withTenant();
  await connectDB();
  const user = await User.findOne({ _id: userId, ...tenantFilter(actor) });
  if (!user) throw new Error('User not found');

  const yearStart = new Date(new Date().getFullYear(), 0, 1);
  const yearEnd = new Date(new Date().getFullYear() + 1, 0, 1);
  const used = await LeaveRequest.aggregate([
    {
      $match: {
        userId: user._id,
        status: 'APPROVED',
        startDate: { $gte: yearStart.toISOString().split('T')[0] },
        endDate: { $lt: yearEnd.toISOString().split('T')[0] },
      },
    },
    { $group: { _id: '$leaveType', days: { $sum: 1 } } },
  ]);
  const usedBy: Record<string, number> = { SICK: 0, CASUAL: 0, EARNED: 0 };
  for (const u of used) usedBy[u._id] = u.days;

  const settings = await HRAdminSettings.findOne(tenantFilter(actor));
  const sickQuota = settings?.leaveAccrual?.sickLeaveQuota ?? 12;
  const casualQuota = settings?.leaveAccrual?.casualLeaveQuota ?? 12;

  return {
    sick: { used: usedBy.SICK, total: sickQuota },
    casual: { used: usedBy.CASUAL, total: casualQuota },
    earned: { used: usedBy.EARNED, total: 0 },
  };
}

/**
 * List projects visible to the actor. Manager+HR see all in tenant, employees
 * see ones where they have a task.
 */
export async function getProjects() {
  const { actor } = await withTenant();
  await connectDB();
  const projects = await Project.find(tenantFilter(actor))
    .populate('managerId', 'name email employeeCode')
    .sort({ createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(projects));
}

/**
 * List tasks visible to the actor. Manager/HR see all in tenant; employees
 * see only their own.
 */
export async function getTasks(projectId?: string) {
  const { actor } = await withTenant();
  await connectDB();
  const q: any = { ...tenantFilter(actor) };
  if (projectId) q.projectId = projectId;
  if (actor.role === 'EMPLOYEE') q.assigneeId = actor.id;
  const tasks = await Task.find(q)
    .populate('assigneeId', 'name email employeeCode')
    .populate('projectId', 'name')
    .sort({ status: 1, createdAt: -1 })
    .lean();
  return JSON.parse(JSON.stringify(tasks));
}

export async function updateTaskStatus(input: unknown) {
  const { taskId, status } = z.object({
    taskId: z.string().min(1),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']),
  }).parse(input);
  const { actor } = await withTenant();
  await connectDB();
  // Load the task first to verify the actor is allowed to change it.
  const existing = await Task.findOne({ _id: taskId, ...tenantFilter(actor) });
  if (!existing) throw new Error('Task not found');
  // Authorization: assignee, the assignee's manager, or HR_ADMIN+.
  const assignee = await User.findById(existing.assigneeId).select('reportingManagerId tenantId').lean();
  const isAssignee = String(existing.assigneeId) === String(actor.id);
  const isManager = assignee && String(assignee.reportingManagerId) === String(actor.id);
  const isHr = actor.role === 'HR_ADMIN' || actor.role === 'SUPER_ADMIN';
  if (!isAssignee && !isManager && !isHr) throw new Error('FORBIDDEN');
  const task = await Task.findOneAndUpdate(
    { _id: taskId, ...tenantFilter(actor) },
    { status },
    { new: true }
  );
  if (!task) throw new Error('Task not found');
  revalidatePath('/hrms/manager/pms');
  revalidatePath('/hrms/employee/tasks');
  return { success: true, task: JSON.parse(JSON.stringify(task)) };
}

/**
 * Manager's team timesheets. Team = employees whose reportingManagerId == actor.
 * Locked = status LOCKED_BY_MANAGER; Pending = status SUBMITTED.
 */
export async function getTeamTimesheets(managerId: string) {
  const actor = await requireSession();
  if (actor.role === 'MANAGER' && actor.id !== managerId) {
    throw new Error('FORBIDDEN: not your team');
  }
  if (actor.role !== 'MANAGER' && actor.role !== 'HR_ADMIN' && actor.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN');
  }
  await connectDB();
  const teamQ: any = { reportingManagerId: managerId };
  if (actor.tenantId) teamQ.tenantId = actor.tenantId;
  const team = await User.find(teamQ, { _id: 1 }).lean();
  const teamIds = team.map((t) => t._id);
  const rows = await Timesheet.find({ userId: { $in: teamIds } })
    .populate('userId', 'name email employeeCode')
    .populate('projectId', 'name')
    .populate('taskId', 'title')
    .sort({ date: -1 })
    .lean();
  return JSON.parse(JSON.stringify(rows));
}

/**
 * List payroll runs for the actor's tenant, newest first.
 * If month/year given, filters to that period.
 */
export async function getPayrolls(month?: number, year?: number) {
  const { actor } = await withTenant();
  await connectDB();
  const q: any = { ...tenantFilter(actor) };
  if (month) q.month = month;
  if (year) q.year = year;
  const rows = await Payroll.find(q)
    .populate('userId', 'name email employeeCode department baseSalary')
    .sort({ year: -1, month: -1, userId: 1 })
    .lean();
  return JSON.parse(JSON.stringify(rows));
}

/**
 * F-22: list pending team approvals for a manager (leaves + attendance OT/reg).
 * Used by the Manager Approvals page.
 */
export async function getPendingTeamApprovals(managerId: string) {
  const actor = await requireSession();
  if (actor.role === 'MANAGER' && actor.id !== managerId) {
    throw new Error('FORBIDDEN: not your queue');
  }
  if (actor.role !== 'MANAGER' && actor.role !== 'HR_ADMIN' && actor.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN');
  }
  await connectDB();
  const teamQ: any = { reportingManagerId: managerId };
  if (actor.tenantId) teamQ.tenantId = actor.tenantId;
  const teamMembers = await User.find(teamQ).select('_id');
  const teamUserIds = teamMembers.map(m => m._id);

  const [pendingLeaves, pendingAttendance] = await Promise.all([
    LeaveRequest.find({ userId: { $in: teamUserIds }, status: 'PENDING' })
      .populate('userId', 'name email employeeCode')
      .sort({ createdAt: -1 })
      .lean(),
    Attendance.find({
      userId: { $in: teamUserIds },
      $or: [{ regularizationStatus: 'PENDING' }, { overtimeStatus: 'PENDING' }],
    })
      .populate('userId', 'name email employeeCode')
      .sort({ date: -1 })
      .lean(),
  ]);

  return {
    leaves: JSON.parse(JSON.stringify(pendingLeaves)),
    attendance: JSON.parse(JSON.stringify(pendingAttendance)),
  };
}

// Attendance Escalation Routing Fetcher
export async function getEscalatedAttendance(targetRole: 'SUPER_ADMIN' | 'MANAGER', managerUserId?: string) {
  const actor = await requireSession();
  if (targetRole === 'SUPER_ADMIN' && actor.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN: SUPER_ADMIN view only');
  }
  if (targetRole === 'MANAGER') {
    if (actor.role !== 'MANAGER' && actor.role !== 'HR_ADMIN' && actor.role !== 'SUPER_ADMIN') {
      throw new Error('FORBIDDEN');
    }
    if (actor.role === 'MANAGER' && actor.id !== managerUserId) {
      throw new Error('FORBIDDEN: not your escalation view');
    }
  }
  await connectDB();
  
  if (targetRole === 'SUPER_ADMIN') {
    // Exclusive view of Manager and HR Admin attendance records
    const attendanceRecords = await Attendance.find({ escalationTargetRole: 'SUPER_ADMIN' })
      .populate({ path: 'userId', select: 'name email role department employeeCode' })
      .sort({ date: -1 });
    return JSON.parse(JSON.stringify(attendanceRecords));
  } else {
    // Standard Manager view of team employees
    const teamMembers = await User.find({ reportingManagerId: managerUserId });
    const teamUserIds = teamMembers.map(m => m._id);
    
    const attendanceRecords = await Attendance.find({ userId: { $in: teamUserIds } })
      .populate({ path: 'userId', select: 'name email role department employeeCode' })
      .sort({ date: -1 });
    return JSON.parse(JSON.stringify(attendanceRecords));
  }
}

// ----------------------------------------------------
// 2. ONBOARDING VERIFICATION LOOP & 48H COUNTDOWN ESCALATION
// ----------------------------------------------------
export async function uploadOnboardingDocument(userId: string, docType: 'AADHAAR' | 'PAN' | 'RESUME' | 'CERTIFICATE' | string, fileName: string, fileUrl: string) {
  // SECURITY: self for employees, HR+ for others. (Previously any caller could
  // upload a doc on behalf of any user.)
  const actor = await assertSelfOrManagerOrHR(userId);
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  assertTenant(actor, user, false);

  await UserDocument.create({
    userId,
    tenantId: user.tenantId,
    docType: docType as any,
    fileName,
    fileUrl,
    status: 'PENDING'
  });

  user.onboardingStatus = 'PENDING_REVIEW';
  await user.save();

  return { success: true, message: `${docType} document uploaded for review.` };
}

export async function reviewOnboardingDocument(userId: string, hrAdminId: string, status: 'APPROVED' | 'REJECTED', rejectionReason?: string) {
  // SECURITY: HR_ADMIN+ only, and the hrAdminId in the input MUST match the
  // session actor (no impersonation).
  const actor = await assertRole(['HR_ADMIN', 'SUPER_ADMIN']);
  if (actor.id !== hrAdminId) throw new Error('FORBIDDEN: hrAdminId must match the session user');
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  assertTenant(actor, user, false);

  if (status === 'APPROVED') {
    user.onboardingStatus = 'VERIFIED';
    if (!user.employeeCode) {
      const count = await User.countDocuments({ onboardingStatus: 'VERIFIED' });
      user.employeeCode = `EMP-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;
    }
    user.onboardingDeadline = undefined;
    await UserDocument.updateMany({ userId }, { status: 'APPROVED', verifiedBy: hrAdminId, verifiedAt: new Date() });
  } else {
    // Transition user back to PENDING_UPLOAD so they can re-upload (was: stuck
    // in REJECTED). Keep the 48h timer.
    user.onboardingStatus = 'PENDING_UPLOAD';
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 48);
    user.onboardingDeadline = deadline;
    await UserDocument.updateMany({ userId, status: 'PENDING' }, { status: 'REJECTED', rejectionReason });
  }

  await user.save();
  // Notify the employee.
  await notify({
    to: user.email,
    subject: `Onboarding ${status.toLowerCase()}`,
    body: status === 'APPROVED'
      ? `Your onboarding has been verified. Your employee code is ${user.employeeCode}.`
      : `Your onboarding was rejected. Reason: ${rejectionReason || 'not provided'}. You have 48 hours to re-upload.`,
  }).catch(() => {});
  return {
    success: true,
    message: status === 'APPROVED' ? `Employee verified & assigned code ${user.employeeCode}` : `Onboarding rejected with 48h timer set.`,
  };
}

export async function checkAndEscalateOnboardingDeadlines() {
  // SECURITY: only callable by SUPER_ADMIN (cron job uses elevated service role).
  await assertRole(['SUPER_ADMIN']);
  await connectDB();
  const now = new Date();
  const expiredUsers = await User.find({
    onboardingStatus: 'REJECTED',
    onboardingDeadline: { $lte: now }
  });

  for (const user of expiredUsers) {
    user.onboardingStatus = 'ESCALATED_SUPERADMIN';
    await user.save();
  }

  return { escalatedCount: expiredUsers.length };
}

export async function getSuperAdminEscalations() {
  await assertRole(['SUPER_ADMIN']);
  await connectDB();
  await checkAndEscalateOnboardingDeadlines();
  
  const escalatedUsers = await User.find({ onboardingStatus: 'ESCALATED_SUPERADMIN' })
    .populate('tenantId reportingManagerId');
  const documents = await UserDocument.find({ userId: { $in: escalatedUsers.map(u => u._id) } });

  return {
    users: JSON.parse(JSON.stringify(escalatedUsers)),
    documents: JSON.parse(JSON.stringify(documents))
  };
}

// ----------------------------------------------------
// 3. LEAVE REQUESTS WITH HALF-DAY TOGGLES
// ----------------------------------------------------
export async function submitLeaveRequest(data: {
  userId: string;
  leaveType: 'CASUAL' | 'SICK' | 'EARNED';
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDaySession?: 'MORNING' | 'AFTERNOON';
  reason: string;
}) {
  // SECURITY: employees can only file for themselves; HR can file for tenant members.
  const actor = await assertSelfOrManagerOrHR(data.userId);
  await connectDB();
  const user = await User.findById(data.userId);
  if (!user) throw new Error('User not found');
  assertTenant(actor, user, false);

  // Past-date guard.
  const today = new Date().toISOString().split('T')[0];
  if (data.startDate < today) throw new Error('Cannot request leave for a past date.');

  // Overlap guard: no two PENDING/APPROVED leaves for the same user in the
  // same window. The pre-check is a fast-fail; the partial unique index on
  // LeaveRequest is the actual race-safe guard (H3). Even if two requests
  // pass the pre-check simultaneously, the second `create` will fail with a
  // duplicate-key error which we map to a friendly message below.
  const overlap = await LeaveRequest.findOne({
    userId: user._id,
    status: { $in: ['PENDING', 'APPROVED'] },
    startDate: { $lte: data.endDate },
    endDate: { $gte: data.startDate },
  });
  if (overlap) throw new Error('A leave request already exists for this date range.');

  // Balance check for non-EARNED leave.
  if (data.leaveType === 'SICK' || data.leaveType === 'CASUAL') {
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
    const yearEnd = new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0];
    const used = await LeaveRequest.countDocuments({
      userId: user._id,
      status: 'APPROVED',
      leaveType: data.leaveType,
      startDate: { $gte: yearStart, $lt: yearEnd },
    });
    const settings = await HRAdminSettings.findOne(tenantFilter(actor));
    const quota = data.leaveType === 'SICK'
      ? (settings?.leaveAccrual?.sickLeaveQuota ?? 12)
      : (settings?.leaveAccrual?.casualLeaveQuota ?? 12);
    if (used >= quota) throw new Error(`${data.leaveType} leave quota (${quota}) exhausted for this year.`);
  }

  const approverRole = getEscalationTargetRole(user.role);

  let leave: any;
  try {
    leave = await LeaveRequest.create({
      userId: user._id,
      tenantId: user.tenantId,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      isHalfDay: data.isHalfDay,
      halfDaySession: data.halfDaySession,
      reason: data.reason,
      approverRole,
      status: 'PENDING'
    });
  } catch (err) {
    // H3: the partial unique index on (userId, startDate, endDate) for
    // PENDING/APPROVED leaves caught a race. Map dup-key to the same
    // friendly error the pre-check would have produced.
    if (err instanceof Error && /duplicate key/i.test(err.message)) {
      throw new Error('A leave request already exists for this date range.');
    }
    throw err;
  }

  return { success: true, message: 'Leave request submitted.', leave: JSON.parse(JSON.stringify(leave)) };
}

export async function reviewLeaveRequest(input: unknown) {
  const { leaveId, status } = ReviewLeaveRequestSchema.parse(input);
  const { actor } = await withTenant();

  await connectDB();
  const leave = await LeaveRequest.findOne({ _id: leaveId, ...tenantFilter(actor) });
  if (!leave) throw new Error('Leave request not found');

  // Authorization: the actor must match the leave's approverRole.
  //   approverRole='MANAGER'    → actor must be the requester's reporting manager or HR_ADMIN
  //   approverRole='HR_ADMIN'   → actor must be HR_ADMIN or SUPER_ADMIN
  //   approverRole='SUPER_ADMIN'→ actor must be SUPER_ADMIN
  const requester = await User.findById(leave.userId).select('reportingManagerId email name').lean();
  const isManagerOfRequester = requester && String(requester.reportingManagerId) === String(actor.id);
  const allowed =
    (leave.approverRole === 'MANAGER'    && (isManagerOfRequester || actor.role === 'HR_ADMIN' || actor.role === 'SUPER_ADMIN')) ||
    (leave.approverRole === 'HR_ADMIN'   && (actor.role === 'HR_ADMIN' || actor.role === 'SUPER_ADMIN')) ||
    (leave.approverRole === 'SUPER_ADMIN' &&  actor.role === 'SUPER_ADMIN');
  if (!allowed) throw new Error('FORBIDDEN: not the designated approver for this leave');

  leave.status = status;
  leave.approvedBy = actor.id as any;
  leave.approvedAt = new Date();
  await leave.save();
  logAudit(actor, 'reviewLeaveRequest', { leaveId, status });

  if (requester?.email) {
    await notify({
      to: requester.email,
      subject: `Leave ${status.toLowerCase()}`,
      body: `Your leave from ${leave.startDate} to ${leave.endDate} has been ${status.toLowerCase()} by ${actor.name}.`,
    }).catch(() => {});
  }

  return { success: true, message: `Leave request ${status.toLowerCase()}.` };
}

// ----------------------------------------------------
// 4. PMS PROJECTS, TASKS & TIMESHEETS
// ----------------------------------------------------
export async function createProject(data: { name: string; description?: string; clientBudget: number; managerId: string; tenantId?: string }) {
  // SECURITY: HR_ADMIN+ only, and tenantId is forced.
  const actor = await assertRole(['HR_ADMIN', 'SUPER_ADMIN']);
  const parsed = CreateProjectSchema.parse(data);
  await connectDB();
  // Verify the managerId points to a real user in this tenant with role MANAGER+.
  const mgr = await User.findById(parsed.managerId).select('role tenantId').lean();
  if (!mgr) throw new Error('Manager not found');
  if (actor.tenantId && String(mgr.tenantId) !== String(actor.tenantId)) {
    throw new Error('FORBIDDEN: manager belongs to a different tenant');
  }
  if (!['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'].includes(String(mgr.role))) {
    throw new Error('Selected user is not a manager');
  }
  const proj = await Project.create({
    name: parsed.name,
    description: parsed.description,
    clientBudget: parsed.clientBudget,
    managerId: parsed.managerId,
    tenantId: actor.tenantId ? new mongoose.Types.ObjectId(actor.tenantId) : undefined,
  });
  return { success: true, project: JSON.parse(JSON.stringify(proj)) };
}

export async function createTask(data: { projectId: string; title: string; description?: string; assigneeId: string; estimatedHours: number }) {
  // SECURITY: gate to HR_ADMIN+ and tenant-scope both project and assignee.
  const actor = await assertRole(['HR_ADMIN', 'SUPER_ADMIN']);
  const parsed = CreateTaskSchema.parse(data);
  await connectDB();
  const [project, assignee] = await Promise.all([
    Project.findById(parsed.projectId).select('tenantId').lean(),
    User.findById(parsed.assigneeId).select('tenantId role').lean(),
  ]);
  if (!project) throw new Error('Project not found');
  if (!assignee) throw new Error('Assignee not found');
  if (actor.tenantId) {
    if (String(project.tenantId) !== String(actor.tenantId)) throw new Error('FORBIDDEN: cross-tenant project');
    if (String(assignee.tenantId) !== String(actor.tenantId)) throw new Error('FORBIDDEN: cross-tenant assignee');
  }
  const task = await Task.create({
    projectId: parsed.projectId,
    title: parsed.title,
    description: parsed.description,
    assigneeId: parsed.assigneeId,
    estimatedHours: parsed.estimatedHours ?? 0,
    status: 'TODO',
    loggedHours: 0,
    tenantId: actor.tenantId ? new mongoose.Types.ObjectId(actor.tenantId) : (project.tenantId as any),
  });
  return { success: true, task: JSON.parse(JSON.stringify(task)) };
}

export async function toggleTaskTimer(taskId: string) {
  // SECURITY: require session and that the actor owns (or can manage) the task.
  const actor = await requireSession();
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');
  assertTenant(actor, task, false);
  const isAssignee = String(task.assigneeId) === String(actor.id);
  if (!isAssignee && actor.role !== 'HR_ADMIN' && actor.role !== 'SUPER_ADMIN') {
    // managers can only manipulate their own direct reports' timers
    const assignee = await User.findById(task.assigneeId).select('reportingManagerId').lean();
    if (!assignee || String(assignee.reportingManagerId) !== String(actor.id)) {
      throw new Error('FORBIDDEN');
    }
  }

  if (!task.timerActive) {
    task.timerActive = true;
    task.timerStartedAt = new Date();
  } else {
    if (task.timerStartedAt) {
      const elapsedMs = new Date().getTime() - new Date(task.timerStartedAt).getTime();
      const elapsedHours = Math.round((elapsedMs / (1000 * 60 * 60)) * 10) / 10;
      task.loggedHours += Math.max(0.1, elapsedHours);
      // F-42: stop = also create an auditable Timesheet row
      await Timesheet.create({
        userId: task.assigneeId,
        projectId: task.projectId,
        taskId: task._id,
        tenantId: task.tenantId,
        date: new Date().toISOString().split('T')[0],
        hours: Math.max(0.1, elapsedHours),
        description: 'Auto-logged from task timer stop',
        status: 'SUBMITTED',
      });
    }
    task.timerActive = false;
    task.timerStartedAt = undefined;
  }
  await task.save();
  return { success: true, task: JSON.parse(JSON.stringify(task)) };
}

export async function logTimesheet(data: { userId: string; projectId: string; taskId: string; hours: number; description: string }) {
  // SECURITY: caller must be the user (or their manager / HR). Hard-cap hours.
  const parsed = LogTimesheetSchema.parse(data);
  const actor = await assertSelfOrManagerOrHR(parsed.userId);
  await connectDB();
  // Verify the task is assigned to this user and the task belongs to the project.
  const task = await Task.findById(parsed.taskId).select('assigneeId projectId tenantId').lean();
  if (!task) throw new Error('Task not found');
  if (String(task.projectId) !== String(parsed.projectId)) {
    throw new Error('Task does not belong to the specified project');
  }
  if (String(task.assigneeId) !== String(parsed.userId)) {
    throw new Error('Task is not assigned to that user');
  }
  assertTenant(actor, task, false);

  const today = new Date().toISOString().split('T')[0];

  const ts = await Timesheet.create({
    userId: parsed.userId,
    projectId: parsed.projectId,
    taskId: parsed.taskId,
    tenantId: (task as any).tenantId,
    date: today,
    hours: parsed.hours,
    description: parsed.description,
    status: 'SUBMITTED'
  });

  // Update the task's loggedHours (still scoped to that task).
  await Task.updateOne({ _id: parsed.taskId }, { $inc: { loggedHours: parsed.hours } });

  return { success: true, timesheet: JSON.parse(JSON.stringify(ts)) };
}

export async function lockTimesheetsByManager(timesheetIds: string[]) {
  // SECURITY: manager/HR only, and the rows must belong to the actor's team/tenant.
  const actor = await assertRole(['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN']);
  await connectDB();
  if (!Array.isArray(timesheetIds) || timesheetIds.length === 0) {
    return { success: true, message: '0 timesheets locked.' };
  }
  // Fetch the targets to verify ownership before mutating.
  const targets = await Timesheet.find({ _id: { $in: timesheetIds } })
    .select('_id userId tenantId status')
    .lean();
  if (actor.role === 'MANAGER') {
    const team = await User.find({ reportingManagerId: actor.id }).select('_id').lean();
    const teamIds = new Set(team.map((m) => String(m._id)));
    for (const t of targets) {
      if (!teamIds.has(String(t.userId))) throw new Error('FORBIDDEN: timesheet not in your team');
    }
  } else {
    // HR_ADMIN+ must match tenant
    for (const t of targets) {
      if (actor.tenantId && String(t.tenantId) !== String(actor.tenantId)) {
        throw new Error('FORBIDDEN: cross-tenant timesheet');
      }
    }
  }
  const result = await Timesheet.updateMany(
    { _id: { $in: timesheetIds }, status: 'SUBMITTED' },
    { status: 'LOCKED_BY_MANAGER' }
  );
  return { success: true, message: `${result.modifiedCount} timesheets locked for HR payroll processing.` };
}

/**
 * HR approval step in the timesheet lifecycle. SUBMITTED → APPROVED_BY_HR.
 * (Previously: this enum state was dead code — see audit F-22.)
 */
export async function approveTimesheetsByHR(timesheetIds: string[]) {
  const actor = await assertRole(['HR_ADMIN', 'SUPER_ADMIN']);
  await connectDB();
  if (!Array.isArray(timesheetIds) || timesheetIds.length === 0) {
    return { success: true, message: '0 timesheets approved.' };
  }
  const result = await Timesheet.updateMany(
    { _id: { $in: timesheetIds }, status: 'LOCKED_BY_MANAGER', ...tenantFilter(actor) },
    { status: 'APPROVED_BY_HR' }
  );
  return { success: true, message: `${result.modifiedCount} timesheets approved by HR.` };
}

// ----------------------------------------------------
// 5. PAYROLL MODULE
// ----------------------------------------------------
export async function runMonthlyPayroll(input: unknown) {
  const { month, year } = RunPayrollSchema.parse(input);
  const { actor } = await withTenant();
  // SECURITY: HR_ADMIN+ only. Previously any tenant member could run payroll.
  if (actor.role !== 'HR_ADMIN' && actor.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN: HR_ADMIN+ required');
  }
  await connectDB();

  // F-20: tenant-scoped. F-18: read PF/tax rates from tenant settings.
  const settings = await HRAdminSettings.findOne(tenantFilter(actor));
  const pfRate = (settings?.payrollDeductions?.pfDeductionPercent ?? 12) / 100;
  const taxRate = (settings?.payrollDeductions?.taxRatePercent ?? 10) / 100;

  const users = await User.find({
    ...tenantFilter(actor),
    role: { $ne: 'SUPER_ADMIN' },
  });
  const payrolls: any[] = [];

  // F-25: scope OT to the pay period. We use the (year, month) as the bucket.
  const periodStart = new Date(Date.UTC(year, month - 1, 1)).toISOString().split('T')[0];
  const periodEnd = new Date(Date.UTC(year, month, 1)).toISOString().split('T')[0];

  // H5: serialize all per-user upserts inside a single transaction so two
  // HR admins running payroll at the same instant cannot race. Without the
  // tx, each writer reads OT, computes net, and overwrites — the second
  // writer's `processedAt` wins, and OT totals can disagree.
  // Requires a Mongo replica set. Falls back gracefully on standalone.
  const session = await mongoose.startSession();
  try {
    try {
      await session.withTransaction(async () => {
        for (const u of users) {
          // F-19 + F-59: scope OT by tenant AND period, dedupe via (tenant, user, month, year) unique idx.
          const otAttendance = await Attendance.find({
            tenantId: actor.tenantId,
            userId: u._id,
            overtimeStatus: 'APPROVED',
            date: { $gte: periodStart, $lt: periodEnd },
          }).session(session);
          const otHours = otAttendance.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
          const base = u.baseSalary || 0;
          const hourlyRate = base / 160;
          const otPayout = Math.round(otHours * hourlyRate * 1.5);

          // F-18: PF = pct of base, tax = pct of base. Distinct buckets so they sum correctly.
          const pf = Math.round(base * pfRate);
          const tax = Math.round(base * taxRate);
          const deductions = pf + tax;
          const netSalary = base + otPayout - deductions;

          const p = await Payroll.findOneAndUpdate(
            { tenantId: actor.tenantId, userId: u._id, month, year },
            {
              tenantId: actor.tenantId,
              userId: u._id,
              month,
              year,
              baseSalary: base,
              overtimeHours: otHours,
              overtimePayout: otPayout,
              deductions,
              netSalary,
              status: 'PROCESSED',
              processedAt: new Date(),
            },
            { upsert: true, new: true, session }
          );
          if (p) payrolls.push(p);
        }
      });
    } catch (txErr) {
      // Standalone Mongo (no replica set) cannot run transactions. Fall back
      // to per-row upsert. The unique index on (tenant,user,month,year) still
      // serializes each row; what we lose is the cross-row atomicity.
      if (!(txErr instanceof Error) || !/Transaction numbers are only allowed|replica set|standalone/i.test(txErr.message)) {
        throw txErr;
      }
      console.warn('[runMonthlyPayroll] No replica set; running without transaction. Concurrency not guaranteed.');
      for (const u of users) {
        const otAttendance = await Attendance.find({
          tenantId: actor.tenantId,
          userId: u._id,
          overtimeStatus: 'APPROVED',
          date: { $gte: periodStart, $lt: periodEnd },
        });
        const otHours = otAttendance.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
        const base = u.baseSalary || 0;
        const hourlyRate = base / 160;
        const otPayout = Math.round(otHours * hourlyRate * 1.5);
        const pf = Math.round(base * pfRate);
        const tax = Math.round(base * taxRate);
        const deductions = pf + tax;
        const netSalary = base + otPayout - deductions;
        const p = await Payroll.findOneAndUpdate(
          { tenantId: actor.tenantId, userId: u._id, month, year },
          {
            tenantId: actor.tenantId,
            userId: u._id,
            month,
            year,
            baseSalary: base,
            overtimeHours: otHours,
            overtimePayout: otPayout,
            deductions,
            netSalary,
            status: 'PROCESSED',
            processedAt: new Date(),
          },
          { upsert: true, new: true }
        );
        if (p) payrolls.push(p);
      }
    }
  } finally {
    await session.endSession();
  }

  revalidatePath('/hrms/payroll');
  logAudit(actor, 'runMonthlyPayroll', { month, year, count: payrolls.length });
  // F-27: notify each affected employee (best-effort).
  await Promise.allSettled(
    payrolls.map((p: any) =>
      User.findById(p.userId).select('email name').lean().then((u) => {
        if (!u?.email) return;
        return notify({
          to: u.email,
          subject: `Payslip for ${month}/${year} processed`,
          body: `Your payslip for ${month}/${year} has been processed. Net salary: ₹${p.netSalary}.`,
        });
      })
    )
  );
  return { success: true, count: payrolls.length, payrolls: JSON.parse(JSON.stringify(payrolls)) };
}

/**
 * Mark a payroll run as PAID. Fills the previously-dead PAID enum state
 * (see audit F-26). Idempotent.
 */
export async function markPayrollPaid(input: { payrollId: string }) {
  const actor = await assertRole(['HR_ADMIN', 'SUPER_ADMIN']);
  const parsed = z.object({ payrollId: z.string().min(1) }).parse(input);
  await connectDB();
  const p = await Payroll.findOneAndUpdate(
    { _id: parsed.payrollId, ...tenantFilter(actor), status: 'PROCESSED' },
    { status: 'PAID', paidAt: new Date() },
    { new: true }
  );
  if (!p) throw new Error('Payroll not found or not in PROCESSED state');
  return { success: true, payroll: JSON.parse(JSON.stringify(p)) };
}

// ----------------------------------------------------
// 6. ISOLATED SETTINGS DATA API
// ----------------------------------------------------
export async function getSuperAdminSettingsData() {
  await assertRole(['SUPER_ADMIN']);
  await connectDB();
  let s = await SuperAdminSettings.findOne();
  if (!s) {
    s = await SuperAdminSettings.create({
      globalSecurityPolicy: { mfaEnforced: true, sessionTimeoutMinutes: 60 },
      apiKeys: { geolocationProviderKey: 'GEO_LIVE_99812', paymentGatewayKey: 'PAY_LIVE_00492' },
      firebaseAuthSync: { autoProvision: true, syncIntervalHours: 24 }
    });
  }
  return JSON.parse(JSON.stringify(s));
}

export async function updateSuperAdminSettingsData(data: any) {
  await assertRole(['SUPER_ADMIN']);
  await connectDB();
  // Whitelist editable fields to prevent arbitrary field injection.
  const allowed = ['globalSecurityPolicy', 'apiKeys', 'firebaseAuthSync'];
  const safe: Record<string, unknown> = {};
  for (const k of allowed) if (k in (data ?? {})) safe[k] = (data as any)[k];
  const data_ = safe;
  let s = await SuperAdminSettings.findOne();
  if (s) {
    Object.assign(s, data_);
    await s.save();
  }
  return { success: true, settings: JSON.parse(JSON.stringify(s)) };
}

export async function getHRAdminSettingsData(tenantId?: string) {
  const actor = await assertRole(['HR_ADMIN', 'SUPER_ADMIN']);
  await connectDB();
  // Tenant scoping: HR_ADMIN sees their tenant; SUPER_ADMIN may pass any.
  const query = actor.role === 'SUPER_ADMIN' && !actor.tenantId
    ? {}
    : { tenantId: actor.tenantId };
  let s = await HRAdminSettings.findOne(query);
  if (!s) {
    const tenant = await Tenant.findOne();
    s = await HRAdminSettings.create({
      tenantId: tenant?._id,
      holidayCalendar: [
        { date: '2026-01-01', name: 'New Year Day' },
        { date: '2026-08-15', name: 'Independence Day' }
      ],
      leaveAccrual: { sickLeaveQuota: 12, casualLeaveQuota: 12 },
      payrollDeductions: { taxRatePercent: 10, pfDeductionPercent: 12 }
    });
  }
  return JSON.parse(JSON.stringify(s));
}

export async function updateHRAdminSettingsData(data: any) {
  const actor = await assertRole(['HR_ADMIN', 'SUPER_ADMIN']);
  await connectDB();
  const query = actor.role === 'SUPER_ADMIN' && !actor.tenantId
    ? {}
    : { tenantId: actor.tenantId };
  // Whitelist editable fields.
  const allowed = ['holidayCalendar', 'leaveAccrual', 'payrollDeductions'];
  const safe: Record<string, unknown> = {};
  for (const k of allowed) if (k in (data ?? {})) safe[k] = (data as any)[k];
  let s = await HRAdminSettings.findOne(query);
  if (s) {
    Object.assign(s, safe);
    await s.save();
  }
  return { success: true, settings: JSON.parse(JSON.stringify(s)) };
}

export async function getManagerSettingsData(userId: string) {
  // SECURITY: self only.
  await assertSelfOrManagerOrHR(userId);
  await connectDB();
  let s = await ManagerSettings.findOne({ userId });
  if (!s) {
    s = await ManagerSettings.create({
      userId,
      overtimeNotificationsEnabled: true,
      autoTaskAssignment: false,
      metricLayout: 'KANBAN_FIRST'
    });
  }
  return JSON.parse(JSON.stringify(s));
}

export async function updateManagerSettingsData(userId: string, data: any) {
  await assertSelfOrManagerOrHR(userId);
  await connectDB();
  // Whitelist.
  const allowed = ['overtimeNotificationsEnabled', 'autoTaskAssignment', 'metricLayout'];
  const safe: Record<string, unknown> = {};
  for (const k of allowed) if (k in (data ?? {})) safe[k] = (data as any)[k];
  const s = await ManagerSettings.findOneAndUpdate({ userId }, safe, { upsert: true, new: true });
  return { success: true, settings: JSON.parse(JSON.stringify(s)) };
}

export async function getEmployeeSettingsData(userId: string) {
  await assertSelfOrManagerOrHR(userId);
  await connectDB();
  let s = await EmployeeSettings.findOne({ userId });
  if (!s) {
    s = await EmployeeSettings.create({
      userId,
      emergencyContact: { name: 'Sarah Mercer', phone: '+1 555-0192', relation: 'Spouse' },
      themePreference: 'SYSTEM'
    });
  }
  return JSON.parse(JSON.stringify(s));
}

export async function updateEmployeeSettingsData(userId: string, data: any) {
  await assertSelfOrManagerOrHR(userId);
  await connectDB();
  const allowed = ['emergencyContact', 'themePreference'];
  const safe: Record<string, unknown> = {};
  for (const k of allowed) if (k in (data ?? {})) safe[k] = (data as any)[k];
  const s = await EmployeeSettings.findOneAndUpdate({ userId }, safe, { upsert: true, new: true });
  return { success: true, settings: JSON.parse(JSON.stringify(s)) };
}

// ----------------------------------------------------
// 7. OFFER LETTER RELEASE (HR_ADMIN action)
// ----------------------------------------------------
export async function releaseOfferLetter(documentId: string) {
  const actor = await requireSession();
  await connectDB();
  const doc = await UserDocument.findById(documentId);
  if (!doc) throw new Error('Document not found');
  // Only HR_ADMIN+ may release; cross-tenant isolation enforced by tenantId match
  if (actor.role !== 'HR_ADMIN' && actor.role !== 'SUPER_ADMIN') throw new Error('FORBIDDEN');
  if (actor.tenantId && String(doc.tenantId) !== actor.tenantId) throw new Error('FORBIDDEN');

  doc.status = 'APPROVED';
  doc.verifiedAt = new Date();
  doc.verifiedBy = new mongoose.Types.ObjectId(actor.id) as any;
  await doc.save();
  return { success: true, document: JSON.parse(JSON.stringify(doc)) };
}

// ----------------------------------------------------
// 8. PROJECT MILESTONE STATUS TOGGLE
// ----------------------------------------------------
export async function toggleMilestoneStatus(taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE') {
  const actor = await requireSession();
  if (actor.role !== 'MANAGER' && actor.role !== 'HR_ADMIN' && actor.role !== 'SUPER_ADMIN') {
    throw new Error('FORBIDDEN');
  }
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');
  assertTenant(actor, task, false);
  // Manager must own the parent project (not just be "any manager in the tenant").
  if (actor.role === 'MANAGER') {
    const project = await Project.findById(task.projectId).select('managerId tenantId').lean();
    if (!project || String(project.managerId) !== String(actor.id)) {
      throw new Error('FORBIDDEN: not the project manager');
    }
  }

  task.status = newStatus;
  if (newStatus === 'DONE') {
    (task as any).completedAt = new Date();
  } else {
    (task as any).completedAt = undefined;
  }
  await task.save();
  return { success: true, task: JSON.parse(JSON.stringify(task)) };
}

// ----------------------------------------------------
// 9. CREATE TASK (Manager assigns to employee)
// ----------------------------------------------------
export async function createAssignedTask(data: {
  projectId: string;
  title: string;
  description?: string;
  assigneeId: string;
  estimatedHours?: number;
}) {
  const actor = await requireSession();
  if (actor.role === 'EMPLOYEE') throw new Error('FORBIDDEN');
  await connectDB();
  if (!data.title?.trim()) throw new Error('Title required');
  // Verify the project belongs to actor's tenant and the assignee is in the same tenant.
  const [project, assignee] = await Promise.all([
    Project.findById(data.projectId).select('tenantId managerId').lean(),
    User.findById(data.assigneeId).select('tenantId').lean(),
  ]);
  if (!project) throw new Error('Project not found');
  if (!assignee) throw new Error('Assignee not found');
  assertTenant(actor, project, false);
  if (String(assignee.tenantId) !== String(project.tenantId)) {
    throw new Error('FORBIDDEN: assignee belongs to a different tenant than the project');
  }
  if (actor.role === 'MANAGER' && String(project.managerId) !== String(actor.id)) {
    throw new Error('FORBIDDEN: not the project manager');
  }
  const task = await Task.create({
    projectId: data.projectId,
    tenantId: project.tenantId,
    title: data.title.trim(),
    description: data.description?.trim(),
    assigneeId: data.assigneeId,
    estimatedHours: data.estimatedHours || 0,
    status: 'TODO',
    loggedHours: 0,
  });
  return { success: true, task: JSON.parse(JSON.stringify(task)) };
}

// ----------------------------------------------------
// 10. REAL ONBOARDING DOCUMENT UPLOAD (used by /api/uploads)
// ----------------------------------------------------
export async function attachOnboardingDocument(
  userId: string,
  docType: string,
  objectPath: string,
  fileName: string,
  mime: string
) {
  // SECURITY (F-5): only accept server-issued storage paths from /api/uploads.
  // Never trust a client-supplied URL — verify the path lives under the
  // target user's tenant/user tree.
  const actor = await assertSelfOrManagerOrHR(userId);
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  assertTenant(actor, user, false);

  const { isOwnedPath } = await import('@/lib/uploads/path');
  const { ALLOWED_MIMES } = await import('@/lib/uploads/sniff');
  if (!isOwnedPath(objectPath, {
    tenantId: String(user.tenantId || ''),
    userId,
    namespace: 'onboarding',
  })) {
    throw new Error('FORBIDDEN: object path outside tenant namespace');
  }
  if (!ALLOWED_MIMES.has(mime as any)) {
    throw new Error('FORBIDDEN: mime not allowed');
  }

  const doc = await UserDocument.create({
    userId,
    tenantId: user.tenantId,
    docType: docType as any,
    fileName,
    fileUrl: objectPath, // store the path, not a URL; GET route signs on read
    status: 'PENDING',
  });
  user.onboardingStatus = 'PENDING_REVIEW';
  await user.save();

  const { logAudit } = await import('@/lib/audit');
  logAudit(actor, 'attach.onboarding', { userId, docType, objectPath, mime }, 'SUCCESS');

  return { success: true, document: JSON.parse(JSON.stringify(doc)) };
}

// ----------------------------------------------------
// 11. EMPLOYEE SELF-SERVICE
// ----------------------------------------------------

/** My timesheets (employee view) */
export async function getMyTimesheets(userId: string) {
  await assertSelfOrManagerOrHR(userId);
  await connectDB();
  const rows = await Timesheet.find({ userId })
    .populate('projectId', 'name')
    .populate('taskId', 'title')
    .sort({ date: -1 })
    .lean();
  return JSON.parse(JSON.stringify(rows));
}

/** My payrolls (employee view) */
export async function getMyPayrolls(userId: string) {
  await assertSelfOrManagerOrHR(userId);
  await connectDB();
  const rows = await Payroll.find({ userId })
    .sort({ year: -1, month: -1 })
    .lean();
  return JSON.parse(JSON.stringify(rows));
}

/** My attendance for the last 30 days (employee view) */
export async function getMyAttendance(userId: string) {
  await assertSelfOrManagerOrHR(userId);
  await connectDB();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceStr = since.toISOString().split('T')[0];
  const rows = await Attendance.find({ userId, date: { $gte: sinceStr } })
    .sort({ date: -1 })
    .lean();
  return JSON.parse(JSON.stringify(rows));
}

// ----------------------------------------------------
// 12. NOTIFICATIONS (navbar bell + dropdown)
// ----------------------------------------------------
// Tenant-scoped. SUPER_ADMIN without tenant sees all. HR_ADMIN/MANAGER see
// their own; EMPLOYEE sees their own. Caller is the session user, so this
// can never read someone else's mailbox.

import {
  getUserNotifications as svcGetUserNotifications,
  markAsRead as svcMarkAsRead,
} from '@/services/hrm/notifications';

/** List the current user's notifications (newest first). */
export async function listMyNotifications(limitCount: number = 5) {
  const actor = await requireSession();
  // GLOBAL SUPER_ADMIN (no tenant) may see all; otherwise always self.
  if (actor.role !== 'SUPER_ADMIN' || actor.tenantId) {
    const rows = await svcGetUserNotifications(actor.id, { limitCount });
    return rows;
  }
  // global SA: use the service for self, since notifications are user-scoped.
  return svcGetUserNotifications(actor.id, { limitCount });
}

/** Mark a single notification as read. Caller must own it. */
export async function markNotificationRead(id: string) {
  const actor = await requireSession();
  if (!id) return { success: false, error: 'id required' };
  // Defensive ownership check: the service update is unconditional, so we
  // look up the row first. Skipping the round-trip on a self-row is fine.
  const { notificationsService } = await import('@/lib/hrm/firestore');
  const existing = await notificationsService.findById(id);
  if (!existing) return { success: false, error: 'not found' };
  if (existing.userId !== actor.id) return { success: false, error: 'forbidden' };
  await svcMarkAsRead(id);
  return { success: true };
}

/** Mark every unread notification for the current user as read. */
export async function markAllMyNotificationsRead() {
  const actor = await requireSession();
  const { markAllAsRead } = await import('@/services/hrm/notifications');
  await markAllAsRead(actor.id);
  return { success: true };
}
