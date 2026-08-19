import { NextRequest, NextResponse } from "next/server";
import {
  getSettings,
  getSetting,
  setSetting,
  getTranslations,
  setTranslation,
  getSupportTickets,
  createSupportTicket,
  updateSupportTicket,
} from "@/services/hrm/settings";
import { resolveTenantFromOrigin } from "@/services/hrm/tenant";
import { requireAuth, requireAdmin, isErrorResponse } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isErrorResponse(auth)) return auth;

    const origin = request.headers.get("origin");
    const tenantCtx = await resolveTenantFromOrigin(origin);
    const tenantId = tenantCtx?.tenantId || "default";

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const category = searchParams.get("category");
    const type = searchParams.get("type");

    if (type === "translations") {
      const languageId = searchParams.get("languageId") || undefined;
      const translations = await getTranslations(tenantId, languageId);
      return NextResponse.json({ data: translations });
    }

    if (type === "support") {
      const status = searchParams.get("status") as any || undefined;
      const tickets = await getSupportTickets(tenantId, status);
      return NextResponse.json({ data: tickets });
    }

    if (key) {
      const setting = await getSetting(tenantId, key);
      return NextResponse.json({ data: setting });
    }

    const settings = await getSettings(tenantId, category as any || undefined);
    return NextResponse.json({ data: settings });
  } catch (error: any) {
    console.error("GET /api/hrm/v2/settings error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isErrorResponse(auth)) return auth;

    const origin = request.headers.get("origin");
    const tenantCtx = await resolveTenantFromOrigin(origin);
    const tenantId = tenantCtx?.tenantId || "default";

    const body = await request.json();
    const action = body.action;

    let result;

    if (action === "set") {
      result = await setSetting(tenantId, body.key, body.value, body.type, body.category);
    } else if (action === "translation") {
      result = await setTranslation(body);
    } else if (action === "support") {
      result = await createSupportTicket(tenantId, body);
    } else {
      return NextResponse.json({ error: "Invalid action. Use: set, translation, support" }, { status: 400 });
    }

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/hrm/v2/settings error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
