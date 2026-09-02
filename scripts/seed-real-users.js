/**
 * Seed script for the current Skora HRMS team directory.
 *
 * WARNING: This DELETES ALL existing users before recreating them.
 * Run only once during initial setup or after an intentional database reset.
 *
 * Usage: node scripts/seed-real-users.js --force
 */

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const dns = require("dns").promises;

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

async function resolveSRV(srvUri) {
  if (!srvUri.startsWith("mongodb+srv://")) return srvUri;
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    const body = srvUri.replace("mongodb+srv://", "");
    const ai = body.indexOf("@");
    const cred = ai >= 0 ? body.substring(0, ai) : "";
    const after = ai >= 0 ? body.substring(ai + 1) : body;
    const si = after.indexOf("/");
    const host = si >= 0 ? after.substring(0, si) : after;
    const rest = si >= 0 ? after.substring(si) : "/";
    const qi = rest.indexOf("?");
    const dbPath = qi >= 0 ? rest.substring(0, qi) : rest;
    const query = qi >= 0 ? rest.substring(qi + 1) : "";
    const srvH = "_mongodb._tcp." + host;
    const [srvRecs, txtRecs] = await Promise.all([
      dns.resolveSrv(srvH).catch(() => []),
      dns.resolveTxt(host).catch(() => []),
    ]);
    if (srvRecs.length === 0) return srvUri;
    const hosts = srvRecs.map(r => r.name + ":" + r.port).join(",");
    const txt = txtRecs[0] && txtRecs[0][0] ? txtRecs[0][0] : "";
    const params = new Map();
    if (txt) txt.split("&").forEach(p => { const i = p.indexOf("="); if (i > 0) params.set(p.substring(0, i), p.substring(i + 1)); });
    if (query) query.split("&").forEach(p => { const i = p.indexOf("="); if (i > 0) params.set(p.substring(0, i), p.substring(i + 1)); else if (p) params.set(p, ""); });
    const pr = Array.from(params.entries()).map(e => e[0] + "=" + e[1]).join("&");
    return "mongodb://" + cred + "@" + hosts + "/" + dbPath + (pr ? "?" + pr : "");
  } catch {
    return srvUri;
  }
}

async function resolveAndConnect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found in .env");
    process.exit(1);
  }
  const resolvedUri = await resolveSRV(uri);
  const c = new MongoClient(resolvedUri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    tls: true,
    retryWrites: true,
    w: "majority",
  });
  await c.connect();
  const dbMatch = uri.match(/\/([^/?]+)(\?|$)/);
  const dbName = dbMatch ? dbMatch[1] : "hrms";
  return c.db(dbName);
}

const USERS = [
  {
    email: "skorainfotech@gmail.com",
    displayName: "Vishal Srivastava",
    firstName: "Vishal",
    lastName: "Srivastava",
    role: "super_admin",
    department: "Executive",
    designation: "CEO",
    employeeCode: "CEO-001",
  },
  {
    email: "hr@skorainfotech.com",
    displayName: "Vishal Srivastava",
    firstName: "Vishal",
    lastName: "Srivastava",
    role: "hr_admin",
    department: "Human Resources",
    designation: "HR Manager",
    employeeCode: "HR-001",
  },
  {
    email: "rajat.stf007@gmail.com",
    displayName: "Rajat Kashyap",
    firstName: "Rajat",
    lastName: "Kashyap",
    role: "manager",
    department: "Development",
    designation: "Development Manager",
    employeeCode: "MGR-DEV-001",
  },
  {
    email: "vipul.skorasoft@gmail.com",
    displayName: "Vipul Singh",
    firstName: "Vipul",
    lastName: "Singh",
    role: "manager",
    department: "Sales",
    designation: "Sales Manager",
    employeeCode: "MGR-SLS-001",
  },
  {
    email: "sg.shivangi@outlook.com",
    displayName: "Shivangi Gupta",
    firstName: "Shivangi",
    lastName: "Gupta",
    role: "manager",
    department: "Marketing",
    designation: "Marketing Manager",
    employeeCode: "MGR-MKT-001",
  },
  {
    email: "chaudharygoldy08@gmail.com",
    displayName: "Goldy Chaudhary",
    firstName: "Goldy",
    lastName: "Chaudhary",
    role: "employee",
    department: "Marketing",
    designation: "Marketing Executive",
    employeeCode: "EMP-MKT-001",
  },
  {
    email: "maazhasan024@gmail.com",
    displayName: "Maaz Hasan",
    firstName: "Maaz",
    lastName: "Hasan",
    role: "employee",
    department: "Marketing",
    designation: "Marketing Executive",
    employeeCode: "EMP-MKT-002",
  },
  {
    email: "sapnadelhi2004@gmail.com",
    displayName: "Sapna",
    firstName: "Sapna",
    lastName: "",
    role: "employee",
    department: "Marketing",
    designation: "Marketing Executive",
    employeeCode: "EMP-MKT-003",
  },
  {
    email: "sk01506967961@gmail.com",
    displayName: "Sachin",
    firstName: "Sachin",
    lastName: "",
    role: "employee",
    department: "Marketing",
    designation: "Marketing Executive",
    employeeCode: "EMP-MKT-004",
  },
  {
    email: "simarkaurwork15@gmail.com",
    displayName: "Simar Kaur",
    firstName: "Simar",
    lastName: "Kaur",
    role: "employee",
    department: "Marketing",
    designation: "Social Media Designer",
    employeeCode: "EMP-MKT-005",
  },
  {
    email: "ashish17427@gmail.com",
    displayName: "Ashish Mishra",
    firstName: "Ashish",
    lastName: "Mishra",
    role: "employee",
    department: "Development",
    designation: "Web Developer",
    employeeCode: "EMP-DEV-001",
  },
  {
    email: "spallavivatsa@gmail.com",
    displayName: "Shubha Pallavi",
    firstName: "Shubha",
    lastName: "Pallavi",
    role: "employee",
    department: "Development",
    designation: "Web Developer",
    employeeCode: "EMP-DEV-002",
  },
  {
    email: "abhishek.skorasoft@gmail.com",
    displayName: "Abhishek Singh",
    firstName: "Abhishek",
    lastName: "Singh",
    role: "employee",
    department: "Sales",
    designation: "Sales Executive",
    employeeCode: "EMP-SLS-001",
  },
];

const TEMP_PASSWORD = "Password@123";

async function seed() {
  const force = process.argv.includes("--force");
  if (!force) {
    console.log("Run with --force to intentionally recreate the HRMS users.");
    process.exit(0);
  }

  const db = await resolveAndConnect();
  const now = new Date();

  await db.collection("users").deleteMany({});
  await db.collection("sessions").deleteMany({});

  const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 12);
  for (const u of USERS) {
    await db.collection("users").insertOne({
      email: u.email,
      emailVerified: true,
      displayName: u.displayName,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      status: "active",
      loginStatus: "enabled",
      department: u.department,
      departmentName: u.department,
      designation: u.designation,
      designationName: u.designation,
      employeeCode: u.employeeCode,
      passwordHash,
      tenantId: "default",
      phone: "",
      mustChangePassword: u.role !== "super_admin",
      createdAt: now,
      updatedAt: now,
    });
  }

  console.log(`Created ${USERS.length} current HRMS users.`);
  console.log("Nayan Raj removed; Shivangi Gupta is Marketing Manager.");
  console.log("Shubha Pallavi added to Development as Web Developer.");
  console.log("Simar Kaur updated to Social Media Designer.");
  console.log("Ashish Mishra updated to Web Developer.");
}

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
