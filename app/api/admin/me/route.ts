import { NextResponse } from "next/server";
import { isSubmittedAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const isAuthenticated = await isSubmittedAdminAuthenticated();
  return NextResponse.json({ authenticated: isAuthenticated });
}
