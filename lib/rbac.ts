// ══════════════════════════════════════════════════════════════════
// Role-Based Access Control (RBAC)
// ══════════════════════════════════════════════════════════════════

import { SUPER_ADMIN_EMAILS } from "@/lib/constants";

// ── Role Types ─────────────────────────────────────────

export type Role = "super_admin" | "admin" | "hr_admin" | "manager" | "employee";

export const ROLES = {
  SUPER_ADMIN: "super_admin" as const,
  ADMIN: "admin" as const,
  HR_ADMIN: "hr_admin" as const,
  MANAGER: "manager" as const,
  EMPLOYEE: "employee" as const,
} as const;

/**
 * Maps legacy roles (from the old system) to the new RBAC system.
 * This ensures backward compatibility for existing users.
 */
export const LEGACY_ROLE_MAP: Record<string, Role> = {
  super_admin: "super_admin",
  admin: "hr_admin",
  hr_admin: "hr_admin",
  hr: "hr_admin",
  manager: "manager",
  employee: "employee",
  agent: "employee",
  support_manager: "manager",
};

/**
 * Normalize a role string to one of the canonical roles.
 * Handles legacy roles and unknown roles gracefully.
 */
export function normalizeRole(role: string | undefined | null): Role {
  if (!role) return "employee";
  return LEGACY_ROLE_MAP[role] || (role as Role) || "employee";
}

export const ROLE_HIERARCHY: Record<Role, number> = {
  super_admin: 100,
  hr_admin: 80,
  admin: 80,
  manager: 50,
  employee: 20,
};

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "CEO",
  hr_admin: "HR Admin",
  admin: "HR Admin",
  manager: "Manager",
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

  // HR Admin — full employee management, attendance, leave, payroll, HR operations, reports
  hr_admin: [
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
    PERMISSIONS.RECRUITMENT_VIEW,
    PERMISSIONS.RECRUITMENT_CREATE,
    PERMISSIONS.RECRUITMENT_EDIT,
    PERMISSIONS.RECRUITMENT_DELETE,
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.PERFORMANCE_CREATE,
    PERMISSIONS.PERFORMANCE_EDIT,
    PERMISSIONS.PERFORMANCE_DELETE,
    PERMISSIONS.TASKS_HRM_VIEW,
    PERMISSIONS.TASKS_HRM_CREATE,
    PERMISSIONS.TASKS_HRM_EDIT,
    PERMISSIONS.TASKS_HRM_DELETE,
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_EDIT,
    PERMISSIONS.TICKETS_REPLY,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.PROJECTS_DELETE,
    PERMISSIONS.DEPARTMENTS_VIEW,
  ],

  // Admin alias for hr_admin
  admin: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.EMPLOYEES_CREATE,
    PERMISSIONS.EMPLOYEES_EDIT,
    PERMISSIONS.EMPLOYEES_DELETE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.PAYROLL_VIEW,
    PERMISSIONS.PAYROLL_PROCESS,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
  ],

  // Manager — departmental team management, project tasks, leave approvals, timesheets
  manager: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.EMPLOYEES_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.LEAVE_VIEW,
    PERMISSIONS.LEAVE_APPLY,
    PERMISSIONS.LEAVE_APPROVE,
    PERMISSIONS.PERFORMANCE_VIEW,
    PERMISSIONS.PERFORMANCE_CREATE,
    PERMISSIONS.TASKS_HRM_VIEW,
    PERMISSIONS.TASKS_HRM_CREATE,
    PERMISSIONS.TASKS_HRM_EDIT,
    PERMISSIONS.TASKS_HRM_ASSIGN,
    PERMISSIONS.PROJECTS_VIEW,
    PERMISSIONS.PROJECTS_CREATE,
    PERMISSIONS.PROJECTS_EDIT,
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.TICKETS_REPLY,
    PERMISSIONS.HOLIDAYS_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
  ],

  // Employee — self-service: own profile, attendance, leave, assigned tasks, timesheets
  employee: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.LEAVE_APPLY,
    PERMISSIONS.ASSETS_VIEW,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.ENGAGE_POST,
    PERMISSIONS.ENGAGE_COMMENT,
    PERMISSIONS.HOLIDAYS_VIEW,
    PERMISSIONS.TASKS_HRM_VIEW,
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.TICKETS_CREATE,
    PERMISSIONS.TICKETS_REPLY,
  ],
};

// ── Route Access (which roles can access which routes) ──

