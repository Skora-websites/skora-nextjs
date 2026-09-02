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
