import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "skora_admin_session";
const ADMIN_SECRET_TOKEN = "skora_enterprise_authenticated_admin_session_v1";

export async function isSubmittedAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
    return sessionCookie?.value === ADMIN_SECRET_TOKEN;
  } catch (error) {
    return false;
  }
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, ADMIN_SECRET_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 Days Session
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
