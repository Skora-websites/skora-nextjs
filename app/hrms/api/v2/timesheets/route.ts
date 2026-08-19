import { NextResponse } from "next/server";
import { getTimesheets, createTimesheet } from "@/lib/db/timesheets";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const status = (searchParams.get("status") as any) || undefined;
    const tenantId = searchParams.get("tenantId") || undefined;

    const timesheets = await getTimesheets({ userId, projectId, status, tenantId });
    return NextResponse.json({ timesheets });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const timesheet = await createTimesheet(body);
    return NextResponse.json({ timesheet }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
