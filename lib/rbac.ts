// ══════════════════════════════════════════════════════════════════
// Role-Based Access Control (RBAC)
//
// Lightweight role model for the Skora marketing/CMS admin area.
// (HRMS-specific roles, permissions and routes were removed.)
// ══════════════════════════════════════════════════════════════════

import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

// ── Role Types ─────────────────────────────────────────

export type Role = "admin" | "super_admin";

export const ROLES = {
  ADMIN: "admin" as const,
  SUPER_ADMIN: "super_admin" as const,
} as const;

/** Normalize arbitrary stored role values to a known admin role. */
export function normalizeRole(role: string | undefined | null): Role {
  const normalized = String(role ?? "").trim().toLowerCase();
  if (normalized === "super_admin" || normalized === "superadmin") return "super_admin";
  return "admin";
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  admin: 80,
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
};

/** Whether a role is allowed into the admin portal (any authenticated admin). */
export function isAdminRole(role: string | undefined | null): boolean {
  const r = normalizeRole(role);
  return r === "admin" || r === "super_admin";
}

export function isSuperAdminEmail(email: string): boolean {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}
