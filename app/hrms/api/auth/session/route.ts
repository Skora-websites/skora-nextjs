import { NextRequest, NextResponse } from "next/server";
import { createSession, destroySession, auth, SESSION_COOKIE_OPTIONS, SESSION_EXPIRES_IN_MS } from "@/lib/auth";
import { withErrorHandler, badRequest } from "@/lib/api-handler";

export async function GET() {
  const session = await auth();
  if (!session.user) {
    // Return 200 with null user so client-side AuthProvider can distinguish
    // "not logged in" from "server error"
    return NextResponse.json({ user: null });
  }
  return NextResponse.json(session);
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const body = await request.json();
  const { idToken } = body;

  if (!idToken || typeof idToken !== "string") {
    return badRequest("idToken is required");
  }

  const sessionCookie = await createSession(idToken);

  const response = NextResponse.json({ success: true });
  response.cookies.set("session", sessionCookie, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  return response;
}, { label: "Session" });

export async function DELETE() {
  await destroySession();

  const response = NextResponse.json({ success: true });
  response.cookies.delete("session");
  return response;
}
