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
      const { email, password, displayName, firstName, lastName, role: rawRole } = body;

      if (!email || !password) {
        return badRequest("Email and password are required");
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return badRequest("Please enter a valid email address");
      }

      // Password strength validation
      if (password.length < 6) {
        return badRequest("Password must be at least 6 characters");
      }
      if (password.length > 128) {
        return badRequest("Password must be less than 128 characters");
      }

      // Name validation
      const name = displayName || firstName;
      if (!name || name.trim().length < 2) {
        return badRequest("Name must be at least 2 characters");
      }
      if (name.length > 100) {
        return badRequest("Name must be less than 100 characters");
      }

      // Check for duplicate email
      const existingUser = await hrmUsersService.findOne("email", email.toLowerCase());
      if (existingUser) {
        return badRequest("An account with this email already exists");
      }

      // New registrations are always employees - prevent role escalation
      const role = "employee";
      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = await hrmUsersService.create({
        email,
        emailVerified: false,
        displayName: displayName || firstName || email,
        firstName: firstName || displayName || "",
        lastName: lastName || "",
        role,
        // New registrations start as pending until HR verifies documents
        status: "pending_verification",
        loginStatus: "enabled",
        passwordHash,
        tenantId: "default",
        onboardingStatus: "pending",
        mustChangePassword: true,
      } as any);

      // Create onboarding task record in DB so HR Admin can see it
      const db = await getDb();
      if (db) {
        await db.collection("employee_onboarding_tasks").insertOne({
          userId: newUser.id,
          tenantId: "default",
          employeeName: displayName || firstName || email,
          email,
          department: body.department || "",
          documentName: body.documentName || "",
          documentUrl: body.documentUrl || "",
          status: "pending",
          submittedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Notify HR admins about new registration
        const hrAdmins = await db.collection("users").find({
          role: { $in: ["hr_admin", "admin"] },
          tenantId: "default",
        }).toArray();
        for (const admin of hrAdmins) {
          await db.collection("notifications").insertOne({
            userId: admin._id.toString(),
            title: "New Employee Registration",
            body: `${displayName || firstName || email} (${email}) has registered and submitted documents for verification.`,
            type: "onboarding",
            isRead: false,
            referenceType: "onboarding",
            referenceId: newUser.id,
            createdAt: new Date(),
          });
        }
      }

      // Auto-login after registration
      const sessionToken = await createSession(newUser.id);

      const response = NextResponse.json({
        data: {
          uid: newUser.id,
          email,
          displayName: displayName || firstName || email,
          role,
        },
      }, { status: 201 });

      response.cookies.set("session", sessionToken, {
        ...SESSION_COOKIE_OPTIONS,
        maxAge: SESSION_EXPIRES_IN_MS / 1000,
      });

      // Set user_role cookie for middleware role-based routing
      response.cookies.set("user_role", role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_EXPIRES_IN_MS / 1000,
      });

      return response;
    }

    case "reset-password": {
      const { email } = body;
      if (!email) return badRequest("Email is required");

      const user = await hrmUsersService.findOne("email", email.toLowerCase());
      if (!user) {
        // Don't reveal if user exists
        return NextResponse.json({ data: { message: "If the email exists, a reset link has been generated." } });
      }

      const crypto = require("crypto");
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      const db = await getDb();
      if (db) {
        await db.collection("password_resets").updateOne(
          { userId: user.id },
          { $set: { token: resetToken, expiresAt: resetExpiry, createdAt: new Date() } },
          { upsert: true }
        );
      }

      // In production, send an email with the reset link.
      // For now, log the reset link for development purposes.
      const resetLink = "/hrms/forgot-password?token=" + resetToken + "&email=" + encodeURIComponent(email);
      console.log(`[Password Reset] Link for ${email}: ${resetLink}`);

      return NextResponse.json({ data: { message: "If the email exists, a reset link has been generated." } });
    }

    case "confirm-reset-password": {
      const { token, email: resetEmail, newPassword } = body;
      if (!token || !resetEmail || !newPassword) {
        return badRequest("Token, email, and new password are required");
      }
      if (newPassword.length < 6) {
        return badRequest("Password must be at least 6 characters");
      }

      const resetUser = await hrmUsersService.findOne("email", resetEmail.toLowerCase());
      if (!resetUser) {
        return badRequest("Invalid reset request");
      }

      const db = await getDb();
      if (!db) return badRequest("Database not available");

      const resetRecord = await db.collection("password_resets").findOne({
        userId: resetUser.id,
        token,
        expiresAt: { $gt: new Date() },
      });

      if (!resetRecord) {
        return badRequest("Invalid or expired reset token");
      }

      // Update password
      const newHash = await bcrypt.hash(newPassword, 12);
      await hrmUsersService.update(resetUser.id, { passwordHash: newHash } as any);

      // Delete the reset token
      await db.collection("password_resets").deleteOne({ userId: resetUser.id });

      return NextResponse.json({ data: { message: "Password has been reset successfully" } });
    }

    case "create-user": {
      const auth = await requireAuth();
      if (isErrorResponse(auth)) return auth;
      if (auth.role === "employee") {
        return forbidden("Insufficient permissions");
      }
      const { email, password, displayName, role: rawRole } = body;
      const role = normalizeRole(rawRole);
      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = await hrmUsersService.create({
        email,
        displayName: displayName || email,
        role,
        status: "active",
        passwordHash,
        tenantId: "default",
        mustChangePassword: true,
      } as any);

      return NextResponse.json({ data: { uid: newUser.id, email } }, { status: 201 });
    }

    case "tenant-setup": {
      return NextResponse.json({ error: "Multi-tenancy disabled. Single company mode." }, { status: 400 });
    }

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
    case "roles": {
      return NextResponse.json({ data: ROLE_DEFINITIONS });
    }

    case "user": {
      if (auth.role === "employee" && userId !== auth.userId) {
        return forbidden();
      }
      if (!userId) {
        return badRequest("userId required");
      }
      const user = await hrmUsersService.findById(userId);
      if (!user) {
        return notFound("User not found");
      }
      return NextResponse.json({ data: user });
    }

    case "users": {
      if (auth.role === "employee") {
        return forbidden();
      }
      const users = await hrmUsersService.findManyInTenant("default");
      return NextResponse.json({ data: users });
    }

    default:
      return badRequest("Invalid action. Use: roles, user, users");
  }
}, { label: "HRM Auth" });

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth();
  if (isErrorResponse(auth)) return auth;

  const body = await request.json();
  const { userId, role, loginStatus } = body;

  if (role && userId) {
    if (auth.role !== "super_admin") {
      return forbidden("Only Super Admin can change roles");
    }
    const normalizedRole = normalizeRole(role);
    await hrmUsersService.update(userId, { role: normalizedRole } as any);
    return NextResponse.json({ success: true });
  }

  if (loginStatus && userId) {
    if (auth.role === "employee") {
      return forbidden("Insufficient permissions");
    }
    // Clear sessions if disabling
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

  if (!userId) {
    return badRequest("userId required");
  }

  // Clear sessions
  const db = await getDb();
  if (db) await db.collection("sessions").deleteMany({ userId });

  await hrmUsersService.delete(userId);
  return NextResponse.json({ success: true });
}, { label: "HRM Auth" });
