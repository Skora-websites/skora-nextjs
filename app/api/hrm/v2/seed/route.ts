import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongo-helper";
import bcrypt from "bcryptjs";

/**
 * POST /api/hrm/v2/seed — one-time database seed endpoint.
 *
 * WARNING: This DELETES ALL users and sessions before creating the current team directory.
 * Protected by a deployment secret; never expose the secret in client code.
 */

const SEED_KEY = process.env.HRMS_SEED_KEY;

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

const TEMP_PASSWORD = "Password@123";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!SEED_KEY || body.key !== SEED_KEY) {
      return NextResponse.json({ error: "Invalid seed key" }, { status: 403 });
    }

    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 500 });

    const existingUsers = await db.collection("users").countDocuments({ tenantId: "default" });
    await db.collection("users").deleteMany({ tenantId: "default" });
    await db.collection("sessions").deleteMany({});

    const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 12);
    const now = new Date();

    for (const user of USERS) {
      await db.collection("users").insertOne({
        ...user,
        tenantId: "default",
        emailVerified: true,
        status: "active",
        loginStatus: "enabled",
        allowMobileLogin: false,
        passwordHash,
        mustChangePassword: user.role !== "super_admin",
        createdAt: now,
        updatedAt: now,
      });
    }

    const created = USERS.map((u) => ({
      role: u.role === "super_admin" ? "CEO" : u.role === "hr_admin" ? "HR Admin" : u.role === "manager" ? "Manager" : "Employee",
      name: u.displayName,
      email: u.email,
      department: u.department,
      designation: u.designation,
      code: u.employeeCode,
    }));

    return NextResponse.json({
      success: true,
      message: `Seeded ${USERS.length} users`,
      wiped: existingUsers,
      created,
      tempPassword: TEMP_PASSWORD,
      note: "All users except the CEO must change password on first login.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Seed failed" }, { status: 500 });
  }
}
