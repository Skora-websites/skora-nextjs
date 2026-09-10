import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isAdminRole } from "@/lib/rbac";

// ── Types ───────────────────────────────────────────────

type ApiHandler<T> = (context: { userId: string; role: string }) => Promise<T>;

interface ApiRouteOptions {
  /** Require authentication. Default true. */
  requireAuth?: boolean;
  /** When set, the caller must hold an admin role to access this route. */
  adminOnly?: boolean;
}

// ── Route Wrapper ───────────────────────────────────────

/**
 * Wraps an API route handler with authentication and error handling.
 *
 * Usage:
 * ```ts
 * export const GET = apiRoute(async () => {
 *   const leads = await leadsService.findMany();
 *   return leads;
 * });
 *
 * // Admin-only route:
 * export const POST = apiRoute(
 *   async () => { ... },
 *   { adminOnly: true }
 * );
 * ```
 */
export function apiRoute<T>(
  handler: ApiHandler<T>,
  options: ApiRouteOptions = {}
) {
  const { requireAuth = true, adminOnly = false } = options;

  return async function () {
    try {
      let userId = "";
      let role = "";

      if (requireAuth) {
        const session = await auth();
        if (!session.user) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
          );
        }
        userId = session.user.id;
        role = session.user.role;

        if (adminOnly && !isAdminRole(role)) {
          return NextResponse.json(
            { error: "Forbidden: admin access required" },
            { status: 403 }
          );
        }
      }

      const data = await handler({ userId, role });
      return NextResponse.json(data);
    } catch (error) {
      console.error("API Error:", error);
      const message =
        error instanceof Error ? error.message : "Internal server error";
      return NextResponse.json(
        { error: message },
        { status: 500 }
      );
    }
  };
}

// ── Data Serialization Helpers ──────────────────────────

/**
 * Convert a Firestore Date to ISO string, with a fallback.
 */
export function toISO(
  date: Date | undefined | null,
  fallback?: string
): string {
  return date?.toISOString() ?? fallback ?? new Date().toISOString();
}

/**
 * Create a standard success response.
 */
export function successResponse(data: unknown) {
  return NextResponse.json(data);
}
