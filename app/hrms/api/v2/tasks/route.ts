import { NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/db/tasks";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;
    const assigneeId = searchParams.get("assigneeId") || undefined;
    const tenantId = searchParams.get("tenantId") || undefined;

    const tasks = await getTasks({ projectId, assigneeId, tenantId });
    return NextResponse.json({ tasks });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const task = await createTask(body);
    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
