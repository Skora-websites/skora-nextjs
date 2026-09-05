'use server';

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

import { mapFirebaseRoleToHRMS } from '@/lib/hrms-roles';

// Connect to DB cleanly without seeding fake data
export async function initHRMSSystem() {
  await connectDB();
  return { success: true };
}

// Reset all HRMS data to complete zero for clean start
export async function resetAllHRMSDataToZero() {
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
export async function registerHRMSUser(formData: {
  name: string;
  email: string;
  password: string;
  role?: 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
}) {
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
    password: formData.password,
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
  const hrPassword = data.hrAdminPassword || 'password123';
  let hrAdmin = await User.findOne({ email: hrEmail });
  if (!hrAdmin) {
    hrAdmin = await User.create({
      tenantId: tenant._id,
      name: data.hrAdminName,
      email: hrEmail,
      password: hrPassword,
      role: 'HR_ADMIN',
      employeeCode: 'HR-0001',
      department: 'Human Resources',
      onboardingStatus: 'VERIFIED',
      baseSalary: Number(data.hrAdminSalary) || 95000
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
        role: 'hr_admin' as const,
        status: 'active' as const,
      });
    } else {
      await usersService.update(firebaseUid, {
        role: 'hr_admin' as const,
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
    hrAdmin: JSON.parse(JSON.stringify(hrAdmin))
  };
}

// Fetch all tenants
export async function getTenantsList() {
  await connectDB();
  const tenants = await Tenant.find().populate('hrAdminId').sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(tenants));
}

// Fetch Active User profile by Role or Email
/**
 * Get the current logged-in HRMS user from the session.
 * If called with an email, looks up that specific user.
 * Auto-provisions a MongoDB user from the Firebase session if one doesn't exist yet.
 */
export async function getHRMSUser(emailOrRole?: string) {
  await connectDB();

  // 1. If an explicit email is passed, look up that user directly
  if (emailOrRole && emailOrRole.includes('@')) {
    let user = await User.findOne({ email: emailOrRole.toLowerCase().trim() }).populate('tenantId reportingManagerId');
    if (user) return JSON.parse(JSON.stringify(user));
    throw new Error(`User not found: ${emailOrRole}`);
  }

  // 2. Get the current session
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('No authenticated user. Please log in again.');
  }

  const sessionEmail = session.user.email.toLowerCase().trim();
  const sessionRole = mapFirebaseRoleToHRMS(session.user.role);

  // 3. Look up MongoDB user by session email
  let user = null;
  try {
    user = await User.findOne({ email: sessionEmail }).populate('tenantId reportingManagerId').maxTimeMS(5000);
  } catch (qErr) {
    console.warn('[getHRMSUser] MongoDB query failed:', (qErr as Error).message);
  }

  // 4. Auto-provision MongoDB user from session if not found
  if (!user) {
    try {
      const userCount = await User.countDocuments().maxTimeMS(5000);
      const assignedRole = userCount === 0 ? 'SUPER_ADMIN' : sessionRole;
      user = await User.create({
        name: session.user.name || sessionEmail.split('@')[0],
        email: sessionEmail,
        password: 'firebase-managed',
        role: assignedRole,
        department: assignedRole === 'SUPER_ADMIN' ? 'Executive Board' : 'General',
        onboardingStatus: 'VERIFIED',
        baseSalary: 0
      });
      user = await user.populate('tenantId reportingManagerId');
    } catch (createErr) {
      console.warn('[getHRMSUser] MongoDB auto-provision failed:', (createErr as Error).message);
      // Return a virtual user from session data
      return {
        _id: session.user.id || 'session-user',
        name: session.user.name || sessionEmail.split('@')[0],
        email: sessionEmail,
        role: sessionRole,
        department: 'General',
        onboardingStatus: 'VERIFIED',
        baseSalary: 0,
        employeeCode: 'PENDING',
        createdAt: new Date().toISOString()
      };
    }
  }

  return JSON.parse(JSON.stringify(user));
}

/**
 * Get a specific user by email (for HR Admin looking up employees, etc.)
 */
export async function getHRMSUserByEmail(email: string) {
  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase().trim() }).populate('tenantId reportingManagerId');
  if (!user) throw new Error(`User not found: ${email}`);
  return JSON.parse(JSON.stringify(user));
}

/**
 * Get all users (for directory, team roster, etc.)
 */
export async function getAllHRMSUsers(role?: string) {
  await connectDB();
  const query: any = {};
  if (role) query.role = role;
  const users = await User.find(query).populate('tenantId reportingManagerId').sort({ name: 1 });
  return JSON.parse(JSON.stringify(users));
}

