import type { Role } from "@/lib/rbac";

const ROLE_MAP: Record<string, Role> = {
  super_admin: "super_admin",
  superadmin: "super_admin",
  admin: "admin",
  administrator: "admin",
};

/**
 * Normalize only known admin roles. Unknown or malformed database values fail
 * closed to the base "admin" role instead of being cast into a privileged type.
 */
export function normalizeRoleStrict(role: string | undefined | null): Role {
  const normalized = String(role ?? "").trim().toLowerCase();
  return ROLE_MAP[normalized] ?? "admin";
}
