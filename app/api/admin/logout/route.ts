import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    await clearAdminSessionCookie();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
