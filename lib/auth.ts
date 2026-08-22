import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDb } from "./db/mongo-helper";
import { normalizeRole } from "./rbac";
import { ObjectId } from "mongodb";
import crypto from "crypto";
import bcrypt from "bcryptjs";

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

// ── Password Helpers ────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Session Helpers ─────────────────────────────────────

/**
 * Get the current session by reading the session cookie
 * and looking up the session in MongoDB.
 */
export async function auth(): Promise<Session> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  if (!sessionToken) return { user: null };

  try {
    const db = await getDb();
    if (!db) return { user: null };

    const session = await db.collection("sessions").findOne({
      token: sessionToken,
      expiresAt: { $gt: new Date() },
    });

    if (!session) return { user: null };

    // Look up the user
    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.userId),
    });

    if (!user) return { user: null };

    const role = normalizeRole(user.role);
    return {
      user: {
        id: user._id.toString(),
        name: user.displayName || user.firstName || null,
        email: user.email || null,
        image: user.image || null,
        role,
      },
    };
  } catch {
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
 * Create a MongoDB session and return the session token.
 */
export async function createSession(userId: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN_MS);

  await db.collection("sessions").insertOne({
    token,
    userId,
    expiresAt,
    createdAt: new Date(),
  });

  return token;
}

/**
 * Destroy the current session and clear the cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;

  if (sessionToken) {
    try {
      const db = await getDb();
      if (db) {
        await db.collection("sessions").deleteOne({ token: sessionToken });
      }
    } catch { /* ignore */ }
  }

  cookieStore.delete("session");
}

// ── MongoDB Auth Helpers (replacing Firebase) ─────────

/**
 * Sign in with email/password using MongoDB.
 * Returns the user document on success, throws on failure.
 */
export async function signInWithMongo(
  email: string,
  password: string
): Promise<{ id: string; email: string; role: string; displayName: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const user = await db.collection("users").findOne({ email: email.toLowerCase() });
  if (!user) throw new Error("Invalid email or password");

  const passwordHash = user.passwordHash || user.password;
  if (!passwordHash) throw new Error("Invalid email or password");

  const valid = await verifyPassword(password, passwordHash);
  if (!valid) throw new Error("Invalid email or password");

  if (user.status === "disabled" || user.status === "inactive") {
    throw new Error("This account has been disabled");
  }

  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role || "employee",
    displayName: user.displayName || user.firstName || email,
  };
}

// ── Admin Session (unchanged) ─────────────────────────

export async function setAdminSessionCookie(token: string = "authenticated"): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

export async function isSubmittedAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("admin_session")?.value);
}
