import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase-admin";
import { normalizeRole, hasPermission, type PermissionKey } from "@/lib/rbac";

// ── Types ───────────────────────────────────────────────

export interface AuthenticatedRequest {
  userId: string;
  role: string;
  isAuthenticated: true;
}

export interface ApiAuthResult {
  userId: string;
  role: string;
  tenantId: string;
}

// ── Session Verification ────────────────────────────────

/**
 * Verify the session cookie and extract user info.
 * Returns null if not authenticated.
 */
async function verifySession(): Promise<{
  userId: string;
  role: string;
} | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, false);
    const role = normalizeRole(
      (decoded as Record<string, unknown>).role as string | undefined
    );
    return { userId: decoded.uid, role };
  } catch {
    return null;
  }
}

// ── Route Wrappers ──────────────────────────────────────

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
    tenantId: "default",
  };
}

/**
 * Require authentication AND a specific permission.
 * Returns 401 if not authenticated, 403 if insufficient permissions.
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
    tenantId: "default",
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
