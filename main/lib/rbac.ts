// ══════════════════════════════════════════════════════════════════
// Role-Based Access Control (RBAC)
// ══════════════════════════════════════════════════════════════════

import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

// ── Role Types ─────────────────────────────────────────

export type Role = "super_admin" | "admin" | "employee";

export const ROLES = {
  SUPER_ADMIN: "super_admin" as const,
  ADMIN: "admin" as const,
  EMPLOYEE: "employee" as const,
} as const;

/**
 * Maps HRMS roles (4-role) AND legacy roles to the 3-role RBAC system.
 * HR_ADMIN and MANAGER map to "admin" so the existing 3-role permission
 * matrix keeps working without a schema change.
 */
export const LEGACY_ROLE_MAP: Record<string, Role> = {
  // 4-role HRMS roles
  SUPER_ADMIN: "super_admin",
  HR_ADMIN: "admin",
  MANAGER: "admin",
  EMPLOYEE: "employee",
  // legacy / external names
  super_admin: "super_admin",
  admin: "admin",
  hr: "admin",
  manager: "admin",
  employee: "employee",
  agent: "employee",
  support_manager: "admin",
};

/**
 * Normalize a role string to one of the three canonical roles.
 * Handles legacy roles and unknown roles gracefully.
 */
export function normalizeRole(role: string | undefined | null): Role {
  if (!role) return "employee";
  // Try exact, then uppercase (HRMS roles are uppercase), then lowercase.
  return (
    LEGACY_ROLE_MAP[role] ||
    LEGACY_ROLE_MAP[role.toUpperCase()] ||
    LEGACY_ROLE_MAP[role.toLowerCase()] ||
    "employee"
  );
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  admin: 80,
  employee: 20,
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  employee: "Employee",
};

// ── Permission Keys ─────────────────────────────────────

