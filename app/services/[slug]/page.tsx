import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServicePageTemplate from "@/components/landing/ServicePageTemplate";
import { getServiceBySlug, serviceSlugs } from "@/lib/services";
import { absoluteUrl, socialImageUrl } from "@/lib/blog";
import { getGlobalSeoSafe } from "@/lib/db";

/**
 * One route for all nine service pages.
 *
 * Content lives in `lib/services.ts`; this file only supplies the SEO layer
 * (which the old client-only pages could not export) and the breadcrumb schema.
 * Metadata depends on the site settings in the database, so the page regenerates
 * on a five-minute window as well as on demand when /admin/seo saves.
 */
export const revalidate = 300;

export function generateStaticParams() {
  return serviceSlugs.map((slug) => ({ slug }));
}

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};

  const seo = await getGlobalSeoSafe();
  const shareTitle = `${service.metaTitle} | ${seo.siteName}`;
  const shareUrl = absoluteUrl(`/services/${service.slug}`, seo.canonicalBase);
  const image = socialImageUrl(seo.ogImage, seo.canonicalBase);

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    keywords: [service.pill, service.navName],
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: {
      title: shareTitle,
      description: service.metaDescription,
      url: shareUrl,
      siteName: seo.siteName,
      locale: "en_US",
      type: "website",
      images: [{ url: image, alt: seo.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: service.metaDescription,
      site: seo.twitterHandle || undefined,
      images: [image],
    },
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const seo = await getGlobalSeoSafe();
  const base = seo.canonicalBase;

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
        name: "Services",
        item: absoluteUrl("/services", base),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: service.pill,
        item: absoluteUrl(`/services/${service.slug}`, base),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      {/* Explicit props: `icon` is a component reference and cannot cross the
          server→client boundary, so it is never spread through. */}
      <ServicePageTemplate
        slug={service.slug}
        pill={service.pill}
        title={service.title}
        lead={service.lead}
        primaryCta={service.primaryCta}
        heroImage={service.heroImage}
        heroImageAlt={service.heroImageAlt}
        capabilitiesTitle={service.capabilitiesTitle}
        capabilitiesIntro={service.capabilitiesIntro}
        capabilities={service.capabilities}
        stackTitle={service.stackTitle}
        stack={service.stack}
        deliverablesTitle={service.deliverablesTitle}
        deliverables={service.deliverables}
        ctaTitle={service.ctaTitle}
        ctaDescription={service.ctaDescription}
        ctaButton={service.ctaButton}
        modalServiceName={service.modalServiceName}
      />
    </>
  );
}
