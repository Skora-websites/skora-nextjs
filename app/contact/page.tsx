import React from "react";
import type { Metadata } from "next";
import ContactView from "@/components/contact/ContactView";
import { CONTACT_FAQ } from "@/lib/faq";
import { absoluteUrl } from "@/lib/blog";
import { getGlobalSeoSafe } from "@/lib/db";

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
  const seo = await getGlobalSeoSafe();
  const shareUrl = absoluteUrl("/contact", seo.canonicalBase);
  const image = seo.ogImage ? absoluteUrl(seo.ogImage, seo.canonicalBase) : undefined;
  const shareTitle = `Contact Us | ${seo.siteName}`;
  const description =
    "Tell us about your project — goals, timeline and budget. We reply within 4 business hours with next steps and a fixed estimate.";

  return {
    title: "Contact Us",
    description,
    keywords: ["contact", "hire a web agency", "project enquiry", "SKORA"],
    alternates: { canonical: "/contact" },
    openGraph: {
      title: shareTitle,
      description,
      url: shareUrl,
      siteName: seo.siteName,
      locale: "en_US",
      type: "website",
      images: image ? [{ url: image, alt: seo.siteName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      site: seo.twitterHandle || undefined,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ContactPage() {
  const jsonLd = {
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ContactView />
    </>
  );
}
