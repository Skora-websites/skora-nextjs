import { NextResponse } from "next/server";
import { getTenants, createTenant } from "@/lib/db/tenants";

export async function GET() {
  try {
    const tenants = await getTenants();
    return NextResponse.json({ tenants });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const tenant = await createTenant(body);
    return NextResponse.json({ tenant }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
