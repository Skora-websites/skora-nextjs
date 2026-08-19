import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getMongoClient } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const docType = (formData.get("type") as string) || "Verification Document";
    const userId = (formData.get("userId") as string) || "employee";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate clean filename
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}_${safeName}`;
    const filePath = path.join(uploadsDir, filename);

    // Write file to server disk
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";

    // Save metadata record in MongoDB Atlas
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db("skora_db");
        await db.collection("onboarding_documents").insertOne({
          userId,
          docType,
          originalName: file.name,
          storedName: filename,
          fileUrl: publicUrl,
          fileSize: fileSizeMB,
          mimeType: file.type,
          status: "DOCUMENT_VERIFICATION_PENDING",
          uploadedAt: new Date().toISOString(),
        });
      }
    } catch {
      // ignore fallback if offline
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: file.name,
      storedName: filename,
      fileSize: fileSizeMB,
      message: "File successfully saved to server disk & database",
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message || "Failed to upload file to server" }, { status: 500 });
  }
}
