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
  const userEmail = decoded.email || email;
  const userDoc = await usersService.findById(decoded.uid);
  
  // Determine role from email first (super admin email always wins)
  let resolvedRole = isSuperAdminEmail(userEmail) ? "super_admin" : "employee";
  
  if (userDoc) {
    // User exists in Firestore — use their stored role unless email is super admin
    resolvedRole = isSuperAdminEmail(userEmail)
      ? "super_admin"
      : normalizeRole(userDoc.role);
    await getAdminAuth().setCustomUserClaims(decoded.uid, { role: resolvedRole });
    if (resolvedRole !== userDoc.role) {
      await usersService.update(decoded.uid, { role: resolvedRole } as any);
    }
  } else {
    // User in Firebase Auth but NOT in Firestore — create their profile
    const role = isSuperAdminEmail(userEmail) ? "super_admin" : "employee";
    resolvedRole = role;
    await usersService.createWithId(decoded.uid, {
      name: decoded.name || email.split("@")[0],
      email: userEmail,
      role,
      status: "active",
    });
    await getAdminAuth().setCustomUserClaims(decoded.uid, { role });
  }

  const sessionCookie = await createSession(idToken);
  const userRole = resolvedRole;

  const response = NextResponse.json({ success: true });
  response.cookies.set("session", sessionCookie, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  response.cookies.set('user_role', userRole, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  return response;
}, { label: "Login" });
