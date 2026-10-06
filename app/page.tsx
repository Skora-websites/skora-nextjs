import React from "react";
import type { Metadata } from "next";
import HomeView from "@/components/home/HomeView";
import { absoluteUrl } from "@/lib/blog";
import { PAGE_SEO, buildPageMetadata } from "@/lib/page-seo";
import { getGlobalSeoSafe, getPageSeoContext } from "@/lib/db";
import { SERVICES } from "@/lib/services";

/**
 * Server page: the sections live in `components/home/HomeView` (they are client
 * components and two open the consultation modal), while the route stays
 * server-side so it can export its own title/description/canonical rather than
 * inheriting the root layout's defaults — three pages used to share one title.
 *
 * Also emits the Organization + WebSite schema the homepage should always have
 * carried, plus the ItemList of service divisions.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  // The homepage is the one route whose code default IS the site-wide default
  // from /admin/seo, so its registry entry resolves against `global` rather than
  // hardcoding strings — and a saved per-page override wins over it. Clearing the
  // override falls back to the site default. `absoluteTitle` on that entry is why
  // this page cannot share the ordinary title-template path.
  return buildPageMetadata(PAGE_SEO.home, await getPageSeoContext());
}

export default async function HomePage() {
  const seo = await getGlobalSeoSafe();
  const base = seo.canonicalBase;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${base}/#organization`,
      name: seo.siteName,
      url: base,
      description: seo.defaultDescription,
      ...(seo.ogImage ? { logo: absoluteUrl(seo.ogImage, base) } : {}),
      sameAs: seo.socials.map((s) => s.url),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${base}/#website`,
      name: seo.siteName,
      url: base,
      publisher: { "@id": `${base}/#organization` },
    },
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
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `${seo.siteName} services`,
      itemListElement: SERVICES.map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: service.pill,
        url: absoluteUrl(`/services/${service.slug}`, base),
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <HomeView />
    </>
  );
}