import { z } from "zod";

// ── HRMS Role Enum ──
export const HRMSRoleEnum = z.enum(["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"]);

// ── Coercions ──
const trimmedString = (min = 1, max = 200) =>
  z.string().trim().min(min).max(max);

const positiveNumber = z.coerce.number().nonnegative().finite();

// ── createEmployee ──
// SECURITY: role is intentionally NOT in this schema. Server sets role from session.
export const CreateEmployeeSchema = z.object({
  name: trimmedString(2, 100),
  email: z.string().email().max(200).transform((v) => v.toLowerCase().trim()),
  department: trimmedString(1, 100),
  baseSalary: positiveNumber.max(10_000_000).optional(),
  reportingManagerId: z.string().optional(),
  tenantId: z.string().optional(),
});
export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;

// ── createProject ──
export const CreateProjectSchema = z.object({
  name: trimmedString(2, 200),
  description: z.string().max(2000).optional(),
  clientBudget: positiveNumber.max(1_000_000_000),
  managerId: z.string().min(1), // validated server-side: must be a real MANAGER
  tenantId: z.string().optional(),
});
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;

// ── createTask / createAssignedTask ──
export const CreateTaskSchema = z.object({
  projectId: z.string().min(1),
  title: trimmedString(2, 200),
  description: z.string().max(2000).optional(),
  assigneeId: z.string().min(1),
  estimatedHours: positiveNumber.max(1000).optional(),
});
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

// ── updateTaskStatus / toggleMilestoneStatus ──
export const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]);
export const UpdateTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  status: TaskStatusEnum,
});

// ── submitLeaveRequest ──
export const LeaveTypeEnum = z.enum(["CASUAL", "SICK", "EARNED"]);
export const HalfDaySessionEnum = z.enum(["MORNING", "AFTERNOON"]);
export const SubmitLeaveRequestSchema = z.object({
  userId: z.string().min(1),
  leaveType: LeaveTypeEnum,
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date (YYYY-MM-DD)"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date (YYYY-MM-DD)"),
  isHalfDay: z.boolean(),
  halfDaySession: HalfDaySessionEnum.optional(),
  reason: trimmedString(3, 500),
}).refine((v) => v.startDate <= v.endDate, { message: "startDate must be <= endDate", path: ["endDate"] });
export type SubmitLeaveRequestInput = z.infer<typeof SubmitLeaveRequestSchema>;

// ── reviewLeaveRequest ──
// SECURITY: approverUserId is intentionally NOT in the schema. Server uses session.
export const ReviewLeaveRequestSchema = z.object({
  leaveId: z.string().min(1),
  status: z.enum(["APPROVED", "REJECTED"]),
});
export type ReviewLeaveRequestInput = z.infer<typeof ReviewLeaveRequestSchema>;

// ── runMonthlyPayroll ──
export const RunPayrollSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});
export type RunPayrollInput = z.infer<typeof RunPayrollSchema>;

// ── requestAttendanceRegularization ──
export const RequestRegularizationSchema = z.object({
  userId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date (YYYY-MM-DD)"),
  reason: trimmedString(3, 500),
});

// ── logTimesheet ──
export const LogTimesheetSchema = z.object({
  userId: z.string().min(1),
  projectId: z.string().min(1),
  taskId: z.string().min(1),
  hours: positiveNumber.max(24),
  description: z.string().max(1000).optional(),
});

// ── Helper: parse FormData → object ──
export function formDataToObject(fd: FormData): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (k in obj) {
      const existing = obj[k];
      obj[k] = Array.isArray(existing) ? [...existing, v] : [existing, v];
    } else {
      obj[k] = v;
    }
  }
  // Common coercions for checkbox "on" → boolean
  for (const k of Object.keys(obj)) {
    if (obj[k] === "on") obj[k] = true;
  }
  return obj;
}
