import "server-only";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db/mongo-helper";
import { hasPermission, type PermissionKey } from "@/lib/rbac";
import { normalizeRoleStrict } from "@/lib/role-utils";
import { ObjectId } from "mongodb";

/** getDb with a 5s timeout to prevent hanging when MongoDB is unreachable */
async function getDbWithTimeout() {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
  const dbPromise = getDb();
  return Promise.race([dbPromise, timeout]);
}

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

async function verifySession(): Promise<{ userId: string; role: string } | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return null;

  try {
    const db = await getDbWithTimeout();
    if (!db) return null;

    const session = await db.collection("sessions").findOne({
      token: sessionToken,
      expiresAt: { $gt: new Date() },
    });
    if (!session) return null;

    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.userId),
    });
    if (!user) return null;

    const role = normalizeRoleStrict(user.role);
    return { userId: user._id.toString(), role };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<ApiAuthResult | NextResponse> {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { userId: session.userId, role: session.role, tenantId: "default" };
}

export async function requirePermission(
  permission: PermissionKey | string
): Promise<ApiAuthResult | NextResponse> {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(session.role, permission)) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  return { userId: session.userId, role: session.role, tenantId: "default" };
}

/** Require a privileged HR/admin role; managers and employees must use explicit permissions. */
export async function requireAdmin(): Promise<ApiAuthResult | NextResponse> {
  const auth = await requireAuth();
  if (isErrorResponse(auth)) return auth;
  if (!["super_admin", "hr_admin", "admin"].includes(auth.role)) {
    return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
  }
  return auth;
}

export async function requireSuperAdmin(): Promise<ApiAuthResult | NextResponse> {
  const auth = await requireAuth();
  if (isErrorResponse(auth)) return auth;
  if (auth.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden: only Super Admin can perform this action" }, { status: 403 });
  }
  return auth;
}

export function isErrorResponse(result: ApiAuthResult | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
