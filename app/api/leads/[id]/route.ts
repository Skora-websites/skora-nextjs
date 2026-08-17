import { NextResponse } from "next/server";
import { updateLeadStatus, deleteLead } from "@/lib/db";
import { isSubmittedAdminAuthenticated } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await isSubmittedAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status field is required" }, { status: 400 });
    }

    const updatedLead = await updateLeadStatus(id, status);
    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update lead status" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAuthenticated = await isSubmittedAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { id } = await params;
    const success = await deleteLead(id);
    if (!success) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
