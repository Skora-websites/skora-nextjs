import "server-only";
import { connectDB } from "@/lib/db/db";
import { Tenant } from "@/lib/db/models";
import { requireSession, type ActingUser } from "@/lib/auth-server";

/**
 * Build a tenant filter for Mongo queries. For SUPER_ADMIN without a tenant
 * (global), returns {} (no filter — they can see everything). For any other
 * role, returns { tenantId: session.tenantId }.
 */
export function tenantFilter(actor: ActingUser): Record<string, unknown> {
  if (actor.role === "SUPER_ADMIN" && !actor.tenantId) return {};
  if (!actor.tenantId) {
    throw new Error("FORBIDDEN: missing tenantId");
  }
  return { tenantId: actor.tenantId };
}

/**
 * Require session + return tenant ObjectId helper. Use at the top of any
 * mutating action that touches tenant-scoped data.
 */
export async function withTenant(): Promise<{ actor: ActingUser; filter: Record<string, unknown> }> {
  const actor = await requireSession();
  return { actor, filter: tenantFilter(actor) };
}

/**
 * Resolve a tenant's office geofence. Falls back to Skora HQ (Delhi NCR) defaults
 * if the tenant has no coordinates configured.
 */
export async function getTenantGeofence(tenantId?: string) {
  await connectDB();
  const fallback = {
    latitude: 28.6007594,
    longitude: 77.4319307,
    radiusMeters: 100,
  };
  if (!tenantId) return fallback;
  const t = await Tenant.findById(tenantId).select("officeCoordinates").lean();
  if (!t?.officeCoordinates) return fallback;
  return {
    latitude: t.officeCoordinates.latitude ?? fallback.latitude,
    longitude: t.officeCoordinates.longitude ?? fallback.longitude,
    radiusMeters: t.officeCoordinates.radiusMeters ?? fallback.radiusMeters,
  };
}
