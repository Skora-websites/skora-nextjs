/**
 * Test/dev DB seed: creates demo accounts + all accounts expected by the
 * vitest integration suite, with correct roles, in the DB pointed to by
 * MONGODB_URI (default: mongodb://localhost:27017/skora_test).
 *
 * Run: node scripts/seed-test-db.js
 */
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const fs = require("fs");

// Load env files (no dependency on dotenv)
[".env.local", ".env"].forEach((f) => {
  try {
    const lines = fs.readFileSync(f, "utf-8").split("\n");
    lines.forEach((l) => {
      l = l.trim();
      if (l && !l.startsWith("#") && l.includes("=")) {
        const eq = l.indexOf("=");
        const k = l.substring(0, eq).trim();
        const v = l.substring(eq + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    });
  } catch {}
});

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017/skora_test";
const DB_NAME = process.env.MONGODB_DB || "skora_test";

// ── Accounts ───────────────────────────────────────────
// role, email, password, displayName, employeeCode

const DEMO = [
  ["super_admin", "ceo@company.com", "Admin@123", "Ashish Mishra", "CEO-001", "Executive", "CEO"],
  ["hr_admin", "hr@company.com", "Admin@123", "Shivangi Gupta", "HR-001", "Human Resources", "HR Manager"],
  ["manager", "manager1@company.com", "Manager@123", "Rajat Khalnayak", "MGR-001", "Engineering", "Engineering Manager"],
  ["manager", "manager2@company.com", "Manager@123", "Priya Sharma", "MGR-002", "Marketing", "Marketing Manager"],
  ["manager", "manager3@company.com", "Manager@123", "Vikram Patel", "MGR-003", "Finance", "Finance Manager"],
  ["employee", "emp1@company.com", "Employee@123", "Ankit Singh", "EMP-001", "Engineering", "Software Developer"],
  ["employee", "emp2@company.com", "Employee@123", "Neha Verma", "EMP-002", "Engineering", "Frontend Developer"],
  ["employee", "emp3@company.com", "Employee@123", "Rahul Joshi", "EMP-003", "Engineering", "Backend Developer"],
];

// Accounts expected by __tests__/*.test.ts
const TEST_ACCOUNTS = [
  ["super_admin", "superadmin-api-test@company.com", "SuperAdmin@123", "SA API Tester", "SA-T-001"],
  ["hr_admin", "hr-admin-api-test@company.com", "HRAdmin@123", "HR API Tester", "HR-T-001"],
  ["manager", "manager-api-test@company.com", "Manager@123", "MGR API Tester", "MGR-T-001"],
  ["hr_admin", "hr-admin-att-stats@company.com", "HRAdmin@123", "Attendance Stats HR", "HR-T-002"],
  ["hr_admin", "hr-admin-aux-test@company.com", "HRAdmin@123", "AUX Test HR Admin", "HR-T-003"],
  ["hr_admin", "hr-admin-aux-trans@company.com", "HRAdmin@123", "AUX Transition HR", "HR-T-004"],
  ["hr_admin", "hr-admin-payroll-test@company.com", "HRAdmin@123", "Payroll Test HR Admin", "HR-T-005"],
  ["hr_admin", "hr-admin-project-test@company.com", "HRAdmin@123", "Project Test HR Admin", "HR-T-006"],
  ["manager", "manager-project-test@company.com", "Manager@123", "Project Test Manager", "MGR-T-002"],
  ["hr_admin", "hr-admin-ticket-test@company.com", "HRAdmin@123", "Ticket Test HR Admin", "HR-T-007"],
  ["super_admin", "superadmin-ticket-test@company.com", "SuperAdmin@123", "Ticket Test SA", "SA-T-002"],
  ["hr_admin", "hr-admin-early-dep@company.com", "HRAdmin@123", "Early Departure HR", "HR-T-008"],
  ["hr_admin", "hr-admin-leave-test@company.com", "HRAdmin@123", "Leave Test HR Admin", "HR-T-009"],
  ["manager", "manager-leave-test@company.com", "Manager@123", "Leave Test Manager", "MGR-T-003"],
  ["hr_admin", "hr-admin-office-rules@company.com", "HRAdmin@123", "Office Rules HR Admin", "HR-T-010"],
  ["hr_admin", "hr-admin-onboard-test@company.com", "HRAdmin@123", "Onboard Test HR Admin", "HR-T-011"],
  ["super_admin", "superadmin-onboard-test@company.com", "SuperAdmin@123", "Onboard Test SA", "SA-T-003"],
];

// Salary component templates (mirrors scripts/seed-accounts.js)
const SALARY_RANGES = {
  super_admin: { basic: 50000, hra: 20000, special: 10000, pf: 1800, esi: 550, pt: 200 },
  hr_admin: { basic: 35000, hra: 14000, special: 6000, pf: 1800, esi: 550, pt: 200 },
  manager: { basic: 40000, hra: 16000, special: 7000, pf: 1800, esi: 550, pt: 200 },
  employee: { basic: 25000, hra: 10000, special: 5000, pf: 1800, esi: 550, pt: 200 },
};

async function main() {
  const client = new MongoClient(URI, { serverSelectionTimeoutMS: 8000 });
  await client.connect();
  const db = client.db(DB_NAME);
  console.log(`Connected: ${URI} (db=${DB_NAME})`);

  const wipe = [
    "users", "sessions", "pay_groups", "salary_components", "employee_salaries",
    "leave_requests", "leave_balances", "hrm_tasks", "employee_attendance",
    "payroll_runs", "payroll_transactions", "projects", "project_tasks",
    "tickets", "notifications", "onboarding", "audit_logs", "settings",
  ];
  for (const c of wipe) await db.collection(c).deleteMany({});
  console.log(`Wiped ${wipe.length} collections.`);

  const now = new Date();

  // Pay group + components (needed by payroll flow)
  const pg = await db.collection("pay_groups").insertOne({
    name: "Default Pay Group", description: "Standard monthly pay group",
    frequency: "monthly", status: "active", tenantId: "default",
    createdAt: now, updatedAt: now,
  });
  const payGroupId = pg.insertedId.toString();

  const comps = [
    { name: "Basic Salary", type: "earning", category: "fixed" },
    { name: "HRA", type: "earning", category: "fixed" },
    { name: "Special Allowance", type: "earning", category: "fixed" },
    { name: "PF", type: "deduction", category: "statutory" },
    { name: "ESI", type: "deduction", category: "statutory" },
    { name: "Professional Tax", type: "deduction", category: "statutory" },
  ].map((c, i) => ({
    ...c, sortOrder: i + 1, fixedAmount: 0, status: "active",
    tenantId: "default", createdAt: now, updatedAt: now,
  }));
  await db.collection("salary_components").insertMany(comps);

  async function addUser([role, email, password, displayName, employeeCode, department, designation]) {
    const passwordHash = await bcrypt.hash(password, 12);
    const res = await db.collection("users").insertOne({
      email, emailVerified: true, displayName,
      firstName: displayName.split(" ")[0], lastName: displayName.split(" ").slice(1).join(" "),
      role, status: "active", loginStatus: "enabled",
      department: department || "", designation: designation || "",
      employeeCode, passwordHash, tenantId: "default", phone: "",
      createdAt: now, updatedAt: now,
    });
    const userId = res.insertedId.toString();

    const range = SALARY_RANGES[role] || SALARY_RANGES.employee;
    const components = [
      { name: "Basic Salary", type: "earning", amount: range.basic },
      { name: "HRA", type: "earning", amount: range.hra },
      { name: "Special Allowance", type: "earning", amount: range.special },
      { name: "PF", type: "deduction", amount: range.pf },
      { name: "ESI", type: "deduction", amount: range.esi },
      { name: "Professional Tax", type: "deduction", amount: range.pt },
    ];
    const gross = range.basic + range.hra + range.special;
    const deductions = range.pf + range.esi + range.pt;
    await db.collection("employee_salaries").insertOne({
      userId, payGroupId, components, grossSalary: gross, totalCtc: gross,
      totalDeductions: deductions, netSalary: gross - deductions,
      status: "active", effectiveFrom: now, tenantId: "default",
      createdAt: now, updatedAt: now,
    });
    console.log(`  ${role.padEnd(12)} ${email}`);
    return userId;
  }

  console.log("\nDemo accounts:");
  for (const a of DEMO) await addUser(a);
  console.log("\nTest-suite accounts:");
  for (const a of TEST_ACCOUNTS) await addUser(a);

  // Useful indexes
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ token: 1 }, { unique: true });
  await db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });

  console.log("\nDone.");
  await client.close();
  process.exit(0);
}

main().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
