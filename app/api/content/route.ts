import { NextResponse } from "next/server";
import { getSiteContent, updateSiteContent } from "@/lib/db";
import { isSubmittedAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const content = await getSiteContent();
    // Omit sensitive password hash in public responses
    const { ...publicContent } = content;
    return NextResponse.json({ success: true, content: publicContent });
  } catch {
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
    // `packages` and `healthcareEmail` were dropped with the /healthcare
    // division — they are no longer part of SiteContent, so anything a stale
    // admin client still sends is simply ignored by the destructuring below.
    const { phone, email, address, responseGuarantee, services, textOverrides } = body;

    const updated = await updateSiteContent({
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      ...(address ? { address } : {}),
      ...(responseGuarantee ? { responseGuarantee } : {}),
      ...(services ? { services } : {}),
      ...(textOverrides ? { textOverrides } : {}),
    });

    const { ...cleanContent } = updated;
    return NextResponse.json({ success: true, content: cleanContent });
  } catch {
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}
