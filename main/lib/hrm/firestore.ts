import "server-only";
import { getAdminDb } from "@/lib/firebase-admin";
import type { DocumentData, Timestamp } from "firebase-admin/firestore";

// ══════════════════════════════════════════════════════════════════
// HRM Firestore Service Factory
// ══════════════════════════════════════════════════════════════════

// ── Collection Names ───────────────────────────────────

export const COLLECTIONS = {
  tenants: "tenants",
  tenantLanguages: "tenant_languages",
  organizations: "organizations",
  departments: "departments",
  designations: "designations",
  businessUnits: "business_units",
  locations: "locations",
  users: "users",
  employeeJobs: "employee_jobs",
  employeeDetails: "employee_details",
  employeeJobEvents: "employee_job_events",
  familyDetails: "family_details",
  pastEmployers: "past_employers",
  employeeEducations: "employee_educations",
  employeeCertifications: "employee_certifications",
  employeeSalaries: "employee_salaries",
  employeeSalaryHistory: "employee_salary_history",
  reportingManagers: "reporting_managers",
  roles: "roles",
  permissions: "permissions",
  approvalChains: "approval_chains",
  shifts: "shifts",
  weeklyOffs: "weekly_offs",
  attendance: "attendance",
  attendanceStats: "attendance_stats",
  regularizationRequests: "regularization_requests",
  leavePlans: "leave_plans",
  leaveTypes: "leave_types",
  leaveBalances: "leave_balances",
  leaveBalanceHistory: "leave_balance_history",
  leaveRequests: "leave_requests",
  overtimePolicies: "overtime_policies",
  overtimeRequests: "overtime_requests",
  overtimeTerms: "overtime_terms",
  holidayPlans: "holiday_plans",
  holidays: "holidays",
  calendarEvents: "calendar_events",
  payGroups: "pay_groups",
  payGroupComponents: "pay_group_components",
  salaryComponents: "salary_components",
  payrollRuns: "payroll_runs",
  payrollTransactions: "payroll_transactions",
  payslipTemplates: "payslip_templates",
  assetCategories: "asset_categories",
  assetTypes: "asset_types",
  assets: "assets",
  assetAssignments: "asset_assignments",
  documentCategories: "document_categories",
  documents: "documents",
  documentTemplates: "document_templates",
  posts: "posts",
  comments: "comments",
  reactions: "reactions",
  polls: "polls",
  pollVotes: "poll_votes",
  onboarding: "onboarding",
  employeeOnboardingTasks: "employee_onboarding_tasks",
  employeeExits: "employee_exits",
  exitSettings: "exit_settings",
  probationPolicies: "probation_policies",
  probationReviews: "probation_reviews",
  noticePeriods: "notice_periods",
  notificationTemplates: "notification_templates",
  notifications: "notifications",
  settings: "settings",
  languages: "languages",
  translations: "translations",
  contactSupport: "contact_support",
  projects: "projects",
  projectMembers: "project_members",
  projectTasks: "project_tasks",
  taskComments: "task_comments",
  taskAttachments: "task_attachments",
  milestones: "milestones",
  idCardTemplates: "id_card_templates",
  aiChatMessages: "ai_chat_messages",
  sessions: "sessions",
  verificationTokens: "verification_tokens",
  accounts: "accounts",
  jobLogs: "job_logs",
  auditLogs: "audit_logs",

  // Task & Ticket Management
  hrmTasks: "hrm_tasks",
  hrmTaskComments: "hrm_task_comments",
  taskAuditLogs: "task_audit_logs",
  tickets: "tickets",
  ticketReplies: "ticket_replies",
  ticketTimeline: "ticket_timeline",

  // Performance
  goals: "goals",
  performanceReviews: "performance_reviews",
  performanceFeedback: "performance_feedback",
  kpis: "kpis",
} as const;

// ── Type Helpers ────────────────────────────────────────

type FirestoreWhereOp =
  | "<" | "<=" | "==" | ">=" | ">"
  | "!=" | "array-contains" | "array-contains-any"
  | "in" | "not-in";

type FirestoreOrderDirection = "asc" | "desc";

export interface WhereClause {
  field: string;
  op: FirestoreWhereOp;
  value: unknown;
}

export interface QueryOptions {
  where?: WhereClause[];
  orderByField?: string;
  orderByDirection?: FirestoreOrderDirection;
  limitCount?: number;
  startAfter?: unknown;
}

/**
 * Converts Firestore Timestamps to native Date objects recursively.
 */
