import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Route Lists ────────────────────────────────────────

const protectedRoutes = [
  "/superadmin",
  "/hr-admin",
  "/manager",
  "/employee",
  "/hrms/superadmin",
  "/hrms/hr-admin",
  "/hrms/manager",
  "/hrms/employee",
  "/dashboard",
];

const authRoutes = ["/login", "/register", "/forgot-password", "/hrms/login"];

// ── Role-gated routes ──────────────────────────────────
// key = prefix, value = roles allowed.
const roleGatedPrefixes: Array<{
  prefix: string;
  allowed: ("SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE")[];
}> = [
  { prefix: "/hrms/superadmin", allowed: ["SUPER_ADMIN"] },
  { prefix: "/superadmin", allowed: ["SUPER_ADMIN"] },
  { prefix: "/hrms/hr-admin", allowed: ["HR_ADMIN", "SUPER_ADMIN"] },
  { prefix: "/hr-admin", allowed: ["HR_ADMIN", "SUPER_ADMIN"] },
  { prefix: "/hrms/manager", allowed: ["MANAGER", "HR_ADMIN", "SUPER_ADMIN"] },
  { prefix: "/manager", allowed: ["MANAGER", "HR_ADMIN", "SUPER_ADMIN"] },
  { prefix: "/hrms/employee", allowed: ["EMPLOYEE", "MANAGER", "HR_ADMIN", "SUPER_ADMIN"] },
  { prefix: "/employee", allowed: ["EMPLOYEE", "MANAGER", "HR_ADMIN", "SUPER_ADMIN"] },
];

// ── Signed-cookie helpers (HMAC-SHA256, Web-Crypto for Edge runtime) ────────
function getSessionSecret(): string {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 16) return explicit;
  // SECURITY: production must explicitly set SESSION_SECRET; never derive.
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set (>=16 chars) in production.");
  }
  const seed = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "dev-only-hrms-session-secret";
  // Dev-only: must match the Node-side fallback in lib/auth.ts (sha256(seed) hex).
  // The Edge runtime cannot use createHash synchronously, but we only need the
  // value when `crypto.subtle.importKey` runs (async), so we await it lazily.
  return seed; // resolved by `resolveSessionSecret()` before HMAC.
}

let devSecretCache: string | null = null;
async function resolveSessionSecret(): Promise<string> {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 16) return explicit;
  const seed = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "dev-only-hrms-session-secret";
  if (devSecretCache) return devSecretCache;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));
  devSecretCache = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return devSecretCache;
}

function b64urlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToB64url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmacSha256(keyStr: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(keyStr),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

async function verifyHrmsCookie(value: string): Promise<{ role: string; tenantId?: string } | null> {
  if (!value.startsWith("hrms_session_")) return null;
  const token = value.slice("hrms_session_".length);
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  let expected: Uint8Array;
  let sigBytes: Uint8Array;
  try {
    expected = await hmacSha256(await resolveSessionSecret(), body);
    sigBytes = b64urlToBytes(sig);
  } catch {
    return null;
  }
  if (!timingSafeEqualBytes(expected, sigBytes)) return null;
  try {
    const json = new TextDecoder().decode(b64urlToBytes(body));
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== "object") return null;
    return { role: String(parsed.role || ""), tenantId: parsed.tenantId as string | undefined };
  } catch {
    return null;
  }
}

function pathMatches(path: string, prefix: string): boolean {
  return path === prefix || path.startsWith(prefix + "/");
}

// ── Middleware ─────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("session") || request.cookies.has("token");

  // Unauthenticated users away from protected role routes
  if (!hasSession) {
    const isProtected = protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    if (isProtected) {
      const loginUrl = new URL("/hrms/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Authenticated users away from auth pages
  if (hasSession) {
    const isAuthRoute = authRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/hrms", request.url));
    }
  }

  // Role-gated: only allow if user role matches.
  // SECURITY: we only trust the role when it comes from a verified HMAC-signed
  // HRMS cookie. The Firebase cookie is a JWT whose payload is *unverified* in
  // the edge runtime (Admin SDK can't run here), so we refuse to read the role
  // from it. Instead we let the server-side route handler perform real authz.
  if (hasSession) {
    for (const gate of roleGatedPrefixes) {
      if (pathMatches(pathname, gate.prefix)) {
        const verified = request.cookies.get("session")?.value || "";
        const v = verified.startsWith("hrms_session_")
          ? await verifyHrmsCookie(verified)
          : null;
        const role = v?.role;
        if (!role || !gate.allowed.includes(role as "SUPER_ADMIN" | "HR_ADMIN" | "MANAGER" | "EMPLOYEE")) {
          return NextResponse.redirect(new URL("/access-denied", request.url));
        }
        break;
      }
    }
  }

  // Legacy /dashboard -> /hrms
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/hrms", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // SECURITY: the `uploads/` exclusion is for static asset paths ONLY (if
  // any are ever introduced). All real file access MUST go through
  // /api/uploads/* which performs its own auth + signed-URL issuance.
  // Never serve bucket objects from this prefix without auth.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|api/|uploads/).*)",
  ],
};
