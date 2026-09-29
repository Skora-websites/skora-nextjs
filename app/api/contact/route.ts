import { NextRequest, NextResponse } from "next/server";
import { withErrorHandler, badRequest, created } from "@/lib/api-handler";
import { createLead } from "@/lib/db";

/**
 * Public enquiry endpoint — the only unauthenticated write on the site.
 *
 * `/api/leads` stays admin-only because it is the admin CRUD surface; this
 * route accepts the contact form and consultation modal submissions, validates
 * them, and creates a lead the admin sees under CRM → Leads.
 *
 * Abuse controls: honeypot field, field length caps, per-IP throttle.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const MAX = {
  name: 120,
  email: 200,
  phone: 40,
  company: 120,
  service: 200,
  budget: 80,
  message: 5000,
  source: 60,
} as const;

/** Collapse whitespace and trim, capped at `limit` characters. */
function text(value: unknown, limit: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

/**
 * Simple per-IP throttle — enough to blunt form-spam scripts without ever
 * locking out a real enquiry. Deliberately roomy: several people can share one
 * office or carrier IP, and someone whose submission is rejected will retry.
 * A false 429 here would break the exact promise this endpoint exists for, so
 * the limit only bites on repeated abuse.
 */
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_HITS = 10;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return true;
  }

  recent.push(now);
  hits.set(ip, recent);

  // Opportunistic cleanup so the map cannot grow without bound.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return false;
}

export const POST = withErrorHandler(
  async (request: NextRequest) => {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    if (!body || typeof body !== "object") return badRequest("Invalid request body");

    const name = text(body.name ?? body.fullName, MAX.name);
    const email = text(body.email, MAX.email);

    if (!name) return badRequest("Please add your name.");
    if (!email || !EMAIL_RE.test(email)) return badRequest("Please add a valid email address.");

    // Honeypot: real visitors never fill this hidden field. Pretend success so
    // spam scripts learn nothing, without writing a record.
    if (text(body.website, MAX.company)) {
      return created({ ok: true });
    }

    const lead = await createLead({
      fullName: name,
      email,
      phone: text(body.phone, MAX.phone),
      company: text(body.company, MAX.company) || undefined,
      service: text(body.service, MAX.service),
      budget: text(body.budget, MAX.budget),
      message: text(body.message, MAX.message),
      source: text(body.source, MAX.source) || "Website contact form",
    });

    return created({ id: lead.id, ok: true });
  },
  { label: "Contact" }
);
