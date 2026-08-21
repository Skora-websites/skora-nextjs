import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_OPTIONS, SESSION_EXPIRES_IN_MS } from "@/lib/auth";
import { withErrorHandler, badRequest } from "@/lib/api-handler";
import { connectDB } from "@/lib/db/db";
import { User } from "@/lib/db/models";

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
  const body = await request.json();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return badRequest("Name, email, and password are required");
  }

  await connectDB();
  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return badRequest("An account with this email already exists");
  }

  const existingUsersCount = await User.countDocuments();
  // First user to register in the system is always SUPER_ADMIN!
  const role = existingUsersCount === 0 ? 'SUPER_ADMIN' : (body.role || 'SUPER_ADMIN');

  const newUser = await User.create({
    name,
    email: normalizedEmail,
    password,
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
  const sessionCookie = `hrms_session_${Buffer.from(JSON.stringify(sessionPayload)).toString('base64')}`;
  const redirectUrl = getRoleRedirect(newUser.role);

  const response = NextResponse.json({
    success: true,
    message: "Account registered successfully",
    role: newUser.role,
    redirectUrl,
    user: {
      id: String(newUser._id),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  }, { status: 201 });

  response.cookies.set("session", sessionCookie, {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: SESSION_EXPIRES_IN_MS / 1000,
  });

  return response;
}, { label: "Register" });
