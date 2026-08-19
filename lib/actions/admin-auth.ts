"use server";

import { verifyAdminCredentials } from "@/lib/db";
import { setAdminSessionCookie } from "@/lib/auth";

export async function loginAdminAction(usernameInput: string, passwordInput: string) {
  try {
    const username = String(usernameInput || "").trim();
    const password = String(passwordInput || "").trim();

    if (!username || !password) {
      return { success: false, error: "Username and password are required." };
    }

    const isValid = await verifyAdminCredentials(username, password);
    if (!isValid) {
      return { success: false, error: "Invalid admin credentials." };
    }

    await setAdminSessionCookie();
    return { success: true };
  } catch (error) {
    console.error("Admin login error:", error);
    return { success: false, error: "Authentication failed. Please check database connection." };
  }
}
