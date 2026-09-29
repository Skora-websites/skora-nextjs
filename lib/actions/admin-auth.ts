"use server";

import { getDb } from "@/lib/db/mongo-helper";
import bcrypt from "bcryptjs";
import { setAdminSessionCookie } from "@/lib/auth";

/**
 * Admin login — authenticates against the users collection.
 * Allows users with role 'super_admin' or 'admin'.
 * Uses bcrypt password verification.
 */
export async function loginAdminAction(usernameInput: string, passwordInput: string) {
  try {
    const username = String(usernameInput || "").trim();
    const password = String(passwordInput || "").trim();

    if (!username || !password) {
      return { success: false, error: "Username and password are required." };
    }

    const db = await getDb();
    if (!db) {
      return { success: false, error: "Database not available. Please try again." };
    }

    // Look up by email OR username — don't filter by tenantId since HRMS login doesn't either.
    // Collation makes the match case-insensitive so stored values like "adminskora" also work.
    const identifier = username.toLowerCase();
    const user = await db.collection("users").findOne(
      {
        $or: [{ email: identifier }, { username: identifier }],
      },
      { collation: { locale: "en", strength: 2 } }
    );

    if (!user) {
      // No username/role/collection-shape details in the log — only the outcome.
      console.warn("[Admin Auth] Login failed: no matching account");
      return { success: false, error: "Invalid credentials. No account found with this email." };
    }

    // Only allow super_admin or admin to access admin portal
    const role = (user.role || "").toLowerCase();
    if (role !== "super_admin" && role !== "admin") {
      console.warn("[Admin Auth] Login rejected: account role is not an admin role");
      return { success: false, error: `Access denied. Your role is '${role}'. Only admin and super_admin can access the admin portal.` };
    }

    // Check if account is active
    if (user.loginStatus === "disabled") {
      return { success: false, error: "Account is disabled. Contact administrator." };
    }

    // Verify password with bcrypt
    const passwordHash = user.passwordHash;
    if (!passwordHash) {
      console.warn("[Admin Auth] Login failed: account has no password hash");
      return { success: false, error: "Invalid credentials. Account has no password set." };
    }

    const isValid = await bcrypt.compare(password, passwordHash);
    if (!isValid) {
      console.warn("[Admin Auth] Login failed: password mismatch");
      return { success: false, error: "Invalid credentials." };
    }

    console.log("[Admin Auth] Login succeeded");
    await setAdminSessionCookie();
    return { success: true };
  } catch (error) {
    console.error("Admin login error:", error);
    return { success: false, error: "Authentication failed. Please check database connection." };
  }
}
