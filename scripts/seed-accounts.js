/**
 * Seed script: Creates 15 user accounts + salary data in MongoDB.
 * Run: node scripts/seed-accounts.js
 */
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

// Load env
const fs = require("fs");
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

// Resolve SRV
const dns = require("dns").promises;
dns.setServers(["8.8.8.8", "1.1.1.1"]);

async function resolveAndConnect() {
  const uri = process.env.MONGODB_URI;
  const ub = uri.replace("mongodb+srv://", "");
  const ai = ub.indexOf("@");
  const cred = ub.substring(0, ai);
  const after = ub.substring(ai + 1);
  const si = after.indexOf("/");
  const host = after.substring(0, si);
  const dbq = after.substring(si);
  const qi = dbq.indexOf("?");
  const dbp = qi >= 0 ? dbq.substring(0, qi) : dbq;
  const eq = qi >= 0 ? dbq.substring(qi + 1) : "";
  const srvH = "_mongodb._tcp." + host;
  const [srvRecords, txtRecords] = await Promise.all([
    dns.resolveSrv(srvH),
    dns.resolveTxt(host),
  ]);
  const hosts = srvRecords.map((h) => h.name + ":" + h.port).join(",");
  const tp = txtRecords[0] && txtRecords[0][0] ? txtRecords[0][0] : "";
  const m = {};
  if (tp)
    tp.split("&").forEach((p) => {
      const i = p.indexOf("=");
      if (i > 0) m[p.substring(0, i)] = p.substring(i + 1);
    });
  if (eq)
    eq.split("&").forEach((p) => {
      const i = p.indexOf("=");
      if (i > 0) m[p.substring(0, i)] = p.substring(i + 1);
    });
  const pr = Object.keys(m)
    .map((k) => k + "=" + m[k])
    .join("&");
  const direct =
    "mongodb://" + cred + "@" + hosts + "/" + dbp + (pr ? "?" + pr : "");
  const mc = require("mongodb");
  const c = new mc.MongoClient(direct, {
    tls: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 15000,
  });
  await c.connect();
  return c.db("hrms");
}

const ACCOUNTS = [
  {
    email: "ceo@company.com",
    password: "Admin@123",
    displayName: "Ashish Mishra",
    firstName: "Ashish",
    lastName: "Mishra",
    role: "super_admin",
    department: "Executive",
    designation: "CEO",
    employeeCode: "CEO-001",
  },
  {
    email: "hr@company.com",
    password: "Admin@123",
    displayName: "Shivangi Gupta",
    firstName: "Shivangi",
    lastName: "Gupta",
    role: "hr_admin",
    department: "Human Resources",
    designation: "HR Manager",
    employeeCode: "HR-001",
  },
  {
    email: "manager1@company.com",
    password: "Manager@123",
    displayName: "Rajat Khalnayak",
    firstName: "Rajat",
    lastName: "Khalnayak",
    role: "manager",
    department: "Engineering",
    designation: "Engineering Manager",
    employeeCode: "MGR-001",
  },
  {
    email: "manager2@company.com",
    password: "Manager@123",
    displayName: "Priya Sharma",
    firstName: "Priya",
    lastName: "Sharma",
    role: "manager",
    department: "Marketing",
    designation: "Marketing Manager",
    employeeCode: "MGR-002",
  },
  {
    email: "manager3@company.com",
    password: "Manager@123",
    displayName: "Vikram Patel",
    firstName: "Vikram",
    lastName: "Patel",
    role: "manager",
    department: "Finance",
    designation: "Finance Manager",
    employeeCode: "MGR-003",
  },
  {
    email: "emp1@company.com",
    password: "Employee@123",
    displayName: "Ankit Singh",
    firstName: "Ankit",
    lastName: "Singh",
    role: "employee",
    department: "Engineering",
    designation: "Software Developer",
    employeeCode: "EMP-001",
  },
  {
    email: "emp2@company.com",
    password: "Employee@123",
    displayName: "Neha Verma",
    firstName: "Neha",
    lastName: "Verma",
    role: "employee",
    department: "Engineering",
    designation: "Frontend Developer",
    employeeCode: "EMP-002",
  },
  {
    email: "emp3@company.com",
    password: "Employee@123",
    displayName: "Rahul Joshi",
    firstName: "Rahul",
    lastName: "Joshi",
    role: "employee",
    department: "Engineering",
    designation: "Backend Developer",
    employeeCode: "EMP-003",
  },
  {
    email: "emp4@company.com",
    password: "Employee@123",
    displayName: "Sneha Reddy",
    firstName: "Sneha",
    lastName: "Reddy",
    role: "employee",
    department: "Marketing",
    designation: "Content Strategist",
    employeeCode: "EMP-004",
  },
  {
    email: "emp5@company.com",
    password: "Employee@123",
    displayName: "Arjun Mehta",
    firstName: "Arjun",
    lastName: "Mehta",
    role: "employee",
    department: "Marketing",
    designation: "SEO Specialist",
    employeeCode: "EMP-005",
  },
  {
    email: "emp6@company.com",
    password: "Employee@123",
    displayName: "Kavya Nair",
    firstName: "Kavya",
    lastName: "Nair",
    role: "employee",
    department: "Finance",
    designation: "Accountant",
    employeeCode: "EMP-006",
  },
  {
    email: "emp7@company.com",
    password: "Employee@123",
    displayName: "Deepak Gupta",
    firstName: "Deepak",
    lastName: "Gupta",
    role: "employee",
    department: "Finance",
    designation: "Financial Analyst",
    employeeCode: "EMP-007",
  },
  {
    email: "emp8@company.com",
    password: "Employee@123",
    displayName: "Pooja Desai",
    firstName: "Pooja",
    lastName: "Desai",
    role: "employee",
    department: "Human Resources",
    designation: "HR Executive",
    employeeCode: "EMP-008",
  },
  {
    email: "emp9@company.com",
    password: "Employee@123",
    displayName: "Karan Bhatia",
    firstName: "Karan",
    lastName: "Bhatia",
    role: "employee",
    department: "Engineering",
    designation: "DevOps Engineer",
    employeeCode: "EMP-009",
  },
  {
    email: "emp10@company.com",
    password: "Employee@123",
    displayName: "Meera Iyer",
    firstName: "Meera",
    lastName: "Iyer",
    role: "employee",
    department: "Engineering",
    designation: "QA Engineer",
    employeeCode: "EMP-010",
  },
];

