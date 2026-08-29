import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongo-helper";
import bcrypt from "bcryptjs";

/**
 * POST /api/hrm/v2/seed — One-time database seed endpoint
 *
 * Wipes ALL users and sessions, then creates 12 real team members.
 * Protected by a secret key to prevent unauthorized access.
 *
 * Usage: POST { "key": "skora-seed-2026" }
 */

const SEED_KEY = "skora-seed-2026";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    // Require secret key
    if (body.key !== SEED_KEY) {
      return NextResponse.json(
        { error: "Invalid seed key" },
        { status: 403 }
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not connected" },
        { status: 500 }
      );
    }

    // Step 1: Wipe existing data
    const existingUsers = await db.collection("users").countDocuments();
    await db.collection("users").deleteMany({});
    await db.collection("sessions").deleteMany({});

    // Step 2: Hash password
    const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 12);

    // Step 3: Insert real users
    const now = new Date();
    const created = [];
    let empCount = 0;

    for (const u of USERS) {
      const userDoc = {
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
      };

      await db.collection("users").insertOne(userDoc);
      created.push({
        role: u.role === "super_admin" ? "CEO" : u.role === "manager" ? "Manager" : "Employee",
        name: u.displayName,
        email: u.email,
        code: u.employeeCode,
      });

      if (u.role !== "super_admin") empCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${USERS.length} users (${empCount} employees + 1 CEO)`,
      wiped: existingUsers,
      created,
      tempPassword: TEMP_PASSWORD,
      note: "All users (except CEO) must change password on first login",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Seed failed" },
      { status: 500 }
    );
  }
}
