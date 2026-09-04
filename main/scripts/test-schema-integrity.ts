// Self-check for the HRMS schema integrity fixes. Run with:
//   MONGODB_URI=mongodb://127.0.0.1:27017/skora_hrms_test npx tsx scripts/test-schema-integrity.ts
// Connects to a real Mongo instance (same URI as lib/db/db.ts) and exercises
// the unique indexes / validators / fields that this audit changed:
//   H1: User.email uniqueness is per-tenant (compound partial unique)
//   H2: Attendance unique (userId, date) — no two punch-ins for the same day
//   H3: LeaveRequest partial unique (userId, startDate, endDate) for open leaves
//   H4: Task compound (projectId, assigneeId) index exists
//   H6: Payroll.paidAt is persisted
//   M2: UserDocument.fileUrl rejects non-storage-path values
//   M8: Timesheet has no `isLocked` field; lock state is `status`
//   L2: Project.clientBudget rejects negative
// No test framework; uses node:assert only.
//
// ponytail: real Mongo only. No mock — these tests prove the DB enforces the
// invariants. Skip with: `SKIP_INTEGRITY=1 npx tsx scripts/test-schema-integrity.ts`.
//
// H1 migration helper: `MIGRATE_H1=1 npx tsx scripts/test-schema-integrity.ts`
// drops the legacy `email_1` global unique index on the users collection
// before the new compound partial unique is built by `syncIndexes()`. Run
// this once after deploying the new model on existing data. Re-runs are
// safe — `dropIndex` is a no-op if the index is already gone.

import assert from "node:assert/strict";
import crypto from "node:crypto";
import mongoose, { Schema } from "mongoose";

