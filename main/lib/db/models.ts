import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. Tenant
export interface ITenant extends Document {
  name: string;
  domain: string;
  hrAdminId?: mongoose.Types.ObjectId;
  officeCoordinates: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
  moduleToggles: {
    pmsEnabled: boolean;
    payrollEnabled: boolean;
    overtimeEnabled: boolean;
    geofencingEnabled: boolean;
  };
  createdAt: Date;
}

const TenantSchema = new Schema<ITenant>({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
  hrAdminId: { type: Schema.Types.ObjectId, ref: 'User' },
  officeCoordinates: {
    latitude: { type: Number, required: true, default: 28.6007594 },
    longitude: { type: Number, required: true, default: 77.4319307 },
    radiusMeters: { type: Number, required: true, default: 100 }
  },
  moduleToggles: {
    pmsEnabled: { type: Boolean, default: true },
    payrollEnabled: { type: Boolean, default: true },
    overtimeEnabled: { type: Boolean, default: true },
    geofencingEnabled: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now }
});
TenantSchema.index({ hrAdminId: 1 }, { sparse: true });

// 2. User
export interface IUser extends Document {
  tenantId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
  employeeCode?: string;
  department: string;
  reportingManagerId?: mongoose.Types.ObjectId;
  onboardingStatus: 'PENDING_UPLOAD' | 'PENDING_REVIEW' | 'REJECTED' | 'VERIFIED' | 'ESCALATED_SUPERADMIN';
  onboardingDeadline?: Date;
  baseSalary: number;
  mustChangePassword?: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  name: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  // SECURITY: password is never returned by default queries. Callers that
  // need it must `.select('+password')` and must NOT return it to the client.
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'], required: true },
  employeeCode: { type: String },
  department: { type: String, default: 'General' },
  reportingManagerId: { type: Schema.Types.ObjectId, ref: 'User' },
  onboardingStatus: {
    type: String,
    enum: ['PENDING_UPLOAD', 'PENDING_REVIEW', 'REJECTED', 'VERIFIED', 'ESCALATED_SUPERADMIN'],
    default: 'PENDING_UPLOAD'
  },
  onboardingDeadline: { type: Date },
  baseSalary: { type: Number, default: 0, min: 0 },
  mustChangePassword: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
// H1: email is unique per tenant (null tenantId = global SUPER_ADMIN).
// Drop the old global unique index on `email` via migration script (see
// scripts/test-schema-integrity.ts for the helper). Compound partial unique
// keeps uniqueness inside each tenant and across global super admins.
UserSchema.index(
  { tenantId: 1, email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);
UserSchema.index({ employeeCode: 1 }, { unique: true, partialFilterExpression: { employeeCode: { $type: 'string' } } });
// M1: tenant-scoped query hot paths.
UserSchema.index({ tenantId: 1, role: 1 });
UserSchema.index({ tenantId: 1, onboardingStatus: 1 });
UserSchema.index({ tenantId: 1, reportingManagerId: 1 });
UserSchema.index({ reportingManagerId: 1 }, { sparse: true });

// 3. User Document
export interface IUserDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId;
  docType: 'AADHAAR' | 'PAN' | 'RESUME' | 'CERTIFICATE';
  fileUrl: string;
  fileName: string;
  uploadedAt: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
}

const UserDocumentSchema = new Schema<IUserDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  docType: { type: String, enum: ['AADHAAR', 'PAN', 'RESUME', 'CERTIFICATE'], required: true },
  // M2: enforce the upload-path prefix at the schema layer. Direct DB writes
  // and legacy rows that don't match are rejected. Use `tenants/<tid>/` so
  // ownership is unambiguous.
  fileUrl: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^tenants\/[a-f0-9]{24}\/(documents|onboarding)\//i.test(v),
      message: 'fileUrl must be a server-issued storage path under tenants/<id>/...',
    },
  },
  fileName: { type: String, default: 'document.pdf' },
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  rejectionReason: { type: String },
  verifiedAt: { type: Date },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' }
});
UserDocumentSchema.index({ tenantId: 1, status: 1 });
UserDocumentSchema.index({ userId: 1, uploadedAt: -1 });

