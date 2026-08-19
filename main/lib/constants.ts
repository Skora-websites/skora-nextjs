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
  { title: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", group: "overview" },
  // ── HRM Module ──
  { title: "Employees", href: "/employees", icon: "Users", group: "hrm" },
  { title: "Attendance", href: "/attendance", icon: "Clock", group: "hrm" },
  { title: "Leaves", href: "/leaves", icon: "CalendarDays", group: "hrm" },
  { title: "Payroll", href: "/payroll", icon: "DollarSign", group: "hrm" },
  { title: "Organization", href: "/organization", icon: "Building2", group: "hrm" },
  // ── Operations ──
  { title: "Assets", href: "/assets", icon: "Package", group: "operations" },
  { title: "Documents", href: "/documents", icon: "FileText", group: "operations" },
  { title: "Engage", href: "/engage", icon: "MessageSquare", group: "operations" },
  // ── Employee Lifecycle ──
  { title: "Onboarding", href: "/onboarding", icon: "UserCheck", group: "lifecycle" },
  { title: "Exit Mgmt", href: "/exit", icon: "LogOut", group: "lifecycle" },
  { title: "Holidays", href: "/holidays", icon: "Sun", group: "lifecycle" },
  { title: "Probation", href: "/probation", icon: "ClipboardList", group: "lifecycle" },
  // ── CRM ──
  { title: "Reports", href: "/reports", icon: "BarChart3", group: "crm" },
  { title: "Leads", href: "/leads", icon: "TrendingUp", group: "crm" },
  { title: "Customers", href: "/customers", icon: "Building2", group: "crm" },
  { title: "Contacts", href: "/contacts", icon: "Contact2", group: "crm" },
  { title: "Analytics", href: "/analytics", icon: "BarChart3", group: "crm" },
  // ── New Modules ──
  { title: "Recruitment", href: "/recruitment", icon: "UserCheck", group: "hrm" },
  { title: "Performance", href: "/performance", icon: "TrendingUp", group: "hrm" },
  // ── Task & Ticket Management ──
  { title: "Tasks", href: "/tasks", icon: "ClipboardList", group: "hrm" },
  { title: "Tickets", href: "/tickets", icon: "MessageSquare", group: "hrm" },
  { title: "Projects", href: "/projects", icon: "ClipboardList", group: "operations" },
  // ── System ──
  { title: "Settings", href: "/settings", icon: "Settings", group: "system" },
];

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
export const SUPER_ADMIN_EMAILS = ["sudarshank264@gmail.com"];

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
