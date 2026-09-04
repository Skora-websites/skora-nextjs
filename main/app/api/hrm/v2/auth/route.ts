import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { hrmUsersService } from "@/lib/hrm/firestore";
import { ROLE_DEFINITIONS } from "@/services/hrm/auth";
import { normalizeRole } from "@/lib/rbac";
import { requireAuth, requireAdmin, requireSuperAdmin, isErrorResponse } from "@/lib/api-auth";
import { withErrorHandler, badRequest, notFound, forbidden } from "@/lib/api-handler";
import { rateLimit } from "@/lib/security";
import { z } from "zod";

// ponytail: tight per-action rate limits because this route is a multi-action
// dispatcher — a single bucket would let one abusive action starve the others.
function clientKey(req: NextRequest, suffix: string) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  return `hrmv2:${suffix}:${ip}`;
}

// ── Input schemas (whitelist approach) ─────────────────────────
const RegisterSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  tenantId: z.string().min(1).max(128).optional(),
});

const ResetPasswordSchema = z.object({
  email: z.string().email().max(254),
});

const CreateUserSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(100),
  role: z.enum(["super_admin", "admin", "employee", "hr_admin", "manager"]),
  tenantId: z.string().min(1).max(128),
});

const PatchUserSchema = z
  .object({
    userId: z.string().min(1).max(256),
    role: z.enum(["super_admin", "admin", "employee", "hr_admin", "manager"]).optional(),
    loginStatus: z.enum(["enabled", "disabled"]).optional(),
    tenantId: z.string().min(1).max(128).optional(),
  })
  .refine((d) => d.role || d.loginStatus, { message: "Provide role or loginStatus" });

const TenantSetupSchema = z.object({
  name: z.string().min(1).max(200),
  domain: z.string().min(1).max(200),
  email: z.string().email().max(254),
  plan: z.string().min(1).max(64).optional(),
});

const SetClaimsSchema = z.object({
  userId: z.string().min(1).max(256),
  claims: z.record(z.string().min(1).max(64), z.union([z.string().max(256), z.number(), z.boolean()])).refine(
    (c) => Object.keys(c).every((k) => /^(role|tenantId)$/.test(k)),
    { message: "Only role/tenantId claims are allowed" }
  ),
});

// ── Audit logger (fire-and-forget) ─────────────────────────────
type AuditResult = "success" | "denied" | "error";
async function logHrmAuthAudit(
  actor: { userId: string; role: string; tenantId: string } | null,
  action: string,
  result: AuditResult,
  args: unknown
) {
  try {
    // Reuse the existing auditLogsService collection if available.
    const { auditLogsService } = await import("@/lib/hrm/firestore");
    await auditLogsService.create({
      actorId: actor?.userId || "anonymous",
      actorEmail: "",
      actorRole: actor?.role || "anonymous",
      action: `hrmv2.auth.${action}`,
      args: [truncate(args)],
      result,
      tenantId: actor?.tenantId || "default",
      durationMs: 0,
      createdAt: new Date(),
    } as any);
  } catch {
    // best-effort; do not throw
  }
}

function truncate(value: unknown): string {
  try {
    const s = JSON.stringify(value);
    return s.length > 500 ? s.slice(0, 500) + "…" : s;
  } catch {
    return "<unserializable>";
  }
}

// ── Constant-time response for reset-password (no enumeration) ──
async function constantTimeDelay(start: number) {
  // Aim for ~400ms total response time so timing can't reveal
  // whether the email exists.
  const elapsed = Date.now() - start;
  const target = 400;
  if (elapsed < target) {
    await new Promise((r) => setTimeout(r, target - elapsed));
  }
}

