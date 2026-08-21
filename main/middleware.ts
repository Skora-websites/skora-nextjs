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

// ── Middleware ─────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie (lightweight; full verification happens server-side)
  const hasSession = request.cookies.has("session") || request.cookies.has("token");

  // Redirect unauthenticated users away from protected role routes
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

  // Redirect authenticated users away from auth pages to their dashboard
  if (hasSession) {
    const isAuthRoute = authRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/hrms", request.url));
    }
  }

  // Redirect legacy /dashboard to /hrms
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/hrms", request.url));
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