export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: "dashboard.view",

  // Employee Management
  EMPLOYEES_VIEW: "employees.view",
  EMPLOYEES_CREATE: "employees.create",
  EMPLOYEES_EDIT: "employees.edit",
  EMPLOYEES_DELETE: "employees.delete",

  // Attendance
  ATTENDANCE_VIEW: "attendance.view",
  ATTENDANCE_EDIT: "attendance.edit",
  ATTENDANCE_REGULARIZE: "attendance.regularize",

  // Leave
  LEAVE_VIEW: "leave.view",
  LEAVE_APPLY: "leave.apply",
  LEAVE_APPROVE: "leave.approve",

  // Payroll
  PAYROLL_VIEW: "payroll.view",
  PAYROLL_PROCESS: "payroll.process",
  PAYROLL_EDIT: "payroll.edit",

  // Organization
  ORG_VIEW: "org.view",
  ORG_EDIT: "org.edit",
  ORG_DEPARTMENTS: "org.departments",

  // Settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_EDIT: "settings.edit",

  // Reports
  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",

  // Assets
  ASSETS_VIEW: "assets.view",
  ASSETS_CREATE: "assets.create",
  ASSETS_ASSIGN: "assets.assign",

  // Documents
  DOCUMENTS_VIEW: "documents.view",
  DOCUMENTS_UPLOAD: "documents.upload",

  // Engage
  ENGAGE_POST: "engage.post",
  ENGAGE_COMMENT: "engage.comment",

  // Onboarding
  ONBOARDING_VIEW: "onboarding.view",
  ONBOARDING_MANAGE: "onboarding.manage",

  // Exit Management
  EXIT_VIEW: "exit.view",
  EXIT_MANAGE: "exit.manage",

  // Holidays
  HOLIDAYS_VIEW: "holidays.view",
  HOLIDAYS_MANAGE: "holidays.manage",

  // Probation
  PROBATION_VIEW: "probation.view",
  PROBATION_MANAGE: "probation.manage",

  // CRM
  LEADS_VIEW: "leads.view",
  LEADS_CREATE: "leads.create",
  LEADS_EDIT: "leads.edit",
  LEADS_DELETE: "leads.delete",
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_CREATE: "customers.create",
  CUSTOMERS_EDIT: "customers.edit",
  CUSTOMERS_DELETE: "customers.delete",
  CONTACTS_VIEW: "contacts.view",
  CONTACTS_CREATE: "contacts.create",
  CONTACTS_EDIT: "contacts.edit",
  CONTACTS_DELETE: "contacts.delete",
  DEALS_VIEW: "deals.view",
  DEALS_CREATE: "deals.create",
  DEALS_EDIT: "deals.edit",
  DEALS_DELETE: "deals.delete",
  TASKS_VIEW: "tasks.view",
  TASKS_CREATE: "tasks.create",
  TASKS_EDIT: "tasks.edit",
  TASKS_DELETE: "tasks.delete",
  ACTIVITIES_VIEW: "activities.view",
  ACTIVITIES_CREATE: "activities.create",
  ACTIVITIES_EDIT: "activities.edit",
  ACTIVITIES_DELETE: "activities.delete",
  ANALYTICS_VIEW: "analytics.view",

  // Recruitment
  RECRUITMENT_VIEW: "recruitment.view",
  RECRUITMENT_CREATE: "recruitment.create",
  RECRUITMENT_EDIT: "recruitment.edit",
  RECRUITMENT_DELETE: "recruitment.delete",

  // Performance
  PERFORMANCE_VIEW: "performance.view",
  PERFORMANCE_CREATE: "performance.create",
  PERFORMANCE_EDIT: "performance.edit",
  PERFORMANCE_DELETE: "performance.delete",

  // Task & Ticket Management
  TASKS_HRM_VIEW: "tasks_hrm.view",
  TASKS_HRM_CREATE: "tasks_hrm.create",
  TASKS_HRM_EDIT: "tasks_hrm.edit",
  TASKS_HRM_DELETE: "tasks_hrm.delete",
  TASKS_HRM_ASSIGN: "tasks_hrm.assign",
  TASKS_HRM_REASSIGN: "tasks_hrm.reassign",
  TICKETS_VIEW: "tickets.view",
  TICKETS_CREATE: "tickets.create",
  TICKETS_EDIT: "tickets.edit",
  TICKETS_DELETE: "tickets.delete",
  TICKETS_ASSIGN: "tickets.assign",
  TICKETS_REPLY: "tickets.reply",

  // Projects
  PROJECTS_VIEW: "projects.view",
  PROJECTS_CREATE: "projects.create",
  PROJECTS_EDIT: "projects.edit",
  PROJECTS_DELETE: "projects.delete",

  // Departments (fine-grained)
  DEPARTMENTS_VIEW: "departments.view",
  DEPARTMENTS_CREATE: "departments.create",
  DEPARTMENTS_EDIT: "departments.edit",
  DEPARTMENTS_DELETE: "departments.delete",

  // Role Management & Permission Management (system-level)
  ROLE_MANAGEMENT_VIEW: "role_management.view",
  ROLE_MANAGEMENT_CREATE: "role_management.create",
  ROLE_MANAGEMENT_EDIT: "role_management.edit",
  ROLE_MANAGEMENT_DELETE: "role_management.delete",
  PERMISSION_MANAGEMENT_VIEW: "permission_management.view",
  PERMISSION_MANAGEMENT_EDIT: "permission_management.edit",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ── Route-to-Permission Map ────────────────────────────

