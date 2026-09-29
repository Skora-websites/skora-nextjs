import { NextRequest, NextResponse } from "next/server";
import { createLead, deleteLead, getLeads, updateLeadStatus, type Lead } from "@/lib/db";
import { isSubmittedAdminAuthenticated } from "@/lib/auth";
import { withErrorHandler, badRequest, created, notFound } from "@/lib/api-handler";

/**
 * Lead list + create — admin only.
 *
 * Auth uses `isSubmittedAdminAuthenticated`, the same check as /api/leads/[id],
 * /api/posts and /api/admin/seo: it validates the `admin_session` cookie that
 * both login flows (the /admin/login server action and POST /api/admin/login)
 * actually set. An earlier wrapper authenticated against a different session
 * that no login flow ever writes, so a signed-in admin was always answered
 * 401 here and leads submitted through the public forms never appeared in the
 * dashboard.
 *
 * Public submissions do NOT come through this file — they go to
 * POST /api/contact, which is validated and rate-limited separately.
 * Updates and deletes live on /api/leads/[id].
 */

async function guardAdmin(): Promise<NextResponse | null> {
  if (await isSubmittedAdminAuthenticated()) return null;
  return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
}

/** One response shape for list and create — matches `lib/lead.ts`. */
function serialize(lead: Lead) {
  return {
    id: lead.id,
    fullName: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    service: lead.service,
    budget: lead.budget,
    message: lead.message,
    status: lead.status,
    source: lead.source,
    createdAt: lead.createdAt,
  };
}

export async function GET() {
  const denied = await guardAdmin();
  if (denied) return denied;

  const leads = await getLeads();
  return NextResponse.json({ leads: leads.map(serialize) });
}

export const POST = withErrorHandler(
  async (request: NextRequest) => {
    const denied = await guardAdmin();
    if (denied) return denied;

    const body = await request.json();

    if (!body.fullName || !body.email) {
      return badRequest("Missing required fields: fullName, email");
    }

    const lead = await createLead({
      fullName: String(body.fullName),
      email: String(body.email),
      phone: String(body.phone || ""),
      company: body.company ? String(body.company) : undefined,
      service: String(body.service || ""),
      budget: body.budget ? String(body.budget) : undefined,
      message: String(body.message || ""),
      source: String(body.source || "Admin dashboard"),
    });

    if (body.status && body.status !== lead.status) {
      const updated = await updateLeadStatus(lead.id, body.status);
      return created(serialize(updated ?? lead));
    }

    return created(serialize(lead));
  },
  { label: "Leads" }
);

export const PATCH = withErrorHandler(
  async (request: NextRequest) => {
    const denied = await guardAdmin();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return badRequest("id parameter required");
    }

    const body = await request.json();
    if (!body.status) {
      return badRequest("status field required");
    }

    const lead = await updateLeadStatus(id, body.status);
    if (!lead) {
      return notFound("Lead not found");
    }

    return NextResponse.json({ data: serialize(lead) });
  },
  { label: "Leads" }
);

export const DELETE = withErrorHandler(
  async (request: NextRequest) => {
    const denied = await guardAdmin();
    if (denied) return denied;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return badRequest("id parameter required");
    }

    const deleted = await deleteLead(id);
    if (!deleted) {
      return notFound("Lead not found");
    }

    return NextResponse.json({ success: true });
  },
  { label: "Leads" }
);
