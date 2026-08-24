import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/mongo-helper";
import bcrypt from "bcryptjs";
import { setAdminSessionCookie } from "@/lib/auth";

/**
 * Admin login API — authenticates against hrms.users collection.
 * Same logic as lib/actions/admin-auth.ts server action.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database not available." }, { status: 503 });
    }

    const user = await db.collection("users").findOne({
      email: username.toLowerCase(),
      tenantId: "default",
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const role = (user.role || "").toLowerCase();
    if (role !== "super_admin" && role !== "hr_admin") {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    if (user.loginStatus === "disabled") {
      return NextResponse.json({ error: "Account is disabled." }, { status: 403 });
    }

    const passwordHash = user.passwordHash;
    if (!passwordHash) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    await setAdminSessionCookie();
    return NextResponse.json({ success: true, message: "Authenticated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
