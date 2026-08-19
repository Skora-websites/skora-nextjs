import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const client = await getMongoClient();
    if (!client) {
      return NextResponse.json({ success: true, documents: [] });
    }
    const db = client.db("skora_db");
    const docs = await db.collection("onboarding_documents").find({}).sort({ uploadedAt: -1 }).toArray();
    return NextResponse.json({ success: true, documents: docs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch documents" }, { status: 500 });
  }
}
