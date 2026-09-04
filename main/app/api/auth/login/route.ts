import { NextRequest, NextResponse } from "next/server";
import { createSession, signInWithFirebase, SESSION_COOKIE_OPTIONS, SESSION_EXPIRES_IN_MS, signHrmsPayload } from "@/lib/auth";
import { getAdminAuth } from "@/lib/firebase-admin";
import { usersService } from "@/lib/firestore";
import { normalizeRole, isSuperAdminEmail } from "@/lib/rbac";
import { withErrorHandler, badRequest } from "@/lib/api-handler";
import { connectDB } from "@/lib/db/db";
import { User } from "@/lib/db/models";
import { initHRMSSystem } from "@/lib/actions/hrms-actions";
import { hashPassword, verifyPassword, rateLimit } from "@/lib/security";

/** Map normalized RBAC roles to HRMS MongoDB roles */
function mapRoleToHRMS(rbacRole: string): "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE" {
  const norm = rbacRole.toUpperCase();
  if (norm === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (norm === "ADMIN") return "HR_ADMIN";
  // Firebase "manager" maps to MANAGER; everything else to EMPLOYEE
  return norm === "MANAGER" ? "MANAGER" : "EMPLOYEE";
}

function getRoleRedirect(roleStr: string): string {
  const norm = roleStr.toUpperCase();
  if (norm === "SUPER_ADMIN" || norm === "SUPERADMIN" || norm === "SUPER_ADMINISTRATOR") {
    return "/hrms/superadmin";
  }
  if (norm === "HR_ADMIN" || norm === "HRADMIN" || norm === "ADMIN") {
    return "/hrms/hr-admin";
  }
  if (norm === "MANAGER") {
    return "/hrms/manager";
  }
  return "/hrms/employee";
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  // ── Rate limit: 5 attempts per minute per IP+email ──
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const emailHint = (await request.clone().json().catch(() => ({}))).email || "anon";
  const rl = rateLimit(`login:${ip}:${String(emailHint).toLowerCase()}`, 5, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } }
    );
  }

  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return badRequest("Email and password are required");
  }

  // ── Step 1: Try MongoDB first (credentials stored in DB) ──
  try {
    await initHRMSSystem();
    // SECURITY: password has `select: false` on the schema, so we must
    // explicitly opt in here. We never return the user object to the client.
    const hrmsUser = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (hrmsUser) {
      const v = verifyPassword(String(password), String(hrmsUser.password || ""));
      if (v.ok) {
        // Self-migrate legacy plain-text password to scrypt on first success.
        if (v.rehash) {
          hrmsUser.password = v.rehash;
          await hrmsUser.save().catch(() => undefined);
        }
        const hrmsRole = hrmsUser.role || "EMPLOYEE";
        const redirectUrl = getRoleRedirect(hrmsRole);
        const sessionPayload = {
          id: String(hrmsUser._id),
          email: hrmsUser.email,
          name: hrmsUser.name,
          role: hrmsRole,
          tenantId: hrmsUser.tenantId ? String(hrmsUser.tenantId) : undefined,
        };
        const sessionCookie = "hrms_session_" + signHrmsPayload(sessionPayload);

        const response = NextResponse.json({
          success: true,
          role: hrmsRole,
          redirectUrl,
          user: {
            id: String(hrmsUser._id),
            name: hrmsUser.name,
            email: hrmsUser.email,
            role: hrmsRole,
            tenantId: hrmsUser.tenantId ? String(hrmsUser.tenantId) : undefined,
          }
        });

        response.cookies.set("session", sessionCookie, {
          ...SESSION_COOKIE_OPTIONS,
          maxAge: SESSION_EXPIRES_IN_MS / 1000,
        });

        return response;
      }
    }
  } catch (mongoErr) {
    // MongoDB not available, continue to Firebase
  }

  // ── Step 2: Try Firebase Auth REST API ──
  let idToken: string;
  try {
    idToken = await signInWithFirebase(email, password);
  } catch (firebaseErr: any) {
    throw new Error("Invalid email or password");
  }

  const decoded = await getAdminAuth().verifyIdToken(idToken);

  // Determine role from Firestore or super-admin list
  let role = "employee";
  try {
    const userDoc = await usersService.findById(decoded.uid);
    if (userDoc) {
      const rawRole = userDoc.role || "employee";
      role = isSuperAdminEmail(userDoc.email || "") ? "super_admin" : rawRole;
    } else {
      role = isSuperAdminEmail(decoded.email || "") ? "super_admin" : "employee";
    }
  } catch {}

  const hrmsRole = mapRoleToHRMS(role);

  // Auto-provision MongoDB user
  await connectDB();
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

  // SECURITY: never let a Firebase claim silently downgrade a privileged
  // Mongo role. Privilege only flows one direction here: a privileged Mongo
  // role (SUPER_ADMIN/HR_ADMIN/MANAGER) is sticky once granted.
  const PRIVILEGED = new Set(["SUPER_ADMIN", "HR_ADMIN", "MANAGER"]);
  const finalRole = existingUser && PRIVILEGED.has(String(existingUser.role))
    ? String(existingUser.role)
    : hrmsRole;

  // SECURITY: a non-EMPLOYEE bootstrap must be opt-in via env. Without this,
  // the very first login would be promoted to SUPER_ADMIN, which is a
  // privilege-escalation race.
  const allowBootstrap =
    process.env.REGISTER_BOOTSTRAP_SUPERADMIN === "1" && finalRole === "SUPER_ADMIN";

  if (!existingUser) {
    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 && allowBootstrap ? "SUPER_ADMIN" : finalRole;
    await User.create({
      name: decoded.name || email.split("@")[0],
      email: email.toLowerCase().trim(),
      password: hashPassword("firebase-managed-" + email),
      role: assignedRole,
      department: assignedRole === "SUPER_ADMIN" ? "Executive Board" : "General",
      onboardingStatus: "VERIFIED",
      baseSalary: 0,
    });
  } else if (finalRole !== existingUser.role) {
    // Upgrades (e.g. EMPLOYEE → MANAGER from Firebase claim) are still
    // allowed here, but the symmetric downgrade path is gone.
    existingUser.role = finalRole;
    await existingUser.save();
  }

  // Re-read the effective role from Mongo (covers bootstrap + upgrade paths)
  // so the session cookie and redirect reflect what the DB actually has.
  const effective = await User.findOne({ email: email.toLowerCase().trim() }).select("role loginStatus");
  if (!effective) throw new Error("User provisioning failed");
  // SECURITY: deactivated users must not be issued a working session.
  if (effective.loginStatus === false) {
    return NextResponse.json(
      { error: "This account has been disabled" },
      { status: 403 }
    );
  }
  const hrmsRoleFinal = String(effective.role || "EMPLOYEE");
  const redirectUrl = getRoleRedirect(hrmsRoleFinal);

  const sessionCookie = await createSession(idToken);

  const response = NextResponse.json({ success: true, role: hrmsRoleFinal, redirectUrl });
  response.cookies.set("session", sessionCookie, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  return response;
}, { label: "Login" });
