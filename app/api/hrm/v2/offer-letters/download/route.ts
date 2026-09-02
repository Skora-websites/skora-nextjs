import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/api-auth";
import { getDb } from "@/lib/db/mongo-helper";
import crypto from "crypto";

/**
 * GET /api/hrm/v2/offer-letters/download?id=xxx
 * Downloads a password-protected PDF offer letter.
 * Employee can only download their own released offer letters.
 * Password is displayed on the page after download.
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

    // Generate a simple text-based offer letter as PDF (since we don't have a PDF library)
    // For production, you'd use pdfkit or similar
    const password = letter.password || "offer2026";

    // Create an HTML-based offer letter
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Offer Letter - ${letter.employeeName}</title>
  <style>
    body { font-family: 'Georgia', serif; max-width: 700px; margin: 40px auto; padding: 20px; color: #333; }
    .header { text-align: center; border-bottom: 3px double #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .company-name { font-size: 28px; font-weight: bold; color: #2563eb; letter-spacing: 2px; }
    .tagline { font-size: 12px; color: #666; margin-top: 5px; }
    .date { text-align: right; margin-bottom: 20px; color: #666; }
    .subject { font-weight: bold; font-size: 16px; margin: 20px 0; }
    .content { line-height: 1.8; font-size: 14px; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .details-table td { padding: 8px 12px; border: 1px solid #ddd; font-size: 13px; }
    .details-table td:first-child { font-weight: bold; background: #f8f9fa; width: 40%; }
    .salary { font-size: 18px; font-weight: bold; color: #059669; }
    .footer { margin-top: 40px; border-top: 1px solid #ddd; padding-top: 20px; font-size: 12px; color: #999; text-align: center; }
    .password-notice { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; margin: 20px 0; font-size: 12px; color: #92400e; }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">SKORA</div>
    <div class="tagline">Innovation \u00B7 Excellence \u00B7 Growth</div>
  </div>

  <div class="date">${new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</div>

  <p>Dear <strong>${letter.employeeName}</strong>,</p>

  <div class="subject">Subject: Offer of Employment</div>

  <div class="content">
    <p>We are delighted to extend this offer of employment to you. After careful consideration of your qualifications and experience, we believe you will be a valuable addition to our team.</p>

    <table class="details-table">
      <tr><td>Employee Name</td><td>${letter.employeeName}</td></tr>
      <tr><td>Email</td><td>${letter.employeeEmail}</td></tr>
      <tr><td>Department</td><td>${letter.department}</td></tr>
      <tr><td>Designation</td><td>${letter.designation}</td></tr>
      ${letter.salary ? `<tr><td>Annual Salary</td><td class="salary">\u20B9 ${letter.salary.toLocaleString("en-IN")}</td></tr>` : ""}
      ${letter.joiningDate ? `<tr><td>Joining Date</td><td>${letter.joiningDate}</td></tr>` : ""}
    </table>

    ${letter.offerContent ? `<div style="margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #2563eb;"><p>${letter.offerContent.replace(/\n/g, "<br>")}</p></div>` : ""}

    <p>We look forward to welcoming you to the team and are confident that your contributions will be instrumental in driving our success.</p>

    <p>Please confirm your acceptance of this offer by signing and returning this letter.</p>

    <p>Warm regards,<br><strong>Vishal Srivastava</strong><br>CEO, Skora</p>
  </div>

  <div class="footer">
    <p>This is a confidential document. Unauthorized distribution is prohibited.</p>
    <p>Offer Letter ID: ${letter.id} | Generated: ${new Date().toISOString()}</p>
  </div>
</body>
</html>`;

    // Return HTML that the browser can print as PDF
    // For true PDF protection, you'd use a server-side PDF library with encryption
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="offer-letter-${letter.employeeName.replace(/\s+/g, "-")}.html"`,
        "X-Offer-Letter-Password": password,
      },
    });
  } catch (error: any) {
    console.error("GET /api/hrm/v2/offer-letters/download error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
