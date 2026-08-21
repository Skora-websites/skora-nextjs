import { NextRequest } from "next/server";
import { tenantsService, hrmUsersService } from "@/lib/hrm/firestore";
import { getAdminAuth } from "@/lib/firebase-admin";
import { requireSuperAdmin, isErrorResponse } from "@/lib/api-auth";
import { withErrorHandler, badRequest, created, ok, noContent } from "@/lib/api-handler";
import { normalizeRole } from "@/lib/rbac";

export const GET = withErrorHandler(async () => {
  const auth = await requireSuperAdmin();
  if (isErrorResponse(auth)) return auth;

  const tenants = await tenantsService.findMany({
    orderByField: "createdAt",
    orderByDirection: "desc",
  });

  return ok(tenants);
}, { label: "Tenants GET" });

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireSuperAdmin();
  if (isErrorResponse(auth)) return auth;

  const body = await request.json();
  const { name, domain, subscriptionTier, modulesEnabled, officeLatitude, officeLongitude, assignedHrAdmin } = body;

  if (!name || typeof name !== "string") {
    return badRequest("Company name is required");
  }

  // 1. Create the tenant in Firestore
  const tenant = await tenantsService.create({
    name: name.trim(),
    domain: domain || "",
    email: assignedHrAdmin || "",
    status: "active" as const,
    plan: subscriptionTier || "basic",
    subscriptionTier: subscriptionTier || "basic",
    isActive: true,
    modulesEnabled: modulesEnabled || { pms: true, ats: false, payroll: true },
    officeLatitude: officeLatitude != null ? Number(officeLatitude) : undefined,
    officeLongitude: officeLongitude != null ? Number(officeLongitude) : undefined,
    assignedHrAdmin: assignedHrAdmin || "",
  } as any);

  // 2. If an HR Admin email was provided, create their account and generate invite link
  let hrAdminInvite: { email: string; resetLink: string } | null = null;

  if (assignedHrAdmin && typeof assignedHrAdmin === "string" && assignedHrAdmin.includes("@")) {
    const hrEmail = assignedHrAdmin.trim().toLowerCase();
    try {
      // Check if user already exists in Firebase Auth
      let hrUser;
      try {
        hrUser = await getAdminAuth().getUserByEmail(hrEmail);
      } catch {
        // User doesn't exist — create them with a temporary password
        const tempPassword = generateTempPassword();
        hrUser = await getAdminAuth().createUser({
          email: hrEmail,
          password: tempPassword,
          displayName: hrEmail.split("@")[0],
        });

        // Create Firestore profile
        await hrmUsersService.createWithId(hrUser.uid, {
          email: hrEmail,
          displayName: hrEmail.split("@")[0],
          firstName: hrEmail.split("@")[0],
          lastName: "",
          role: "hr_admin",
          status: "active",
          loginStatus: "enabled",
          tenantId: tenant.id,
        } as any);
      }

      // Set custom claims
      await getAdminAuth().setCustomUserClaims(hrUser.uid, {
        role: "hr_admin",
        tenantId: tenant.id,
      });

      // Update Firestore role if needed
      const existingProfile = await hrmUsersService.findById(hrUser.uid);
      if (existingProfile) {
        if (normalizeRole(existingProfile.role) !== "hr_admin") {
          await hrmUsersService.update(hrUser.uid, { role: "hr_admin" } as any);
        }
      } else {
        await hrmUsersService.createWithId(hrUser.uid, {
          email: hrEmail,
          displayName: hrEmail.split("@")[0],
          firstName: hrEmail.split("@")[0],
          lastName: "",
          role: "hr_admin",
          status: "active",
          loginStatus: "enabled",
          tenantId: tenant.id,
        } as any);
      }

      // Generate password reset link so the HR Admin can set their own password
      const resetLink = await getAdminAuth().generatePasswordResetLink(hrEmail);
      hrAdminInvite = { email: hrEmail, resetLink };
    } catch (err) {
      console.error("Failed to create HR Admin account:", err);
      // Tenant was created but HR Admin setup failed — still return success with warning
    }
  }

  return created({ ...tenant, hrAdminInvite });
}, { label: "Tenants POST" });



export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireSuperAdmin();
  if (isErrorResponse(auth)) return auth;

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return badRequest("Tenant ID is required");
  }

  const updated = await tenantsService.update(id, updates as any);
  if (!updated) {
    return badRequest("Tenant not found");
  }

  return ok(updated);
}, { label: "Tenants PATCH" });

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requireSuperAdmin();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return badRequest("Tenant ID is required");
  }

  await tenantsService.delete(id);
  return noContent();
}, { label: "Tenants DELETE" });
/** Generate a random temporary password (12 chars, mixed) */
function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const special = "!@#$%&*";
  let password = "";
  // Ensure at least one uppercase, one lowercase, one digit, one special
  password += "A"; // uppercase
  password += "a"; // lowercase
  password += "3"; // digit
  password += "!"; // special
  for (let i = 4; i < 12; i++) {
    const allChars = chars + special;
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  // Shuffle
  return password.split("").sort(() => Math.random() - 0.5).join("");
}
