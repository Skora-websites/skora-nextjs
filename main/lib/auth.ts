import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAdminAuth } from "./firebase-admin";
import { usersService } from "./firestore";
import { normalizeRole } from "./rbac";
import { logger } from "./logger";
import { connectDB } from "./db/db";
import { User } from "./db/models";

// ── Types ───────────────────────────────────────────────

export interface Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
  } | null;
}

// ── Session Helpers ─────────────────────────────────────

/**
 * Get the current session by verifying the session cookie.
 * Compatible with the NextAuth session interface used across the app.
 */
export async function auth(): Promise<Session> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;

  if (!cookie) return { user: null };

  if (cookie.startsWith("hrms_session_")) {
    try {
      const raw = Buffer.from(cookie.replace("hrms_session_", ""), "base64").toString("utf-8");
      const parsed = JSON.parse(raw);
      return {
        user: {
          id: parsed.id || parsed._id || "hrms-user",
          name: parsed.name || null,
          email: parsed.email || null,
          image: parsed.image || null,
          role: parsed.role || "employee",
        },
      };
    } catch (e) {
      // Fallback
    }
  }

  try {
    // checkRevoked: false — avoids intermittent 401s from Firebase's
    // revocation API propagation delays. When a user logs out,
    // destroySession() independently revokes tokens & clears the cookie.
    // For role/permission changes, custom claims are verified inline,
    // so stale sessions are not a security concern.
    const decoded = await getAdminAuth().verifySessionCookie(cookie, false);

    // Get the actual HRMS role from MongoDB (preserves MANAGER, HR_ADMIN, etc.)
    let role = "employee";
    try {
      const conn = await connectDB();
      if (conn) {
        const sessionEmail = decoded.email || "";
        if (sessionEmail) {
          try {
            const mongoUser = await User.findOne({ email: sessionEmail.toLowerCase().trim() }).maxTimeMS(5000);
            if (mongoUser) {
              role = mongoUser.role || "employee";
            } else {
              role = (decoded as Record<string, unknown>).role as string || "employee";
            }
          } catch (queryErr) {
            console.warn("[auth] MongoDB query failed:", (queryErr as Error).message);
            role = (decoded as Record<string, unknown>).role as string || "employee";
          }
        }
      } else {
        console.warn("[auth] MongoDB not connected, using session role");
        role = (decoded as Record<string, unknown>).role as string || "employee";
      }
    } catch (e) {
      console.warn("[auth] Role lookup failed:", (e as Error).message);
      role = (decoded as Record<string, unknown>).role as string || "employee";
    }

    return {
      user: {
        id: decoded.uid,
        name: decoded.name || null,
        email: decoded.email || null,
        image: decoded.picture || null,
        role,
      },
    };
  } catch (error) {
    logger.error("Session verification failed", error);
    return { user: null };
  }
}

// ── Session Cookie Config ─────────────────────────────

export const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/**
 * Create a session cookie from a Firebase Auth ID token.
 * Returns the cookie value. The caller is responsible for setting it
 * on the response via `response.cookies.set()` for reliable persistence.
 */
export async function createSession(idToken: string): Promise<string> {
  const expiresIn = SESSION_EXPIRES_IN_MS;

  const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
    expiresIn,
  });

  return sessionCookie;
}

/**
 * Set the session cookie on a NextResponse object.
 * Use this in API route handlers for reliable cookie persistence.
 */
export function setSessionCookieOnResponse(
  response: NextResponse,
  sessionCookie: string
): NextResponse {
  response.cookies.set("session", sessionCookie, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });
  return response;
}

/**
 * Full destroy: revoke Firebase refresh tokens and clear the session cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("session")?.value;

  if (cookie) {
    try {
      const decoded = await getAdminAuth().verifySessionCookie(cookie);
      await getAdminAuth().revokeRefreshTokens(decoded.uid);
    } catch {
      // Token is already invalid; nothing to revoke
    }
  }

  cookieStore.delete("session");
}

// ── Firebase Auth REST Helpers ──────────────────────────

const FIREBASE_AUTH_BASE = "https://identitytoolkit.googleapis.com/v1";

/**
 * Sign in with email/password via the Firebase Auth REST API.
 * Returns an ID token that can be exchanged for a session cookie.
 */
export async function signInWithFirebase(
  email: string,
  password: string
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not set");
  }

  const res = await fetch(
    `${FIREBASE_AUTH_BASE}/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    const message = err.error?.message;
    if (
      message === "EMAIL_NOT_FOUND" ||
      message === "INVALID_PASSWORD" ||
      message === "INVALID_LOGIN_CREDENTIALS"
    ) {
      throw new Error("Invalid email or password");
    }
    if (message === "USER_DISABLED") {
      throw new Error("This account has been disabled");
    }
    throw new Error(message || "Authentication failed");
  }

  const data = await res.json();
  return data.idToken as string;
}

/**
 * Sign up with email/password via the Firebase Auth REST API.
 * Creates a new Firebase Auth user and returns an ID token.
 */
export async function signUpWithFirebase(
  email: string,
  password: string
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_FIREBASE_API_KEY is not set");
  }

  const res = await fetch(
    `${FIREBASE_AUTH_BASE}/accounts:signUp?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    const message = err.error?.message;
    if (message === "EMAIL_EXISTS") {
      throw new Error("An account with this email already exists");
    }
    throw new Error(message || "Registration failed");
  }

  const data = await res.json();
  return data.idToken as string;
}

// ── API Route Handlers (compatible with NextAuth route) ─

/**
 * These handlers are exported in place of the NextAuth handlers
 * for the `app/api/auth/[...nextauth]/route.ts` route,
 * but the session cookie API route has moved to `app/api/auth/session/route.ts`.
 *
 * We keep a minimal GET/POST export so existing imports don't break.
 */

