import { NextRequest, NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/api-auth";
import { getDb } from "@/lib/db/mongo-helper";
import { sendMail, getMailTransportInfo } from "@/lib/email";
import { ObjectId } from "mongodb";

/**
 * POST /api/hrm/v2/email/test
 * CEO/HR-only: sends a test email using the configured SMTP (or Resend)
 * transport so the connection can be verified without waiting for a
 * real offer-letter event.
 *
 * Body (all optional): { to?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isErrorResponse(auth)) return auth;

    if (!["super_admin", "hr_admin", "admin"].includes(auth.role)) {
      return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    let to = (body?.to || "").trim();
    if (!to) {
      // Default to the caller's own email address.
      const db = await getDb();
      const caller = db
        ? await db.collection("users").findOne({ _id: new ObjectId(auth.userId) }, { projection: { email: 1 } })
        : null;
      to = caller?.email || "";
    }
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json({ error: "A valid recipient email is required" }, { status: 400 });
    }

    const transport = getMailTransportInfo();
    if (!transport) {
      return NextResponse.json(
        {
          error:
            "No mail transport configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and SMTP_FROM in the environment.",
        },
        { status: 503 }
      );
    }

    const sent = await sendMail({
      to,
      subject: "Skora HRMS — SMTP test email",
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <h2 style="color:#2563eb;margin:0 0 12px;">SMTP connection works ✅</h2>
        <p>This is a test message from <strong>Skora HRMS</strong>.</p>
        <p style="color:#555;font-size:13px;">Transport: <code>${transport.provider}</code> via <code>${transport.host || "resend-api"}</code><br/>
        From: <code>${transport.from}</code><br/>
        Sent at: ${new Date().toISOString()}</p>
        <p style="color:#555;font-size:13px;">If you received this in your inbox, offer letters and password-reset emails will deliver correctly.</p>
      </div>`,
    });

    if (!sent) {
      return NextResponse.json(
        { error: `Transport "${transport.provider}" rejected the message. Check server logs and credentials.` },
        { status: 502 }
      );
    }

    return NextResponse.json({ data: { sent: true, transport } });
  } catch (error: any) {
    console.error("POST /api/hrm/v2/email/test error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
