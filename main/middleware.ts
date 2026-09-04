import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

/**
 * Route-level RBAC for /hrms/*.
 *
 * Layouts hardcode the role passed to <HRMSSidebar> for UI purposes, but they
 * do NOT enforce it. This middleware is the first real enforcement gate.
 * Server actions under /hrms/* are the second gate (assertRole / withTenant).
 *
 * ponytail: cookie verification here is intentionally a fast-path that only
 * blocks OBVIOUSLY privileged routes from the wrong role. We cannot decrypt
 * the HMAC cookie without the secret, and we cannot re-read Mongo on edge
 * runtime. The authoritative check stays in the server action. Upgrade path:
 * move the secret to a JWT verifiable on edge (e.g. jose with HS256) and
 * re-validate role against Mongo via a `/api/_me` round-trip on every nav.
 */

function getSessionSecret(): string {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 16) return explicit;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set (>=16 chars) in production");
  }
  const seed = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "dev-only-hrms-session-secret";
  return crypto.createHash("sha256").update(String(seed)).digest("hex");
}

function verifyHrmsPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const expected = crypto
    .createHmac("sha256", getSessionSecret())
    .update(body)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const json = Buffer.from(body, "base64url").toString("utf-8");
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function readRole(req: NextRequest): { role: string; isAuthed: boolean } {
  const cookie = req.cookies.get("session")?.value;
  if (!cookie) return { role: "guest", isAuthed: false };
  if (cookie.startsWith("hrms_session_")) {
    const parsed = verifyHrmsPayload(cookie.replace("hrms_session_", ""));
    if (parsed && typeof parsed.role === "string") {
      return { role: String(parsed.role).toUpperCase(), isAuthed: true };
    }
    return { role: "guest", isAuthed: false };
  }
  // Firebase session cookies carry role in custom claims; we cannot decode
  // them on the edge without firebase-admin. Treat any non-HRMS cookie as
  // "unverified" and let the page-level action do the real check. The
  // /hrms/superadmin and /hrms/hr-admin routes still get the right
  // redirect because the page itself returns 403.
  return { role: "unknown", isAuthed: true };
}

const ALLOW: Record<string, string[]> = {
  "/hrms/superadmin": ["SUPER_ADMIN", "SUPERADMIN"],
  "/hrms/hr-admin": ["HR_ADMIN", "HRADMIN", "SUPER_ADMIN", "SUPERADMIN"],
  "/hrms/manager": ["MANAGER", "HR_ADMIN", "HRADMIN", "SUPER_ADMIN", "SUPERADMIN"],
  "/hrms/employee": [
    "EMPLOYEE",
    "MANAGER",
    "HR_ADMIN",
    "HRADMIN",
    "SUPER_ADMIN",
    "SUPERADMIN",
  ],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = "/" + (pathname.split("/").slice(1, 3).join("/"));
  const allowed = ALLOW[seg];
  if (!allowed) return NextResponse.next();

  const { role, isAuthed } = readRole(req);
  if (!isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = "/hrms/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  if (role === "unknown") {
    // Firebase cookie — let the page check; just don't redirect.
    return NextResponse.next();
  }
  if (!allowed.includes(role)) {
    const url = req.nextUrl.clone();
    url.pathname = "/hrms";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/hrms/superadmin/:path*", "/hrms/hr-admin/:path*", "/hrms/manager/:path*", "/hrms/employee/:path*"],
};
