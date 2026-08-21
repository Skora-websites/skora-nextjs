import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  await destroySession();

  const loginUrl = new URL("/hrms/login", request.url);
  loginUrl.searchParams.set("callbackUrl", "/hrms");

  return NextResponse.redirect(loginUrl);
}
