import { NextRequest, NextResponse } from "next/server";
import { apiRoute, toISO } from "@/lib/api-utils";
import { tasksService } from "@/lib/firestore";
import { requirePermission, isErrorResponse, type ApiAuthResult } from "@/lib/api-auth";
import { PERMISSIONS } from "@/lib/rbac";
import { withErrorHandler, badRequest, notFound, created } from "@/lib/api-handler";

export const GET = apiRoute(
  async () => {
    const tasks = await tasksService.findMany({
      orderByField: "createdAt",
      orderByDirection: "desc",
      limitCount: 20,
    });

    return tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      assignee: "",
      dueDate: t.dueDate ? toISO(t.dueDate) : undefined,
      relatedTo: t.relatedTo,
      createdAt: toISO(t.createdAt),
    }));
  },
  { permission: "tasks.view" as const }
);

export const POST = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.TASKS_CREATE);
  if (isErrorResponse(auth)) return auth;
  const { userId } = auth as ApiAuthResult;

  const body = await request.json();

  if (!body.title) {
    return badRequest("Missing required field: title");
  }

  const task = await tasksService.create({
    title: body.title,
    description: body.description || null,
    status: body.status || "todo",
    priority: body.priority || "medium",
    assigneeId: body.assigneeId || userId,
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    relatedTo: body.relatedTo || null,
  });

  return created({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: "",
    dueDate: task.dueDate ? toISO(task.dueDate) : undefined,
    relatedTo: task.relatedTo,
    createdAt: toISO(task.createdAt),
    updatedAt: toISO(task.updatedAt),
  });
}, { label: "Tasks" });

export const PATCH = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.TASKS_EDIT);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return badRequest("id parameter required");
  }

  const body = await request.json();

  if (body.dueDate) {
    body.dueDate = new Date(body.dueDate);
  }

  const task = await tasksService.update(id, body);
  if (!task) {
    return notFound("Task not found");
  }

  return NextResponse.json({
    data: {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: "",
      dueDate: task.dueDate ? toISO(task.dueDate) : undefined,
      relatedTo: task.relatedTo,
      createdAt: toISO(task.createdAt),
      updatedAt: toISO(task.updatedAt),
    },
  });
}, { label: "Tasks" });

export const DELETE = withErrorHandler(async (request: NextRequest) => {
  const auth = await requirePermission(PERMISSIONS.TASKS_DELETE);
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return badRequest("id parameter required");
  }

  const deleted = await tasksService.delete(id);
  if (!deleted) {
    return notFound("Task not found");
  }

  return NextResponse.json({ success: true });
}, { label: "Tasks" });
