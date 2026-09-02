import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { hrmUsersService } from "@/lib/hrm/firestore";
import { ROLE_DEFINITIONS } from "@/services/hrm/auth";
import { normalizeRole, isSuperAdminEmail } from "@/lib/rbac";
import { requireAuth, requireAdmin, requireSuperAdmin, isErrorResponse } from "@/lib/api-auth";
import { withErrorHandler, badRequest, notFound, forbidden } from "@/lib/api-handler";
import { createSession, SESSION_COOKIE_OPTIONS, SESSION_EXPIRES_IN_MS } from "@/lib/auth";
import { getDb } from "@/lib/db/mongo-helper";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const action = body.action;

  switch (action) {
    case "register": {
      const { email, password, displayName, firstName, lastName } = body;
      if (!email || !password) return badRequest("Email and password are required");
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return badRequest("Please enter a valid email address");
      if (password.length < 6) return badRequest("Password must be at least 6 characters");
      if (password.length > 128) return badRequest("Password must be less than 128 characters");
      const name = displayName || firstName;
      if (!name || name.trim().length < 2) return badRequest("Name must be at least 2 characters");
      if (name.length > 100) return badRequest("Name must be less than 100 characters");

      const existingUser = await hrmUsersService.findOne("email", email.toLowerCase());
      if (existingUser) return badRequest("An account with this email already exists");

      const role = "employee";
      const passwordHash = await bcrypt.hash(password, 12);
      const newUser = await hrmUsersService.create({
        email,
        emailVerified: false,
        displayName: displayName || firstName || email,
        firstName: firstName || displayName || "",
        lastName: lastName || "",
        role,
        status: "pending_verification",
        loginStatus: "enabled",
        passwordHash,
        tenantId: "default",
        onboardingStatus: "pending",
        mustChangePassword: true,
      } as any);

      const db = await getDb();
      if (db) {
        await db.collection("employee_onboarding_tasks").insertOne({
          userId: newUser.id, tenantId: "default", employeeName: displayName || firstName || email,
          email, department: body.department || "", documentName: body.documentName || "",
          documentUrl: body.documentUrl || "", status: "pending", submittedAt: new Date(),
          createdAt: new Date(), updatedAt: new Date(),
        });
        const hrAdmins = await db.collection("users").find({ role: { $in: ["hr_admin", "admin"] }, tenantId: "default" }).toArray();
        for (const admin of hrAdmins) {
          await db.collection("notifications").insertOne({
            userId: admin._id.toString(), title: "New Employee Registration",
            body: `${displayName || firstName || email} (${email}) has registered and submitted documents for verification.`,
            type: "onboarding", isRead: false, referenceType: "onboarding", referenceId: newUser.id, createdAt: new Date(),
          });
        }
      }

      const sessionToken = await createSession(newUser.id);
      const response = NextResponse.json({ data: { uid: newUser.id, email, displayName: displayName || firstName || email, role } }, { status: 201 });
      response.cookies.set("session", sessionToken, { ...SESSION_COOKIE_OPTIONS, maxAge: SESSION_EXPIRES_IN_MS / 1000 });
      response.cookies.set("user_role", role, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_EXPIRES_IN_MS / 1000 });
      return response;
    }

    case "reset-password": {
      const { email } = body;
      if (!email) return badRequest("Email is required");
      const user = await hrmUsersService.findOne("email", email.toLowerCase());
      if (!user) return NextResponse.json({ data: { message: "If the email exists, a reset link has been generated." } });
      const crypto = require("crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);
      const db = await getDb();
      if (db) await db.collection("password_resets").updateOne({ userId: user.id }, { $set: { token: resetToken, expiresAt: resetExpiry, createdAt: new Date() } }, { upsert: true });
      console.log(`[Password Reset] Link for ${email}: /hrms/forgot-password?token=${resetToken}&email=${encodeURIComponent(email)}`);
      return NextResponse.json({ data: { message: "If the email exists, a reset link has been generated." } });
    }

    case "confirm-reset-password": {
      const { token, email: resetEmail, newPassword } = body;
      if (!token || !resetEmail || !newPassword) return badRequest("Token, email, and new password are required");
      if (newPassword.length < 6) return badRequest("Password must be at least 6 characters");
      const resetUser = await hrmUsersService.findOne("email", resetEmail.toLowerCase());
      if (!resetUser) return badRequest("Invalid reset request");
      const db = await getDb();
      if (!db) return badRequest("Database not available");
      const resetRecord = await db.collection("password_resets").findOne({ userId: resetUser.id, token, expiresAt: { $gt: new Date() } });
      if (!resetRecord) return badRequest("Invalid or expired reset token");
      const newHash = await bcrypt.hash(newPassword, 12);
      await hrmUsersService.update(resetUser.id, { passwordHash: newHash } as any);
      await db.collection("password_resets").deleteOne({ userId: resetUser.id });
      return NextResponse.json({ data: { message: "Password has been reset successfully" } });
    }

    case "create-user": {
      const auth = await requireAdmin();
      if (isErrorResponse(auth)) return auth;
      const { email, password, displayName, role: rawRole } = body;
      if (!email || !password) return badRequest("Email and password are required");
      if (password.length < 8) return badRequest("Password must be at least 8 characters");

      // Only Super Admin may create privileged accounts. HR Admin may create employees.
      const requestedRole = rawRole ? normalizeRole(rawRole) : "employee";
      if (auth.role !== "super_admin" && requestedRole !== "employee") {
        return forbidden("Only Super Admin can create privileged accounts");
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const newUser = await hrmUsersService.create({
        email: email.toLowerCase(), displayName: displayName || email, role: requestedRole,
        status: "active", passwordHash, tenantId: auth.tenantId, mustChangePassword: true,
      } as any);
      return NextResponse.json({ data: { uid: newUser.id, email: email.toLowerCase(), role: requestedRole } }, { status: 201 });
    }

    case "tenant-setup":
      return NextResponse.json({ error: "Multi-tenancy disabled. Single company mode." }, { status: 400 });
    default:
      return badRequest("Invalid action");
  }
}, { label: "HRM Auth" });

