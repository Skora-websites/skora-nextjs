"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z, type ZodError } from "zod";
import { getAdminAuth } from "@/lib/firebase-admin";
import { usersService } from "@/lib/firestore";
import {
  signInWithFirebase,
  signUpWithFirebase,
  createSession,
  destroySession,
  SESSION_COOKIE_OPTIONS,
  SESSION_EXPIRES_IN_MS,
} from "@/lib/auth";
import { normalizeRole, isSuperAdminEmail } from "@/lib/rbac";

function formatZodErrors<T>(error: ZodError<T>): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_form";
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  email: z.string().email("Please enter a valid email").trim(),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[a-zA-Z]/, "Password must contain at least one letter").regex(/[0-9]/, "Password must contain at least one number"),
});

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email").trim(),
  password: z.string().min(1, "Password is required"),
});

export type AuthState = {
  errors?: { name?: string[]; email?: string[]; password?: string[]; _form?: string[]; };
  success?: boolean;
  message?: string;
};

const ROLE_DASHBOARDS: Record<string, string> = {
  super_admin: "/hrms/superadmin",
  hr_admin: "/hrms/hr-admin",
  admin: "/hrms/hr-admin",
  manager: "/hrms/manager",
  employee: "/hrms/employee",
};

export async function signup(prevState: AuthState | undefined, formData: FormData): Promise<AuthState | undefined> {
  const validated = SignupSchema.safeParse({ name: formData.get("name"), email: formData.get("email"), password: formData.get("password") });
  if (!validated.success) return { errors: formatZodErrors(validated.error), message: "Please fix the errors above." };
  const { name, email, password } = validated.data;
  try {
    const idToken = await signUpWithFirebase(email, password);
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    await getAdminAuth().updateUser(decoded.uid, { displayName: name });
    const existingUserCount = await usersService.count();
    const role = isSuperAdminEmail(email) || existingUserCount === 0 ? "super_admin" : "employee";
    await usersService.createWithId(decoded.uid, { name, email, role, status: "active" as const });
    await getAdminAuth().setCustomUserClaims(decoded.uid, { role });
    const sessionCookieValue = await createSession(idToken);
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookieValue, { ...SESSION_COOKIE_OPTIONS, maxAge: SESSION_EXPIRES_IN_MS / 1000 });
    cookieStore.set("user_role", role, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_EXPIRES_IN_MS / 1000 });
    redirect(ROLE_DASHBOARDS[role] || "/hrms/employee");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("Signup error:", error);
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes("already exists")) return { errors: { email: ["An account with this email already exists"] }, message: "Registration failed." };
      if (msg.includes("WEAK_PASSWORD")) return { errors: { password: ["Password should be at least 6 characters"] }, message: "Registration failed." };
      return { errors: { _form: [msg] }, message: "Registration failed." };
    }
    return { errors: { _form: [String(error)] }, message: "Registration failed." };
  }
}

export async function login(prevState: AuthState | undefined, formData: FormData): Promise<AuthState | undefined> {
  const validated = LoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!validated.success) return { errors: formatZodErrors(validated.error), message: "Please fix the errors above." };
  const { email, password } = validated.data;
  try {
    const idToken = await signInWithFirebase(email, password);
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const userDoc = await usersService.findById(decoded.uid);
    if (userDoc) {
      const role = isSuperAdminEmail(userDoc.email || "") ? "super_admin" : normalizeRole(userDoc.role);
      await getAdminAuth().setCustomUserClaims(decoded.uid, { role });
      if (role !== userDoc.role) await usersService.update(decoded.uid, { role } as any);
    }
    const sessionCookieValue = await createSession(idToken);
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookieValue, { ...SESSION_COOKIE_OPTIONS, maxAge: SESSION_EXPIRES_IN_MS / 1000 });
    const loginRole = userDoc ? (isSuperAdminEmail(userDoc.email || "") ? "super_admin" : normalizeRole(userDoc.role)) : "employee";
    cookieStore.set("user_role", loginRole, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_EXPIRES_IN_MS / 1000 });
    redirect(ROLE_DASHBOARDS[loginRole] || "/hrms/employee");
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
    console.error("Login error:", error);
    return { errors: { _form: [error instanceof Error ? error.message : "Invalid email or password."] }, message: "Login failed." };
  }
}

export async function logout() {
  await destroySession();
  const cookieStore = await cookies();
  cookieStore.delete("user_role");
  redirect("/hrms/login");
}

export async function signInWithProvider(_provider: "google" | "github") {
  throw new Error("Use client-side OAuth flow instead.");
}

export async function createSessionFromIdToken(idToken: string): Promise<void> {
  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const existing = await usersService.findById(decoded.uid);
    const userEmail = existing?.email || decoded.email || "";
    const isSuperAdmin = isSuperAdminEmail(userEmail);
    if (!existing) {
      await usersService.createWithId(decoded.uid, { name: decoded.name || decoded.email || "User", email: decoded.email || undefined, image: decoded.picture || undefined, role: isSuperAdmin ? ("super_admin" as const) : ("employee" as const), status: "active" as const });
    } else {
      const currentRole = normalizeRole(existing.role);
      if (isSuperAdmin && currentRole !== "super_admin") await usersService.update(decoded.uid, { role: "super_admin" as const });
      if (decoded.name || decoded.picture) await usersService.update(decoded.uid, { name: decoded.name || existing.name, image: decoded.picture || existing.image });
    }
    const roleToSet = isSuperAdmin ? "super_admin" : normalizeRole(existing?.role || "employee");
    await getAdminAuth().setCustomUserClaims(decoded.uid, { role: roleToSet });
    const sessionCookieValue = await createSession(idToken);
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookieValue, { ...SESSION_COOKIE_OPTIONS, maxAge: SESSION_EXPIRES_IN_MS / 1000 });
    cookieStore.set("user_role", roleToSet, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: SESSION_EXPIRES_IN_MS / 1000 });
  } catch (error) {
    console.error("Session from ID token error:", error);
    throw error;
  }
}
