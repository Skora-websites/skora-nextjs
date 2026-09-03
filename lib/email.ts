import "server-only";

interface ResetEmailInput {
  to: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({ to, resetUrl }: ResetEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Reset your Skora HRMS password",
      html: `<p>We received a request to reset your Skora HRMS password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>`,
    }),
  });

  return response.ok;
}

interface OfferLetterEmailInput {
  to: string;
  employeeName: string;
  salary?: number | null;
  joiningDate?: string | null;
  companyName: string;
  signatoryName: string;
  downloadUrl: string;
}

/**
 * Send offer letter notification email to employee when CEO releases it.
 * Uses Resend API. Returns false if RESEND_API_KEY is not configured.
 */
export async function sendOfferLetterEmail({
  to,
  employeeName,
  salary,
  joiningDate,
  companyName,
  signatoryName,
  downloadUrl,
}: OfferLetterEmailInput): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return false;

  const salaryStr = salary
    ? `<p><strong>Annual Salary:</strong> ₹${salary.toLocaleString("en-IN")}</p>`
    : "";
  const joinStr = joiningDate
    ? `<p><strong>Joining Date:</strong> ${joiningDate}</p>`
    : "";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: `Your Offer Letter from ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; border-bottom: 3px double #2563eb; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; letter-spacing: 2px; margin: 0;">${companyName}</h1>
            <p style="color: #666; font-size: 12px; margin-top: 5px;">Innovation · Excellence · Growth</p>
          </div>
          <p>Dear <strong>${employeeName}</strong>,</p>
          <p>We are pleased to inform you that your offer letter has been released and is ready for download.</p>
          ${salaryStr}
          ${joinStr}
          <div style="text-align: center; margin: 30px 0;">
            <a href="${downloadUrl}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Download Offer Letter</a>
          </div>
          <p>Please review the offer letter carefully. If you have any questions, do not hesitate to reach out.</p>
          <p>Warm regards,<br><strong>${signatoryName}</strong><br>${companyName}</p>
          <div style="border-top: 1px solid #ddd; padding-top: 15px; margin-top: 30px; font-size: 11px; color: #999; text-align: center;">
            <p>This is a confidential document. Unauthorized distribution is prohibited.</p>
          </div>
        </div>
      `,
    }),
  });

  return response.ok;
}