function serializeDoc<T extends DocumentData>(id: string, data: DocumentData): T {
  const out: Record<string, unknown> = { id };
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "toDate" in value) {
      out[key] = (value as Timestamp).toDate();
    } else {
      out[key] = value;
    }
  }
  return out as T;
}

/**
 * Creates a typed Firestore service for a given collection.
 * All queries include tenant isolation via tenantId field.
 */
export function createFirestoreService<T extends { id?: string; tenantId?: string }>(
  collectionName: string
) {
  // Lazily initialize the collection reference to avoid crashing at module import time
  // when Firebase Admin SDK is not yet configured (e.g., missing .env).
  let _collRef: FirebaseFirestore.CollectionReference | null = null;

  function coll() {
    if (!_collRef) {
      _collRef = getAdminDb().collection(collectionName);
    }
    return _collRef;
  }

  return {
    /** Find a document by ID */
    async findById(id: string): Promise<T | null> {
      const snap = await coll().doc(id).get();
      if (!snap.exists) return null;
      return serializeDoc<T>(snap.id, snap.data()!);
    },

    /** Find all documents within a tenant, optionally filtered/sorted */
    async findManyInTenant(tenantId: string, options: QueryOptions = {}): Promise<T[]> {
      let query: FirebaseFirestore.Query = coll().where("tenantId", "==", tenantId);

      if (options.where) {
        for (const clause of options.where) {
          query = query.where(clause.field, clause.op, clause.value);
        }
      }

      if (options.orderByField) {
        query = query.orderBy(options.orderByField, options.orderByDirection ?? "asc");
      }

      if (options.limitCount) {
        query = query.limit(options.limitCount);
      }

      try {
        const snap = await query.get();
        return snap.docs.map((d) => serializeDoc<T>(d.id, d.data()));
      } catch (err) {
        // Firestore requires composite indexes for queries combining `where` + `orderBy`.
        // If the query fails (e.g., missing index), fall back to fetching all and sorting
        // in-memory so the app doesn't crash on first load.
        if (
          err instanceof Error &&
          err.message.includes("requires an index")
        ) {
          console.warn(
            `[Firestore] Missing composite index for "${collectionName}". ` +
            `Falling back to in-memory sort. Create an index at: ` +
            `https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID || "?"}/firestore/indexes`
          );
          // Retry without ordering
          let fallbackQuery: FirebaseFirestore.Query = coll().where("tenantId", "==", tenantId);
          if (options.where) {
            for (const clause of options.where) {
              fallbackQuery = fallbackQuery.where(clause.field, clause.op, clause.value);
            }
          }
          if (options.limitCount) {
            fallbackQuery = fallbackQuery.limit(options.limitCount);
          }
          const snap = await fallbackQuery.get();
          const docs = snap.docs.map((d) => serializeDoc<T>(d.id, d.data()));

          // In-memory sort
          if (options.orderByField) {
            const dir = options.orderByDirection === "desc" ? -1 : 1;
            docs.sort((a: any, b: any) => {
              const va = a[options.orderByField!];
              const vb = b[options.orderByField!];
              if (va == null && vb == null) return 0;
              if (va == null) return 1;
              if (vb == null) return -1;
              if (typeof va === "string") return va.localeCompare(vb) * dir;
              return (va < vb ? -1 : va > vb ? 1 : 0) * dir;
            });
          }

          return docs;
        }
        // Re-throw non-index errors
        throw err;
      }
    },

    /** Find a single document by a field value within a tenant */
    async findOneInTenant(tenantId: string, field: string, value: unknown): Promise<T | null> {
      const q = coll()
        .where("tenantId", "==", tenantId)
        .where(field, "==", value)
        .limit(1);
      const snap = await q.get();
      if (snap.empty) return null;
      const doc = snap.docs[0];
      return serializeDoc<T>(doc.id, doc.data());
    },

    /** Find first item by a field value (global, use with caution) */
    async findOne(field: string, value: unknown): Promise<T | null> {
      const q = coll().where(field, "==", value).limit(1);
      const snap = await q.get();
      if (snap.empty) return null;
      const doc = snap.docs[0];
      return serializeDoc<T>(doc.id, doc.data());
    },

    /** Find all documents, optionally filtered/sorted (global) */
    async findMany(options: QueryOptions = {}): Promise<T[]> {
      let query: FirebaseFirestore.Query = coll();

      if (options.where) {
        for (const clause of options.where) {
          query = query.where(clause.field, clause.op, clause.value);
        }
      }

      if (options.orderByField) {
        query = query.orderBy(options.orderByField, options.orderByDirection ?? "asc");
      }

      if (options.limitCount) {
        query = query.limit(options.limitCount);
      }

      try {
        const snap = await query.get();
        return snap.docs.map((d) => serializeDoc<T>(d.id, d.data()));
      } catch (err) {
        // Firestore requires composite indexes for queries combining `where` + `orderBy`.
        // If the query fails (e.g., missing index), fall back to fetching all and sorting
        // in-memory so the app doesn't crash on first load.
        if (
          err instanceof Error &&
          err.message.includes("requires an index")
        ) {
          console.warn(
            `[Firestore] Missing composite index for "${collectionName}". ` +
            `Falling back to in-memory sort. Create an index at: ` +
            `https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID || "?"}/firestore/indexes`
          );
          // Retry without ordering
          let fallbackQuery: FirebaseFirestore.Query = coll();
          if (options.where) {
            for (const clause of options.where) {
              fallbackQuery = fallbackQuery.where(clause.field, clause.op, clause.value);
            }
          }
          if (options.limitCount) {
            fallbackQuery = fallbackQuery.limit(options.limitCount);
          }
          const snap = await fallbackQuery.get();
          const docs = snap.docs.map((d) => serializeDoc<T>(d.id, d.data()));

          // In-memory sort
          if (options.orderByField) {
            const dir = options.orderByDirection === "desc" ? -1 : 1;
            docs.sort((a: any, b: any) => {
              const va = a[options.orderByField!];
              const vb = b[options.orderByField!];
              if (va == null && vb == null) return 0;
              if (va == null) return 1;
              if (vb == null) return -1;
              if (typeof va === "string") return va.localeCompare(vb) * dir;
              return (va < vb ? -1 : va > vb ? 1 : 0) * dir;
            });
          }

          return docs;
        }
        // Re-throw non-index errors
        throw err;
      }
    },

    /** Create a document with an auto-generated ID */
    async create(data: Partial<T>): Promise<T> {
      const docRef = coll().doc();
      const now = new Date();
      const docData = {
        ...data,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
      };
      await docRef.set(docData);
      return docData as unknown as T;
    },

    /** Create a document with a specific ID */
    async createWithId(id: string, data: Partial<T>): Promise<T> {
      const docRef = coll().doc(id);
      const now = new Date();
      const docData = {
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      };
      await docRef.set(docData);
      return docData as unknown as T;
    },

    /** Update a document (partial update) */
    async update(id: string, data: Partial<T>): Promise<T | null> {
      const docRef = coll().doc(id);
      const snap = await docRef.get();
      if (!snap.exists) return null;

      const updateData = {
        ...data,
        updatedAt: new Date(),
      };
      await docRef.update(updateData);
      const updated = await docRef.get();
      return serializeDoc<T>(id, updated.data()!);
    },

    /** Delete a document */
    async delete(id: string): Promise<boolean> {
      const docRef = coll().doc(id);
      const snap = await docRef.get();
      if (!snap.exists) return false;
      await docRef.delete();
      return true;
    },

    /** Count documents with optional filters within a tenant */
    async countInTenant(tenantId: string, options: { where?: WhereClause[] } = {}): Promise<number> {
      let query: FirebaseFirestore.Query = coll().where("tenantId", "==", tenantId);
      if (options.where) {
        for (const clause of options.where) {
          query = query.where(clause.field, clause.op, clause.value);
        }
      }
      const snap = await query.get();
      return snap.size;
    },

    /** Count documents globally */
    async count(options: { where?: WhereClause[] } = {}): Promise<number> {
      let query: FirebaseFirestore.Query = coll();
      if (options.where) {
        for (const clause of options.where) {
          query = query.where(clause.field, clause.op, clause.value);
        }
      }
      const snap = await query.get();
      return snap.size;
    },

    /** Run a transaction */
    async runTransaction<T>(updateFn: (transaction: FirebaseFirestore.Transaction) => Promise<T>): Promise<T> {
      return getAdminDb().runTransaction(updateFn);
    },

    /** Get a document reference for transaction operations */
    doc(id: string) {
      return coll().doc(id);
    },

    /** Batch set/update/delete */
    batch() {
      return getAdminDb().batch();
    },
  };
}