/**
 * Get users with pending onboarding (for HR Admin verification queue)
 */
export async function getPendingOnboardingUsers() {
  await connectDB();
  const users = await User.find({
    onboardingStatus: { $in: ['PENDING_REVIEW', 'PENDING_UPLOAD'] }
  }).populate('tenantId reportingManagerId').sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(users));
}

/**
 * Get team members reporting to a specific manager
 */
export async function getTeamMembers(managerId: string) {
  await connectDB();
  const members = await User.find({ reportingManagerId: managerId })
    .populate('tenantId reportingManagerId')
    .sort({ name: 1 });
  return JSON.parse(JSON.stringify(members));
}

/**
 * Create a new employee (HR Admin action)
 */
export async function createEmployee(data: {
  name: string;
  email: string;
  department: string;
  role?: 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
  baseSalary?: number;
  reportingManagerId?: string;
  tenantId?: string;
}) {
  await connectDB();
  const email = data.email.toLowerCase().trim();
  const existing = await User.findOne({ email });
  if (existing) throw new Error('A user with this email already exists');

  const count = await User.countDocuments();
  const employeeCode = `EMP-2026-${String(count + 101).padStart(4, '0')}`;

  const user = await User.create({
    name: data.name,
    email,
    password: 'pending-setup',
    role: data.role || 'EMPLOYEE',
    department: data.department,
    employeeCode,
    baseSalary: data.baseSalary || 50000,
    reportingManagerId: data.reportingManagerId || undefined,
    tenantId: data.tenantId || undefined,
    onboardingStatus: 'PENDING_UPLOAD'
  });

  return { success: true, user: JSON.parse(JSON.stringify(user)), employeeCode };
}