// ── POST ───────────────────────────────────────────────────────
export const POST = withErrorHandler(async (request: NextRequest) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }
  if (!body || typeof body !== "object") return badRequest("Invalid body");
  const action = (body as Record<string, unknown>).action;

  switch (action) {
    // ─── 1. Password reset: no auth, no enumeration, no link leak ───
    case "reset-password": {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      // Stricter: 5 req/min per IP and 3 req/min per email.
      const rlIp = rateLimit(`resetpw:ip:${ip}`, 5, 60_000);
      if (!rlIp.allowed) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429, headers: { "Retry-After": String(Math.ceil(rlIp.resetMs / 1000)) } }
        );
      }
      const parsed = ResetPasswordSchema.safeParse(body);
      if (!parsed.success) {
        return badRequest("Invalid email");
      }
      const rlEmail = rateLimit(`resetpw:email:${parsed.data.email.toLowerCase()}`, 3, 60_000);
      if (!rlEmail.allowed) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429, headers: { "Retry-After": String(Math.ceil(rlEmail.resetMs / 1000)) } }
        );
      }
      const t0 = Date.now();
      // Try to find the user first; if they don't exist, return the SAME shape.
      // Firebase Auth itself generates the link server-side and would email it
      // only if the configured action URL is set. We deliberately do NOT return
      // the link to the caller (was: account takeover).
      let accountExists = false;
      try {
        await getAdminAuth().getUserByEmail(parsed.data.email);
        accountExists = true;
        await getAdminAuth().generatePasswordResetLink(parsed.data.email);
      } catch {
        accountExists = false;
      }
      await constantTimeDelay(t0);
      // Always log + always return the same opaque response.
      await logHrmAuthAudit(null, "reset-password", "success", { email: parsed.data.email, found: accountExists });
      return NextResponse.json({ data: { sent: true } });
    }

    // ─── 2. Self-register: capped, no first-user-becomes-super_admin ───
    case "register": {
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const rl = rateLimit(`register:ip:${ip}`, 3, 60_000);
      if (!rl.allowed) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } }
        );
      }
      const parsed = RegisterSchema.safeParse(body);
      if (!parsed.success) return badRequest("Invalid registration payload");
      // SECURITY: no automatic super_admin bootstrap here. Use the dedicated
      // /api/auth/register (rate-limited, audited) or a SUPER_ADMIN-only action.
      const role = "employee";
      const tenant = parsed.data.tenantId || "default";

      const authUser = await getAdminAuth().createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        displayName: parsed.data.displayName,
      });
      await hrmUsersService.createWithId(authUser.uid, {
        email: parsed.data.email,
        emailVerified: false,
        displayName: parsed.data.displayName,
        firstName: parsed.data.firstName || parsed.data.displayName,
        lastName: parsed.data.lastName || "",
        role,
        status: "active",
        loginStatus: "enabled",
        allowMobileLogin: false,
        tenantId: tenant,
      } as any);
      await getAdminAuth().setCustomUserClaims(authUser.uid, { role, tenantId: tenant });
      await logHrmAuthAudit({ userId: authUser.uid, role, tenantId: tenant }, "register", "success", { email: parsed.data.email });
      return NextResponse.json({
        data: { uid: authUser.uid, email: authUser.email, role },
      }, { status: 201 });
    }

    // ─── 3. get-session: caller proves possession of an idToken ───
    case "get-session": {
      // SECURITY: anyone with a valid idToken may fetch their own session.
      // We do NOT return claims beyond what the token already carries.
      const token = (body as Record<string, unknown>).idToken;
      if (typeof token !== "string" || !token) return badRequest("idToken required");
      let decoded;
      try {
        decoded = await getAdminAuth().verifyIdToken(token);
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
      const user = await hrmUsersService.findById(decoded.uid);
      return NextResponse.json({
        data: {
          uid: decoded.uid,
          email: decoded.email,
          emailVerified: decoded.email_verified,
          role: decoded.role || user?.role || "employee",
          tenantId: decoded.tenantId || user?.tenantId,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
        },
      });
    }

    // ─── 4. verify-token (Firebase idToken verification utility) ───
    case "verify-token": {
      const token = (body as Record<string, unknown>).token;
      if (typeof token !== "string" || !token) return badRequest("token required");
      try {
        const decoded = await getAdminAuth().verifyIdToken(token);
        return NextResponse.json({ data: { uid: decoded.uid, email: decoded.email } });
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    // ─── 5. set-claims: super_admin only; whitelist role/tenantId only ───
    case "set-claims": {
      const auth = await requireAuth();
      if (isErrorResponse(auth)) return auth;
      if (auth.role !== "super_admin") return forbidden("Only Super Admin can set custom claims");
      const parsed = SetClaimsSchema.safeParse(body);
      if (!parsed.success) return badRequest("Invalid claims");
      await getAdminAuth().setCustomUserClaims(parsed.data.userId, parsed.data.claims);
      await logHrmAuthAudit(auth, "set-claims", "success", { userId: parsed.data.userId, claims: parsed.data.claims });
      return NextResponse.json({ success: true });
    }

    // ─── 6. create-user: admin+; tenant-bound; cannot escalate beyond own role ───
    case "create-user": {
      const auth = await requireAuth();
      if (isErrorResponse(auth)) return auth;
      if (auth.role === "employee") return forbidden("Insufficient permissions");
      const parsed = CreateUserSchema.safeParse(body);
      if (!parsed.success) return badRequest("Invalid payload");
      // SECURITY: apply the same role ceiling as lib/actions/hrms-actions.ts
      // createEmployee. Without this, an `admin` (HR_ADMIN) could mint other
      // HR_ADMINs and eventually gather enough to compromise the tenant.
      if (auth.role !== "super_admin") {
        if (parsed.data.role === "super_admin" || parsed.data.role === "admin" || parsed.data.role === "hr_admin") {
          return forbidden("Cannot create users at or above your own role");
        }
      }
      // Tenant guard: must match caller's tenant unless super_admin.
      if (auth.role !== "super_admin" && parsed.data.tenantId !== auth.tenantId) {
        return forbidden("Cross-tenant create not allowed");
      }
      const authUser = await getAdminAuth().createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        displayName: parsed.data.displayName,
      });
      await getAdminAuth().setCustomUserClaims(authUser.uid, {
        role: parsed.data.role,
        tenantId: parsed.data.tenantId,
      });
      await logHrmAuthAudit(auth, "create-user", "success", {
        uid: authUser.uid,
        role: parsed.data.role,
        tenantId: parsed.data.tenantId,
      });
      return NextResponse.json({ data: { uid: authUser.uid, email: authUser.email } }, { status: 201 });
    }

    // ─── 7. tenant-setup: super_admin only ───
    case "tenant-setup": {
      const auth = await requireSuperAdmin();
      if (isErrorResponse(auth)) return auth;
      const parsed = TenantSetupSchema.safeParse(body);
      if (!parsed.success) return badRequest("Invalid tenant payload");
      const { createTenant } = await import("@/services/hrm/tenant");
      const tenant = await createTenant({
        name: parsed.data.name,
        domain: parsed.data.domain,
        email: parsed.data.email,
        plan: parsed.data.plan as "basic" | "standard" | "enterprise" | undefined,
      });
      await logHrmAuthAudit(auth, "tenant-setup", "success", { tenantId: tenant?.id });
      return NextResponse.json({ data: tenant }, { status: 201 });
    }

    default:
      await logHrmAuthAudit(null, String(action || "unknown"), "denied", null);
      return badRequest("Invalid action");
  }
}, { label: "HRM Auth" });

