import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import ContactView from "@/components/contact/ContactView";
import { CONTACT_FAQ } from "@/lib/faq";
import { absoluteUrl } from "@/lib/blog";
import { PAGE_SEO, buildPageMetadata } from "@/lib/page-seo";
import { getGlobalSeoSafe, getPageSeoContext } from "@/lib/db";

/**
 * Server page: all the markup lives in `components/contact/ContactView`, but
 * the route itself stays server-side so it can export metadata and emit the
 * FAQPage schema for the questions rendered below the form.
 *
 * SEO settings come from the database, so regenerate on a five-minute window
 * as well as on demand when /admin/seo saves.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  // Owned by lib/page-seo.ts: this route's code default, overlaid with
  // whatever an admin saved at /admin/seo/pages. Clearing a field there
  // falls back to the code default.
  return buildPageMetadata(PAGE_SEO.contact, await getPageSeoContext());
}

export default async function ContactPage() {
  const seo = await getGlobalSeoSafe();
  const base = seo.canonicalBase;

  // Two schemas for this page: the questions the form sits next to, and the fact
  // that the contact page is one hop off the homepage. Emitted as a single
  // script tag so the page head is parsed once.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: CONTACT_FAQ.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
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
        {
          "@type": "ListItem",
          position: 2,
          name: "Contact",
          item: absoluteUrl("/contact", base),
        },
      ],
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {/*
        The breadcrumb is owned by the route, not by ContactView: ContactView is
        the page body, and the trail describes the route. It is absolutely
        positioned into the hero's empty top padding (pt-32) rather than pushed
        above it, so the layout the hero was designed around is untouched.
        Centred, because this hero's copy is centred.
      */}
      <div className="relative">
        <nav
          aria-label="Breadcrumb"
          className="section-wrap absolute inset-x-0 top-28 z-10 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-widest text-faint sm:top-32"
        >
          <Link href="/" className="transition-colors hover:text-accent">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-sub">Contact</span>
        </nav>
        <ContactView />
      </div>
    </>
  );
}