// 4. Attendance
export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId;
  date: string;
  punchIn?: Date;
  punchOut?: Date;
  punchInLocation?: { latitude: number; longitude: number; distanceMeters: number };
  punchOutLocation?: { latitude: number; longitude: number; distanceMeters: number };
  status: 'PRESENT' | 'LATE' | 'HALF_DAY' | 'ABSENT';
  regularizationStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  regularizationReason?: string;
  escalationTargetRole: 'MANAGER' | 'SUPER_ADMIN';
  overtimeHours: number;
  overtimeStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  effectiveHours?: number;
}

const AttendanceSchema = new Schema<IAttendance>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  punchIn: { type: Date },
  punchOut: { type: Date },
  punchInLocation: { latitude: Number, longitude: Number, distanceMeters: Number },
  punchOutLocation: { latitude: Number, longitude: Number, distanceMeters: Number },
  status: { type: String, enum: ['PRESENT', 'LATE', 'HALF_DAY', 'ABSENT'], default: 'ABSENT' },
  regularizationStatus: { type: String, enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'], default: 'NONE' },
  regularizationReason: { type: String },
  // M6: default to MANAGER so legacy call sites that omit this still validate.
  escalationTargetRole: { type: String, enum: ['MANAGER', 'SUPER_ADMIN'], required: true, default: 'MANAGER' },
  overtimeHours: { type: Number, default: 0, min: 0 },
  overtimeStatus: { type: String, enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'], default: 'NONE' },
  effectiveHours: { type: Number, default: 0, min: 0 }
});
// H2: one row per (user, day). Punch-in code must catch dup-key and treat as
// already-punched instead of crashing.
AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
// M7: tenant-scoped hot paths.
AttendanceSchema.index({ tenantId: 1, date: 1 });
AttendanceSchema.index({ tenantId: 1, status: 1 });
AttendanceSchema.index({ userId: 1, overtimeStatus: 1 });

// 5. Leave Request
export interface ILeaveRequest extends Document {
  userId: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId;
  leaveType: 'CASUAL' | 'SICK' | 'EARNED';
  startDate: string;
  endDate: string;
  isHalfDay: boolean;
  halfDaySession?: 'MORNING' | 'AFTERNOON';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approverRole: 'MANAGER' | 'HR_ADMIN' | 'SUPER_ADMIN';
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  leaveType: { type: String, enum: ['CASUAL', 'SICK', 'EARNED'], required: true },
  startDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  endDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  isHalfDay: { type: Boolean, default: false },
  halfDaySession: { type: String, enum: ['MORNING', 'AFTERNOON'] },
  reason: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  approverRole: { type: String, enum: ['MANAGER', 'HR_ADMIN', 'SUPER_ADMIN'], required: true },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});
// H3: prevent two open leaves for the same user+window. PENDING/APPROVED
// rows are constrained; REJECTED rows are not (so a user can re-apply).
LeaveRequestSchema.index(
  { userId: 1, startDate: 1, endDate: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['PENDING', 'APPROVED'] } } }
);
LeaveRequestSchema.index({ tenantId: 1, status: 1, startDate: -1 });
LeaveRequestSchema.index({ userId: 1, status: 1 });

// 6. Project & Task
export interface IProject extends Document {
  tenantId?: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  clientBudget: number;
  managerId: mongoose.Types.ObjectId;
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED';
  createdAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  name: { type: String, required: true },
  description: { type: String },
  // L2: budgets cannot be negative.
  clientBudget: { type: Number, default: 0, min: 0 },
  managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['PLANNING', 'ACTIVE', 'COMPLETED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now }
});
ProjectSchema.index({ tenantId: 1, status: 1 });
ProjectSchema.index({ managerId: 1 });

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  assigneeId: mongoose.Types.ObjectId;
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
  estimatedHours: number;
  loggedHours: number;
  timerActive: boolean;
  timerStartedAt?: Date;
}

