import { NextRequest, NextResponse } from "next/server";
import { createSession, destroySession, auth, SESSION_COOKIE_OPTIONS, SESSION_EXPIRES_IN_MS } from "@/lib/auth";
import { withErrorHandler, badRequest } from "@/lib/api-handler";
import { getAdminAuth } from "@/lib/firebase-admin";
import { usersService } from "@/lib/firestore";
import { normalizeRole, isSuperAdminEmail } from "@/lib/rbac";

export async function GET() {
  const session = await auth();
  if (!session.user) {
    // Return 200 with null user so client-side AuthProvider can distinguish
    // "not logged in" from "server error"
    return NextResponse.json({ user: null });
  }
  return NextResponse.json(session);
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { idToken } = body;

  if (!idToken || typeof idToken !== "string") {
    return badRequest("idToken is required");
  }

  // Determine role from token claims / Firestore
  const decoded = await getAdminAuth().verifyIdToken(idToken);
  const userDoc = await usersService.findById(decoded.uid);
  const role = isSuperAdminEmail(userDoc?.email || "")
    ? "super_admin"
    : normalizeRole(userDoc?.role || "employee");

  const sessionCookie = await createSession(idToken);

  const response = NextResponse.json({ success: true });
  response.cookies.set("session", sessionCookie, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  // Set role cookie for middleware-based routing
  response.cookies.set("user_role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  return response;
}, { label: "Session" });

export async function DELETE() {
  await destroySession();

  const response = NextResponse.json({ success: true });
  response.cookies.delete("session");
  response.cookies.delete("user_role");
  return response;
}
