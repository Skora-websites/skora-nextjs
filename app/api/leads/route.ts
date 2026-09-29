import { NextRequest, NextResponse } from "next/server";
import { toISO } from "@/lib/api-utils";
import { leadsService, type FirestoreLead } from "@/lib/firestore";
import { isSubmittedAdminAuthenticated } from "@/lib/auth";
import { withErrorHandler, badRequest, created, notFound } from "@/lib/api-handler";

/**
 * CRM lead collection — admin only.
 *
 * Auth uses `isSubmittedAdminAuthenticated`, the same check as /api/leads/[id],
 * /api/posts and /api/admin/seo: it validates the `admin_session` cookie that
 * both login flows (the /admin/login server action and POST /api/admin/login)
 * actually set. The previous `requireAdmin()`/`apiRoute` helpers read a
 * different cookie that no login flow ever writes, so a signed-in admin was
 * always answered 401 here and leads submitted through the public forms never
 * appeared in the dashboard.
 *
 * Public submissions do NOT come through this file — they go to
 * POST /api/contact, which is validated and rate-limited separately.
 */

async function guardAdmin(): Promise<NextResponse | null> {
  if (await isSubmittedAdminAuthenticated()) return null;
  return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
}

/** One response shape for list, create and update. */
function serialize(lead: FirestoreLead) {
  return {
    id: lead.id,
    name: lead.name,
    company: lead.company,
    email: lead.email,
    phone: lead.phone || undefined,
    status: lead.status,
    source: lead.source,
    value: lead.value,
    owner: "",
    probability: lead.probability,
    notes: lead.notes,
    createdAt: toISO(lead.createdAt),
    updatedAt: toISO(lead.updatedAt),
  };
}

export async function GET() {
  const denied = await guardAdmin();
  if (denied) return denied;

  const leads = await leadsService.findMany({
    orderByField: "createdAt",
    orderByDirection: "desc",
  });

  return NextResponse.json(leads.map(serialize));
}

export const POST = withErrorHandler(
  async (request: NextRequest) => {
    const denied = await guardAdmin();
    if (denied) return denied;

    const body = await request.json();

    if (!body.name || !body.email || !body.company) {
      return badRequest("Missing required fields: name, email, company");
    }

    const lead = await leadsService.create({
      name: body.name,
      company: body.company,
      email: body.email,
      phone: body.phone || null,
      status: body.status || "new",
      source: body.source || "other",
      value: body.value || 0,
      probability: body.probability || 0,
      notes: body.notes || null,
      ownerId: "",
    });

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
    const lead = await leadsService.update(id, body);
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

    const deleted = await leadsService.delete(id);
    if (!deleted) {
      return notFound("Lead not found");
    }

    return NextResponse.json({ success: true });
  },
  { label: "Leads" }
);
