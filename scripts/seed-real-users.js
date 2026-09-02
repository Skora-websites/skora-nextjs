/**
 * Seed script: Creates 12 real Skora team members in MongoDB.
 *
 * WARNING: This DELETES ALL existing users before creating new ones.
 * Run only once during initial setup or after a full database reset.
 *
 * Usage: node scripts/seed-real-users.js [--force]
 */

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const dns = require("dns").promises;

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
    if (srvRecs.length === 0) { console.warn("No SRV for", srvH); return srvUri; }
    const hosts = srvRecs.map(r => r.name + ":" + r.port).join(",");
    const txt = txtRecs[0] && txtRecs[0][0] ? txtRecs[0][0] : "";
    const params = new Map();
    if (txt) txt.split("&").forEach(p => { const i = p.indexOf("="); if (i > 0) params.set(p.substring(0, i), p.substring(i + 1)); });
    if (query) query.split("&").forEach(p => { const i = p.indexOf("="); if (i > 0) params.set(p.substring(0, i), p.substring(i + 1)); else if (p) params.set(p, ""); });
    const pr = Array.from(params.entries()).map(e => e[0] + "=" + e[1]).join("&");
    var direct = "mongodb://" + cred + "@" + hosts + "/" + dbPath;
    if (pr) direct += "?" + pr;
    console.log("SRV resolved to", hosts.split(",").length, "hosts");
    return direct;
  } catch (err) {
    console.warn("SRV failed:", err.message, "- using original URI");
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
  console.log("Connecting to MongoDB...");
  const c = new MongoClient(resolvedUri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    retryWrites: true,
    w: "majority",
  });
  await c.connect();
  const dbMatch = uri.match(/\/([^/?]+)(\?|$)/);
  const dbName = dbMatch ? dbMatch[1] : "hrms";
  console.log("Connected to database: " + dbName);
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
    email: "nayanskorasoft@gmail.com",
    displayName: "Nayan Raj",
    firstName: "Nayan",
    lastName: "Raj",
    role: "manager",
    department: "Marketing",
    designation: "Marketing Manager",
    employeeCode: "MGR-MKT-001",
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
    email: "sg.shivangi@outlook.com",
    displayName: "Shivangi Gupta",
    firstName: "Shivangi",
    lastName: "Gupta",
    role: "employee",
    department: "Marketing",
    designation: "Marketing Executive",
    employeeCode: "EMP-MKT-003",
  },
  {
    email: "sapnadelhi2004@gmail.com",
    displayName: "Sapna",
    firstName: "Sapna",
    lastName: "",
    role: "employee",
    department: "Marketing",
    designation: "Marketing Executive",
    employeeCode: "EMP-MKT-004",
  },
  {
    email: "sk01506967961@gmail.com",
    displayName: "Sachin",
    firstName: "Sachin",
    lastName: "",
    role: "employee",
    department: "Marketing",
    designation: "Marketing Executive",
    employeeCode: "EMP-MKT-005",
  },
  {
    email: "simarkaurwork15@gmail.com",
    displayName: "Simar Kaur",
    firstName: "Simar",
    lastName: "Kaur",
    role: "employee",
    department: "Marketing",
    designation: "Marketing Executive",
    employeeCode: "EMP-MKT-006",
  },
  {
    email: "ashish17427@gmail.com",
    displayName: "Ashish Mishra",
    firstName: "Ashish",
    lastName: "Mishra",
    role: "employee",
    department: "Development",
    designation: "Software Developer",
    employeeCode: "EMP-DEV-001",
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
    console.log("WARNING: This script DELETES all existing users and recreates them.");
    console.log("Run with --force to confirm:");
    console.log("  node scripts/seed-real-users.js --force\n");
    process.exit(0);
  }

  const db = await resolveAndConnect();

  const now = new Date();
  const existingCount = await db.collection("users").countDocuments();
  console.log("Found " + existingCount + " existing users.");

  await db.collection("users").deleteMany({});
  await db.collection("sessions").deleteMany({});
  console.log("Cleared old users and sessions.\n");

  const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 12);
  let empCount = 0;

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
      designation: u.designation,
      employeeCode: u.employeeCode,
      passwordHash: passwordHash,
      tenantId: "default",
      phone: "",
      mustChangePassword: u.role !== "super_admin",
      createdAt: now,
      updatedAt: now,
    });

    var roleLabel = u.role === "super_admin" ? "CEO" : u.role === "hr_admin" ? "HR Admin" : u.role === "manager" ? "Manager" : "Employee";
    console.log("  " + roleLabel + ": " + u.displayName + " (" + u.email + ") — code: " + u.employeeCode);
    if (u.role !== "super_admin") empCount++;
  }

  console.log("\n=============================================");
  console.log("  Created " + USERS.length + " users (" + empCount + " employees + 1 CEO)");
  console.log("  Temporary password: " + TEMP_PASSWORD);
  console.log("  All users (except CEO) MUST change password on first login");
  console.log("=============================================\n");

  console.log("Login Credentials (all use same temp password):");
  console.log("------------------------------------------------");
  for (const u of USERS) {
    var role = u.role === "super_admin" ? "CEO" : u.role === "hr_admin" ? "HR" : u.role === "manager" ? "MGR" : "EMP";
    console.log("  " + role.padEnd(4) + " " + u.email.padEnd(35) + " " + TEMP_PASSWORD);
  }
  console.log("------------------------------------------------");

  process.exit(0);
}

seed().catch(function(e) {
  console.error("Seed failed:", e.message);
  process.exit(1);
});
