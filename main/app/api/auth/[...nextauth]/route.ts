import { NextResponse } from "next/server";

/**
 * Compatibility stub for the legacy NextAuth mount point.
 *
 * Real auth lives in /api/auth/session. A few older clients may still hit
 * the NextAuth path; route them to the live endpoint via 308 (permanent
 * redirect) so HTTP method + body are preserved.
 */
function redirectToSession(req: Request) {
  return NextResponse.redirect(new URL("/api/auth/session", req.url), 308);
}

export async function GET(req: Request) {
  return redirectToSession(req);
}

export async function POST(req: Request) {
  return redirectToSession(req);
}

export async function DELETE(req: Request) {
  return redirectToSession(req);
}
