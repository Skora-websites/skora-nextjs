import "server-only";
import { Types } from "mongoose";
import { requireSession, type ActingUser, type HRMSRole } from "@/lib/auth-server";

/** Allowed HRMS roles in this app. */
export const HRMS_ROLES = ["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"] as const;

/** Throw unless the session user's role is in the allowlist. */
export async function assertRole(allowed: HRMSRole[]): Promise<ActingUser> {
  const actor = await requireSession();
  if (!allowed.includes(actor.role)) throw new Error("FORBIDDEN");
  return actor;
}

/**
 * Self-or-elevated ownership check. Employees can only act on themselves.
 * Managers can act on users in their team (reportingManagerId === actor.id).
 * HR_ADMIN / SUPER_ADMIN can act on any user in their tenant (or any user
 * if SUPER_ADMIN has no tenant).
 */
export async function assertSelfOrManagerOrHR(
  targetUserId: string,
  opts: { fetchTarget?: boolean } = {}
): Promise<ActingUser> {
  const actor = await requireSession();
  if (!targetUserId) throw new Error("targetUserId required");
  if (actor.role === "SUPER_ADMIN") return actor; // global super admin
  if (actor.id === targetUserId) return actor;

  if (actor.role === "HR_ADMIN" || actor.role === "MANAGER") {
    // Lazy import to avoid circular deps; only the model is touched.
    const { User } = await import("@/lib/db/models");
    const target = await User.findById(targetUserId)
      .select("_id tenantId reportingManagerId role")
      .lean();
    if (!target) throw new Error("Target user not found");
    if (actor.tenantId && String(target.tenantId) !== String(actor.tenantId)) {
      throw new Error("FORBIDDEN: cross-tenant");
    }
    if (actor.role === "HR_ADMIN") return actor;
    // MANAGER: must be the user's reporting manager
    if (String(target.reportingManagerId) === String(actor.id)) return actor;
  }
  throw new Error("FORBIDDEN");
}

/** Throw if `actor.tenantId` does not match `doc.tenantId` (and actor is not a global super admin). */
export function assertTenant(
  actor: ActingUser,
  doc: { tenantId?: Types.ObjectId | string | null } | null | undefined,
  allowNoTenant = false
): void {
  if (actor.role === "SUPER_ADMIN" && !actor.tenantId) return; // global SA
  if (!doc) {
    if (allowNoTenant) return;
    throw new Error("FORBIDDEN: missing record");
  }
  if (!actor.tenantId) throw new Error("FORBIDDEN: missing tenantId in session");
  if (!doc.tenantId) {
    if (allowNoTenant) return;
    throw new Error("FORBIDDEN: record has no tenant");
  }
  if (String(doc.tenantId) !== String(actor.tenantId)) {
    throw new Error("FORBIDDEN: cross-tenant");
  }
}

/** True if `actor` manages `targetUserId` (is their reporting manager, same tenant). */
export async function isDirectManager(
  actor: ActingUser,
  targetUserId: string
): Promise<boolean> {
  if (actor.role !== "MANAGER") return false;
  if (actor.id === targetUserId) return true; // self
  const { User } = await import("@/lib/db/models");
  const target = await User.findById(targetUserId)
    .select("reportingManagerId tenantId")
    .lean();
  if (!target) return false;
  if (actor.tenantId && String(target.tenantId) !== String(actor.tenantId)) return false;
  return String(target.reportingManagerId) === String(actor.id);
}
