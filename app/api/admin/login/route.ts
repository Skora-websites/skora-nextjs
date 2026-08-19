import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/db";
import { setAdminSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required." }, { status: 400 });
    }

    const isValid = await verifyAdminCredentials(username, password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    await setAdminSessionCookie();
    return NextResponse.json({ success: true, message: "Authenticated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
