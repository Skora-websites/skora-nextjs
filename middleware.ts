import { NextResponse, type NextRequest } from "next/server";

const protectedHrmsRoutes = [
  "/hrms/dashboard",
  "/hrms/superadmin",
  "/hrms/manager",
  "/hrms/employee",
  "/hrms/leads",
  "/hrms/customers",
  "/hrms/contacts",
  "/hrms/pipeline",
  "/hrms/tasks",
  "/hrms/tickets",
  "/hrms/employees",
  "/hrms/attendance",
  "/hrms/leaves",
  "/hrms/payroll",
  "/hrms/assets",
  "/hrms/holidays",
  "/hrms/documents",
  "/hrms/organization",
  "/hrms/settings",
  "/hrms/projects",
  "/hrms/recruitment",
  "/hrms/performance",
  "/hrms/onboarding",
  "/hrms/probation",
  "/hrms/exit",
  "/hrms/engage",
  "/hrms/analytics",
];

const hrmsAuthRoutes = ["/hrms/login", "/hrms/register", "/hrms/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ADMIN PORTAL ROUTE INTERCEPTION (Instant HTTP Redirects, No Loading Spinners)
  if (pathname === "/admin" || (pathname.startsWith("/admin/") && pathname !== "/admin/login")) {
    const hasAdminSession = request.cookies.has("admin_session");
    if (!hasAdminSession) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname === "/admin/login") {
    const hasAdminSession = request.cookies.has("admin_session");
    if (hasAdminSession) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // 2. HRMS PORTAL ROUTE PROTECTION
  const hasHrmsSession = request.cookies.has("session") || request.cookies.has("token");

  if (!hasHrmsSession) {
    const isProtected = protectedHrmsRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    if (isProtected) {
      const loginUrl = new URL("/hrms/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (hasHrmsSession) {
    const isAuthRoute = hrmsAuthRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    if (isAuthRoute) {
      return NextResponse.redirect(new URL("/hrms/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons/|images/|api/).*)",
  ],
};
