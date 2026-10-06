import React from "react";
import type { Metadata } from "next";
import TermsView from "@/components/landing/TermsView";
import { absoluteUrl } from "@/lib/blog";
import { PAGE_SEO, buildPageMetadata } from "@/lib/page-seo";
import { getGlobalSeoSafe, getPageSeoContext } from "@/lib/db";

/**
 * Server page: the clause markup lives in `components/landing/TermsView` (it
 * opens the consultation modal), while the route stays server-side so it can
 * export metadata and the breadcrumb schema.
 *
 * Same structure as `app/privacy/page.tsx` and `app/contact/page.tsx`.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  // Owned by lib/page-seo.ts: this route's code default, overlaid with
  // whatever an admin saved at /admin/seo/pages. Clearing a field there
  // falls back to the code default.
  return buildPageMetadata(PAGE_SEO.terms, await getPageSeoContext());
}

export default async function TermsPage() {
  const base = (await getGlobalSeoSafe()).canonicalBase;

  const jsonLd = {
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
        name: "Terms and Conditions",
        item: absoluteUrl("/terms", base),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <TermsView />
    </>
  );
}