// Inlined scrypt hash so the test runs under plain `tsx` (no Next bundler).
// ponytail: keep in sync with lib/security.ts hashPassword; lift to a shared
// module if/when a non-server-only utility file exists.
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password.normalize("NFKC"), salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$16384$8$1$${salt.toString("base64")}$${hash.toString("base64")}`;
}

if (process.env.SKIP_INTEGRITY === "1") {
  console.log("[skip] SKIP_INTEGRITY=1");
  process.exit(0);
}

const URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/skora_hrms_test";
const DB_NAME = URI.split("/").pop() || "skora_hrms_test";

// We import the real models so the same schemas (with all our new indexes) are tested.
import {
  User,
  Attendance,
  LeaveRequest,
  Project,
  Task,
  Payroll,
  Timesheet,
  UserDocument,
  Tenant,
} from "../lib/db/models";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => Promise<void> | void) {
  return Promise.resolve()
    .then(fn)
    .then(() => { console.log(`  ok  ${name}`); passed++; })
    .catch((e) => { console.log(`  FAIL ${name}\n       ${(e as Error).message}`); failed++; });
}

async function dropAll() {
  // Each test uses an isolated DB to avoid cross-contamination.
  await mongoose.connection.dropDatabase();
}

const MODELS = [User, Attendance, LeaveRequest, Project, Task, Payroll, Timesheet, UserDocument, Tenant];
async function syncAll() {
  for (const m of MODELS) {
    // init() creates the collection metadata (incl. indexes) in the
    // freshly-dropped DB. syncIndexes() ensures declared indexes exist.
    await m.init();
    await m.syncIndexes();
  }
}

async function makeTenantAndUser(suffix: string, opts: { tenantId?: mongoose.Types.ObjectId | null; role?: "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE" } = {}) {
  let tid = opts.tenantId ?? null;
  if (tid === null) {
    const t = await Tenant.create({ name: `T-${suffix}`, domain: `t-${suffix}.test` });
    tid = t._id as mongoose.Types.ObjectId;
  }
  const u = await User.create({
    tenantId: tid,
    name: `U-${suffix}`,
    email: `u-${suffix}@test.local`,
    password: hashPassword("pw-" + suffix),
    role: (opts.role ?? "EMPLOYEE") as any,
    onboardingStatus: "VERIFIED",
    baseSalary: 1000,
  });
  return { tenantId: tid, user: u as any };
}

async function migrateH1() {
  console.log("[migrate] dropping legacy users.email_1 unique index if present");
  try {
    await User.collection.dropIndex("email_1");
    console.log("  ok  dropped users.email_1");
  } catch (e) {
    if (e instanceof Error && /index not found|IndexNotFound/i.test(e.message)) {
      console.log("  ok  users.email_1 not present (nothing to do)");
    } else {
      throw e;
    }
  }
}

async function main() {
  await mongoose.connect(URI, { dbName: DB_NAME, serverSelectionTimeoutMS: 5000 });

  if (process.env.MIGRATE_H1 === "1") {
    await migrateH1();
    await mongoose.disconnect();
    process.exit(0);
  }

  // Make sure index builds finish so we exercise them, not the planner.
  await syncAll();

  // ── H1 ───────────────────────────────────────────────────────────
  console.log("H1: User.email uniqueness is per-tenant");
  await dropAll();
  await syncAll();
  await test("same email in different tenants is allowed", async () => {
    const a = await makeTenantAndUser("a1");
    // First insert of shared@x.test in T-a1: should succeed.
    await User.create({
      tenantId: a.tenantId,
      name: "X",
      email: "shared@x.test",
      password: hashPassword("x"),
      role: "EMPLOYEE",
      onboardingStatus: "VERIFIED",
    });
    // Second insert of same email in same tenant: should reject.
    await assert.rejects(
      User.create({
        tenantId: a.tenantId,
        name: "Y",
        email: "shared@x.test",
        password: hashPassword("y"),
        role: "EMPLOYEE",
        onboardingStatus: "VERIFIED",
      }),
      /duplicate key|unique/i
    );
    // Different tenant with same email: allowed.
    const t2 = await Tenant.create({ name: "T2", domain: "t2.test" });
    await User.create({
      tenantId: t2._id,
      name: "Z",
      email: "shared@x.test",
      password: hashPassword("z"),
      role: "EMPLOYEE",
      onboardingStatus: "VERIFIED",
    });
  });

  // ── H2 ───────────────────────────────────────────────────────────
  console.log("H2: Attendance unique (userId, date)");
  await dropAll();
  await syncAll();
  await test("two punch-ins same day blocked", async () => {
    const { user, tenantId } = await makeTenantAndUser("h2");
    await Attendance.create({
      userId: user._id, tenantId, date: "2026-01-15", escalationTargetRole: "MANAGER", status: "PRESENT",
    });
    await assert.rejects(
      Attendance.create({
        userId: user._id, tenantId, date: "2026-01-15", escalationTargetRole: "MANAGER", status: "PRESENT",
      }),
      /duplicate key|unique/i
    );
  });
  await test("different dates allowed", async () => {
    const { user, tenantId } = await makeTenantAndUser("h2b");
    await Attendance.create({ userId: user._id, tenantId, date: "2026-02-01", escalationTargetRole: "MANAGER" });
    await Attendance.create({ userId: user._id, tenantId, date: "2026-02-02", escalationTargetRole: "MANAGER" });
  });
  await test("invalid date format rejected", async () => {
    const { user, tenantId } = await makeTenantAndUser("h2c");
    await assert.rejects(
      Attendance.create({ userId: user._id, tenantId, date: "not-a-date", escalationTargetRole: "MANAGER" }),
      /validation|pattern|match/i
    );
  });
  await test("escalationTargetRole default = MANAGER", async () => {
    const { user, tenantId } = await makeTenantAndUser("h2d");
    const a = await Attendance.create({ userId: user._id, tenantId, date: "2026-03-01" });
    assert.equal(a.escalationTargetRole, "MANAGER");
  });

  // ── H3 ───────────────────────────────────────────────────────────
  console.log("H3: LeaveRequest partial unique on open leaves");
  await dropAll();
  await syncAll();
  await test("two PENDING leaves same window blocked", async () => {
    const { user, tenantId } = await makeTenantAndUser("h3");
    await LeaveRequest.create({
      userId: user._id, tenantId, leaveType: "CASUAL",
      startDate: "2026-04-01", endDate: "2026-04-03",
      reason: "vacation", approverRole: "MANAGER", status: "PENDING",
    });
    // Same (userId, startDate, endDate) → must reject via partial unique.
    await assert.rejects(
      LeaveRequest.create({
        userId: user._id, tenantId, leaveType: "SICK",
        startDate: "2026-04-01", endDate: "2026-04-03",
        reason: "flu", approverRole: "MANAGER", status: "PENDING",
      }),
      /duplicate key|unique/i
    );
  });
  await test("REJECTED leave does not block re-apply", async () => {
    const { user, tenantId } = await makeTenantAndUser("h3b");
    await LeaveRequest.create({
      userId: user._id, tenantId, leaveType: "CASUAL",
      startDate: "2026-05-01", endDate: "2026-05-02",
      reason: "x", approverRole: "MANAGER", status: "REJECTED",
    });
    // Same window as REJECTED: allowed.
    const r = await LeaveRequest.create({
      userId: user._id, tenantId, leaveType: "CASUAL",
      startDate: "2026-05-01", endDate: "2026-05-02",
      reason: "retry", approverRole: "MANAGER", status: "PENDING",
    });
    assert.equal(r.status, "PENDING");
  });

  // ── H4 ───────────────────────────────────────────────────────────
  console.log("H4: Task compound index exists");
  await dropAll();
  await syncAll();
  await test("Task has projectId+assigneeId index", async () => {
    const idx = await Task.collection.indexes();
    const ok = idx.some((i: any) => i.key && i.key.projectId === 1 && i.key.assigneeId === 1);
    assert.ok(ok, "missing Task(projectId, assigneeId) index");
  });

  // ── H6 ───────────────────────────────────────────────────────────
  console.log("H6: Payroll.paidAt persisted");
  await dropAll();
  await syncAll();
  await test("paidAt round-trips", async () => {
    const { user, tenantId } = await makeTenantAndUser("h6");
    const p = await Payroll.create({
      tenantId, userId: user._id, month: 1, year: 2026,
      baseSalary: 1000, netSalary: 1000, status: "PROCESSED",
    });
    p.status = "PAID";
    p.paidAt = new Date();
    await p.save();
    const fresh = await Payroll.findById(p._id).lean();
    assert.equal(fresh?.status, "PAID");
    assert.ok(fresh?.paidAt instanceof Date, "paidAt should be a Date");
  });

  // ── M2 ───────────────────────────────────────────────────────────
  console.log("M2: UserDocument.fileUrl validator");
  await dropAll();
  await syncAll();
  await test("rejects non-storage-path fileUrl", async () => {
    const { user, tenantId } = await makeTenantAndUser("m2");
    await assert.rejects(
      UserDocument.create({
        userId: user._id, tenantId, docType: "AADHAAR",
        fileUrl: "https://example.com/foo.pdf",
      }),
      /tenants\//i
    );
  });
  await test("accepts server-issued path", async () => {
    const { user, tenantId } = await makeTenantAndUser("m2b");
    const t = String(tenantId);
    await UserDocument.create({
      userId: user._id, tenantId, docType: "AADHAAR",
      fileUrl: `tenants/${t}/onboarding/${user._id}/x.pdf`,
    });
  });

  // ── M8 ───────────────────────────────────────────────────────────
  console.log("M8: Timesheet.isLocked removed; status is source of truth");
  await dropAll();
  await syncAll();
  await test("Timesheet has no isLocked field in schema", async () => {
    const paths = Timesheet.schema.paths as Record<string, any>;
    assert.equal(paths.isLocked, undefined, "isLocked path should be gone");
  });
  await test("lockByManager updates status only", async () => {
    const { user, tenantId } = await makeTenantAndUser("m8");
    const ts = await Timesheet.create({
      userId: user._id, projectId: new mongoose.Types.ObjectId(),
      taskId: new mongoose.Types.ObjectId(), tenantId,
      date: "2026-06-01", hours: 1, status: "SUBMITTED",
    });
    const r = await Timesheet.updateOne(
      { _id: ts._id },
      { status: "LOCKED_BY_MANAGER" }
    );
    assert.equal(r.modifiedCount, 1);
    const fresh = await Timesheet.findById(ts._id).lean() as any;
    assert.equal(fresh.status, "LOCKED_BY_MANAGER");
    assert.equal(fresh.isLocked, undefined);
  });

  // ── L2 ───────────────────────────────────────────────────────────
  console.log("L2: Project.clientBudget min:0");
  await dropAll();
  await syncAll();
  await test("negative budget rejected", async () => {
    const { tenantId } = await makeTenantAndUser("l2");
    await assert.rejects(
      Project.create({
        tenantId, name: "p", clientBudget: -1,
        managerId: new mongoose.Types.ObjectId(), status: "ACTIVE",
      }),
      /validation|min/i
    );
  });
  await test("zero budget accepted", async () => {
    const { tenantId } = await makeTenantAndUser("l2b");
    const p = await Project.create({
      tenantId, name: "p", clientBudget: 0,
      managerId: new mongoose.Types.ObjectId(), status: "ACTIVE",
    });
    assert.equal(p.clientBudget, 0);
  });

  // ── Summary ─────────────────────────────────────────────────────
  console.log(`\n${passed} passed, ${failed} failed`);
  await mongoose.disconnect();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
