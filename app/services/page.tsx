import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2, Rocket, Search } from "lucide-react";
import Footer from "@/components/Footer";
import Reveal from "@/components/animation/Reveal";
import SectionHeader from "@/components/landing/SectionHeader";
import CtaBand from "@/components/landing/CtaBand";
import { SERVICES } from "@/lib/services";
import { CTA, CTA_TRUST_LINE, TRUST_SIGNALS } from "@/lib/cta";
import { absoluteUrl } from "@/lib/blog";
import { getGlobalSeoSafe } from "@/lib/db";

/** Metadata depends on the site settings stored in the database. */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGlobalSeoSafe();
  const shareTitle = `Services | ${seo.siteName}`;
  const description =
    "Nine services from SKORA — website design, digital marketing, branding, video, mobile apps, cloud, SaaS, CRM and project management systems.";
  const image = seo.ogImage ? absoluteUrl(seo.ogImage, seo.canonicalBase) : undefined;
  const shareUrl = absoluteUrl("/services", seo.canonicalBase);

  return {
    title: "Services",
    description,
    keywords: SERVICES.map((s) => s.pill),
    alternates: { canonical: "/services" },
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

/** Three starting points for visitors who know the problem, not the service. */
const PATHS = [
  {
    icon: Rocket,
    title: "I need a website",
    body: "A fast, search-ready site your team can update without a developer.",
    href: "/services/website-design",
    cta: "Website design",
  },
  {
    icon: Search,
    title: "I need more enquiries",
    body: "Local SEO and paid campaigns reported on leads, spend and cost per lead.",
    href: "/services/digital-marketing",
    cta: "Digital marketing",
  },
  {
    icon: Code2,
    title: "I need custom software",
    body: "SaaS products, CRMs and internal tools configured around your process.",
    href: "/services/saas-development",
    cta: "SaaS development",
  },
];

export default async function ServicesHubPage() {
  const seo = await getGlobalSeoSafe();
  const base = seo.canonicalBase;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "SKORA services",
    itemListElement: SERVICES.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: service.pill,
      url: absoluteUrl(`/services/${service.slug}`, base),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="relative min-h-screen overflow-x-hidden bg-main font-sans text-ink">
        {/* Hero */}
        <section className="relative overflow-hidden bg-paper pb-14 pt-28 sm:pb-16 sm:pt-32">
          <div
            className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]"
            aria-hidden="true"
          />
          <div className="section-wrap relative">
            <Reveal variant="blur" className="max-w-3xl space-y-6">
              <span className="kicker">What we do</span>
              <h1 className="display-hero text-4xl sm:text-6xl">
                Nine ways we <span className="display-accent text-accent">grow your business.</span>
              </h1>
              <p className="max-w-2xl text-base font-medium leading-relaxed text-sub sm:text-lg">
                Every engagement starts with a fixed scope, a dated plan and a staging link you can
                review. Pick the service that matches the problem — most projects combine two.
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <Link href="/contact" className="btn-primary group">
                  <span>Start a project</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="#all-services" className="btn-secondary">
                  Browse all nine
                </a>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-sub">
                {TRUST_SIGNALS.map((item) => (
                  <li key={item} className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* All services */}
        <section id="all-services" className="border-t border-line bg-main py-16 sm:py-20">
          <div className="section-wrap">
            <SectionHeader
              badge="All services"
              title={
                <>
                  Pick a <span className="display-accent text-accent">starting point.</span>
                </>
              }
              subtext="Nine divisions, one delivery process — the same team scopes, builds and reports on every project."
            />
            <Reveal
              variant="fade-up"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              staggerSelector="[data-service-card]"
              stagger={0.07}
            >
              {SERVICES.map((service) => (
                <Link
                  key={service.slug}
                  data-service-card
                  href={`/services/${service.slug}`}
                  className="group flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_16px_36px_-16px_rgba(37,99,235,0.25)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                      <service.icon size={24} aria-hidden="true" />
                    </span>
                    <ArrowRight
                      size={18}
                      className="text-faint transition-all group-hover:translate-x-1 group-hover:text-accent"
                    />
                  </div>
                  <div>
                    <h2 className="mb-1 text-base font-extrabold text-ink">{service.navName}</h2>
                    <p className="text-sm leading-relaxed text-sub">{service.navDesc}</p>
                  </div>
                  <span className="mt-auto text-[11px] font-black uppercase tracking-widest text-accent">
                    {service.pill}
                  </span>
                </Link>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Not sure which one? */}
        <section className="border-t border-line bg-paper py-16 sm:py-20">
          <div className="section-wrap">
            <SectionHeader
              badge="Start here"
              title={
                <>
                  Know the problem, <span className="display-accent text-accent">not the service?</span>
                </>
              }
            />
            <Reveal
              variant="fade-up"
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
              staggerSelector="[data-path]"
              stagger={0.09}
            >
              {PATHS.map((path) => (
                <Link
                  key={path.href}
                  data-path
                  href={path.href}
                  className="group flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                    <path.icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight text-ink transition-colors group-hover:text-accent">
                    {path.title}
                  </h3>
                  <p className="text-sm font-medium leading-relaxed text-sub">{path.body}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[11px] font-black uppercase tracking-widest text-accent">
                    {path.cta}
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              ))}
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-main pb-16 pt-4 sm:pb-20">
          <div className="section-wrap">
            <CtaBand
              title={
                <>
                  Not sure which one <span className={CTA.accent}>you need?</span>
                </>
              }
              description="Tell us the outcome you are after. We reply with the right service, scope, timeline and a fixed price."
              primaryLabel="Get a free audit"
              primaryHref="/contact"
              secondaryLabel="Read the blog"
              secondaryHref="/blog"
              trustNote={CTA_TRUST_LINE}
            />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