const TaskSchema = new Schema<ITask>({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  title: { type: String, required: true },
  description: { type: String },
  assigneeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'], default: 'TODO' },
  estimatedHours: { type: Number, default: 0, min: 0 },
  loggedHours: { type: Number, default: 0, min: 0 },
  timerActive: { type: Boolean, default: false },
  timerStartedAt: { type: Date }
});
// H4: compound hot paths.
TaskSchema.index({ projectId: 1, assigneeId: 1 });
TaskSchema.index({ assigneeId: 1, status: 1 });
TaskSchema.index({ tenantId: 1, status: 1 });
// M9: partial index helps the timer-sweep job find orphan running timers fast.
TaskSchema.index(
  { timerStartedAt: 1 },
  { partialFilterExpression: { timerActive: true } }
);

// 7. Timesheet
export interface ITimesheet extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId;
  date: string;
  hours: number;
  description?: string;
  // M8: `status` is the only lock state. `isLocked` removed.
  status: 'SUBMITTED' | 'LOCKED_BY_MANAGER' | 'APPROVED_BY_HR';
}

const TimesheetSchema = new Schema<ITimesheet>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  hours: { type: Number, required: true, min: 0, max: 24 },
  description: { type: String },
  // M8: `status` is the single source of truth. `isLocked` is removed to
  // prevent the two fields from drifting. Treat LOCKED_BY_MANAGER +
  // APPROVED_BY_HR as locked reads.
  status: { type: String, enum: ['SUBMITTED', 'LOCKED_BY_MANAGER', 'APPROVED_BY_HR'], default: 'SUBMITTED' }
});
// M4: one log per (user, task, day). Manager HR approvals update the same row.
TimesheetSchema.index({ userId: 1, taskId: 1, date: 1 }, { unique: true });
TimesheetSchema.index({ tenantId: 1, status: 1, date: -1 });
TimesheetSchema.index({ projectId: 1, date: 1 });

// 8. Payroll
export interface IPayroll extends Document {
  tenantId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  baseSalary: number;
  overtimeHours: number;
  overtimePayout: number;
  deductions: number;
  netSalary: number;
  status: 'DRAFT' | 'PROCESSED' | 'PAID';
  processedAt: Date;
  // H6: markPayrollPaid sets this. Was being written without a schema field.
  paidAt?: Date;
}

const PayrollSchema = new Schema<IPayroll>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true, min: 2000, max: 2100 },
  // L1: align with User.baseSalary default (was 50000 magic number, now 0).
  baseSalary: { type: Number, required: true, min: 0 },
  overtimeHours: { type: Number, default: 0, min: 0 },
  overtimePayout: { type: Number, default: 0, min: 0 },
  deductions: { type: Number, default: 0, min: 0 },
  netSalary: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['DRAFT', 'PROCESSED', 'PAID'], default: 'DRAFT' },
  processedAt: { type: Date, default: Date.now },
  paidAt: { type: Date }
});
// F-19: ensure one payroll per (tenant, user, month, year) — prevents dup on retry
PayrollSchema.index({ tenantId: 1, userId: 1, month: 1, year: 1 }, { unique: true });
PayrollSchema.index({ tenantId: 1, status: 1, year: -1, month: -1 });

// 9. Isolated Settings Schemas
export interface ISuperAdminSettings extends Document {
  globalSecurityPolicy: { mfaEnforced: boolean; sessionTimeoutMinutes: number };
  apiKeys: { geolocationProviderKey: string; paymentGatewayKey: string };
  firebaseAuthSync: { autoProvision: boolean; syncIntervalHours: number };
}

