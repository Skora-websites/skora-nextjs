import { NextRequest, NextResponse } from "next/server";
import { apiRoute, toISO } from "@/lib/api-utils";
import { leadsService } from "@/lib/firestore";
import { requirePermission, isErrorResponse, type ApiAuthResult } from "@/lib/api-auth";
import { PERMISSIONS } from "@/lib/rbac";
import { withErrorHandler, badRequest, notFound, created } from "@/lib/api-handler";

export const GET = apiRoute(
  async () => {
    const leads = await leadsService.findMany({
      orderByField: "createdAt",
      orderByDirection: "desc",
    });

    return leads.map((lead) => ({
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
    }));
  },
  { permission: "leads.view" as const }
);

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.LEADS_CREATE);
  if (isErrorResponse(auth)) return auth;
  const { userId } = auth as ApiAuthResult;

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
    ownerId: userId,
  });

  return created({
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
  });
}, { label: "Leads" });

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.LEADS_EDIT);
  if (isErrorResponse(auth)) return auth;

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

  return NextResponse.json({
    data: {
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
    },
  });
}, { label: "Leads" });

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.LEADS_DELETE);
  if (isErrorResponse(auth)) return auth;

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
}, { label: "Leads" });
