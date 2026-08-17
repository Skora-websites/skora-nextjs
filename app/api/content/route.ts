import { NextResponse } from "next/server";
import { getSiteContent, updateSiteContent, updateAdminPassword } from "@/lib/db";
import { isSubmittedAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const content = await getSiteContent();
    // Omit sensitive password hash in public responses
    const { adminPasswordHash, ...publicContent } = content;
    return NextResponse.json({ success: true, content: publicContent });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const isAuthenticated = await isSubmittedAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, email, healthcareEmail, address, responseGuarantee, packages, services, textOverrides, newPassword } = body;

    if (newPassword && newPassword.trim().length > 0) {
      await updateAdminPassword(newPassword.trim());
    }

    const updated = await updateSiteContent({
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      ...(healthcareEmail ? { healthcareEmail } : {}),
      ...(address ? { address } : {}),
      ...(responseGuarantee ? { responseGuarantee } : {}),
      ...(packages ? { packages } : {}),
      ...(services ? { services } : {}),
      ...(textOverrides ? { textOverrides } : {}),
    });

    const { adminPasswordHash, ...cleanContent } = updated;
    return NextResponse.json({ success: true, content: cleanContent });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}
