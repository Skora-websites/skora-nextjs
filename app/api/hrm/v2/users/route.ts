import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { hrmUsersService } from "@/lib/hrm/firestore";
import { resolveTenantFromOrigin } from "@/services/hrm/tenant";
import { normalizeRole } from "@/lib/rbac";
import { requireAuth, requireAdmin, requireSuperAdmin, isErrorResponse } from "@/lib/api-auth";
import { recordAuditLog, getAuditLogs } from "@/services/hrm/audit";
import type { AuditAction } from "@/services/hrm/audit";

// ── GET: List users, get single user, get audit logs ───

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isErrorResponse(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "list";
    const userId = searchParams.get("userId");
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const role = searchParams.get("role");

    const origin = request.headers.get("origin");
    const tenantCtx = await resolveTenantFromOrigin(origin);
    const tenantId = tenantCtx?.tenantId || "default";

    switch (action) {
      case "list": {
        // Only admins can list all users
        if (auth.role === "employee") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const where: { field: string; op: "=="; value: unknown }[] = [];

        if (status) where.push({ field: "status", op: "==", value: status });
        if (role) where.push({ field: "role", op: "==", value: role });

        const users = await hrmUsersService.findManyInTenant(tenantId, {
          where: where.length > 0 ? where : undefined,
          orderByField: "createdAt",
          orderByDirection: "desc",
        });

        // Filter by search term if provided (client-side for flexibility)
        let filtered = users;
        if (search) {
          const term = search.toLowerCase();
          filtered = users.filter(
            (u: any) =>
              (u.displayName || "").toLowerCase().includes(term) ||
              (u.firstName || "").toLowerCase().includes(term) ||
              (u.lastName || "").toLowerCase().includes(term) ||
              (u.email || "").toLowerCase().includes(term)
          );
        }

        return NextResponse.json({ data: filtered });
      }

      case "get": {
        if (!userId) {
          return NextResponse.json({ error: "userId required" }, { status: 400 });
        }
        // Employees can only view themselves
        if (auth.role === "employee" && userId !== auth.userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const user = await hrmUsersService.findById(userId);
        if (!user) {
          return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Get Firebase Auth user for additional info
        let authUserInfo: any = {};
        try {
          const authUser = await getAdminAuth().getUser(userId);
          authUserInfo = {
            customClaims: authUser.customClaims,
            emailVerified: authUser.emailVerified,
            lastSignInAt: authUser.metadata.lastSignInTime,
            createdAt: authUser.metadata.creationTime,
          };
        } catch {
          // Firebase Auth user might not exist
        }

        return NextResponse.json({ data: { ...user, ...authUserInfo } });
      }

      case "audit-logs": {
        // Only admins can view audit logs
        if (auth.role === "employee") {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const targetUserId = searchParams.get("targetUserId") || undefined;
        const limit = parseInt(searchParams.get("limit") || "50", 10);

        const logs = await getAuditLogs(tenantId, { targetUserId, limit });
        return NextResponse.json({ data: logs });
      }

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: list, get, audit-logs" },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("GET /api/hrm/v2/users error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// ── POST: Create user ─────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (isErrorResponse(auth)) return auth;

    const origin = request.headers.get("origin");
    const tenantCtx = await resolveTenantFromOrigin(origin);
    const tenantId = tenantCtx?.tenantId || "default";

    const body = await request.json();
    const { email, password, displayName, firstName, lastName, role: rawRole } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const role = normalizeRole(rawRole);

    // Create Firebase Auth user
    const authUser = await getAdminAuth().createUser({
      email,
      password,
      displayName: displayName || firstName || email,
    });

    // Create Firestore user record
    await hrmUsersService.createWithId(authUser.uid, {
      email,
      emailVerified: false,
      displayName: displayName || firstName || "",
      firstName: firstName || displayName || "",
      lastName: lastName || "",
      role,
      status: "active",
      loginStatus: "enabled",
      allowMobileLogin: false,
      tenantId,
    } as any);

    // Set custom claims
    await getAdminAuth().setCustomUserClaims(authUser.uid, {
      role,
      tenantId,
    });

    // Record audit log
    await recordAuditLog({
      tenantId,
      action: "create_user",
      performedById: auth.userId,
      performedByName: body._performedByName || "Super Admin",
      targetUserId: authUser.uid,
      targetUserEmail: email,
      details: `Created user ${email} with role ${role}`,
      metadata: { role },
    });

    return NextResponse.json(
      {
        data: {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/hrm/v2/users error:", error);

    if (error.code === "auth/email-already-exists") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// ── PATCH: Update user (role, status, profile, reset password) ──

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isErrorResponse(auth)) return auth;

    const origin = request.headers.get("origin");
    const tenantCtx = await resolveTenantFromOrigin(origin);
    const tenantId = tenantCtx?.tenantId || "default";

    const body = await request.json();
    const { userId, action: updateAction, role, status, displayName, firstName, lastName, email, phone } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // Get the target user for audit logging
    const targetUser = await hrmUsersService.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetUserEmail = (targetUser as any).email || "unknown";
    let auditAction: AuditAction = "update_user";
    let auditDetails = "";

    switch (updateAction) {
      case "role": {
        // Only super_admin can change roles
        if (auth.role !== "super_admin") {
          return NextResponse.json(
            { error: "Forbidden: only Super Admin can change roles" },
            { status: 403 }
          );
        }
        const normalizedRole = normalizeRole(role);
        await getAdminAuth().setCustomUserClaims(userId, { role: normalizedRole });
        await hrmUsersService.update(userId, { role: normalizedRole } as any);
        auditAction = "update_role";
        auditDetails = `Changed role from ${(targetUser as any).role} to ${normalizedRole}`;
        break;
      }

      case "status": {
        // Only admins can change user status
        if (auth.role === "employee") {
          return NextResponse.json(
            { error: "Forbidden: insufficient permissions" },
            { status: 403 }
          );
        }
        await hrmUsersService.update(userId, { status } as any);
        auditAction = status === "active" ? "login_enabled" : "login_disabled";
        auditDetails = `Changed status from ${(targetUser as any).status} to ${status}`;

        // If disabling, revoke refresh tokens
        if (status === "disabled" || status === "inactive") {
          try {
            await getAdminAuth().revokeRefreshTokens(userId);
          } catch {
            // Token revocation may fail if user doesn't exist in Auth
          }
        }
        break;
      }

      case "login-status": {
        const adminAuth = await requireAdmin();
        if (isErrorResponse(adminAuth)) return adminAuth;
        const loginStatus = body.loginStatus;
        await hrmUsersService.update(userId, { loginStatus } as any);
        auditAction = loginStatus === "disabled" ? "login_disabled" : "login_enabled";
        auditDetails = `Changed login status to ${loginStatus}`;

        if (loginStatus === "disabled") {
          try {
            await getAdminAuth().revokeRefreshTokens(userId);
          } catch {
            // Token revocation may fail
          }
        }
        break;
      }

      case "profile": {
        // Users can update their own profile; admins can update any
        if (auth.role === "employee" && userId !== auth.userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        const updateData: Record<string, any> = {};
        if (displayName !== undefined) updateData.displayName = displayName;
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (email !== undefined) updateData.email = email;
        if (phone !== undefined) updateData.phone = phone;
        await hrmUsersService.update(userId, updateData as any);
        auditAction = "update_user";
        auditDetails = `Updated profile fields: ${Object.keys(updateData).join(", ")}`;
        break;
      }

      case "reset-password": {
        // Only admins can reset other users' passwords
        if (auth.role === "employee" && userId !== auth.userId) {
          return NextResponse.json(
            { error: "Forbidden: insufficient permissions" },
            { status: 403 }
          );
        }
        const resetLink = await getAdminAuth().generatePasswordResetLink(
          targetUserEmail
        );
        auditAction = "reset_password";
        auditDetails = `Password reset link generated for ${targetUserEmail}`;

        return NextResponse.json({
          data: {
            success: true,
            resetLink,
            message: `Password reset link sent for ${targetUserEmail}`,
          },
        });
      }

      default: {
        // Legacy PATCH support (direct field updates)
        if (auth.role === "employee" && userId !== auth.userId) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (auth.role === "employee") {
          // Employees can only update limited fields
          const { displayName, firstName, lastName, phone } = body;
          const updateData: Record<string, any> = {};
          if (displayName !== undefined) updateData.displayName = displayName;
          if (firstName !== undefined) updateData.firstName = firstName;
          if (lastName !== undefined) updateData.lastName = lastName;
          if (phone !== undefined) updateData.phone = phone;
          await hrmUsersService.update(userId, updateData as any);
          auditDetails = `Updated profile: ${Object.keys(updateData).join(", ")}`;
        } else {
          await hrmUsersService.update(userId, body as any);
          auditDetails = `Updated user fields: ${Object.keys(body).join(", ")}`;
        }
      }
    }

    // Record audit log (skip for self-service updates)
    if (auditDetails && auth.userId !== userId) {
      await recordAuditLog({
        tenantId,
        action: auditAction,
        performedById: auth.userId,
        performedByName: body._performedByName || "Admin",
        targetUserId: userId,
        targetUserEmail,
        details: auditDetails,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("PATCH /api/hrm/v2/users error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// ── DELETE: Delete user (Super Admin only) ────────────

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireSuperAdmin();
    if (isErrorResponse(auth)) return auth;

    const origin = request.headers.get("origin");
    const tenantCtx = await resolveTenantFromOrigin(origin);
    const tenantId = tenantCtx?.tenantId || "default";

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Cannot delete yourself
    if (userId === auth.userId) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Get user info for audit log before deletion
    const targetUser = await hrmUsersService.findById(userId);
    const targetUserEmail = (targetUser as any)?.email || "unknown";

    // Delete from Firebase Auth
    try {
      await getAdminAuth().deleteUser(userId);
    } catch {
      // Auth user may not exist, continue with Firestore deletion
    }

    // Delete from Firestore
    await hrmUsersService.delete(userId);

    // Record audit log
    await recordAuditLog({
      tenantId,
      action: "delete_user",
      performedById: auth.userId,
      performedByName: "Super Admin",
      targetUserId: userId,
      targetUserEmail,
      details: `Deleted user ${targetUserEmail}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/hrm/v2/users error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
