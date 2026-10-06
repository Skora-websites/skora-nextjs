import React from "react";
import type { Metadata } from "next";
import HealthcareView from "@/components/healthcare/HealthcareView";
import { absoluteUrl } from "@/lib/blog";
import { PAGE_SEO, buildPageMetadata } from "@/lib/page-seo";
import { getGlobalSeoSafe, getPageSeoContext } from "@/lib/db";
import { HEALTHCARE } from "@/lib/healthcare";
import { DEFAULT_SITE_CORE } from "@/lib/site-defaults";

/**
 * Sector page for clinics, hospitals and specialist practices in India.
 *
 * Server-rendered like /contact, /terms and /privacy: the metadata and the
 * schema depend on the site settings in the database, and the body needs the
 * consultation modal, so the markup lives in `components/healthcare/HealthcareView`.
 *
 * Page copy lives in `lib/healthcare.ts` (same rule as `lib/services.ts`) so it
 * can be edited in one place and imported by both sides of the boundary.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  // Owned by lib/page-seo.ts: this route's code default, overlaid with
  // whatever an admin saved at /admin/seo/pages. Clearing a field there
  // falls back to the code default.
  return buildPageMetadata(PAGE_SEO.healthcare, await getPageSeoContext());
}

export default async function HealthcarePage() {
  const seo = await getGlobalSeoSafe();
  const base = seo.canonicalBase;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: absoluteUrl("/", base),
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Healthcare",
          item: absoluteUrl("/healthcare", base),
        },
      ],
    },
    {
      // Only fields we can actually evidence (AI_RULES.md: no invented proof) —
      // no aggregate rating, no patient count, no accreditation.
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "@id": `${base}/healthcare#business`,
      name: seo.siteName,
      url: absoluteUrl("/healthcare", base),
      description: HEALTHCARE.metaDescription,
      email: DEFAULT_SITE_CORE.email,
      telephone: DEFAULT_SITE_CORE.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: DEFAULT_SITE_CORE.address,
        addressCountry: "IN",
      },
      parentOrganization: { "@id": `${base}/#organization` },
      areaServed: { "@type": "Country", name: "India" },
      knowsAbout: [
        "Clinic website development",
        "Appointment booking systems",
        "Local SEO for healthcare practices",
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <HealthcareView />
    </>
  );
}