export const GET = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth();
  if (isErrorResponse(auth)) return auth;
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const userId = searchParams.get("userId");
  switch (action) {
    case "roles": return NextResponse.json({ data: ROLE_DEFINITIONS });
    case "user": {
      if (!userId) return badRequest("userId required");
      if (auth.role === "employee" && userId !== auth.userId) return forbidden();
      const user = await hrmUsersService.findById(userId);
      if (!user) return notFound("User not found");
      return NextResponse.json({ data: user });
    }
    case "users": {
      if (auth.role === "employee") return forbidden();
      const users = await hrmUsersService.findManyInTenant(auth.tenantId);
      return NextResponse.json({ data: users });
    }
    default: return badRequest("Invalid action. Use: roles, user, users");
  }
}, { label: "HRM Auth" });

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth();
  if (isErrorResponse(auth)) return auth;
  const body = await request.json();
  const { userId, role, loginStatus } = body;
  if (role && userId) {
    if (auth.role !== "super_admin") return forbidden("Only Super Admin can change roles");
    const normalizedRole = normalizeRole(role);
    await hrmUsersService.update(userId, { role: normalizedRole } as any);
    return NextResponse.json({ success: true });
  }
  if (loginStatus && userId) {
    if (auth.role === "employee") return forbidden("Insufficient permissions");
    if (loginStatus === "disabled") {
      const db = await getDb();
      if (db) await db.collection("sessions").deleteMany({ userId });
    }
    await hrmUsersService.update(userId, { loginStatus } as any);
    return NextResponse.json({ success: true });
  }
  return badRequest("Provide userId with role or loginStatus");
}, { label: "HRM Auth" });

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireSuperAdmin();
  if (isErrorResponse(auth)) return auth;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return badRequest("userId required");
  const db = await getDb();
  if (db) await db.collection("sessions").deleteMany({ userId });
  await hrmUsersService.delete(userId);
  return NextResponse.json({ success: true });
}, { label: "HRM Auth" });
