/**
 * Copy for the /healthcare sector page.
 *
 * Why this page exists: the nine service pages in `lib/services.ts` describe
 * what we build; this describes who we build it for. A clinic owner searching
 * "clinic website India" should land somewhere that answers in their language,
 * then be able to follow a link into the actual service pages. That is also why
 * `serviceLinks` below points at real slugs rather than restating capabilities
 * — the page distributes authority to /services/[slug] instead of competing
 * with it.
 *
 * India-first, because the studio is registered and based in Noida (see
 * DEFAULT_SITE_CORE). Local patient search means Google Business Profile and
 * appointment flows, not US-style compliance language.
 *
 * "No invented proof" (AI_RULES.md) is the hard constraint here: no patient
 * counts, no clinic testimonials, no certifications, no uptime figures, no
 * "trusted by X clinics". Everything asserted is either a description of work
 * we can actually do or one of the three claims already published in
 * TRUST_SIGNALS / CTA_TRUST_LINE.
 *
 * No database access and no JSX, so server and client components can both
 * import it cheaply — same rule as lib/services.ts.
 */

import {
  CalendarCheck,
  MapPin,
  Search,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

/** A capability block rendered on the page. */
export interface HealthcareBlock {
  icon: LucideIcon;
  title: string;
  description: string;
  /**
   * Short corner label — descriptive, never a statistic we cannot evidence.
   */
  tag: string;
}

/** Links into the real service pages — the page's main job. */
export interface HealthcareServiceLink {
  /** Slug from SERVICES in lib/services.ts. */
  slug: string;
  title: string;
  description: string;
}

export interface HealthcareContent {
  /** Kicker above the H1. */
  kicker: string;
  /** H1 — pairs with `headlineAccent`, which is rendered in the accent style. */
  headline: string;
  headlineAccent: string;
  /** Supporting sentence under the H1. */
  lead: string;
  metaTitle: string;
  metaDescription: string;
  heroImage: string;
  heroImageAlt: string;
  primaryCta: string;

  /** The four "what we do" blocks. */
  blocksTitle: string;
  blocks: HealthcareBlock[];

  /** Deliverables list. */
  deliverablesTitle: string;
  deliverables: string[];

  /** Which service pages this sector actually maps onto. */
  relatedTitle: string;
  relatedIntro: string;
  serviceLinks: HealthcareServiceLink[];

  /** Closing CTA band. */
  ctaTitle: string;
  ctaDescription: string;
}

/**
 * Opening hours, in the studio's own time zone.
 *
 * Single source for the footer column and the contact page so the two can never
 * disagree. IST is named explicitly because both audiences are international —
 * a bare "10:00 AM" is ambiguous for anyone outside India.
 */
export const OPENING_HOURS = "Mon to Fri, 10:00 AM to 07:00 PM IST";

export const HEALTHCARE: HealthcareContent = {
  kicker: "Healthcare & clinics",
  headline: "Websites that bring",
  headlineAccent: "patients through the door.",
  lead:
    "We build websites for clinics, hospitals and specialist practices across India — with appointment booking, local search visibility, and enquiry capture that reaches you on WhatsApp.",
  metaTitle: "Healthcare & Clinic Website Development in India",
  metaDescription:
    "Clinic and hospital websites built in India: appointment booking, Google Business Profile setup for local patient search, WhatsApp enquiry capture, and secure hosting.",
  heroImage:
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  heroImageAlt: "Clinician reviewing a patient record on a tablet",
  primaryCta: "Discuss a clinic website",

  blocksTitle: "What we build for practices",
  blocks: [
    {
      icon: Stethoscope,
      title: "Clinic and hospital websites",
      description:
        "Service pages, doctor and department profiles, and a clear contact path — written for patients who are looking for care, not for a marketing brochure.",
      tag: "Websites",
    },
    {
      icon: CalendarCheck,
      title: "Appointment booking",
      description:
        "Booking flows that work on the phone a patient actually uses, plus enquiry forms wired to WhatsApp and email so nothing sits unread in an inbox.",
      tag: "Booking",
    },
    {
      icon: MapPin,
      title: "Local patient search",
      description:
        "Google Business Profile setup, location and department pages, and consistent listings — so a practice is found when someone searches nearby.",
      tag: "Local SEO",
    },
    {
      icon: Search,
      title: "Search visibility",
      description:
        "On-page structure, schema markup, speed and metadata for the treatment pages patients search for by name.",
      tag: "SEO",
    },
  ],

  deliverablesTitle: "Every engagement includes",
  deliverables: [
    "A scope agreed in writing before work starts",
    "A dated project plan with a staging link to review",
    "Booking or enquiry capture wired to your own channels",
    "Google Business Profile setup for local search",
    "A handover session so your team can update content",
  ],

  relatedTitle: "The services behind it",
  relatedIntro:
    "Healthcare is one sector we build for — the engineering work comes from the same nine service lines as every other project.",
  // One entry per service so `key` is unique — an earlier draft listed crm twice.
  serviceLinks: [
    {
      slug: "website-design",
      title: "Website Design & Engineering",
      description: "Next.js sites built for speed, accessibility and on-page SEO.",
    },
    {
      slug: "saas-development",
      title: "SaaS Platform Development",
      description: "Patient portals, dashboards and internal tooling.",
    },
    {
      slug: "crm",
      title: "Custom CRM & Automations",
      description: "Enquiry pipelines and follow-up that do not rely on memory.",
    },
    {
      slug: "cloud-services",
      title: "Cloud Services & DevOps",
      description: "Managed hosting, backups and monitoring for a practice that cannot go offline.",
    },
    {
      slug: "digital-marketing",
      title: "Digital Marketing & Local SEO",
      description: "Local search, campaigns and reporting tied to enquiries.",
    },
    {
      slug: "pms",
      title: "Project Management Systems",
      description: "Rollout tracking when a clinic system spans several teams.",
    },
  ],

  ctaTitle: "Not sure which you need?",
  ctaDescription:
    "Tell us how patients find you today and what you want them to do next. We reply with the scope, timeline and a fixed price.",
};