const SALARY_COMPONENTS = [
  { name: "Basic Salary", type: "earning", category: "fixed" },
  { name: "HRA", type: "earning", category: "fixed" },
  { name: "Special Allowance", type: "earning", category: "fixed" },
  { name: "PF", type: "deduction", category: "statutory" },
  { name: "ESI", type: "deduction", category: "statutory" },
  { name: "Professional Tax", type: "deduction", category: "statutory" },
];

async function seed() {
  console.log("Connecting to MongoDB...");
  const db = await resolveAndConnect();
  console.log("Connected!\n");

  const now = new Date();

  // Clear existing data
  await db.collection("users").deleteMany({});
  await db.collection("sessions").deleteMany({});
  await db.collection("pay_groups").deleteMany({});
  await db.collection("salary_components").deleteMany({});
  await db.collection("employee_salaries").deleteMany({});
  await db.collection("leave_requests").deleteMany({});
  await db.collection("hrm_tasks").deleteMany({});
  console.log("Cleared old data.\n");

  // Create pay group
  const pgResult = await db.collection("pay_groups").insertOne({
    name: "Default Pay Group",
    description: "Standard monthly pay group",
    frequency: "monthly",
    status: "active",
    tenantId: "default",
    createdAt: now,
    updatedAt: now,
  });
  const pgId = pgResult.insertedId.toString();
  console.log("Created pay group:", pgId);

  // Create salary components
  const compDocs = SALARY_COMPONENTS.map((c, i) => ({
    ...c,
    sortOrder: i + 1,
    fixedAmount: 0,
    status: "active",
    tenantId: "default",
    createdAt: now,
    updatedAt: now,
  }));
  await db.collection("salary_components").insertMany(compDocs);
  console.log("Created", compDocs.length, "salary components");

  // Create users
  const salaryRanges = {
    super_admin: { basic: 50000, hra: 20000, special: 10000, pf: 1800, esi: 550, pt: 200 },
    hr_admin: { basic: 35000, hra: 14000, special: 6000, pf: 1800, esi: 550, pt: 200 },
    manager: { basic: 40000, hra: 16000, special: 7000, pf: 1800, esi: 550, pt: 200 },
    employee: { basic: 25000, hra: 10000, special: 5000, pf: 1800, esi: 550, pt: 200 },
  };

  let empCount = 0;
  for (const acct of ACCOUNTS) {
    const passwordHash = await bcrypt.hash(acct.password, 12);
    const result = await db.collection("users").insertOne({
      email: acct.email,
      emailVerified: true,
      displayName: acct.displayName,
      firstName: acct.firstName,
      lastName: acct.lastName,
      role: acct.role,
      status: "active",
      loginStatus: "enabled",
      department: acct.department,
      designation: acct.designation,
      employeeCode: acct.employeeCode,
      passwordHash,
      tenantId: "default",
      phone: "",
      createdAt: now,
      updatedAt: now,
    });
    const userId = result.insertedId.toString();
    console.log(`  Created ${acct.role}: ${acct.email} (${userId})`);

    // Skip CEO from employee count and salary
    if (acct.role === "super_admin") continue;
    empCount++;

    // Create salary for non-CEO users
    const range = salaryRanges[acct.role] || salaryRanges.employee;
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
      userId,
      payGroupId: pgId,
      components,
      grossSalary: gross,
      totalCtc: gross,
      totalDeductions: deductions,
      netSalary: gross - deductions,
      status: "active",
      effectiveFrom: now,
      tenantId: "default",
      createdAt: now,
      updatedAt: now,
    });
  }

  console.log(`\nDone! Created ${ACCOUNTS.length} users (${empCount} employees, 1 CEO).`);
  console.log("\nLogin Credentials:");
  console.log("═══════════════════════════════════════════════════════");
  console.log("CEO:      ceo@company.com       / Admin@123");
  console.log("HR:       hr@company.com        / Admin@123");
  console.log("Manager:  manager1@company.com  / Manager@123");
  console.log("Manager:  manager2@company.com  / Manager@123");
  console.log("Manager:  manager3@company.com  / Manager@123");
  console.log("Employee: emp1@company.com     / Employee@123");
  console.log("Employee: emp2@company.com     / Employee@123");
  console.log("Employee: emp3-emp10@company.com / Employee@123");
  console.log("═══════════════════════════════════════════════════════");

  process.exit(0);
}

seed().catch((e) => {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
