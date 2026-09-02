/**
 * Safely synchronize the current HRMS team directory without wiping the database.
 *
 * This migration only:
 *  - upserts the current team members by email
 *  - removes Nayan Raj from the users collection
 *  - preserves all other users, attendance, sessions, and unrelated tenant data
 *
 * Usage: node scripts/migrate-current-team.js
 */

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const fs = require("fs");

[".env.local", ".env"].forEach((file) => {
  try {
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
      const index = trimmed.indexOf("=");
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {}
});

const USERS = [
  { email: "skorainfotech@gmail.com", displayName: "Vishal Srivastava", firstName: "Vishal", lastName: "Srivastava", role: "super_admin", department: "Executive", designation: "CEO", employeeCode: "CEO-001" },
  { email: "hr@skorainfotech.com", displayName: "Vishal Srivastava", firstName: "Vishal", lastName: "Srivastava", role: "hr_admin", department: "Human Resources", designation: "HR Manager", employeeCode: "HR-001" },
  { email: "rajat.stf007@gmail.com", displayName: "Rajat Kashyap", firstName: "Rajat", lastName: "Kashyap", role: "manager", department: "Development", designation: "Development Manager", employeeCode: "MGR-DEV-001" },
  { email: "vipul.skorasoft@gmail.com", displayName: "Vipul Singh", firstName: "Vipul", lastName: "Singh", role: "manager", department: "Sales", designation: "Sales Manager", employeeCode: "MGR-SLS-001" },
  { email: "sg.shivangi@outlook.com", displayName: "Shivangi Gupta", firstName: "Shivangi", lastName: "Gupta", role: "manager", department: "Marketing", designation: "Marketing Manager", employeeCode: "MGR-MKT-001" },
  { email: "chaudharygoldy08@gmail.com", displayName: "Goldy Chaudhary", firstName: "Goldy", lastName: "Chaudhary", role: "employee", department: "Marketing", designation: "Marketing Executive", employeeCode: "EMP-MKT-001" },
  { email: "maazhasan024@gmail.com", displayName: "Maaz Hasan", firstName: "Maaz", lastName: "Hasan", role: "employee", department: "Marketing", designation: "Marketing Executive", employeeCode: "EMP-MKT-002" },
  { email: "sapnadelhi2004@gmail.com", displayName: "Sapna", firstName: "Sapna", lastName: "", role: "employee", department: "Marketing", designation: "Marketing Executive", employeeCode: "EMP-MKT-003" },
  { email: "sk01506967961@gmail.com", displayName: "Sachin", firstName: "Sachin", lastName: "", role: "employee", department: "Marketing", designation: "Marketing Executive", employeeCode: "EMP-MKT-004" },
  { email: "simarkaurwork15@gmail.com", displayName: "Simar Kaur", firstName: "Simar", lastName: "Kaur", role: "employee", department: "Marketing", designation: "Social Media Designer", employeeCode: "EMP-MKT-005" },
  { email: "ashish17427@gmail.com", displayName: "Ashish Mishra", firstName: "Ashish", lastName: "Mishra", role: "employee", department: "Development", designation: "Web Developer", employeeCode: "EMP-DEV-001" },
  { email: "spallavivatsa@gmail.com", displayName: "Shubha Pallavi", firstName: "Shubha", lastName: "Pallavi", role: "employee", department: "Development", designation: "Web Developer", employeeCode: "EMP-DEV-002" },
  { email: "abhishek.skorasoft@gmail.com", displayName: "Abhishek Singh", firstName: "Abhishek", lastName: "Singh", role: "employee", department: "Sales", designation: "Sales Executive", employeeCode: "EMP-SLS-001" },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing. Put it in .env.local or .env.");

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    tls: true,
    retryWrites: true,
    w: "majority",
  });

  await client.connect();
  try {
    const match = uri.match(/\/([^/?]+)(?:\?|$)/);
    const dbName = match ? match[1] : "hrms";
    const db = client.db(dbName);
    const users = db.collection("users");
    const passwordHash = await bcrypt.hash("Password@123", 12);
    const now = new Date();

    const nayanResult = await users.deleteMany({
      tenantId: "default",
      $or: [
        { displayName: "Nayan Raj" },
        { firstName: "Nayan", lastName: "Raj" },
      ],
    });

    let created = 0;
    let updated = 0;

    for (const user of USERS) {
      const result = await users.updateOne(
        { tenantId: "default", email: user.email },
        {
          $set: {
            ...user,
            departmentName: user.department,
            designationName: user.designation,
            status: "active",
            loginStatus: "enabled",
            tenantId: "default",
            updatedAt: now,
          },
          $setOnInsert: {
            emailVerified: true,
            allowMobileLogin: false,
            passwordHash,
            mustChangePassword: user.role !== "super_admin",
            phone: "",
            createdAt: now,
          },
        },
        { upsert: true },
      );
      if (result.upsertedCount) created += 1;
      else if (result.modifiedCount) updated += 1;
    }

    console.log(JSON.stringify({
      success: true,
      nayanRemoved: nayanResult.deletedCount,
      created,
      updated,
      preservedExistingData: true,
      message: "Current HRMS team synchronized without deleting unrelated users, attendance, or sessions.",
    }, null, 2));
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error("Migration failed:", error.message);
  process.exit(1);
});
