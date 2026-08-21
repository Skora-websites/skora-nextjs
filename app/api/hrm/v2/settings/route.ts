import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, isFirebaseConfigured } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured()) {
      return NextResponse.json({ error: "Firebase is not configured" }, { status: 503 });
    }

    const body = await request.json();
    const { role, userId, settings } = body;

    if (!role || !settings) {
      return NextResponse.json({ error: "Missing role or settings" }, { status: 400 });
    }

    const db = getAdminDb();

    // Save settings to Firestore, keyed by role and optional userId
    const docId = userId ? `${role}_${userId}` : role;
    await db.collection("settings").doc(docId).set(
      {
        role,
        userId: userId || null,
        settings,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Save failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!isFirebaseConfigured()) {
      return NextResponse.json({ error: "Firebase is not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const userId = searchParams.get("userId");

    if (!role) {
      return NextResponse.json({ error: "Missing role parameter" }, { status: 400 });
    }

    const db = getAdminDb();
    const docId = userId ? `${role}_${userId}` : role;
    const doc = await db.collection("settings").doc(docId).get();

    if (!doc.exists) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: doc.data()?.settings || null });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Fetch failed" },
      { status: 500 }
    );
  }
}
