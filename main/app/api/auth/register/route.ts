import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_OPTIONS, SESSION_EXPIRES_IN_MS, signHrmsPayload } from "@/lib/auth";
import { withErrorHandler, badRequest } from "@/lib/api-handler";
import { connectDB } from "@/lib/db/db";
import { User } from "@/lib/db/models";
import { hashPassword, rateLimit } from "@/lib/security";

function getRoleRedirect(roleStr: string): string {
  const norm = roleStr.toUpperCase();
  if (norm === 'SUPER_ADMIN' || norm === 'SUPERADMIN' || norm === 'SUPER_ADMINISTRATOR') {
    return '/hrms/superadmin';
  }
  if (norm === 'HR_ADMIN' || norm === 'HRADMIN' || norm === 'ADMIN') {
    return '/hrms/hr-admin';
  }
  if (norm === 'MANAGER') {
    return '/hrms/manager';
  }
  return '/hrms/employee';
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = rateLimit(`register:${ip}`, 3, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } }
    );
  }

  const body = await request.json();
  // SECURITY: role is intentionally NOT read from body. Server decides.
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return badRequest("Name, email, and password are required");
  }
  if (String(password).length < 8) {
    return badRequest("Password must be at least 8 characters");
  }
  // SECURITY: minimum complexity (letter + number) so a 8-char all-letter
  // password is not allowed.
  if (!/[a-zA-Z]/.test(String(password)) || !/[0-9]/.test(String(password))) {
    return badRequest("Password must contain at least one letter and one number");
  }
  // SECURITY: per-email rate limit (in addition to per-IP) to slow bulk
  // account creation targeting specific addresses.
  const emailRl = rateLimit(`register:email:${String(email).toLowerCase().trim()}`, 3, 60_000);
  if (!emailRl.allowed) {
    return NextResponse.json(
      { error: "Too many registration attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(emailRl.resetMs / 1000)) } }
    );
  }

  await connectDB();
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return badRequest("An account with this email already exists");
  }

  const existingUsersCount = await User.countDocuments();
  // SECURITY: the first-user-becomes-SUPER_ADMIN bootstrap is opt-in via env
  // in production. In dev/test we keep the previous behaviour so local
  // bootstrapping still works. This prevents a public-internet attacker from
  // registering themselves as SUPER_ADMIN by simply being first.
  const allowBootstrap = process.env.REGISTER_BOOTSTRAP_SUPERADMIN === "1";
  const isFirstUser = existingUsersCount === 0;
  const role = (isFirstUser && allowBootstrap) ? "SUPER_ADMIN" : "EMPLOYEE";

  const newUser = await User.create({
    name,
    email: normalizedEmail,
    password: hashPassword(String(password)),
    role,
    department: role === 'SUPER_ADMIN' ? 'Executive Board' : 'General',
    onboardingStatus: 'VERIFIED',
    baseSalary: 0,
    createdAt: new Date()
  });

  const sessionPayload = {
    id: String(newUser._id),
    email: newUser.email,
    name: newUser.name,
    role: newUser.role
  };
  const sessionCookie = `hrms_session_${signHrmsPayload(sessionPayload)}`;
  const redirectUrl = getRoleRedirect(newUser.role);

  const response = NextResponse.json({
    success: true,
    message: "Account registered successfully",
    role: newUser.role,
    redirectUrl,
    // SECURITY: do not echo the full user document (which contains the
    // password hash). Only return the fields the client needs.
    user: {
      id: String(newUser._id),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  }, { status: 201 });

  response.cookies.set("session", sessionCookie, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  return response;
}, { label: "Register" });