export const ROUTE_PERMISSIONS: Record<string, PermissionKey[]> = {
  "/dashboard": [PERMISSIONS.DASHBOARD_VIEW],

  // Employee Management
  "/employees": [PERMISSIONS.EMPLOYEES_VIEW],

  // Attendance
  "/attendance": [PERMISSIONS.ATTENDANCE_VIEW],

  // Leave
  "/leaves": [PERMISSIONS.LEAVE_VIEW],

  // Payroll
  "/payroll": [PERMISSIONS.PAYROLL_VIEW],

  // Organization
  "/organization": [PERMISSIONS.ORG_VIEW],

  // Settings
  "/settings": [PERMISSIONS.SETTINGS_VIEW],

  // Reports
  "/reports": [PERMISSIONS.REPORTS_VIEW],

  // Assets
  "/assets": [PERMISSIONS.ASSETS_VIEW],

  // Documents
  "/documents": [PERMISSIONS.DOCUMENTS_VIEW],

  // Engage
  "/engage": [PERMISSIONS.ENGAGE_POST],

  // Onboarding
  "/onboarding": [PERMISSIONS.ONBOARDING_VIEW],

  // Exit
  "/exit": [PERMISSIONS.EXIT_VIEW],

  // Holidays
  "/holidays": [PERMISSIONS.HOLIDAYS_VIEW],

  // Probation
  "/probation": [PERMISSIONS.PROBATION_VIEW],

  // CRM
  "/leads": [PERMISSIONS.LEADS_VIEW],
  "/customers": [PERMISSIONS.CUSTOMERS_VIEW],
  "/contacts": [PERMISSIONS.CONTACTS_VIEW],
  "/deals": [PERMISSIONS.DEALS_VIEW],
  "/pipeline": [PERMISSIONS.DEALS_VIEW],
  "/tasks": [PERMISSIONS.TASKS_VIEW, PERMISSIONS.TASKS_HRM_VIEW],
  "/tickets": [PERMISSIONS.TICKETS_VIEW],
  "/activities": [PERMISSIONS.ACTIVITIES_VIEW],
  "/analytics": [PERMISSIONS.ANALYTICS_VIEW],

  // Recruitment
  "/recruitment": [PERMISSIONS.RECRUITMENT_VIEW],

  // Performance
  "/performance": [PERMISSIONS.PERFORMANCE_VIEW],

  // Projects
  "/projects": [PERMISSIONS.PROJECTS_VIEW],

  // Departments
  "/departments": [PERMISSIONS.DEPARTMENTS_VIEW],

  // Role & Permission Management
  "/role-management": [PERMISSIONS.ROLE_MANAGEMENT_VIEW],
  "/permission-management": [PERMISSIONS.PERMISSION_MANAGEMENT_VIEW],
};

// ── Role → Permission Mapping ──────────────────────────