export const ROUTE_ACCESS: Record<string, Role[]> = {
  // ── Role-Specific Dashboards ───────────────────────
  "/dashboard": ["super_admin", "hr_admin", "admin", "manager", "employee"],
  "/employee": ["super_admin", "hr_admin", "admin", "manager", "employee"],
  "/manager": ["super_admin", "manager"],
  "/superadmin": ["super_admin"],
  "/hr-admin": ["hr_admin", "admin", "super_admin"],

  // ── Super Admin Portal ──────────────────────────────
  "/superadmin/tenants": ["super_admin"],
  "/superadmin/modules": ["super_admin"],
  "/superadmin/audit-logs": ["super_admin"],
  "/superadmin/settings": ["super_admin"],

  // ── HR Admin Portal ────────────────────────────────
  "/hr-admin/employees": ["hr_admin", "admin", "super_admin"],
  "/hr-admin/onboarding": ["hr_admin", "admin", "super_admin"],
  "/hr-admin/payroll": ["hr_admin", "admin", "super_admin"],
  "/hr-admin/projects": ["hr_admin", "admin", "super_admin"],
  "/hr-admin/leave-policies": ["hr_admin", "admin", "super_admin"],
  "/hr-admin/attendance": ["hr_admin", "admin", "super_admin"],
  "/hr-admin/settings": ["hr_admin", "admin", "super_admin"],

  // ── Manager Portal ─────────────────────────────────
  "/manager/projects": ["manager", "super_admin"],
  "/manager/timesheets": ["manager", "super_admin"],
  "/manager/approvals": ["manager", "super_admin"],
  "/manager/analytics": ["manager", "super_admin"],
  "/manager/settings": ["manager", "super_admin"],
  "/manager/my-team": ["manager", "super_admin"],

  // ── Employee Portal ────────────────────────────────
  "/employee/my-tasks": ["employee", "super_admin"],
  "/employee/leaves": ["employee", "super_admin"],
  "/employee/payslips": ["employee", "super_admin"],
  "/employee/performance": ["employee", "super_admin"],
  "/employee/settings": ["employee", "super_admin"],
  "/employee/profile": ["employee", "super_admin"],
  "/employee/timesheet": ["employee", "super_admin"],

  // ── HR Admin & Super Admin only ────────────────────
  "/employees": ["super_admin", "hr_admin", "admin"],
  "/payroll": ["super_admin", "hr_admin", "admin"],
  "/organization": ["super_admin", "hr_admin", "admin"],
  "/reports": ["super_admin", "hr_admin", "admin"],
  "/onboarding": ["super_admin", "hr_admin", "admin"],
  "/exit": ["super_admin", "hr_admin", "admin"],
  "/probation": ["super_admin", "hr_admin", "admin"],

  // ── Shared (multi-role) ────────────────────────────
  "/attendance": ["super_admin", "hr_admin", "admin", "manager", "employee"],
  "/leaves": ["super_admin", "hr_admin", "admin", "manager", "employee"],
  "/assets": ["super_admin", "hr_admin", "admin", "manager", "employee"],
  "/documents": ["super_admin", "hr_admin", "admin", "manager", "employee"],
  "/engage": ["super_admin", "hr_admin", "admin", "manager", "employee"],
  "/holidays": ["super_admin", "hr_admin", "admin", "manager", "employee"],
  "/tasks": ["super_admin", "hr_admin", "admin", "manager", "employee"],
  "/tickets": ["super_admin", "hr_admin", "admin", "manager", "employee"],
  "/projects": ["super_admin", "hr_admin", "admin", "manager", "employee"],

  // ── Restricted ─────────────────────────────────────
  "/settings": ["super_admin", "hr_admin"],
  "/recruitment": ["super_admin", "hr_admin", "admin"],
  "/performance": ["super_admin", "hr_admin", "admin", "manager"],
  "/departments": ["super_admin", "hr_admin", "admin"],

  // ── System-level — Super Admin only ────────────────
  "/role-management": ["super_admin"],
  "/permission-management": ["super_admin"],
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

  const normalizedPath = path.startsWith("/hrms")
    ? path.replace(/^\/hrms/, "") || "/dashboard"
    : path;

  // Check exact path match
  const allowedRoles = ROUTE_ACCESS[normalizedPath];
  if (allowedRoles?.includes(role as Role)) return true;

  // Check prefix match (e.g., /employees/123 matches /employees)
  for (const [route, roles] of Object.entries(ROUTE_ACCESS)) {
    if (normalizedPath.startsWith(route + "/") || normalizedPath === route) {
      if (roles.includes(role as Role)) return true;
    }
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