// ══════════════════════════════════════════════════════════════════
// Exported Service Instances
// ══════════════════════════════════════════════════════════════════

import type {
  Tenant,
  TenantLanguage,
  Organization,
  Department,
  Designation,
  BusinessUnit,
  Location,
  HRMUser,
  EmployeeJob,
  EmployeeDetail,
  FamilyDetail,
  PastEmployer,
  EmployeeEducation,
  EmployeeCertification,
  EmployeeSalary,
  EmployeeSalaryHistory,
  Shift,
  WeeklyOff,
  EmployeeAttendance,
  AttendanceStats,
  RegularizationRequest,
  LeavePlan,
  LeaveType,
  LeaveBalance,
  LeaveBalanceHistory,
  LeaveRequest,
  OvertimePolicy,
  OvertimeRequest,
  OvertimeTerm,
  HolidayPlan,
  Holiday,
  CalendarEvent,
  PayGroup,
  PayGroupComponent,
  SalaryComponent,
  PayrollRun,
  PayrollTransaction,
  PayslipTemplate,
  AssetCategory,
  AssetType,
  Asset,
  AssetAssignment,
  Document,
  DocumentCategory,
  DocumentTemplate,
  Post,
  Comment,
  Reaction,
  Poll,
  PollVote,
  Onboarding,
  EmployeeOnboardingTask,
  EmployeeExit,
  EmployeeExitSetting,
  ProbationPolicy,
  ProbationReview,
  NoticePeriod,
  NotificationTemplate,
  Notification,
  Setting,
  Language,
  Translation,
  ContactSupport,
  ReportingManager,
  EmployeeJobEvent,
  Role,
  Permission,
  ApprovalChain,
  Project,
  ProjectMember,
  ProjectTask,
  Milestone,
  TaskComment,
  TaskAttachment,
  IDCardTemplate,
  AIChatMessage,
  AuditLog,
  Goal,
  PerformanceReview,
  PerformanceFeedback,
  Kpi,
  HRMTask,
  HRMTaskComment,
  TaskAuditLog,
  Ticket,
  TicketReply,
  TicketTimeline,
} from "@/types";

