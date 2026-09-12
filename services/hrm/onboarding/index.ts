import "server-only";
import {
  onboardingService,
  employeeOnboardingTasksService,
} from "@/lib/hrm/firestore";
import type {
  Onboarding,
  EmployeeOnboardingTask,
  OnboardingTask,
} from "@/types";

// ══════════════════════════════════════════════════════════════════
// Onboarding Service
// ══════════════════════════════════════════════════════════════════

export async function getOnboardingPrograms(tenantId: string): Promise<Onboarding[]> {
  return onboardingService.findManyInTenant(tenantId, {
    orderByField: "name",
    orderByDirection: "asc",
  });
}

export async function getOnboardingById(id: string): Promise<Onboarding | null> {
  return onboardingService.findById(id);
}

export async function createOnboardingProgram(
  tenantId: string,
  data: {
    name: string;
    description?: string;
    departmentId?: string;
    designationId?: string;
    tasks: OnboardingTask[];
    isDefault?: boolean;
  }
): Promise<Onboarding> {
  return onboardingService.create({
    ...data,
    isDefault: data.isDefault || false,
    status: "active",
    tenantId,
  } as any);
}

export async function updateOnboardingProgram(
  id: string,
  data: Partial<Onboarding>
): Promise<Onboarding | null> {
  return onboardingService.update(id, data as any);
}

export async function deleteOnboardingProgram(id: string): Promise<boolean> {
  return onboardingService.delete(id);
}

// ── Employee Onboarding Tasks ──────────────────────────

export async function initiateEmployeeOnboarding(
  tenantId: string,
  onboardingId: string,
  userId: string
): Promise<EmployeeOnboardingTask[]> {
  const program = await onboardingService.findById(onboardingId);
  if (!program) throw new Error("Onboarding program not found");

  const createdTasks: EmployeeOnboardingTask[] = [];

  for (const task of program.tasks) {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + task.dueDaysAfterJoining);

    const createdTask = await employeeOnboardingTasksService.create({
      onboardingId,
      userId,
      taskId: task.id,
      title: task.title,
      assignedTo: task.assignedTo,
      status: "pending",
      dueDate,
      tenantId,
    } as any);

    createdTasks.push(createdTask);
  }

  return createdTasks;
}

export async function getEmployeeOnboardingTasks(
  tenantId: string,
  userId: string
): Promise<EmployeeOnboardingTask[]> {
  // Registration-created onboarding rows historically omitted tenantId; scope
  // strictly when the tenant is present but never hide rows over a missing
  // tenant field. Query the raw collection with an $in fallback instead of the
  // tenant-strict service helper so a legacy row can't vanish from the hub.
  const { getDb } = await import("@/lib/db/mongo-helper");
  const db = await getDb();
  if (!db) return [];
  const docs = await db
    .collection("employee_onboarding_tasks")
    .find({ userId, $or: [{ tenantId }, { tenantId: { $exists: false } }, { tenantId: "default" }] })
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map((d) => {
    const { _id, ...rest } = d as Record<string, unknown>;
    return { ...rest, id: String(_id) } as unknown as EmployeeOnboardingTask;
  });
}

export async function updateOnboardingTaskStatus(
  id: string,
  status: EmployeeOnboardingTask["status"],
  completedById?: string
): Promise<EmployeeOnboardingTask | null> {
  const updateData: Partial<EmployeeOnboardingTask> = { status };
  if (status === "completed") {
    updateData.completedAt = new Date();
    updateData.completedById = completedById;
  }
  return employeeOnboardingTasksService.update(id, updateData as any);
}

export async function getPendingOnboardingTasks(
  tenantId: string
): Promise<EmployeeOnboardingTask[]> {
  // Pending queue must surface registration rows too (they may lack tenantId
  // or carry status "pending" with a documentName from the register flow).
  const { getDb } = await import("@/lib/db/mongo-helper");
  const db = await getDb();
  if (!db) return [];
  const docs = await db
    .collection("employee_onboarding_tasks")
    .find({
      $or: [{ tenantId }, { tenantId: { $exists: false } }, { tenantId: "default" }],
    })
    .sort({ submittedAt: -1, createdAt: -1 })
    .limit(200)
    .toArray();
  return docs.map((d) => {
    const { _id, ...rest } = d as Record<string, unknown>;
    return { ...rest, id: String(_id) } as unknown as EmployeeOnboardingTask;
  });
}

// ── Dashboard ──────────────────────────────────────────

export async function getOnboardingDashboard(tenantId: string): Promise<{
  totalPrograms: number;
  activeOnboardings: number;
  pendingTasks: number;
  overdueTasks: number;
}> {
  const [programs, pendingTasks] = await Promise.all([
    getOnboardingPrograms(tenantId),
    getPendingOnboardingTasks(tenantId),
  ]);

  return {
    totalPrograms: programs.length,
    activeOnboardings: programs.filter((p) => p.status === "active").length,
    pendingTasks: pendingTasks.length,
    overdueTasks: pendingTasks.filter(
      (t) => new Date(t.dueDate as any) < new Date()
    ).length,
  };
}
