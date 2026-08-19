import { NextRequest, NextResponse } from "next/server";
import { apiRoute, toISO } from "@/lib/api-utils";
import { activitiesService } from "@/lib/firestore";
import { requirePermission, isErrorResponse, type ApiAuthResult } from "@/lib/api-auth";
import { PERMISSIONS } from "@/lib/rbac";
import { withErrorHandler, badRequest, notFound, created } from "@/lib/api-handler";

export const GET = apiRoute(
  async () => {
    const activities = await activitiesService.findMany({
      orderByField: "createdAt",
      orderByDirection: "desc",
      limitCount: 50,
    });

    return activities.map((a) => ({
      id: a.id,
      type: a.type,
      title: a.title,
      description: a.description || "",
      user: "",
      relatedTo: a.relatedTo || undefined,
      relatedType: a.relatedType as "lead" | "customer" | "contact" | "deal" | undefined,
      createdAt: toISO(a.createdAt),
    }));
  },
  { permission: "activities.view" as const }
);

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.ACTIVITIES_CREATE);
  if (isErrorResponse(auth)) return auth;
  const { userId } = auth as ApiAuthResult;

  const body = await request.json();

  if (!body.type || !body.title) {
    return badRequest("Missing required fields: type, title");
  }

  const activity = await activitiesService.create({
    type: body.type,
    title: body.title,
    description: body.description || null,
    userId: userId,
    relatedTo: body.relatedTo || null,
    relatedType: body.relatedType || null,
  });

  return created({
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: activity.description || "",
    user: "",
    relatedTo: activity.relatedTo || undefined,
    relatedType: activity.relatedType as "lead" | "customer" | "contact" | "deal" | undefined,
    createdAt: toISO(activity.createdAt),
  });
}, { label: "Activities" });

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.ACTIVITIES_EDIT);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return badRequest("id parameter required");
  }

  const body = await request.json();
  const activity = await activitiesService.update(id, body);
  if (!activity) {
    return notFound("Activity not found");
  }

  return NextResponse.json({
    data: {
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description || "",
      user: "",
      relatedTo: activity.relatedTo || undefined,
      relatedType: activity.relatedType as "lead" | "customer" | "contact" | "deal" | undefined,
      createdAt: toISO(activity.createdAt),
    },
  });
}, { label: "Activities" });

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.ACTIVITIES_DELETE);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return badRequest("id parameter required");
  }

  const deleted = await activitiesService.delete(id);
  if (!deleted) {
    return notFound("Activity not found");
  }

  return NextResponse.json({ success: true });
}, { label: "Activities" });
