import { NextRequest, NextResponse } from "next/server";
import { createSession, signInWithFirebase, SESSION_COOKIE_OPTIONS, SESSION_EXPIRES_IN_MS } from "@/lib/auth";
import { getAdminAuth } from "@/lib/firebase-admin";
import { usersService } from "@/lib/firestore";
import { normalizeRole, isSuperAdminEmail } from "@/lib/rbac";
import { withErrorHandler, unauthorized, badRequest } from "@/lib/api-handler";

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return badRequest("Email and password are required");
  }

  const idToken = await signInWithFirebase(email, password);

  const decoded = await getAdminAuth().verifyIdToken(idToken);
  const userDoc = await usersService.findById(decoded.uid);
  if (userDoc) {
    const role = isSuperAdminEmail(userDoc.email || "")
      ? "super_admin"
      : normalizeRole(userDoc.role);
    await getAdminAuth().setCustomUserClaims(decoded.uid, { role });
    if (role !== userDoc.role) {
      await usersService.update(decoded.uid, { role } as any);
    }
  }

  const sessionCookie = await createSession(idToken);

  const response = NextResponse.json({ success: true });
  response.cookies.set("session", sessionCookie, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  return response;
}, { label: "Login" });