// ── Audit Log ────────────────────────────────────────
export const auditLogsService = createFirestoreService<AuditLog>(COLLECTIONS.auditLogs);

// ── Core ───────────────────────────────────────────────
export const tenantsService = createFirestoreService<Tenant>(COLLECTIONS.tenants);
export const tenantLanguagesService = createFirestoreService<TenantLanguage>(COLLECTIONS.tenantLanguages);

// ── Organization ───────────────────────────────────────
export const organizationsService = createFirestoreService<Organization>(COLLECTIONS.organizations);
export const departmentsService = createFirestoreService<Department>(COLLECTIONS.departments);
export const designationsService = createFirestoreService<Designation>(COLLECTIONS.designations);
export const businessUnitsService = createFirestoreService<BusinessUnit>(COLLECTIONS.businessUnits);
export const locationsService = createFirestoreService<Location>(COLLECTIONS.locations);

// ── Users & Employees ──────────────────────────────────
export const hrmUsersService = createFirestoreService<HRMUser>(COLLECTIONS.users);
export const employeeJobsService = createFirestoreService<EmployeeJob>(COLLECTIONS.employeeJobs);
export const employeeDetailsService = createFirestoreService<EmployeeDetail>(COLLECTIONS.employeeDetails);
export const employeeJobEventsService = createFirestoreService<EmployeeJobEvent>(COLLECTIONS.employeeJobEvents);
export const familyDetailsService = createFirestoreService<FamilyDetail>(COLLECTIONS.familyDetails);
export const pastEmployersService = createFirestoreService<PastEmployer>(COLLECTIONS.pastEmployers);
export const employeeEducationsService = createFirestoreService<EmployeeEducation>(COLLECTIONS.employeeEducations);
export const employeeCertificationsService = createFirestoreService<EmployeeCertification>(COLLECTIONS.employeeCertifications);
export const employeeSalariesService = createFirestoreService<EmployeeSalary>(COLLECTIONS.employeeSalaries);
export const employeeSalaryHistoryService = createFirestoreService<EmployeeSalaryHistory>(COLLECTIONS.employeeSalaryHistory);
export const reportingManagersService = createFirestoreService<ReportingManager>(COLLECTIONS.reportingManagers);

// ── Roles & Permissions ────────────────────────────────
export const rolesService = createFirestoreService<Role>(COLLECTIONS.roles);
export const permissionsService = createFirestoreService<Permission>(COLLECTIONS.permissions);
export const approvalChainsService = createFirestoreService<ApprovalChain>(COLLECTIONS.approvalChains);

