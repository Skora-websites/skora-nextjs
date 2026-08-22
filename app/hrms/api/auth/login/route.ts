import { NextRequest, NextResponse } from "next/server";
import { createSession, signInWithMongo, SESSION_COOKIE_OPTIONS, SESSION_EXPIRES_IN_MS } from "@/lib/auth";
import { withErrorHandler, unauthorized, badRequest } from "@/lib/api-handler";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return badRequest("Email and password are required");
  }

  // Authenticate against MongoDB
  const user = await signInWithMongo(email, password);

  // Create session in MongoDB
  const sessionToken = await createSession(user.id);

  const response = NextResponse.json({ success: true });
  response.cookies.set("session", sessionToken, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  // Set role cookie for middleware routing
  response.cookies.set("user_role", user.role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  return response;
}, { label: "Login" });
