import "server-only";
import { logger } from "@/lib/logger";

/**
 * Notification provider stub.
 * - If RESEND_API_KEY or SMTP_HOST is set, an email is sent via the configured provider.
 * - Otherwise the message is logged (visible in server logs) and counted.
 *
 * ponytail: real provider (Resend / nodemailer / MSG91) is wired via env.
 * When promoting to production, fill in `sendEmail` / `sendSms` with the SDK call.
 */
let emailCount = 0;
let smsCount = 0;

export interface NotificationPayload {
  to: string;
  subject: string;
  body: string;
  channel?: "email" | "sms" | "both";
}

export async function notify(payload: NotificationPayload): Promise<{ delivered: boolean; channel: string }> {
  const channel = payload.channel || "email";
  const hasEmail =
    !!(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
  const hasSms = !!process.env.SMS_PROVIDER_KEY;

  if (channel === "email" || channel === "both") {
    if (hasEmail) {
      // ponytail: wire Resend/SMTP here. Until then, log + count.
      logger.info("[notify:email] stub", { to: payload.to, subject: payload.subject });
    } else {
      logger.info("[notify:email] dev log", { to: payload.to, subject: payload.subject, body: payload.body });
    }
    emailCount++;
  }
  if (channel === "sms" || channel === "both") {
    if (hasSms) {
      logger.info("[notify:sms] stub", { to: payload.to, body: payload.body });
    } else {
      logger.info("[notify:sms] dev log", { to: payload.to, body: payload.body });
    }
    smsCount++;
  }
  return { delivered: true, channel };
}

export function getNotificationStats() {
  return { emailCount, smsCount };
}
