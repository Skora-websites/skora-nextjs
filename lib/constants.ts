// ══════════════════════════════════════════════════════════════════
// Navigation Items (CRM + HRM)
// ══════════════════════════════════════════════════════════════════

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  group: NavGroup;
}

export type NavGroup = "overview" | "hrm" | "operations" | "lifecycle" | "crm" | "system";

export const NAV_GROUPS: Record<NavGroup, string> = {
  overview: "Overview",
  hrm: "HR Management",
  operations: "Operations",
  lifecycle: "Employee Lifecycle",
  crm: "CRM",
  system: "System",
};

export const NAV_GROUP_ORDER: NavGroup[] = ["overview", "hrm", "operations", "lifecycle", "crm", "system"];

/**
 * Groups that should render as expandable/collapsible sub-menus.
 * Users can click the group header to toggle visibility of child items.
 */
export const EXPANDABLE_GROUPS: NavGroup[] = ["hrm"];

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/hrms/dashboard", icon: "LayoutDashboard", group: "overview" },
  // ── HRM Module ──
  { title: "Employees", href: "/hrms/employees", icon: "Users", group: "hrm" },
  { title: "Attendance", href: "/hrms/attendance", icon: "Clock", group: "hrm" },
  { title: "Leaves", href: "/hrms/leaves", icon: "CalendarDays", group: "hrm" },
  { title: "Payroll", href: "/hrms/payroll", icon: "DollarSign", group: "hrm" },
  { title: "Organization", href: "/hrms/organization", icon: "Building2", group: "hrm" },
  // ── Operations ──
  { title: "Projects", href: "/hrms/projects", icon: "ClipboardList", group: "operations" },
  { title: "Assets", href: "/hrms/assets", icon: "Package", group: "operations" },
  { title: "Documents", href: "/hrms/documents", icon: "FileText", group: "operations" },
  { title: "Engage", href: "/hrms/engage", icon: "MessageSquare", group: "operations" },
  // ── Employee Lifecycle ──
  { title: "Onboarding", href: "/hrms/onboarding", icon: "UserCheck", group: "lifecycle" },
  { title: "Exit Mgmt", href: "/hrms/exit", icon: "LogOut", group: "lifecycle" },
  { title: "Holidays", href: "/hrms/holidays", icon: "Sun", group: "lifecycle" },
  { title: "Probation", href: "/hrms/probation", icon: "ClipboardList", group: "lifecycle" },
  // ── CRM / Reports ──
  { title: "Reports", href: "/hrms/reports", icon: "BarChart3", group: "crm" },
  { title: "Recruitment", href: "/hrms/recruitment", icon: "UserCheck", group: "hrm" },
  { title: "Performance", href: "/hrms/performance", icon: "TrendingUp", group: "hrm" },
  { title: "Tasks", href: "/hrms/tasks", icon: "ClipboardList", group: "hrm" },
  { title: "Tickets", href: "/hrms/tickets", icon: "MessageSquare", group: "hrm" },
  // ── System ──
  { title: "Settings", href: "/hrms/settings", icon: "Settings", group: "system" },
];

export const NAV_ITEMS_BY_ROLE: Record<string, NavItem[]> = {
  super_admin: [
    { title: "Platform Overview", href: "/hrms/superadmin", icon: "LayoutDashboard", group: "overview" },
    { title: "Tenants (Companies)", href: "/hrms/superadmin/tenants", icon: "Building2", group: "system" },
    { title: "Module Toggles", href: "/hrms/superadmin/modules", icon: "Settings", group: "system" },
    { title: "Audit Logs", href: "/hrms/superadmin/audit-logs", icon: "FileText", group: "system" },
    { title: "HR Dashboard", href: "/hrms/dashboard", icon: "LayoutDashboard", group: "hrm" },
    { title: "Employees", href: "/hrms/employees", icon: "Users", group: "hrm" },
    { title: "Projects (PMS)", href: "/hrms/projects", icon: "ClipboardList", group: "operations" },
  ],
  hr_admin: [
    { title: "Dashboard", href: "/hrms/dashboard", icon: "LayoutDashboard", group: "overview" },
    { title: "Employees", href: "/hrms/employees", icon: "Users", group: "hrm" },
    { title: "Attendance", href: "/hrms/attendance", icon: "Clock", group: "hrm" },
    { title: "Leaves", href: "/hrms/leaves", icon: "CalendarDays", group: "hrm" },
    { title: "Payroll", href: "/hrms/payroll", icon: "DollarSign", group: "hrm" },
    { title: "Projects (PMS)", href: "/hrms/projects", icon: "ClipboardList", group: "operations" },
    { title: "Recruitment (ATS)", href: "/hrms/recruitment", icon: "UserCheck", group: "hrm" },
    { title: "Onboarding", href: "/hrms/onboarding", icon: "UserCheck", group: "lifecycle" },
    { title: "Organization", href: "/hrms/organization", icon: "Building2", group: "hrm" },
    { title: "Reports", href: "/hrms/reports", icon: "BarChart3", group: "crm" },
    { title: "Settings", href: "/hrms/settings", icon: "Settings", group: "system" },
  ],
  admin: [
    { title: "Dashboard", href: "/hrms/dashboard", icon: "LayoutDashboard", group: "overview" },
    { title: "Employees", href: "/hrms/employees", icon: "Users", group: "hrm" },
    { title: "Attendance", href: "/hrms/attendance", icon: "Clock", group: "hrm" },
    { title: "Leaves", href: "/hrms/leaves", icon: "CalendarDays", group: "hrm" },
    { title: "Payroll", href: "/hrms/payroll", icon: "DollarSign", group: "hrm" },
    { title: "Projects (PMS)", href: "/hrms/projects", icon: "ClipboardList", group: "operations" },
    { title: "Settings", href: "/hrms/settings", icon: "Settings", group: "system" },
  ],
  manager: [
    { title: "Manager Dashboard", href: "/hrms/manager", icon: "LayoutDashboard", group: "overview" },
    { title: "My Team Roster", href: "/hrms/manager/my-team", icon: "Users", group: "hrm" },
    { title: "Team Projects", href: "/hrms/manager/projects", icon: "ClipboardList", group: "operations" },
    { title: "Leave Approvals", href: "/hrms/manager/leave-approvals", icon: "CalendarDays", group: "hrm" },
    { title: "Team Performance", href: "/hrms/manager/performance", icon: "TrendingUp", group: "hrm" },
    { title: "Support Tickets", href: "/hrms/tickets", icon: "MessageSquare", group: "operations" },
  ],
  employee: [
    { title: "Self-Service Home", href: "/hrms/employee", icon: "LayoutDashboard", group: "overview" },
    { title: "Punch In / Out", href: "/hrms/attendance", icon: "Clock", group: "hrm" },
    { title: "My Tasks (Kanban)", href: "/hrms/employee/my-tasks", icon: "ClipboardList", group: "operations" },
    { title: "Log Timesheet", href: "/hrms/employee/timesheet", icon: "FileText", group: "operations" },
    { title: "Apply Leave", href: "/hrms/leaves", icon: "CalendarDays", group: "hrm" },
    { title: "My Payslips", href: "/hrms/payroll", icon: "DollarSign", group: "hrm" },
    { title: "My Profile", href: "/hrms/employee/profile", icon: "UserCheck", group: "lifecycle" },
  ],
};