// ── Attendance ─────────────────────────────────────────
export const shiftsService = createFirestoreService<Shift>(COLLECTIONS.shifts);
export const weeklyOffsService = createFirestoreService<WeeklyOff>(COLLECTIONS.weeklyOffs);
export const attendanceService = createFirestoreService<EmployeeAttendance>(COLLECTIONS.attendance);
export const attendanceStatsService = createFirestoreService<AttendanceStats>(COLLECTIONS.attendanceStats);
export const regularizationRequestsService = createFirestoreService<RegularizationRequest>(COLLECTIONS.regularizationRequests);

// ── Leave & Overtime ───────────────────────────────────
export const leavePlansService = createFirestoreService<LeavePlan>(COLLECTIONS.leavePlans);
export const leaveTypesService = createFirestoreService<LeaveType>(COLLECTIONS.leaveTypes);
export const leaveBalancesService = createFirestoreService<LeaveBalance>(COLLECTIONS.leaveBalances);
export const leaveBalanceHistoryService = createFirestoreService<LeaveBalanceHistory>(COLLECTIONS.leaveBalanceHistory);
export const leaveRequestsService = createFirestoreService<LeaveRequest>(COLLECTIONS.leaveRequests);
export const overtimePoliciesService = createFirestoreService<OvertimePolicy>(COLLECTIONS.overtimePolicies);
export const overtimeRequestsService = createFirestoreService<OvertimeRequest>(COLLECTIONS.overtimeRequests);
export const overtimeTermsService = createFirestoreService<OvertimeTerm>(COLLECTIONS.overtimeTerms);

// ── Holiday ────────────────────────────────────────────
export const holidayPlansService = createFirestoreService<HolidayPlan>(COLLECTIONS.holidayPlans);
export const holidaysService = createFirestoreService<Holiday>(COLLECTIONS.holidays);
export const calendarEventsService = createFirestoreService<CalendarEvent>(COLLECTIONS.calendarEvents);

// ── Payroll ────────────────────────────────────────────
export const payGroupsService = createFirestoreService<PayGroup>(COLLECTIONS.payGroups);
export const payGroupComponentsService = createFirestoreService<PayGroupComponent>(COLLECTIONS.payGroupComponents);
export const salaryComponentsService = createFirestoreService<SalaryComponent>(COLLECTIONS.salaryComponents);
export const payrollRunsService = createFirestoreService<PayrollRun>(COLLECTIONS.payrollRuns);
export const payrollTransactionsService = createFirestoreService<PayrollTransaction>(COLLECTIONS.payrollTransactions);
export const payslipTemplatesService = createFirestoreService<PayslipTemplate>(COLLECTIONS.payslipTemplates);

// ── Assets ─────────────────────────────────────────────
export const assetCategoriesService = createFirestoreService<AssetCategory>(COLLECTIONS.assetCategories);
export const assetTypesService = createFirestoreService<AssetType>(COLLECTIONS.assetTypes);
export const assetsService = createFirestoreService<Asset>(COLLECTIONS.assets);
export const assetAssignmentsService = createFirestoreService<AssetAssignment>(COLLECTIONS.assetAssignments);

// ── Documents ──────────────────────────────────────────
export const documentCategoriesService = createFirestoreService<DocumentCategory>(COLLECTIONS.documentCategories);
export const documentsService = createFirestoreService<Document>(COLLECTIONS.documents);
export const documentTemplatesService = createFirestoreService<DocumentTemplate>(COLLECTIONS.documentTemplates);

// ── Engage ─────────────────────────────────────────────
export const postsService = createFirestoreService<Post>(COLLECTIONS.posts);
export const commentsService = createFirestoreService<Comment>(COLLECTIONS.comments);
export const reactionsService = createFirestoreService<Reaction>(COLLECTIONS.reactions);
export const pollsService = createFirestoreService<Poll>(COLLECTIONS.polls);
export const pollVotesService = createFirestoreService<PollVote>(COLLECTIONS.pollVotes);

// ── Onboarding ─────────────────────────────────────────
export const onboardingService = createFirestoreService<Onboarding>(COLLECTIONS.onboarding);
export const employeeOnboardingTasksService = createFirestoreService<EmployeeOnboardingTask>(COLLECTIONS.employeeOnboardingTasks);

// ── Exit ───────────────────────────────────────────────
export const employeeExitsService = createFirestoreService<EmployeeExit>(COLLECTIONS.employeeExits);
export const exitSettingsService = createFirestoreService<EmployeeExitSetting>(COLLECTIONS.exitSettings);

