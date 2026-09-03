import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/api-auth";
import { getDb } from "@/lib/db/mongo-helper";
import crypto from "crypto";

/**
 * GET /api/hrm/v2/offer-letters/download?id=xxx
 * Downloads a password-protected PDF offer letter.
 * Employee can only download their own released offer letters.
 * Loads company branding from offer_letter_config settings.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isErrorResponse(auth)) return auth;

    const db = await getDb();
    if (!db) return NextResponse.json({ error: "Database not available" }, { status: 503 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id parameter required" }, { status: 400 });

    const { ObjectId } = require("mongodb");
    const letter = await db.collection("offerLetters").findOne({ _id: new ObjectId(id) });
    if (!letter) return NextResponse.json({ error: "Offer letter not found" }, { status: 404 });

    // Only the owner or CEO can download
    if (auth.role !== "super_admin" && letter.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only released letters can be downloaded
    if (letter.status !== "released") {
      return NextResponse.json({ error: "Offer letter has not been released yet" }, { status: 400 });
    }

    // Load offer letter settings for branding
    const settingsDoc = await db.collection("settings").findOne({ key: "offer_letter_config" });
    const cfg = settingsDoc?.settings || {};

    const companyName = cfg.companyName || "SKORA";
    const companyTagline = cfg.companyTagline || "Innovation · Excellence · Growth";
    const companyAddress = cfg.companyAddress || "";
    const companyPhone = cfg.companyPhone || "";
    const companyEmail = cfg.companyEmail || "";
    const signatoryName = cfg.signatoryName || "Vishal Srivastava";
    const signatoryTitle = cfg.signatoryTitle || "CEO, Skora";
    const templateBody = cfg.templateBody || "We are delighted to extend this offer of employment to you. After careful consideration of your qualifications and experience, we believe you will be a valuable addition to our team.";
    const templateFooter = cfg.templateFooter || "We look forward to welcoming you to the team.\n\nPlease confirm your acceptance of this offer by signing and returning this letter.";
    const watermark = cfg.pdfWatermark || "";
    const password = letter.password || "offer2026";

    // Generate PDF using pdfkit (dynamic import for serverless)
    const PDFDocument = (await import("pdfkit")).default;

    const buffers: Buffer[] = [];
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      bufferPages: true,
      info: {
        Title: `Offer Letter - ${letter.employeeName}`,
        Author: companyName,
        Subject: "Offer of Employment",
      },
    });

    // Collect PDF data
    const stream = doc as unknown as NodeJS.ReadableStream;
    stream.on("data", (chunk: Buffer) => buffers.push(chunk));

    const pdfReady = new Promise<Buffer>((resolve) => {
      stream.on("end", () => resolve(Buffer.concat(buffers)));
    });

    // ── Header ──
    doc.fontSize(22).font("Helvetica-Bold").fillColor("#2563eb").text(companyName, { align: "center" });
    doc.moveDown(0.2);
    doc.fontSize(10).font("Helvetica").fillColor("#666666").text(companyTagline, { align: "center" });
    if (companyAddress) {
      doc.moveDown(0.1);
      doc.fontSize(8).fillColor("#999999").text(companyAddress, { align: "center" });
    }
    if (companyPhone || companyEmail) {
      doc.fontSize(8).fillColor("#999999").text(
        [companyPhone, companyEmail].filter(Boolean).join(" | "),
        { align: "center" }
      );
    }

    // Line separator
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#2563eb").lineWidth(2).stroke();
    doc.moveDown(1);

    // ── Date ──
    doc.fontSize(10).font("Helvetica").fillColor("#666666").text(
      new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }),
      { align: "right" }
    );
    doc.moveDown(1);

    // ── Salutation ──
    doc.fontSize(11).font("Helvetica").fillColor("#333333").text(`Dear ${letter.employeeName},`);
    doc.moveDown(0.5);
    doc.fontSize(13).font("Helvetica-Bold").text("Subject: Offer of Employment");
    doc.moveDown(0.5);

    // ── Template Body ──
    doc.fontSize(11).font("Helvetica").fillColor("#333333").text(templateBody, { lineGap: 4 });
    doc.moveDown(0.5);

    // ── Employee Details Table ──
    const tableTop = doc.y;
    const col1 = 55;
    const col2 = 200;
    const rowH = 22;

    const details: [string, string][] = [
      ["Employee Name", letter.employeeName],
      ["Email", letter.employeeEmail],
      ["Department", letter.department || "N/A"],
      ["Designation", letter.designation || "N/A"],
    ];
    if (letter.salary) details.push(["Annual Salary", `₹ ${letter.salary.toLocaleString("en-IN")}`]);
    if (letter.joiningDate) details.push(["Joining Date", letter.joiningDate]);

    details.forEach(([label, value], i) => {
      const y = tableTop + i * rowH;
      // Row background
      if (i % 2 === 0) {
        doc.rect(col1 - 5, y - 2, 490, rowH).fill("#f8f9fa");
      }
      doc.fontSize(10).font("Helvetica-Bold").fillColor("#555555").text(label, col1, y + 4, { width: 140 });
      if (label === "Annual Salary") {
        doc.font("Helvetica-Bold").fillColor("#059669").fontSize(11).text(value, col2, y + 3);
      } else {
        doc.font("Helvetica").fillColor("#333333").text(value, col2, y + 4);
      }
    });
    doc.y = tableTop + details.length * rowH + 10;

    // ── Custom Content (if CEO added notes) ──
    if (letter.offerContent) {
      doc.moveDown(0.5);
      doc.save();
      doc.rect(col1 - 5, doc.y - 3, 490, 4).fill("#2563eb");
      doc.restore();
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica-Oblique").fillColor("#333333").text(letter.offerContent, { lineGap: 3, indent: 10 });
      doc.moveDown(0.5);
    }

    // ── Template Footer ──
    doc.moveDown(0.5);
    doc.fontSize(11).font("Helvetica").fillColor("#333333").text(templateFooter, { lineGap: 4 });
    doc.moveDown(1.5);

    // ── Signatory ──
    doc.fontSize(11).font("Helvetica").fillColor("#333333").text("Warm regards,");
    doc.moveDown(0.3);
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#1a1a1a").text(signatoryName);
    doc.fontSize(10).font("Helvetica").fillColor("#666666").text(signatoryTitle);
    if (companyName) doc.text(companyName);

    // ── Watermark ──
    const pageRange = doc.bufferedPageRange();
    if (watermark) {
      for (let i = pageRange.start; i < pageRange.start + pageRange.count; i++) {
        doc.switchToPage(i);
        doc.save();
        doc.fontSize(60).font("Helvetica-Bold").fillColor("#f0f0f0").rotate(45, { origin: [300, 400] });
        doc.text(watermark, 100, 350, { align: "center", width: 400 });
        doc.restore();
      }
    }

    // ── Footer ──
    const lastPage = pageRange.start + pageRange.count - 1;
    doc.switchToPage(lastPage);
    doc.fontSize(8).font("Helvetica").fillColor("#999999");
    doc.text("This is a confidential document. Unauthorized distribution is prohibited.", 50, doc.page.height - 60, { align: "center", width: 495 });
    doc.text(`Offer Letter ID: ${letter._id.toString()} | Generated: ${new Date().toISOString()}`, 50, doc.page.height - 48, { align: "center", width: 495 });

    doc.end();
    const pdfBuffer = await pdfReady;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="offer-letter-${letter.employeeName.replace(/\s+/g, "-")}.pdf"`,
        "X-Offer-Letter-Password": password,
      },
    });
  } catch (error: any) {
    console.error("GET /api/hrm/v2/offer-letters/download error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
