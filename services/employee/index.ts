import "server-only";
import { getAdminAuth } from "@/lib/firebase-admin";
import {
  hrmUsersService,
  employeeJobsService,
  employeeDetailsService,
  employeeJobEventsService,
  familyDetailsService,
  pastEmployersService,
  employeeEducationsService,
  employeeCertificationsService,
  employeeSalariesService,
  reportingManagersService,
} from "@/lib/hrm/firestore";
import type {
  HRMUser,
  EmployeeJob,
  EmployeeDetail,
  EmployeeJobEvent,
  FamilyDetail,
  PastEmployer,
  EmployeeEducation,
  EmployeeCertification,
  EmployeeSalary,
  ReportingManager,
} from "@/types";

// ══════════════════════════════════════════════════════════════════
// Employee Service
// ══════════════════════════════════════════════════════════════════

// ── Users ──────────────────────────────────────────────

export async function getEmployees(tenantId: string): Promise<HRMUser[]> {
  return hrmUsersService.findManyInTenant(tenantId, {
    orderByField: "displayName",
    orderByDirection: "asc",
  });
}

export interface PaginatedResult<T> {
  data: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface GetEmployeesOptions {
  page?: number;
  pageSize?: number;
  search?: string;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  status?: string;
}

/** Allowed sort fields for employees — prevents injection of arbitrary field names */
const EMPLOYEE_SORT_FIELDS = new Set([
  "displayName", "email", "employeeCode", "firstName", "lastName",
  "departmentName", "designationName", "role", "status",
  "joiningDate", "createdAt", "updatedAt",
]);

/** Fields to search across */
const EMPLOYEE_SEARCH_FIELDS = [
  "displayName", "email", "employeeCode", "firstName", "lastName",
  "departmentName", "designationName", "phone",
];

export async function getEmployeesPaginated(
  tenantId: string,
  options: GetEmployeesOptions = {}
): Promise<PaginatedResult<HRMUser>> {
  const {
    page = 0,
    pageSize = 10,
    search = "",
    sortKey = "displayName",
    sortDir = "asc",
  } = options;

  // Fetch all employees for the tenant
  const all = await hrmUsersService.findManyInTenant(tenantId);

  // ── Search filter (case-insensitive substring match) ──
  let filtered = all;
  if (search.trim()) {
    const q = search.toLowerCase().trim();
    filtered = all.filter((emp) =>
      EMPLOYEE_SEARCH_FIELDS.some((field) => {
        const val = (emp as any)[field];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }

  // ── Status filter ──
  if (options.status) {
    filtered = filtered.filter((emp) => emp.status === options.status);
  }

  // ── Sort — only allow known fields to prevent injection ──
  const safeSortKey = EMPLOYEE_SORT_FIELDS.has(sortKey) ? sortKey : "displayName";
  const dir = sortDir === "desc" ? -1 : 1;

  filtered.sort((a: any, b: any) => {
    const va = a[safeSortKey];
    const vb = b[safeSortKey];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === "string") return va.localeCompare(vb) * dir;
    if (va instanceof Date && vb instanceof Date) return (va.getTime() - vb.getTime()) * dir;
    return (va < vb ? -1 : va > vb ? 1 : 0) * dir;
  });

  // ── Paginate ──
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const data = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return { data, totalItems, page: safePage, pageSize, totalPages };
}

export async function getEmployeeById(id: string): Promise<HRMUser | null> {
  return hrmUsersService.findById(id);
}

export async function createEmployee(
  tenantId: string,
  data: {
    email: string;
    password: string;
    displayName: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: HRMUser["role"];
    status?: HRMUser["status"];
    departmentId?: string;
    departmentName?: string;
    designationId?: string;
    designationName?: string;
    joiningDate?: Date;
    employeeCode?: string;
    address?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
  }
): Promise<HRMUser> {
  // 1. Create Firebase Auth user
  const authUser = await getAdminAuth().createUser({
    email: data.email,
    password: data.password,
    displayName: data.displayName,
  });

  // 2. Set custom claims
  await getAdminAuth().setCustomUserClaims(authUser.uid, {
    role: data.role || "employee",
    tenantId,
  });

  // 3. Generate employee code if not provided
  const employeeCode = data.employeeCode || `EMP${String(Date.now()).slice(-6)}`;

  // 4. Create Firestore user profile
  return hrmUsersService.createWithId(authUser.uid, {
    tenantId,
    email: data.email,
    emailVerified: false,
    displayName: data.displayName,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone || "",
    role: data.role || "employee",
    status: data.status || "active",
    loginStatus: "enabled",
    allowMobileLogin: false,
    departmentId: data.departmentId || "",
    departmentName: data.departmentName || "",
    designationId: data.designationId || "",
    designationName: data.designationName || "",
    joiningDate: data.joiningDate || null,
    employeeCode,
    address: data.address || "",
    emergencyContact: data.emergencyContact || "",
    emergencyPhone: data.emergencyPhone || "",
  } as any);
}

export async function updateEmployee(
  id: string,
  data: Partial<HRMUser>
): Promise<HRMUser | null> {
  // Update Firebase Auth displayName if provided
  if (data.displayName) {
    try {
      await getAdminAuth().updateUser(id, { displayName: data.displayName });
    } catch (error) {
      console.error("Failed to update Firebase Auth user:", error);
    }
  }

  // Update Firebase Auth email if provided
  if (data.email) {
    try {
      await getAdminAuth().updateUser(id, { email: data.email });
    } catch (error) {
      console.error("Failed to update Firebase Auth email:", error);
    }
  }

  return hrmUsersService.update(id, {
    ...data,
    updatedAt: new Date(),
  } as any);
}

export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    await getAdminAuth().deleteUser(id);
  } catch (error) {
    console.error("Failed to delete Firebase Auth user:", error);
  }
  return hrmUsersService.delete(id);
}

export async function disableEmployeeLogin(userId: string): Promise<HRMUser | null> {
  await getAdminAuth().revokeRefreshTokens(userId);
  return hrmUsersService.update(userId, { loginStatus: "login_disabled" } as any);
}

export async function enableEmployeeLogin(userId: string): Promise<HRMUser | null> {
  return hrmUsersService.update(userId, { loginStatus: "enabled" } as any);
}

// ── Employee Jobs ──────────────────────────────────────

export async function getEmployeeJobs(tenantId: string, userId?: string): Promise<EmployeeJob[]> {
  const where = userId ? [{ field: "userId", op: "==" as const, value: userId }] : [];
  return employeeJobsService.findManyInTenant(tenantId, {
    where,
    orderByField: "joiningDate",
    orderByDirection: "desc",
  });
}

export async function getEmployeeJobById(id: string): Promise<EmployeeJob | null> {
  return employeeJobsService.findById(id);
}

export async function createEmployeeJob(
  tenantId: string,
  data: Partial<EmployeeJob>
): Promise<EmployeeJob> {
  const job = await employeeJobsService.create({ ...data, tenantId } as any);

  // Create job event
  await employeeJobsService.create({
    userId: data.userId,
    tenantId,
    type: "joining",
    eventDate: data.joiningDate || new Date(),
    details: `Joined as ${data.employmentType || "permanent"}`,
  } as any);

  return job;
}

export async function updateEmployeeJob(
  id: string,
  data: Partial<EmployeeJob>
): Promise<EmployeeJob | null> {
  const oldJob = await employeeJobsService.findById(id);
  const updated = await employeeJobsService.update(id, data as any);

  // Log job change event
  if (oldJob && updated && (oldJob.departmentId !== data.departmentId || oldJob.designationId !== data.designationId)) {
    await employeeJobsService.create({
      userId: data.userId || oldJob.userId,
      tenantId: oldJob.tenantId,
      type: "transfer",
      eventDate: new Date(),
      details: `Department/Designation changed`,
    } as any);
  }

  return updated;
}

// ── Employee Details ───────────────────────────────────

export async function getEmployeeDetail(userId: string): Promise<EmployeeDetail | null> {
  return employeeDetailsService.findOne("userId", userId);
}

export async function upsertEmployeeDetail(
  userId: string,
  tenantId: string,
  data: Partial<EmployeeDetail>
): Promise<EmployeeDetail> {
  const existing = await employeeDetailsService.findOne("userId", userId);
  if (existing) {
    return (await employeeDetailsService.update(existing.id, data as any))!;
  }
  return employeeDetailsService.create({ ...data, userId, tenantId } as any);
}

// ── Family Details ─────────────────────────────────────

export async function getFamilyDetails(userId: string): Promise<FamilyDetail[]> {
  return familyDetailsService.findMany({
    where: [{ field: "userId", op: "==", value: userId }],
    orderByField: "name",
    orderByDirection: "asc",
  });
}

export async function createFamilyDetail(
  tenantId: string,
  data: Partial<FamilyDetail>
): Promise<FamilyDetail> {
  return familyDetailsService.create({ ...data, tenantId } as any);
}

export async function updateFamilyDetail(
  id: string,
  data: Partial<FamilyDetail>
): Promise<FamilyDetail | null> {
  return familyDetailsService.update(id, data as any);
}

export async function deleteFamilyDetail(id: string): Promise<boolean> {
  return familyDetailsService.delete(id);
}

// ── Education ──────────────────────────────────────────

export async function getEmployeeEducations(userId: string): Promise<EmployeeEducation[]> {
  return employeeEducationsService.findMany({
    where: [{ field: "userId", op: "==", value: userId }],
    orderByField: "endDate",
    orderByDirection: "desc",
  });
}

export async function createEmployeeEducation(
  tenantId: string,
  data: Partial<EmployeeEducation>
): Promise<EmployeeEducation> {
  return employeeEducationsService.create({ ...data, tenantId } as any);
}

export async function updateEmployeeEducation(
  id: string,
  data: Partial<EmployeeEducation>
): Promise<EmployeeEducation | null> {
  return employeeEducationsService.update(id, data as any);
}

export async function deleteEmployeeEducation(id: string): Promise<boolean> {
  return employeeEducationsService.delete(id);
}

// ── Certifications ─────────────────────────────────────

export async function getEmployeeCertifications(userId: string): Promise<EmployeeCertification[]> {
  return employeeCertificationsService.findMany({
    where: [{ field: "userId", op: "==", value: userId }],
    orderByField: "issueDate",
    orderByDirection: "desc",
  });
}

export async function createEmployeeCertification(
  tenantId: string,
  data: Partial<EmployeeCertification>
): Promise<EmployeeCertification> {
  return employeeCertificationsService.create({ ...data, tenantId } as any);
}

export async function updateEmployeeCertification(
  id: string,
  data: Partial<EmployeeCertification>
): Promise<EmployeeCertification | null> {
  return employeeCertificationsService.update(id, data as any);
}

export async function deleteEmployeeCertification(id: string): Promise<boolean> {
  return employeeCertificationsService.delete(id);
}

// ── Past Employers ─────────────────────────────────────

export async function getPastEmployers(userId: string): Promise<PastEmployer[]> {
  return pastEmployersService.findMany({
    where: [{ field: "userId", op: "==", value: userId }],
    orderByField: "fromDate",
    orderByDirection: "desc",
  });
}

export async function createPastEmployer(
  tenantId: string,
  data: Partial<PastEmployer>
): Promise<PastEmployer> {
  return pastEmployersService.create({ ...data, tenantId } as any);
}

// ── Reporting Managers ─────────────────────────────────

export async function getReportingManager(userId: string): Promise<ReportingManager | null> {
  const managers = await reportingManagersService.findMany({
    where: [
      { field: "employeeId", op: "==", value: userId },
      { field: "isActive", op: "==", value: true },
    ],
    limitCount: 1,
  });
  return managers[0] || null;
}

export async function setReportingManager(
  tenantId: string,
  employeeId: string,
  managerId: string
): Promise<ReportingManager> {
  // Deactivate old reporting relationships
  const oldManagers = await reportingManagersService.findMany({
    where: [
      { field: "employeeId", op: "==", value: employeeId },
      { field: "isActive", op: "==", value: true },
    ],
  });
  for (const old of oldManagers) {
    await reportingManagersService.update(old.id, { isActive: false, toDate: new Date() } as any);
  }

  return reportingManagersService.create({
    tenantId,
    managerId,
    employeeId,
    fromDate: new Date(),
    isActive: true,
  } as any);
}

// ── Full Employee Profile ──────────────────────────────

export interface EmployeeProfile {
  user: HRMUser | null;
  job: EmployeeJob | null;
  detail: EmployeeDetail | null;
  family: FamilyDetail[];
  education: EmployeeEducation[];
  certifications: EmployeeCertification[];
  pastEmployers: PastEmployer[];
  salary: EmployeeSalary | null;
  reportingManager: ReportingManager | null;
}

export async function getEmployeeProfile(userId: string): Promise<EmployeeProfile> {
  const [user, job, detail, family, education, certifications, pastEmployers, reportingManager] =
    await Promise.all([
      hrmUsersService.findById(userId),
      getEmployeeJobs(userId, userId).then((jobs) => jobs[0] || null),
      getEmployeeDetail(userId),
      getFamilyDetails(userId),
      getEmployeeEducations(userId),
      getEmployeeCertifications(userId),
      getPastEmployers(userId),
      getReportingManager(userId),
    ]);

  const salary = user
    ? await employeeSalariesService.findOneInTenant(user.tenantId, "userId", userId)
    : null;

  return {
    user,
    job,
    detail,
    family,
    education,
    certifications,
    pastEmployers,
    salary,
    reportingManager,
  };
}

// ── Employee Job Events ────────────────────────────────

export async function getEmployeeJobEvents(userId: string): Promise<EmployeeJobEvent[]> {
  return employeeJobEventsService.findMany({
    where: [{ field: "userId", op: "==", value: userId }],
    orderByField: "eventDate",
    orderByDirection: "desc",
  });
}

export async function createEmployeeJobEvent(
  tenantId: string,
  data: {
    userId: string;
    type: "joining" | "transfer" | "promotion" | "resignation" | "termination" | "rehire";
    eventDate: Date;
    details: string;
    previousValue?: string;
    newValue?: string;
  }
): Promise<EmployeeJobEvent> {
  return employeeJobEventsService.create({ ...data, tenantId } as any);
}
