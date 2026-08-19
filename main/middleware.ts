import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Route Lists ────────────────────────────────────────

const protectedRoutes = [
  "/dashboard",
  "/leads",
  "/customers",
  "/contacts",
  "/pipeline",
  "/tasks",
  "/tickets",
  "/employees",
  "/attendance",
  "/leaves",
  "/payroll",
  "/assets",
  "/holidays",
  "/documents",
  "/organization",
  "/settings",
  "/projects",
  "/recruitment",
  "/performance",
  "/onboarding",
  "/probation",
  "/exit",
  "/engage",
  "/analytics",
];

const authRoutes = ["/login", "/register", "/forgot-password"];

// ── Middleware ─────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie (lightweight; full verification happens server-side)
  const hasSession = request.cookies.has("session") || request.cookies.has("token");

  // Redirect unauthenticated users away from protected routes
  if (!hasSession) {
    const isProtected = protectedRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    if (isProtected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (hasSession) {
    const isAuthRoute = authRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    if (isAuthRoute || pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

// ── Config ─────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons/ (app icons)
     * - images/ (public images)
     * - api/ (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|api/).*)",
  ],
};