// ══════════════════════════════════════════════════════════════════
// HRM Constants
// ══════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════
// Super Admin Configuration
// ══════════════════════════════════════════════════════════════════

/**
 * List of email addresses that should automatically be granted Super Admin role.
 * The first user to sign up also becomes super_admin automatically.
 * Add additional emails here to designate multiple super admins.
 */
export const SUPER_ADMIN_EMAILS = [
  "ashish17427@gmail.com",
  process.env.SUPER_ADMIN_EMAIL || "",
  "admin@skora.info",
  "admin@edskora.com",
].filter(Boolean);

// ══════════════════════════════════════════════════════════════════
// HRM Constants
// ══════════════════════════════════════════════════════════════════

export const EMPLOYMENT_TYPES = [
  { value: "permanent", label: "Permanent" },
  { value: "contract", label: "Contract" },
  { value: "probation", label: "Probation" },
  { value: "intern", label: "Intern" },
  { value: "trainee", label: "Trainee" },
] as const;

export const ATTENDANCE_STATUS = [
  { value: "present", label: "Present", color: "success" },
  { value: "absent", label: "Absent", color: "danger" },
  { value: "half_day", label: "Half Day", color: "warning" },
  { value: "late", label: "Late", color: "warning" },
  { value: "week_off", label: "Week Off", color: "info" },
  { value: "holiday", label: "Holiday", color: "info" },
  { value: "on_leave", label: "On Leave", color: "primary" },
] as const;

export const LEAVE_REQUEST_STATUS = [
  { value: "pending", label: "Pending", color: "warning" },
  { value: "approved", label: "Approved", color: "success" },
  { value: "rejected", label: "Rejected", color: "danger" },
  { value: "cancelled", label: "Cancelled", color: "muted" },
] as const;

export const EXIT_TYPES = [
  { value: "resignation", label: "Resignation" },
  { value: "termination", label: "Termination" },
  { value: "retirement", label: "Retirement" },
  { value: "mutual_separation", label: "Mutual Separation" },
] as const;

export const ASSET_CONDITIONS = [
  { value: "new", label: "New" },
  { value: "good", label: "Good" },
  { value: "fair", label: "Fair" },
  { value: "damaged", label: "Damaged" },
  { value: "disposed", label: "Disposed" },
] as const;

export const ASSET_STATUS_OPTIONS = [
  { value: "available", label: "Available", color: "success" },
  { value: "assigned", label: "Assigned", color: "primary" },
  { value: "under_maintenance", label: "Under Maintenance", color: "warning" },
  { value: "disposed", label: "Disposed", color: "danger" },
] as const;

// ── CRM constants (kept for backward compatibility) ────

export const LEAD_STATUS_OPTIONS = [
  { value: "new", label: "New", color: "info" },
  { value: "contacted", label: "Contacted", color: "primary" },
  { value: "qualified", label: "Qualified", color: "info" },
  { value: "proposal", label: "Proposal", color: "warning" },
  { value: "negotiation", label: "Negotiation", color: "warning" },
  { value: "won", label: "Won", color: "success" },
  { value: "lost", label: "Lost", color: "danger" },
] as const;

export const DEAL_STAGES = [
  { value: "lead", label: "Lead In", color: "info" },
  { value: "qualified", label: "Qualified", color: "primary" },
  { value: "proposal", label: "Proposal", color: "warning" },
  { value: "negotiation", label: "Negotiation", color: "warning" },
  { value: "closed_won", label: "Closed Won", color: "success" },
  { value: "closed_lost", label: "Closed Lost", color: "danger" },
] as const;

export const LEAD_SOURCES = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "cold_call", label: "Cold Call" },
  { value: "email_campaign", label: "Email Campaign" },
  { value: "event", label: "Event" },
  { value: "partner", label: "Partner" },
  { value: "other", label: "Other" },
] as const;