export const ROLE_PERMISSIONS: Record<Role, PermissionKey[]> = {
  // Super Admin — full access to everything
  super_admin: Object.values(PERMISSIONS),

  // Admin — employee management, attendance, leave, HR operations, reports
  admin: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_EDIT,
    PERMISSIONS.EMPLOYEES_DELETE,

    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_EDIT,
    PERMISSIONS.ATTENDANCE_REGULARIZE,

    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_APPLY,
    PERMISSIONS.LEAVE_APPROVE,

    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.PAYROLL_PROCESS,
    PERMISSIONS.PAYROLL_EDIT,

    PERMISSIONS.ORG_VIEW,
    PERMISSIONS.ORG_EDIT,
    PERMISSIONS.ORG_DEPARTMENTS,

    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_EXPORT,

    PERMISSIONS.ASSETS_VIEW,
    PERMISSIONS.ASSETS_CREATE,
    PERMISSIONS.ASSETS_ASSIGN,

    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,

    PERMISSIONS.ENGAGE_POST,
    PERMISSIONS.ENGAGE_COMMENT,

    PERMISSIONS.ONBOARDING_VIEW,
    PERMISSIONS.ONBOARDING_MANAGE,

    PERMISSIONS.EXIT_VIEW,
    PERMISSIONS.EXIT_MANAGE,

    PERMISSIONS.HOLIDAYS_VIEW,
    PERMISSIONS.HOLIDAYS_MANAGE,

    PERMISSIONS.PROBATION_VIEW,
    PERMISSIONS.PROBATION_MANAGE,

    // CRM
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_EDIT,
    PERMISSIONS.LEADS_DELETE,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.CUSTOMERS_DELETE,
    PERMISSIONS.CONTACTS_VIEW,
    PERMISSIONS.CONTACTS_CREATE,
    PERMISSIONS.CONTACTS_EDIT,
    PERMISSIONS.CONTACTS_DELETE,
    PERMISSIONS.DEALS_VIEW,
    PERMISSIONS.DEALS_CREATE,
    PERMISSIONS.DEALS_EDIT,
    PERMISSIONS.DEALS_DELETE,
    PERMISSIONS.TASKS_VIEW,
    PERMISSIONS.TASKS_CREATE,
    PERMISSIONS.TASKS_EDIT,
    PERMISSIONS.TASKS_DELETE,
    PERMISSIONS.ACTIVITIES_VIEW,
    PERMISSIONS.ACTIVITIES_CREATE,
    PERMISSIONS.ACTIVITIES_EDIT,
    PERMISSIONS.ACTIVITIES_DELETE,

    // Recruitment
    PERMISSIONS.RECRUITMENT_VIEW,
    PERMISSIONS.RECRUITMENT_CREATE,
    PERMISSIONS.RECRUITMENT_EDIT,
    PERMISSIONS.RECRUITMENT_DELETE,

    // Performance
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.PERFORMANCE_CREATE,
    PERMISSIONS.PERFORMANCE_EDIT,
    PERMISSIONS.PERFORMANCE_DELETE,

    // Task & Ticket Management
    PERMISSIONS.TASKS_HRM_VIEW,
    PERMISSIONS.TASKS_HRM_CREATE,
    PERMISSIONS.TASKS_HRM_EDIT,
    PERMISSIONS.TASKS_HRM_DELETE,
    PERMISSIONS.TASKS_HRM_ASSIGN,
    PERMISSIONS.TASKS_HRM_REASSIGN,
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_EDIT,
    PERMISSIONS.TICKETS_DELETE,
    PERMISSIONS.TICKETS_ASSIGN,
    PERMISSIONS.TICKETS_REPLY,

    // Projects
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.PROJECTS_DELETE,

    // Departments
    PERMISSIONS.DEPARTMENTS_VIEW,
    PERMISSIONS.DEPARTMENTS_CREATE,
    PERMISSIONS.DEPARTMENTS_EDIT,
    PERMISSIONS.DEPARTMENTS_DELETE,
  ],    // Employee — self-service: own profile, attendance, leave, assigned assets, documents
  employee: [
    PERMISSIONS.DASHBOARD_VIEW,

    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.LEAVE_APPLY,

    PERMISSIONS.ASSETS_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,

    PERMISSIONS.ENGAGE_POST,
    PERMISSIONS.ENGAGE_COMMENT,

    PERMISSIONS.HOLIDAYS_VIEW,

    // Task & Ticket
    PERMISSIONS.TASKS_HRM_VIEW,
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_REPLY,
  ],
};

// ── Route Access (which roles can access which routes) ──

