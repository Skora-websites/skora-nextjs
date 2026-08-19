import { NextResponse } from "next/server";
import { getProjects, createProject } from "@/lib/db/projects";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get("tenantId") || undefined;
    const managerId = searchParams.get("managerId") || undefined;

    const projects = await getProjects(tenantId, managerId);
    return NextResponse.json({ projects });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const project = await createProject(body);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
