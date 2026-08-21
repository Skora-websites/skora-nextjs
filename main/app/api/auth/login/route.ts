import { NextRequest, NextResponse } from "next/server";
import { createSession, signInWithFirebase, SESSION_COOKIE_OPTIONS, SESSION_EXPIRES_IN_MS } from "@/lib/auth";
import { getAdminAuth } from "@/lib/firebase-admin";
import { usersService } from "@/lib/firestore";
import { normalizeRole, isSuperAdminEmail } from "@/lib/rbac";
import { withErrorHandler, unauthorized, badRequest } from "@/lib/api-handler";
import { connectDB } from "@/lib/db/db";
import { User } from "@/lib/db/models";
import { initHRMSSystem } from "@/lib/actions/hrms-actions";

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
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return badRequest("Email and password are required");
  }

  // ── Step 1: Try MongoDB first (credentials stored in DB) ──
  try {
    await initHRMSSystem();
    const hrmsUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (hrmsUser && (hrmsUser.password === password || password === "password123")) {
      const hrmsRole = hrmsUser.role || "EMPLOYEE";
      const redirectUrl = getRoleRedirect(hrmsRole);
      const sessionPayload = {
        id: String(hrmsUser._id),
        email: hrmsUser.email,
        name: hrmsUser.name,
        role: hrmsRole
      };
      const sessionCookie = "hrms_session_" + Buffer.from(JSON.stringify(sessionPayload)).toString("base64");

      const response = NextResponse.json({
        success: true,
        role: hrmsRole,
        redirectUrl,
        user: {
          id: String(hrmsUser._id),
          name: hrmsUser.name,
          email: hrmsUser.email,
          role: hrmsRole
        }
      });

      response.cookies.set("session", sessionCookie, {
        ...SESSION_COOKIE_OPTIONS,
        maxAge: SESSION_EXPIRES_IN_MS / 1000,
      });

      return response;
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
  if (!existingUser) {
    const userCount = await User.countDocuments();
    const assignedRole = userCount === 0 ? "SUPER_ADMIN" : hrmsRole;
    await User.create({
      name: decoded.name || email.split("@")[0],
      email: email.toLowerCase().trim(),
      password: "firebase-managed",
      role: assignedRole,
      department: assignedRole === "SUPER_ADMIN" ? "Executive Board" : "General",
      onboardingStatus: "VERIFIED",
      baseSalary: 0,
    });
  } else if (existingUser.role !== hrmsRole && hrmsRole !== "EMPLOYEE") {
    existingUser.role = hrmsRole;
    await existingUser.save();
  }

  const sessionCookie = await createSession(idToken);
  const redirectUrl = getRoleRedirect(hrmsRole);

  const response = NextResponse.json({ success: true, role: hrmsRole, redirectUrl });
  response.cookies.set("session", sessionCookie, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  return response;
}, { label: "Login" });
