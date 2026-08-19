import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { hrmUsersService } from "@/lib/hrm/firestore";
import { resolveTenantFromOrigin, createTenant } from "@/services/hrm/tenant";
import { ROLE_DEFINITIONS } from "@/services/hrm/auth";
import { normalizeRole, isSuperAdminEmail } from "@/lib/rbac";
import { requireAuth, requireAdmin, requireSuperAdmin, isErrorResponse } from "@/lib/api-auth";
import { withErrorHandler, badRequest, notFound, forbidden } from "@/lib/api-handler";
import { createSession, SESSION_COOKIE_OPTIONS, SESSION_EXPIRES_IN_MS } from "@/lib/auth";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const action = body.action;

  switch (action) {
    case "set-claims": {
      const auth = await requireAuth();
      if (isErrorResponse(auth)) return auth;
      if (auth.role !== "super_admin") {
        return forbidden("Only Super Admin can set custom claims");
      }
      const { userId, claims } = body;
      await getAdminAuth().setCustomUserClaims(userId, claims);
      return NextResponse.json({ success: true });
    }

    case "get-session": {
      const { idToken } = body;
      const decoded = await getAdminAuth().verifyIdToken(idToken);

      const user = await hrmUsersService.findById(decoded.uid);
      if (!user) {
        return notFound("User not found");
      }

      return NextResponse.json({
        data: {
          uid: decoded.uid,
          email: decoded.email,
          emailVerified: decoded.email_verified,
          role: decoded.role || user.role,
          tenantId: decoded.tenantId || user.tenantId,
          displayName: user.displayName,
          photoURL: user.photoURL,
        },
      });
    }

    case "register": {
      const { email, password, displayName, firstName, lastName, tenantId } = body;
      const tenant = tenantId || "default";
      const existingUsers = await hrmUsersService.countInTenant(tenant);
      const role = isSuperAdminEmail(email) || existingUsers === 0 ? "super_admin" : "employee";

      const authUser = await getAdminAuth().createUser({
        email,
        password,
        displayName,
      });

      await hrmUsersService.createWithId(authUser.uid, {
        email,
        emailVerified: false,
        displayName,
        firstName: firstName || displayName,
        lastName: lastName || "",
        role,
        status: "active",
        loginStatus: "enabled",
        allowMobileLogin: false,
        tenantId: tenant,
      } as any);

      await getAdminAuth().setCustomUserClaims(authUser.uid, {
        role,
        tenantId: tenant,
      });

      // Sign in to get an ID token, then create a session cookie for auto-login
      let sessionCookie: string | null = null;
      try {
        const { signInWithFirebase } = await import("@/lib/auth");
        const idToken = await signInWithFirebase(email, password);
        sessionCookie = await createSession(idToken);
      } catch {
        // Session creation is best-effort; user can still log in manually
      }

      const response = NextResponse.json({
        data: {
          uid: authUser.uid,
          email: authUser.email,
          displayName: authUser.displayName,
          role,
          sessionCreated: !!sessionCookie,
        },
      }, { status: 201 });

      if (sessionCookie) {
        response.cookies.set("session", sessionCookie, {
          ...SESSION_COOKIE_OPTIONS,
          maxAge: SESSION_EXPIRES_IN_MS / 1000,
        });
      }

      return response;
    }

    case "reset-password": {
      const { email } = body;
      const resetLink = await getAdminAuth().generatePasswordResetLink(email);
      return NextResponse.json({ data: { resetLink } });
    }

    case "verify-token": {
      const { token } = body;
      const decoded = await getAdminAuth().verifyIdToken(token);
      return NextResponse.json({ data: { uid: decoded.uid, email: decoded.email } });
    }

    case "create-user": {
      const auth = await requireAuth();
      if (isErrorResponse(auth)) return auth;
      if (auth.role === "employee") {
        return forbidden("Insufficient permissions");
      }
      const { email, password, displayName, role: rawRole, tenantId } = body;
      const role = normalizeRole(rawRole);

      const authUser = await getAdminAuth().createUser({
        email,
        password,
        displayName,
      });

      await getAdminAuth().setCustomUserClaims(authUser.uid, {
        role,
        tenantId: tenantId || "default",
      });

      return NextResponse.json({ data: { uid: authUser.uid, email: authUser.email } }, { status: 201 });
    }

    case "tenant-setup": {
      const { name, domain, email, plan } = body;
      const tenant = await createTenant({ name, domain, email, plan });
      return NextResponse.json({ data: tenant }, { status: 201 });
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

      const authUser = await getAdminAuth().getUser(userId);
      return NextResponse.json({ data: { ...user, customClaims: authUser.customClaims } });
    }

    case "users": {
      if (auth.role === "employee") {
        return forbidden();
      }
      const origin = request.headers.get("origin");
      const tenantCtx = await resolveTenantFromOrigin(origin);
      const tenantId = tenantCtx?.tenantId || "default";

      const users = await hrmUsersService.findManyInTenant(tenantId);
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
    await getAdminAuth().setCustomUserClaims(userId, { role: normalizedRole });
    await hrmUsersService.update(userId, { role: normalizedRole } as any);
    return NextResponse.json({ success: true });
  }

  if (loginStatus && userId) {
    if (auth.role === "employee") {
      return forbidden("Insufficient permissions");
    }
    if (loginStatus === "disabled") {
      await getAdminAuth().revokeRefreshTokens(userId);
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

  await getAdminAuth().deleteUser(userId);
  await hrmUsersService.delete(userId);

  return NextResponse.json({ success: true });
}, { label: "HRM Auth" });