export const ROUTE_ACCESS: Record<string, Role[]> = {
  // Everyone
  "/dashboard": ["super_admin", "admin", "employee"],

  // Admin & Super Admin only
  "/employees": ["super_admin", "admin"],
  "/payroll": ["super_admin", "admin"],
  "/organization": ["super_admin", "admin"],
  "/reports": ["super_admin", "admin"],
  "/onboarding": ["super_admin", "admin"],
  "/exit": ["super_admin", "admin"],
  "/probation": ["super_admin", "admin"],

  // Admin, Super Admin, and self-service employees
  "/attendance": ["super_admin", "admin", "employee"],
  "/leaves": ["super_admin", "admin", "employee"],
  "/assets": ["super_admin", "admin", "employee"],
  "/documents": ["super_admin", "admin", "employee"],
  "/engage": ["super_admin", "admin", "employee"],
  "/holidays": ["super_admin", "admin", "employee"],

  // Task & Ticket Management
  "/tasks": ["super_admin", "admin", "employee"],
  "/tickets": ["super_admin", "admin", "employee"],

  // Super Admin only
  "/settings": ["super_admin"],

  // CRM routes — Super Admin only (legacy CRM features)
  "/leads": ["super_admin"],
  "/pipeline": ["super_admin"],
  "/customers": ["super_admin"],
  "/contacts": ["super_admin"],
  "/analytics": ["super_admin"],

  // New modules — Super Admin & Admin
  "/recruitment": ["super_admin", "admin"],
  "/performance": ["super_admin", "admin"],
  "/projects": ["super_admin", "admin"],
  "/departments": ["super_admin", "admin"],

  // System-level — Super Admin only
  "/role-management": ["super_admin"],
  "/permission-management": ["super_admin"],

  // ── HRMS portal routes (4-role: SA/HR/MGR/EMP all map via LEGACY_ROLE_MAP) ──
  // Super Admin can access every HRMS area.
  // HR_ADMIN can access superadmin, hr-admin, manager, employee areas.
  // MANAGER can access manager + employee areas only.
  // EMPLOYEE can access only the employee area.
  // Note: server-side layouts also enforce this; this map is the
  // client-side canAccess() fast path. The /hrms index and /hrms/login
  // routes are server-redirected and do not need client-side gating.
  "/hrms/superadmin": ["super_admin", "admin"],
  "/hrms/hr-admin": ["super_admin", "admin"],
  "/hrms/manager": ["super_admin", "admin"],
  "/hrms/employee": ["super_admin", "admin", "employee"],
  "/hrms/approvals": ["super_admin", "admin"],
};

// ── Helper Functions ───────────────────────────────────

/**
 * Check if an email is in the designated Super Admin list.
 * Users with these emails automatically get super_admin role on signup/login.
 */
/**
 * Check if an email is in the designated Super Admin list.
 * Users with these emails automatically get super_admin role on signup/login.
 */
export function isSuperAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: string | undefined | null, permission: PermissionKey | string): boolean {
  if (!role) return false;
  const normalizedRole = role as Role;
  const perms = ROLE_PERMISSIONS[normalizedRole];
  if (!perms) return false;
  return perms.includes(permission as PermissionKey);
}

/**
 * Check if a role has all specified permissions.
 */
export function hasAllPermissions(
  role: string | undefined | null,
  permissions: (PermissionKey | string)[]
): boolean {
  if (!role) return false;
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Check if a role has any of the specified permissions.
 */
export function hasAnyPermission(
  role: string | undefined | null,
  permissions: (PermissionKey | string)[]
): boolean {
  if (!role) return false;
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if a role can access a given route.
 */
export function canAccessRoute(
  role: string | undefined | null,
  path: string
): boolean {
  if (!role) return false;

  // Super Admin can access everything
  if (role === "super_admin") return true;

  // Exact path match wins.
  const exact = ROUTE_ACCESS[path];
  if (exact?.includes(role as Role)) return true;

  // Prefix match using LONGEST route entry first, so /hrms/manager
  // does not get caught by the broader /hrms rule.
  const candidates = Object.keys(ROUTE_ACCESS)
    .filter((r) => path === r || path.startsWith(r + "/"))
    .sort((a, b) => b.length - a.length);
  for (const route of candidates) {
    const roles = ROUTE_ACCESS[route];
    if (roles?.includes(role as Role)) return true;
  }

  return false;
}

/**
 * Get all permissions for a given role.
 */
export function getPermissionsForRole(role: string): PermissionKey[] {
  return ROLE_PERMISSIONS[role as Role] || [];
}

/**
 * Get the display name for a role.
 */
export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role as Role] || role;
}

/**
 * Check if a role is at least a certain level (hierarchy check).
 */
export function hasRoleLevel(role: string, minimumRole: Role): boolean {
  const userLevel = ROLE_HIERARCHY[role as Role] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole] ?? 0;
  return userLevel >= requiredLevel;
}
