import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "node:crypto";
import { getAdminAuth } from "@/lib/firebase-admin";
import { normalizeRole, hasPermission, type PermissionKey } from "@/lib/rbac";

// ── Session Verification ────────────────────────────────

/**
 * Verify the session cookie and extract user info.
 * Supports two cookie formats:
 *   - hrms_session_<base64url-payload>.<hmac-sig>  (HMAC-signed by lib/auth.ts signHrmsPayload)
 *   - Firebase session cookie                          (verified via Admin SDK)
 * Returns null if not authenticated.
 */
async function verifySession(): Promise<{
  userId: string;
  role: string;
  tenantId?: string;
} | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  // ── Branch A: HRMS signed cookie ──
  if (sessionCookie.startsWith("hrms_session_")) {
    const token = sessionCookie.slice("hrms_session_".length);
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [body, sig] = parts;
    const secret = getSessionSecret();
    const expected = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    try {
      const json = Buffer.from(body, "base64url").toString("utf-8");
      const parsed = JSON.parse(json) as Record<string, unknown>;
      if (!parsed || typeof parsed !== "object") return null;
      return {
        userId: String(parsed.id || ""),
        role: normalizeRole(parsed.role as string | undefined),
        tenantId: parsed.tenantId as string | undefined,
      };
    } catch {
      return null;
    }
  }

  // ── Branch B: Firebase session cookie ──
  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, false);
    const role = normalizeRole(
      (decoded as Record<string, unknown>).role as string | undefined
    );
    return {
      userId: decoded.uid,
      role,
      tenantId: (decoded as Record<string, unknown>).tenantId as string | undefined,
    };
  } catch {
    return null;
  }
}

function getSessionSecret(): string {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 16) return explicit;
  // SECURITY: production must explicitly set SESSION_SECRET; never derive.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET must be set (>=16 chars) in production."
    );
  }
  const seed = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "dev-only-hrms-session-secret";
  return crypto.createHash("sha256").update(String(seed)).digest("hex");
}

// ── Route Wrappers ──────────────────────────────────────

export interface ApiAuthResult {
  userId: string;
  role: string;
  tenantId: string;
}

/**
 * Require authentication for an API route.
 * Returns 401 if not authenticated.
 */
export async function requireAuth(): Promise<ApiAuthResult | NextResponse> {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return {
    userId: session.userId,
    role: session.role,
    tenantId: session.tenantId || "default",
  };
}

/**
 * Require authentication AND a specific permission.
 * Returns 401 if not authenticated, 403 if insufficient permissions.
 *
 * NOTE: this uses the 3-role RBAC system in `lib/rbac.ts` (super_admin/admin/employee).
 * The HRMS data plane uses a 4-role system (SUPER_ADMIN/HR_ADMIN/MANAGER/EMPLOYEE) via
 * `lib/auth-server.ts`. Do NOT use this for HRMS endpoints — use `withTenant` +
 * `requireRole` from `lib/guards.ts` instead. Audit finding F-1.
 */
export async function requirePermission(
  permission: PermissionKey | string
): Promise<ApiAuthResult | NextResponse> {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasPermission(session.role, permission)) {
    return NextResponse.json(
      { error: "Forbidden: insufficient permissions" },
      { status: 403 }
    );
  }

  return {
    userId: session.userId,
    role: session.role,
    tenantId: session.tenantId || "default",
  };
}

/**
 * Require authentication AND admin-level role (admin or super_admin).
 * Returns 401 if not authenticated, 403 if employee.
 */
export async function requireAdmin(): Promise<ApiAuthResult | NextResponse> {
  const auth = await requireAuth();
  if (isErrorResponse(auth)) return auth;
  if (auth.role === "employee") {
    return NextResponse.json(
      { error: "Forbidden: insufficient permissions" },
      { status: 403 }
    );
  }
  return auth;
}

/**
 * Require authentication AND super_admin role.
 * Returns 401 if not authenticated, 403 if not super_admin.
 */
export async function requireSuperAdmin(): Promise<ApiAuthResult | NextResponse> {
  const auth = await requireAuth();
  if (isErrorResponse(auth)) return auth;
  if (auth.role !== "super_admin") {
    return NextResponse.json(
      { error: "Forbidden: only Super Admin can perform this action" },
      { status: 403 }
    );
  }
  return auth;
}

/**
 * Check if a result from requireAuth/requirePermission/requireAdmin is an error response.
 */
export function isErrorResponse(
  result: ApiAuthResult | NextResponse
): result is NextResponse {
  return result instanceof NextResponse;
}
