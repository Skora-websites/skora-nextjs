import "server-only";
import { cookies } from "next/headers";

/**
 * Admin session — a single `admin_session` cookie.
 *
 * Both login paths (the /admin/login server action and POST /api/admin/login)
 * call `setAdminSessionCookie()`, and every admin API route reads it through
 * `isSubmittedAdminAuthenticated()`. Keep those three functions in step: the
 * previous codebase also carried a second, unused session system (`session`
 * cookie + `sessions` collection) whose routes read a cookie nothing ever
 * wrote, which is why a signed-in admin used to get 401s from the lead API.
 */

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