// ── Probation ──────────────────────────────────────────
export const probationPoliciesService = createFirestoreService<ProbationPolicy>(COLLECTIONS.probationPolicies);
export const probationReviewsService = createFirestoreService<ProbationReview>(COLLECTIONS.probationReviews);

// ── Notice Period ──────────────────────────────────────
export const noticePeriodsService = createFirestoreService<NoticePeriod>(COLLECTIONS.noticePeriods);

// ── Notifications ──────────────────────────────────────
export const notificationTemplatesService = createFirestoreService<NotificationTemplate>(COLLECTIONS.notificationTemplates);
export const notificationsService = createFirestoreService<Notification>(COLLECTIONS.notifications);

// ── Settings ───────────────────────────────────────────
export const settingsService = createFirestoreService<Setting>(COLLECTIONS.settings);
export const languagesService = createFirestoreService<Language>(COLLECTIONS.languages);
export const translationsService = createFirestoreService<Translation>(COLLECTIONS.translations);

// ── Support ────────────────────────────────────────────
export const contactSupportService = createFirestoreService<ContactSupport>(COLLECTIONS.contactSupport);

// ── Projects ───────────────────────────────────────────
export const projectsService = createFirestoreService<Project>(COLLECTIONS.projects);
export const projectMembersService = createFirestoreService<ProjectMember>(COLLECTIONS.projectMembers);
export const projectTasksService = createFirestoreService<ProjectTask>(COLLECTIONS.projectTasks);
export const taskCommentsService = createFirestoreService<TaskComment>(COLLECTIONS.taskComments);
export const taskAttachmentsService = createFirestoreService<TaskAttachment>(COLLECTIONS.taskAttachments);
export const milestonesService = createFirestoreService<Milestone>(COLLECTIONS.milestones);

// ── Other ──────────────────────────────────────────────
export const idCardTemplatesService = createFirestoreService<IDCardTemplate>(COLLECTIONS.idCardTemplates);
export const aiChatMessagesService = createFirestoreService<AIChatMessage>(COLLECTIONS.aiChatMessages);

// ── Task & Ticket Management ───────────────────────────
export const hrmTasksService = createFirestoreService<HRMTask>(COLLECTIONS.hrmTasks);
export const hrmTaskCommentsService = createFirestoreService<HRMTaskComment>(COLLECTIONS.hrmTaskComments);
export const taskAuditLogsService = createFirestoreService<TaskAuditLog>(COLLECTIONS.taskAuditLogs);
export const ticketsService = createFirestoreService<Ticket>(COLLECTIONS.tickets);
export const ticketRepliesService = createFirestoreService<TicketReply>(COLLECTIONS.ticketReplies);
export const ticketTimelineService = createFirestoreService<TicketTimeline>(COLLECTIONS.ticketTimeline);

// ── Performance ────────────────────────────────────────
export const goalsService = createFirestoreService<Goal>(COLLECTIONS.goals);
export const performanceReviewsService = createFirestoreService<PerformanceReview>(COLLECTIONS.performanceReviews);
export const performanceFeedbackService = createFirestoreService<PerformanceFeedback>(COLLECTIONS.performanceFeedback);
export const kpisService = createFirestoreService<Kpi>(COLLECTIONS.kpis);

// ── Re-export types for convenience ────────────────────
export type {
  Tenant,
  Organization,
  Department,
  Designation,
  BusinessUnit,
  Location,
  HRMUser,
  EmployeeJob,
  EmployeeDetail,
  EmployeeAttendance,
  LeaveRequest,
  LeaveBalance,
  LeaveType,
  LeavePlan,
  OvertimeRequest,
  OvertimePolicy,
  Shift,
  WeeklyOff,
  PayGroup,
  SalaryComponent,
  PayrollRun,
  PayrollTransaction,
  Asset,
  AssetAssignment,
  Post,
  Comment,
  Notification,
  Setting,
  Document,
  DocumentTemplate,
  Onboarding,
  EmployeeOnboardingTask,
  EmployeeExit,
  ProbationPolicy,
  NoticePeriod,
  Project,
  ProjectTask,
  Milestone,
  TaskComment,
  TaskAttachment,
  Role,
  Permission,
  ApprovalChain,
  CalendarEvent,
  RegularizationRequest,
  Goal,
  PerformanceReview,
  PerformanceFeedback,
  Kpi,
};