// ----------------------------------------------------
// 1. GEOFENCED ATTENDANCE & REGULARIZATION & OVERTIME
// ----------------------------------------------------
export async function handleGeofencedPunchIn(userId: string, userLat: number, userLng: number) {
  await connectDB();
  const user = await User.findById(userId).populate('tenantId');
  if (!user) throw new Error('User not found');

  const tenant = user.tenantId as any;
  const officeLat = tenant?.officeCoordinates?.latitude || 28.6007594;
  const officeLng = tenant?.officeCoordinates?.longitude || 77.4319307;
  const maxRadius = tenant?.officeCoordinates?.radiusMeters || 100;

  const { isWithin, distanceMeters } = isWithinGeofence(userLat, userLng, officeLat, officeLng, maxRadius);

  if (!isWithin) {
    return {
      success: false,
      message: `Geofence violation! You are ${distanceMeters} meters away from the office. Maximum allowed radius is ${maxRadius}m.`
    };
  }

  const today = new Date().toISOString().split('T')[0];
  let attendance = await Attendance.findOne({ userId: user._id, date: today });

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
  await connectDB();
  const user = await User.findById(userId).populate('tenantId');
  if (!user) throw new Error('User not found');

  const tenant = user.tenantId as any;
  const officeLat = tenant?.officeCoordinates?.latitude || 28.6007594;
  const officeLng = tenant?.officeCoordinates?.longitude || 77.4319307;
  const maxRadius = tenant?.officeCoordinates?.radiusMeters || 100;

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
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

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

export async function approveRegularizationOrOvertime(attendanceId: string, type: 'REGULARIZATION' | 'OVERTIME', status: 'APPROVED' | 'REJECTED') {
  await connectDB();
  const attendance = await Attendance.findById(attendanceId);
  if (!attendance) throw new Error('Attendance record not found');

  if (type === 'REGULARIZATION') {
    attendance.regularizationStatus = status;
    if (status === 'APPROVED') attendance.status = 'PRESENT';
  } else {
    attendance.overtimeStatus = status;
  }
  await attendance.save();

  return { success: true, message: `${type} request has been ${status.toLowerCase()}.` };
}

// Attendance Escalation Routing Fetcher
export async function getEscalatedAttendance(targetRole: 'SUPER_ADMIN' | 'MANAGER', managerUserId?: string) {
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
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

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
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (status === 'APPROVED') {
    user.onboardingStatus = 'VERIFIED';
    if (!user.employeeCode) {
      const count = await User.countDocuments({ onboardingStatus: 'VERIFIED' });
      user.employeeCode = `EMP-2026-${String(count + 101).padStart(4, '0')}`;
    }
    user.onboardingDeadline = undefined;
    await UserDocument.updateMany({ userId }, { status: 'APPROVED', verifiedBy: hrAdminId, verifiedAt: new Date() });
  } else {
    user.onboardingStatus = 'REJECTED';
    // 48-hour countdown timer target
    const deadline = new Date();
    deadline.setHours(deadline.getHours() + 48);
    user.onboardingDeadline = deadline;
    await UserDocument.updateMany({ userId, status: 'PENDING' }, { status: 'REJECTED', rejectionReason });
  }

  await user.save();
  return { 
    success: true, 
    message: status === 'APPROVED' ? `Employee verified & assigned code ${user.employeeCode}` : `Onboarding rejected with 48h timer set.` 
  };
}

export async function checkAndEscalateOnboardingDeadlines() {
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
  await connectDB();
  const user = await User.findById(data.userId);
  if (!user) throw new Error('User not found');

  const approverRole = getEscalationTargetRole(user.role);

  const leave = await LeaveRequest.create({
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

  return { success: true, message: 'Leave request submitted.', leave: JSON.parse(JSON.stringify(leave)) };
}

export async function reviewLeaveRequest(leaveId: string, approverUserId: string, status: 'APPROVED' | 'REJECTED') {
  await connectDB();
  const leave = await LeaveRequest.findById(leaveId);
  if (!leave) throw new Error('Leave request not found');

  leave.status = status;
  leave.approvedBy = approverUserId as any;
  await leave.save();

  return { success: true, message: `Leave request ${status.toLowerCase()}.` };
}

// ----------------------------------------------------
// 4. PMS PROJECTS, TASKS & TIMESHEETS
// ----------------------------------------------------
export async function createProject(data: { name: string; description?: string; clientBudget: number; managerId: string; tenantId?: string }) {
  await connectDB();
  const proj = await Project.create(data);
  return { success: true, project: JSON.parse(JSON.stringify(proj)) };
}

export async function createTask(data: { projectId: string; title: string; description?: string; assigneeId: string; estimatedHours: number }) {
  await connectDB();
  const task = await Task.create({ ...data, status: 'TODO', loggedHours: 0 });
  return { success: true, task: JSON.parse(JSON.stringify(task)) };
}

export async function toggleTaskTimer(taskId: string) {
  await connectDB();
  const task = await Task.findById(taskId);
  if (!task) throw new Error('Task not found');

  if (!task.timerActive) {
    task.timerActive = true;
    task.timerStartedAt = new Date();
  } else {
    if (task.timerStartedAt) {
      const elapsedMs = new Date().getTime() - new Date(task.timerStartedAt).getTime();
      const elapsedHours = Math.round((elapsedMs / (1000 * 60 * 60)) * 10) / 10;
      task.loggedHours += Math.max(0.1, elapsedHours);
    }
    task.timerActive = false;
    task.timerStartedAt = undefined;
  }
  await task.save();
  return { success: true, task: JSON.parse(JSON.stringify(task)) };
}

export async function logTimesheet(data: { userId: string; projectId: string; taskId: string; hours: number; description: string }) {
  await connectDB();
  const today = new Date().toISOString().split('T')[0];
  
  const ts = await Timesheet.create({
    userId: data.userId,
    projectId: data.projectId,
    taskId: data.taskId,
    date: today,
    hours: data.hours,
    description: data.description,
    status: 'SUBMITTED'
  });

  const task = await Task.findById(data.taskId);
  if (task) {
    task.loggedHours += data.hours;
    await task.save();
  }

  return { success: true, timesheet: JSON.parse(JSON.stringify(ts)) };
}

export async function lockTimesheetsByManager(timesheetIds: string[]) {
  await connectDB();
  await Timesheet.updateMany(
    { _id: { $in: timesheetIds } },
    { isLocked: true, status: 'LOCKED_BY_MANAGER' }
  );
  return { success: true, message: `${timesheetIds.length} timesheets locked for HR payroll processing.` };
}

// ----------------------------------------------------
// 5. PAYROLL MODULE
// ----------------------------------------------------
export async function runMonthlyPayroll(month: number, year: number) {
  await connectDB();
  const users = await User.find({ role: { $ne: 'SUPER_ADMIN' } });
  const payrolls = [];

  for (const u of users) {
    // Calculate approved overtime
    const otAttendance = await Attendance.find({
      userId: u._id,
      overtimeStatus: 'APPROVED'
    });
    const otHours = otAttendance.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
    const hourlyRate = (u.baseSalary || 50000) / 160;
    const otPayout = Math.round(otHours * hourlyRate * 1.5);

    const deductions = Math.round((u.baseSalary || 50000) * 0.12); // Standard PF deduction
    const netSalary = (u.baseSalary || 50000) + otPayout - deductions;

    const p = await Payroll.findOneAndUpdate(
      { userId: u._id, month, year },
      {
        baseSalary: u.baseSalary || 50000,
        overtimeHours: otHours,
        overtimePayout: otPayout,
        deductions,
        netSalary,
        status: 'PROCESSED',
        processedAt: new Date()
      },
      { upsert: true, new: true }
    );
    payrolls.push(p);
  }

  return { success: true, count: payrolls.length, payrolls: JSON.parse(JSON.stringify(payrolls)) };
}

// ----------------------------------------------------
// 6. ISOLATED SETTINGS DATA API
// ----------------------------------------------------
export async function getSuperAdminSettingsData() {
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
  await connectDB();
  let s = await SuperAdminSettings.findOne();
  if (s) {
    Object.assign(s, data);
    await s.save();
  }
  return { success: true, settings: JSON.parse(JSON.stringify(s)) };
}

export async function getHRAdminSettingsData(tenantId?: string) {
  await connectDB();
  let s = await HRAdminSettings.findOne();
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
  await connectDB();
  let s = await HRAdminSettings.findOne();
  if (s) {
    Object.assign(s, data);
    await s.save();
  }
  return { success: true, settings: JSON.parse(JSON.stringify(s)) };
}

export async function getManagerSettingsData(userId: string) {
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
  await connectDB();
  const s = await ManagerSettings.findOneAndUpdate({ userId }, data, { upsert: true, new: true });
  return { success: true, settings: JSON.parse(JSON.stringify(s)) };
}

export async function getEmployeeSettingsData(userId: string) {
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
  await connectDB();
  const s = await EmployeeSettings.findOneAndUpdate({ userId }, data, { upsert: true, new: true });
  return { success: true, settings: JSON.parse(JSON.stringify(s)) };
}

// ══════════════════════════════════════════════════════════════════
// Unified Approvals surface
// ══════════════════════════════════════════════════════════════════
//
// One server-side query that returns the counts (for the sidebar badge)
// and another that returns the full queue (for /hrms/approvals).
// The queue is role-scoped: employees never see approver queues.

import type { HRMSRole } from '@/lib/hrms-roles';

export interface PendingApprovalCounts {
  leaves: number;
  regularization: number;
  overtime: number;
  onboarding: number;
  escalations: number;
  payroll: number;
  timesheets: number;
  total: number;
}

const ZERO_COUNTS: PendingApprovalCounts = {
  leaves: 0,
  regularization: 0,
  overtime: 0,
  onboarding: 0,
  escalations: 0,
  payroll: 0,
  timesheets: 0,
  total: 0,
};

/** Counts only — cheap; used by the sidebar badge on every layout render. */
export async function getPendingApprovalCounts(actorRole: HRMSRole): Promise<PendingApprovalCounts> {
  if (actorRole === 'EMPLOYEE') return ZERO_COUNTS;
  try {
    await connectDB();
    const [leaves, regularization, overtime, onboarding, escalations, timesheets] = await Promise.all([
      LeaveRequest.countDocuments({ status: 'PENDING' }),
      Attendance.countDocuments({ regularizationStatus: 'PENDING' }),
      Attendance.countDocuments({ overtimeHours: { $gt: 0 }, overtimeStatus: { $in: [null, 'PENDING'] } }),
      User.countDocuments({ onboardingStatus: { $in: ['PENDING_REVIEW', 'PENDING_UPLOAD'] } }),
      actorRole === 'SUPER_ADMIN'
        ? User.countDocuments({ onboardingStatus: 'ESCALATED_SUPERADMIN' })
        : Promise.resolve(0),
      actorRole === 'MANAGER' || actorRole === 'HR_ADMIN'
        ? Timesheet.countDocuments({ status: { $in: ['LOGGED', 'SUBMITTED'] } })
        : Promise.resolve(0),
    ]);
    return {
      leaves,
      regularization,
      overtime,
      onboarding,
      escalations,
      payroll: actorRole === 'HR_ADMIN' || actorRole === 'SUPER_ADMIN' ? 1 : 0,
      timesheets,
      total: leaves + regularization + overtime + onboarding + escalations + timesheets,
    };
  } catch {
    return ZERO_COUNTS;
  }
}

export interface ApprovalItem {
  id: string;
  type: 'leave' | 'regularization' | 'overtime' | 'onboarding' | 'escalation' | 'timesheet' | 'payroll';
  title: string;
  subtitle?: string;
  status: string;
  requestedAt?: string;
  actorName?: string;
  href: string;
}

export interface ApprovalsQueue {
  role: HRMSRole;
  counts: PendingApprovalCounts;
  items: ApprovalItem[];
}

/** Full queue for the /hrms/approvals page. Role-scoped. */
export async function getPendingApprovalsForActor(): Promise<ApprovalsQueue> {
  const counts = await getPendingApprovalCounts('SUPER_ADMIN');
  // Recompute for the actual actor below.
  let actor: Awaited<ReturnType<typeof getHRMSUser>> | null = null;
  try {
    actor = await getHRMSUser();
  } catch {
    return { role: 'EMPLOYEE', counts: ZERO_COUNTS, items: [] };
  }
  const role = mapFirebaseRoleToHRMS(actor?.role);
  if (role === 'EMPLOYEE') {
    return { role, counts: ZERO_COUNTS, items: [] };
  }

  const realCounts = await getPendingApprovalCounts(role);
  const items: ApprovalItem[] = [];

  try {
    await connectDB();
    const [leaves, attendance, onboardingUsers, escalated, timesheets] = await Promise.all([
      LeaveRequest.find({ status: 'PENDING' })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Attendance.find({
        $or: [
          { regularizationStatus: 'PENDING' },
          { overtimeHours: { $gt: 0 }, overtimeStatus: { $in: [null, 'PENDING'] } },
        ],
      })
        .populate('userId', 'name email')
        .sort({ date: -1 })
        .limit(50)
        .lean(),
      User.find({ onboardingStatus: { $in: ['PENDING_REVIEW', 'PENDING_UPLOAD'] } })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      role === 'SUPER_ADMIN'
        ? User.find({ onboardingStatus: 'ESCALATED_SUPERADMIN' })
            .sort({ updatedAt: -1 })
            .limit(50)
            .lean()
        : Promise.resolve([]),
      role === 'MANAGER' || role === 'HR_ADMIN'
        ? Timesheet.find({ status: { $in: ['LOGGED', 'SUBMITTED'] } })
            .populate('userId', 'name email')
            .sort({ date: -1 })
            .limit(50)
            .lean()
        : Promise.resolve([]),
    ]);

    for (const l of leaves as any[]) {
      items.push({
        id: String(l._id),
        type: 'leave',
        title: `${l.leaveType || 'Leave'} — ${l.userId?.name || 'Unknown'}`,
        subtitle: l.reason || l.startDate,
        status: l.status,
        requestedAt: l.createdAt,
        actorName: l.userId?.name,
        href: '/hrms/approvals?tab=leaves',
      });
    }
    for (const a of attendance as any[]) {
      const isOT = (a.overtimeHours || 0) > 0;
      items.push({
        id: String(a._id),
        type: isOT ? 'overtime' : 'regularization',
        title: `${isOT ? 'Overtime' : 'Regularization'} — ${a.userId?.name || 'Unknown'}`,
        subtitle: a.regularizationReason || `${a.overtimeHours || 0}h OT on ${a.date}`,
        status: isOT ? a.overtimeStatus || 'PENDING' : a.regularizationStatus,
        requestedAt: a.date,
        actorName: a.userId?.name,
        href: '/hrms/approvals?tab=' + (isOT ? 'overtime' : 'regularization'),
      });
    }
    for (const u of onboardingUsers as any[]) {
      items.push({
        id: String(u._id),
        type: 'onboarding',
        title: `Onboarding — ${u.name}`,
        subtitle: u.email,
        status: u.onboardingStatus,
        requestedAt: u.createdAt,
        actorName: u.name,
        href: '/hrms/approvals?tab=onboarding',
      });
    }
    for (const u of escalated as any[]) {
      items.push({
        id: String(u._id),
        type: 'escalation',
        title: `Escalation — ${u.name}`,
        subtitle: 'Missed 48h onboarding deadline',
        status: u.onboardingStatus,
        requestedAt: u.updatedAt,
        actorName: u.name,
        href: '/hrms/superadmin/escalations',
      });
    }
    for (const t of timesheets as any[]) {
      items.push({
        id: String(t._id),
        type: 'timesheet',
        title: `Timesheet — ${t.userId?.name || 'Unknown'}`,
        subtitle: `${t.hours || 0}h on ${t.date}`,
        status: t.status,
        requestedAt: t.date,
        actorName: t.userId?.name,
        href: '/hrms/approvals?tab=timesheets',
      });
    }
    if (role === 'HR_ADMIN' || role === 'SUPER_ADMIN') {
      items.push({
        id: 'payroll-current',
        type: 'payroll',
        title: 'Monthly payroll run',
        subtitle: `Period: ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
        status: 'READY',
        href: '/hrms/approvals?tab=payroll',
      });
    }
  } catch {
    // Fall through with whatever was collected.
  }

  return { role, counts: realCounts, items };
}