// ── GET (read-only, role-gated) ─────────────────────────────────
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
      if (!userId) return badRequest("userId required");
      const user = await hrmUsersService.findById(userId);
      if (!user) return notFound("User not found");
      // Tenant guard for non-super_admin.
      if (auth.role !== "super_admin" && user.tenantId && user.tenantId !== auth.tenantId) {
        return forbidden();
      }
      return NextResponse.json({ data: { ...user, customClaims: undefined } });
    }
    case "users": {
      if (auth.role === "employee") return forbidden();
      const tenantId = auth.role === "super_admin" ? searchParams.get("tenantId") || undefined : auth.tenantId;
      if (!tenantId) return badRequest("tenantId required");
      const users = await hrmUsersService.findManyInTenant(tenantId);
      return NextResponse.json({ data: users });
    }
    default:
      return badRequest("Invalid action. Use: roles, user, users");
  }
}, { label: "HRM Auth" });

// ── PATCH (mutations; role + tenant gated; audited) ────────────
export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireAuth();
  if (isErrorResponse(auth)) return auth;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON");
  }
  const parsed = PatchUserSchema.safeParse(body);
  if (!parsed.success) return badRequest("Invalid payload");

  const { userId, role, loginStatus, tenantId } = parsed.data;

  // Fetch target to enforce tenant guard.
  const target = await hrmUsersService.findById(userId);
  if (!target) return notFound("User not found");
  if (auth.role !== "super_admin") {
    if (target.tenantId && target.tenantId !== auth.tenantId) {
      return forbidden("Cross-tenant access denied");
    }
  }

  if (role) {
    if (auth.role !== "super_admin") return forbidden("Only Super Admin can change roles");
    if (role === "super_admin" && auth.role !== "super_admin") {
      return forbidden("Cannot grant super_admin");
    }
    // Cannot change your own role (prevents lockout & self-escalation tricks).
    if (userId === auth.userId) return forbidden("Cannot change your own role");
    const normalizedRole = normalizeRole(role);
    await getAdminAuth().setCustomUserClaims(userId, { role: normalizedRole, tenantId: target.tenantId || "default" });
    await hrmUsersService.update(userId, { role: normalizedRole } as any);
    // SECURITY: keep Mongo User.role in lockstep with the Firebase claim so
    // requireSession() (which reads Mongo for HMAC cookies AND for Firestore
    // cookies via getHRMSUser) reflects the new role on the next request.
    // Without this, a SUPER_ADMIN could be demoted in Firebase but keep SA
    // privileges via the HRMS data plane.
    try {
      const { connectDB } = await import("@/lib/db/db");
      const { User } = await import("@/lib/db/models");
      await connectDB();
      // Map normalized RBAC role → HRMS role enum.
      const hrmsRole =
        normalizedRole === "super_admin" ? "SUPER_ADMIN" :
        normalizedRole === "admin" || normalizedRole === "hr_admin" ? "HR_ADMIN" :
        normalizedRole === "manager" ? "MANAGER" : "EMPLOYEE";
      await User.updateOne(
        { _id: userId },
        { $set: { role: hrmsRole } }
      );
    } catch (mongoErr) {
      await logHrmAuthAudit(auth, "patch.role", "error", { userId, err: String(mongoErr) });
    }
    // SECURITY: revoke refresh tokens so the target's next request re-issues
    // a session cookie with the new role. Without this, a demoted user keeps
    // their previous role in the HMAC session for up to 5 days.
    try { await getAdminAuth().revokeRefreshTokens(userId); } catch {}
    await logHrmAuthAudit(auth, "patch.role", "success", { userId, role: normalizedRole });
  }

  if (loginStatus) {
    if (auth.role === "employee") return forbidden("Insufficient permissions");
    if (loginStatus === "disabled") {
      try {
        await getAdminAuth().revokeRefreshTokens(userId);
      } catch {
        // user may not exist in Firebase — ignore
      }
    }
    await hrmUsersService.update(userId, { loginStatus } as any);
    await logHrmAuthAudit(auth, "patch.loginStatus", "success", { userId, loginStatus });
  }

  if (tenantId) {
    if (auth.role !== "super_admin") return forbidden("Only Super Admin can change tenantId");
    await getAdminAuth().setCustomUserClaims(userId, { tenantId });
    await hrmUsersService.update(userId, { tenantId } as any);
    await logHrmAuthAudit(auth, "patch.tenantId", "success", { userId, tenantId });
  }

  return NextResponse.json({ success: true });
}, { label: "HRM Auth" });

// ── DELETE (super_admin; same-tenant unless super_admin) ────────
export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireSuperAdmin();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return badRequest("userId required");

  // Refuse to delete self.
  if (userId === auth.userId) return forbidden("Cannot delete your own account");

  const target = await hrmUsersService.findById(userId);
  if (!target) return notFound("User not found");
  if (target.tenantId && target.tenantId !== auth.tenantId) {
    // super_admin across tenants — but we still audit.
  }

  await getAdminAuth().deleteUser(userId).catch(() => undefined);
  await hrmUsersService.delete(userId);
  await logHrmAuthAudit(auth, "delete", "success", { userId });
  return NextResponse.json({ success: true });
}, { label: "HRM Auth" });
