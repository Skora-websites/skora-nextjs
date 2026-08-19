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

// ── Helpers ───────────────────────────────────────────

/**
 * Convert Zod v4 issues into a flat field-errors map.
 * Replaces the deprecated `.flatten().fieldErrors` call.
 */
function formatZodErrors<T>(error: ZodError<T>): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? issue.path.join(".") : "_form";
    if (!fieldErrors[key]) fieldErrors[key] = [];
    fieldErrors[key].push(issue.message);
  }
  return fieldErrors;
}

// ── Validation Schemas ───────────────────────────────

const SignupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  email: z.string().email("Please enter a valid email").trim(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email").trim(),
  password: z.string().min(1, "Password is required"),
});

// ── Types ─────────────────────────────────────────────

export type AuthState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    _form?: string[];
  };
  success?: boolean;
  message?: string;
};

// ── Signup Action ─────────────────────────────────────

export async function signup(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState | undefined> {
  // Validate form fields
  const validated = SignupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      errors: formatZodErrors(validated.error),
      message: "Please fix the errors above.",
    };
  }

  const { name, email, password } = validated.data;

  try {
    // 1. Create user in Firebase Auth via REST API
    const idToken = await signUpWithFirebase(email, password);

    // 2. Decode the ID token to get the Firebase UID
    const decoded = await getAdminAuth().verifyIdToken(idToken);

    // 3. Set display name in Firebase Auth
    await getAdminAuth().updateUser(decoded.uid, { displayName: name });

    // 4. Determine role:
    //    - Designated super admin emails always get super_admin
    //    - First user ever becomes super_admin
    //    - Everyone else becomes employee
    const existingUserCount = await usersService.count();
    const role = isSuperAdminEmail(email) || existingUserCount === 0 ? "super_admin" : "employee";

    // 5. Create user profile in Firestore
    await usersService.createWithId(decoded.uid, {
      name,
      email,
      role,
      status: "active" as const,
    });

    // 6. Set custom claims so the session cookie includes the user's role
    await getAdminAuth().setCustomUserClaims(decoded.uid, { role });

    // 7. Create session cookie
    const sessionCookieValue = await createSession(idToken);
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookieValue, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error instanceof Error) {
      const msg = error.message;

      if (msg.includes("already exists")) {
        return {
          errors: { email: ["An account with this email already exists"] },
          message: "Registration failed.",
        };
      }

      if (msg.includes("WEAK_PASSWORD")) {
        return {
          errors: {
            password: ["Password should be at least 6 characters"],
          },
          message: "Registration failed.",
        };
      }
    }

    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('DIAG Signup error detail:', errorMsg);
    return {
      errors: {
        _form: [errorMsg],
      },
      message: "Registration failed.",
    };
  }

  redirect("/dashboard");
}

// ── Email/Password Login Action ────────────────────────

export async function login(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState | undefined> {
  const validated = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return {
      errors: formatZodErrors(validated.error),
      message: "Please fix the errors above.",
    };
  }

  const { email, password } = validated.data;

  try {
    // Sign in via Firebase Auth REST API
    const idToken = await signInWithFirebase(email, password);

    // Decode token to get UID, then ensure custom claims are set
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const userDoc = await usersService.findById(decoded.uid);
    if (userDoc) {
      // Upgrade to super_admin if this is a designated super admin email
      const role = isSuperAdminEmail(userDoc.email || "") ? "super_admin" : normalizeRole(userDoc.role);
      await getAdminAuth().setCustomUserClaims(decoded.uid, { role });
      // Also update Firestore if role changed
      if (role !== userDoc.role) {
        await usersService.update(decoded.uid, { role } as any);
      }
    }

    // Create session cookie
    const sessionCookieValue = await createSession(idToken);
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookieValue, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    });
  } catch (error) {
    console.error("Login error:", error);

    return {
      errors: {
        _form: [
          error instanceof Error
            ? error.message
            : "Invalid email or password.",
        ],
      },
      message: "Login failed.",
    };
  }

  redirect("/dashboard");
}

// ── Logout Action ─────────────────────────────────────

export async function logout() {
  await destroySession();
  redirect("/login");
}

// ── OAuth Sign-In Server Action ────────────────────────

/**
 * Exchange an OAuth ID token for a session cookie.
 * Called after a successful Firebase Auth client-side OAuth sign-in.
 */
export async function signInWithProvider(_provider: "google" | "github") {
  // OAuth is handled client-side via Firebase Auth popup.
  // After the popup, the ID token is sent to the session API.
  // This server action is kept for backward compatibility.
  throw new Error(
    "Use client-side OAuth flow instead. See signInWithGoogle in actions/auth-oauth."
  );
}

/**
 * Create a session from an OAuth ID token.
 * Used after client-side Firebase Auth OAuth popup completes.
 */
export async function createSessionFromIdToken(idToken: string): Promise<void> {
  try {
    // Verify the token and create/update user profile in Firestore
    const decoded = await getAdminAuth().verifyIdToken(idToken);

    // Check if user exists in Firestore; if not, create profile
    const existing = await usersService.findById(decoded.uid);
    const userEmail = existing?.email || decoded.email || "";
    const isSuperAdmin = isSuperAdminEmail(userEmail);

    if (!existing) {
      await usersService.createWithId(decoded.uid, {
        name: decoded.name || decoded.email || "User",
        email: decoded.email || undefined,
        image: decoded.picture || undefined,
        role: isSuperAdmin ? ("super_admin" as const) : ("employee" as const),
        status: "active" as const,
      });
    } else {
      // Upgrade role in Firestore if this is a designated super admin
      const currentRole = normalizeRole(existing.role);
      if (isSuperAdmin && currentRole !== "super_admin") {
        await usersService.update(decoded.uid, { role: "super_admin" as const });
      }
      // Update name/picture if OAuth provides updated info
      if (decoded.name || decoded.picture) {
        await usersService.update(decoded.uid, {
          name: decoded.name || existing.name,
          image: decoded.picture || existing.image,
        });
      }
    }

    // Determine the role to set in custom claims
    const roleToSet = isSuperAdmin ? "super_admin" : normalizeRole(existing?.role || "employee");
    await getAdminAuth().setCustomUserClaims(decoded.uid, { role: roleToSet });

    // Create session cookie
    const sessionCookieValue = await createSession(idToken);
    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookieValue, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: SESSION_EXPIRES_IN_MS / 1000,
    });
  } catch (error) {
    console.error("Session from ID token error:", error);
    throw error;
  }
}
