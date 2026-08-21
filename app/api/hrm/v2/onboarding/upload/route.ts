import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage, getAdminDb, isFirebaseConfigured } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    if (!isFirebaseConfigured()) {
      return NextResponse.json({ error: "Firebase is not configured" }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const userId = formData.get("userId") as string || "unknown";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Allowed: PDF, PNG, JPG, DOC, DOCX" }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum size: 10MB" }, { status: 400 });
    }

    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const timestamp = Date.now();
    const fileName = `onboarding/${userId}/${timestamp}_${file.name}`;
    const fileRef = bucket.file(fileName);

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Firebase Storage
    await fileRef.save(buffer, {
      contentType: file.type,
      metadata: {
        firebaseStorageDownloadTokens: `${userId}_${timestamp}`,
      },
    });

    // Get download URL
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "2030-01-01",
    });

    // Save metadata to Firestore
    const db = getAdminDb();
    await db.collection("onboardingDocuments").add({
      userId,
      fileName: file.name,
      fileUrl: url,
      storagePath: fileName,
      fileSize: file.size,
      mimeType: file.type,
      status: "pending",
      uploadedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        fileName: file.name,
        fileUrl: url,
        storagePath: fileName,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Upload failed" },
      { status: 500 }
    );
  }
}