const SuperAdminSettingsSchema = new Schema<ISuperAdminSettings>({
  globalSecurityPolicy: {
    mfaEnforced: { type: Boolean, default: true },
    sessionTimeoutMinutes: { type: Number, default: 60 }
  },
  apiKeys: {
    geolocationProviderKey: { type: String, default: 'GEO_PROV_LIVE_88329' },
    paymentGatewayKey: { type: String, default: 'PAY_GW_SECRET_99104' }
  },
  firebaseAuthSync: {
    autoProvision: { type: Boolean, default: true },
    syncIntervalHours: { type: Number, default: 24 }
  }
});

export interface IHRAdminSettings extends Document {
  tenantId: mongoose.Types.ObjectId;
  holidayCalendar: Array<{ date: string; name: string }>;
  leaveAccrual: { sickLeaveQuota: number; casualLeaveQuota: number };
  payrollDeductions: { taxRatePercent: number; pfDeductionPercent: number };
}

const HRAdminSettingsSchema = new Schema<IHRAdminSettings>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
  holidayCalendar: [{ date: String, name: String }],
  leaveAccrual: {
    sickLeaveQuota: { type: Number, default: 12 },
    casualLeaveQuota: { type: Number, default: 12 }
  },
  payrollDeductions: {
    taxRatePercent: { type: Number, default: 10 },
    pfDeductionPercent: { type: Number, default: 12 }
  }
});

export interface IManagerSettings extends Document {
  userId: mongoose.Types.ObjectId;
  overtimeNotificationsEnabled: boolean;
  autoTaskAssignment: boolean;
  metricLayout: 'KANBAN_FIRST' | 'GANTT_FIRST';
}

const ManagerSettingsSchema = new Schema<IManagerSettings>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  overtimeNotificationsEnabled: { type: Boolean, default: true },
  autoTaskAssignment: { type: Boolean, default: false },
  metricLayout: { type: String, enum: ['KANBAN_FIRST', 'GANTT_FIRST'], default: 'KANBAN_FIRST' }
});

export interface IEmployeeSettings extends Document {
  userId: mongoose.Types.ObjectId;
  emergencyContact: { name: string; phone: string; relation: string };
  themePreference: 'LIGHT' | 'DARK' | 'SYSTEM';
}

const EmployeeSettingsSchema = new Schema<IEmployeeSettings>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  },
  themePreference: { type: String, enum: ['LIGHT', 'DARK', 'SYSTEM'], default: 'SYSTEM' }
});

// Helper for model compilation
function getModel<T>(name: string, schema: Schema<T>): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

export const Tenant = getModel<ITenant>('Tenant', TenantSchema);
export const User = getModel<IUser>('User', UserSchema);
export const UserDocument = getModel<IUserDocument>('UserDocument', UserDocumentSchema);
export const Attendance = getModel<IAttendance>('Attendance', AttendanceSchema);
export const LeaveRequest = getModel<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);
export const Project = getModel<IProject>('Project', ProjectSchema);
export const Task = getModel<ITask>('Task', TaskSchema);
export const Timesheet = getModel<ITimesheet>('Timesheet', TimesheetSchema);
export const Payroll = getModel<IPayroll>('Payroll', PayrollSchema);

export const SuperAdminSettings = getModel<ISuperAdminSettings>('SuperAdminSettings', SuperAdminSettingsSchema);
export const HRAdminSettings = getModel<IHRAdminSettings>('HRAdminSettings', HRAdminSettingsSchema);
export const ManagerSettings = getModel<IManagerSettings>('ManagerSettings', ManagerSettingsSchema);
export const EmployeeSettings = getModel<IEmployeeSettings>('EmployeeSettings', EmployeeSettingsSchema);

// 10. Audit Log
export interface IAuditLog extends Document {
  tenantId?: mongoose.Types.ObjectId;
  actorId: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  args: unknown[];
  result: string;
  durationMs: number;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant' },
  actorId: { type: String, required: true },
  actorEmail: { type: String, required: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true, index: true },
  args: { type: [Schema.Types.Mixed], default: [] },
  result: { type: String, required: true },
  durationMs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true }
});
AuditLogSchema.index({ actorId: 1, createdAt: -1 });

export const AuditLog = getModel<IAuditLog>('AuditLog', AuditLogSchema);
