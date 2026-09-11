#!/usr/bin/env node
/**
 * cleanup-for-production.js
 *
 * Prepares the HRMS database for go-live by wiping transient/test data while
 * PRESERVING leadership accounts (CEO / Super Admin + HR Admins).
 *
 * Dry-run first: by default this script only PRINTS what it would do.
 * Pass --apply to actually delete.
 *
 * Usage:
 *   node scripts/cleanup-for-production.js            # dry run (no changes)
 *   node scripts/cleanup-for-production.js --apply    # actually delete
 *   MONGODB_URI=... node scripts/cleanup-for-production.js --apply
 */

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

const APPLY = process.argv.includes("--apply");
const DB_NAME = process.env.MONGODB_DB || "hrms";

function loadUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const raw = fs.readFileSync(envPath, "utf8");
    const m = raw.match(/^MONGODB_URI=(.+)$/m);
    if (m) return m[1].trim();
  }
  return "";
}

// Accounts that must survive the wipe.
const PRESERVED_EMAILS = new Set(
  (process.env.PRESERVE_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

const DEFAULT_PRESERVED_ROLES = ["super_admin", "hr_admin", "admin"];

// Collections that are transient by nature — safe to clear entirely.
const TRANSIENT_COLLECTIONS = [
  "sessions",
  "password_resets",
  "notifications",
];

// Collections holding per-user records — cleared only for non-preserved users.
const PER_USER_COLLECTIONS = [
  "attendance",
  "employee_onboarding_tasks",
  "onboarding",
  "leaves",
  "leave_requests",
  "leave_balances",
  "timesheets",
  "payroll",
  "payroll_runs",
  "payslips",
  "tickets",
  "tasks",
  "timesheet_entries",
  "regularization_requests",
  "performance_reviews",
  "posts",
  "comments",
  "assets",
  "asset_assignments",
  "offerLetters",
];

(async () => {
  const uri = loadUri();
  if (!uri) {
    console.error("✖ No MongoDB URI found. Set MONGODB_URI env var or add MONGODB_URI to .env");
    process.exit(1);
  }

  console.log("=== HRMS Production Cleanup ===");
  console.log(`Mode: ${APPLY ? "🔥 APPLY (will delete data)" : "DRY RUN (no changes)"}\n`);
  if (!APPLY) {
    console.log("This is a dry run. Re-run with --apply to perform the deletion.\n");
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 15000,
    tls: true,
  });

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // ── Step 1: resolve preserved users ──
    const roleFilter = { role: { $in: DEFAULT_PRESERVED_ROLES } };
    const roleUsers = await db.collection("users").find(roleFilter).toArray();
    const emailUsers = PRESERVED_EMAILS.size
      ? await db
          .collection("users")
          .find({ email: { $in: [...PRESERVED_EMAILS] } })
          .toArray()
      : [];

    const preserved = new Map();
    for (const u of [...roleUsers, ...emailUsers]) {
      preserved.set(u._id.toString(), u);
    }

    console.log(`Step 1: Preserved accounts (roles: ${DEFAULT_PRESERVED_ROLES.join(", ")}${PRESERVED_EMAILS.size ? ` + ${PRESERVED_EMAILS.size} from PRESERVE_EMAILS` : ""}):`);
    for (const u of preserved.values()) {
      console.log(`   ✓ ${u.email} [role=${u.role}]`);
    }
    if (preserved.size === 0) {
      console.log("   ⚠ No preserved accounts found! Refusing to continue without leadership accounts.");
      process.exit(1);
    }

    const preservedIds = [...preserved.keys()];
    const allUsers = await db.collection("users").find({}).project({ _id: 1, email: 1, role: 1 }).toArray();
    const removableUsers = allUsers.filter((u) => !preserved.has(u._id.toString()));
    console.log(`\nStep 2: Users to REMOVE: ${removableUsers.length} of ${allUsers.length}`);
    for (const u of removableUsers.slice(0, 50)) {
      console.log(`   - ${u.email} [role=${u.role || "?"}]`);
    }
    if (removableUsers.length > 50) console.log(`   ... and ${removableUsers.length - 50} more`);

    const removableIds = removableUsers.map((u) => u._id);
    const removableEmails = removableUsers.map((u) => u.email).filter(Boolean);

    // ── Step 3: per-user record cleanup plan ──
    console.log(`\nStep 3: Per-user record cleanup (${PER_USER_COLLECTIONS.length} collections):`);
    const perUserPlan = [];
    for (const collName of PER_USER_COLLECTIONS) {
      try {
        const coll = db.collection(collName);
        const count = await coll.countDocuments();
        if (count === 0) continue;
        // Delete everything EXCEPT records whose userId is preserved.
        const safeFilter = { userId: { $nin: preservedIds } };
        const willDelete = await coll.countDocuments(safeFilter);
        if (willDelete === 0) continue;
        perUserPlan.push({ collName, count, willDelete, filter: safeFilter });
        console.log(`   ${collName}: ${willDelete} of ${count} docs will be deleted`);
      } catch {
        // collection may not exist — skip
      }
    }

    // ── Step 4: transient collections (cleared fully) ──
    console.log("\nStep 4: Transient collections (full clear):");
    const transientPlan = [];
    for (const collName of TRANSIENT_COLLECTIONS) {
      try {
        const count = await db.collection(collName).countDocuments();
        if (count > 0) {
          transientPlan.push(collName);
          console.log(`   ${collName}: ${count} docs will be deleted`);
        }
      } catch {
        // skip
      }
    }

    if (!APPLY) {
      console.log("\n✅ Dry run complete. No changes were made.");
      console.log("   Review the plan above, then run with --apply to execute.");
      process.exit(0);
    }

    // ── APPLY ──
    console.log("\n🔥 APPLYING…");

    for (const { collName, filter } of perUserPlan) {
      const res = await db.collection(collName).deleteMany(filter);
      console.log(`   deleted ${res.deletedCount} from ${collName}`);
    }

    for (const collName of transientPlan) {
      const res = await db.collection(collName).deleteMany({});
      console.log(`   cleared ${res.deletedCount} from ${collName}`);
    }

    // Delete non-preserved users last (after their records are gone).
    let deletedUsers = 0;
    for (const id of removableIds) {
      const res = await db.collection("users").deleteOne({ _id: id });
      deletedUsers += res.deletedCount;
    }
    console.log(`   deleted ${deletedUsers} user accounts`);

    // Remove their auth sessions references already cleared; scrub stray emails.
    if (removableEmails.length) {
      const orphanRes = await db
        .collection("attendance")
        .deleteMany({ userEmail: { $in: removableEmails } });
      console.log(`   deleted ${orphanRes.deletedCount} attendance docs by email match`);
    }

    console.log("\n✅ Cleanup complete. Leadership accounts (CEO/HR) are preserved.");
    console.log("   Next: have employees re-register, or seed accounts via scripts/seed-accounts.js");
  } catch (err) {
    console.error("✖ Cleanup failed:", err.message);
    process.exit(1);
  } finally {
    await client.close().catch(() => {});
  }
})();
