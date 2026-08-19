import { NextRequest, NextResponse } from "next/server";
import { apiRoute, toISO } from "@/lib/api-utils";
import { dealsService } from "@/lib/firestore";
import { requirePermission, isErrorResponse, type ApiAuthResult } from "@/lib/api-auth";
import { PERMISSIONS } from "@/lib/rbac";
import { withErrorHandler, badRequest, notFound, created } from "@/lib/api-handler";

export const GET = apiRoute(
  async () => {
    const deals = await dealsService.findMany({
      orderByField: "createdAt",
      orderByDirection: "desc",
    });

    return deals.map((d) => ({
      id: d.id,
      title: d.title,
      company: d.company,
      value: d.value,
      stage: d.stage,
      probability: d.probability,
      owner: "",
      closeDate: d.closeDate ? toISO(d.closeDate) : undefined,
      notes: d.notes,
      createdAt: toISO(d.createdAt),
    }));
  },
  { permission: "deals.view" as const }
);

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.DEALS_CREATE);
  if (isErrorResponse(auth)) return auth;
  const { userId } = auth as ApiAuthResult;

  const body = await request.json();

  if (!body.title || !body.company) {
    return badRequest("Missing required fields: title, company");
  }

  const deal = await dealsService.create({
    title: body.title,
    company: body.company,
    value: body.value || 0,
    stage: body.stage || "lead",
    probability: body.probability || 0,
    notes: body.notes || null,
    ownerId: userId,
    closeDate: body.closeDate ? new Date(body.closeDate) : undefined,
  });

  return created({
    id: deal.id,
    title: deal.title,
    company: deal.company,
    value: deal.value,
    stage: deal.stage,
    probability: deal.probability,
    owner: "",
    closeDate: deal.closeDate ? toISO(deal.closeDate) : undefined,
    notes: deal.notes,
    createdAt: toISO(deal.createdAt),
    updatedAt: toISO(deal.updatedAt),
  });
}, { label: "Deals" });

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.DEALS_EDIT);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return badRequest("id parameter required");
  }

  const body = await request.json();

  if (body.closeDate) {
    body.closeDate = new Date(body.closeDate);
  }

  const deal = await dealsService.update(id, body);
  if (!deal) {
    return notFound("Deal not found");
  }

  return NextResponse.json({
    data: {
      id: deal.id,
      title: deal.title,
      company: deal.company,
      value: deal.value,
      stage: deal.stage,
      probability: deal.probability,
      owner: "",
      closeDate: deal.closeDate ? toISO(deal.closeDate) : undefined,
      notes: deal.notes,
      createdAt: toISO(deal.createdAt),
      updatedAt: toISO(deal.updatedAt),
    },
  });
}, { label: "Deals" });

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.DEALS_DELETE);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return badRequest("id parameter required");
  }

  const deleted = await dealsService.delete(id);
  if (!deleted) {
    return notFound("Deal not found");
  }

  return NextResponse.json({ success: true });
}, { label: "Deals" });
