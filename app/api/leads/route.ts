import { NextResponse } from "next/server";
import { getLeads, createLead } from "@/lib/db";
import { isSubmittedAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const isAuthenticated = await isSubmittedAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const leads = await getLeads();
    return NextResponse.json({ success: true, leads });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, phone, company, service, budget, message, source } = body;

    if (!fullName || !email || !phone) {
      return NextResponse.json({ error: "Full Name, Email, and Phone are required." }, { status: 400 });
    }

    const newLead = await createLead({
      fullName,
      email,
      phone,
      company: company || "Individual Inquiry",
      service: service || "General Strategy Consultation",
      budget: budget || "Need Guidance",
      message: message || "Requested consultation details via SKORA portal.",
      source: source || "Website Lead Form",
    });

    return NextResponse.json({ success: true, lead: newLead }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to process lead submission" }, { status: 500 });
  }
}
