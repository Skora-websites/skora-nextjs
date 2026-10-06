import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Layers, Mail, MapPin, Phone, Wrench } from "lucide-react";
import Footer from "@/components/Footer";
import Reveal from "@/components/animation/Reveal";
import SplitHeading from "@/components/animation/SplitHeading";
import SectionHeader from "@/components/landing/SectionHeader";
import CtaBand from "@/components/landing/CtaBand";
import { absoluteUrl } from "@/lib/blog";
import { DEFAULT_SITE_CORE } from "@/lib/site-defaults";
import { SERVICES } from "@/lib/services";
import { CTA_TRUST_LINE, TRUST_SIGNALS } from "@/lib/cta";
import { PAGE_SEO, buildPageMetadata } from "@/lib/page-seo";
import { getGlobalSeoSafe, getPageSeoContext } from "@/lib/db";

/**
 * Who SKORA is, as a page rather than a claim list.
 *
 * Deliberately free of numbers: no client counts, no "years of experience", no
 * rankings (see "No invented proof" in AI_RULES.md). The studio's capability
 * claims are already sourced in `lib/services.ts`, so the capabilities below
 * point at that list instead of repeating it with invented figures.
 *
 * Server-rendered: the metadata and the BreadcrumbList/Person schema depend on
 * the site settings in the database, exactly like /services and /contact.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  // Title, description, keywords, canonical and both share cards are owned by
  // lib/page-seo.ts: this route's code default, overlaid with whatever an admin
  // saved at /admin/seo/pages. Clearing a field there falls back to the code
  // default, so this page has no SEO constants left to drift out of sync — and a
  // path that is not in the registry is a compile error, not a silent no-op.
  return buildPageMetadata(PAGE_SEO.about, await getPageSeoContext());
}

/**
 * How the studio works, in the same order as the service lines on /services.
 * Kept as data here rather than pulled from SERVICES so the prose can stay
 * specific without duplicating the (longer) service copy.
 */
const PRINCIPLES = [
  {
    icon: Compass,
    title: "Outcomes before deliverables",
    body: "Every engagement opens with the result you need, not the list of tasks. Scope, timeline and a fixed price come before the first sprint, and they do not move as the build progresses.",
  },
  {
    icon: Layers,
    title: "One team across the stack",
    body: "The same studio that plans the campaign builds the site and the cloud it runs on. That removes the hand-off gap where marketing, design and engineering each guess at what the others meant.",
  },
  {
    icon: Wrench,
    title: "Built to be handed over",
    body: "You get a staging link to review, documentation for anything you will maintain yourself, and a project management workspace. We would rather you could run it than need us for every change.",
  },
];

export default async function AboutPage() {
  const seo = await getGlobalSeoSafe();
  const base = seo.canonicalBase;

  const breadcrumbJsonLd = {
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
        name: "About",
        item: absoluteUrl("/about", base),
      },
    ],
  };

  // The post schema types its author as a Person and links here, so this page
  // has to describe a person-shaped entity rather than a bare studio name.
  // `worksFor` and `knowsAbout` are the honest fields: no invented job titles,
  // no credentials, no tenure.
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: `${seo.siteName} Team`,
    url: absoluteUrl("/about", base),
    description:
      "The SKORA studio — a digital marketing and technology team based in Noida, India, writing and building across growth, web, cloud and product engineering.",
    worksFor: {
      "@type": "Organization",
      name: seo.siteName,
      url: base,
    },
    knowsAbout: SERVICES.map((service) => service.navName),
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: seo.siteName,
    url: base,
    email: DEFAULT_SITE_CORE.email,
    telephone: DEFAULT_SITE_CORE.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: DEFAULT_SITE_CORE.address,
      addressCountry: "IN",
    },
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(seo.ogImage || "/logo.png", base),
    },
  };

  const jsonLd = [breadcrumbJsonLd, personJsonLd, organizationJsonLd];

  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
        />
      ))}

      <main className="relative min-h-screen overflow-x-hidden bg-main font-sans text-ink">
        {/* Hero */}
        <section className="relative overflow-hidden bg-paper pb-14 pt-28 sm:pb-16 sm:pt-32">
          <div
            className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]"
            aria-hidden="true"
          />
          <div className="section-wrap relative">
            <Reveal variant="blur" className="max-w-3xl space-y-6">
              <nav
                aria-label="Breadcrumb"
                className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-faint"
              >
                <Link href="/" className="transition-colors hover:text-accent">
                  Home
                </Link>
                <span aria-hidden="true">/</span>
                <span className="text-sub">About</span>
              </nav>

              <span className="kicker">The studio</span>
              <SplitHeading as="h1" className="display-hero text-4xl sm:text-6xl">
                Marketing, engineering, <span className="display-accent text-accent">one team.</span>
              </SplitHeading>
              <p className="max-w-2xl text-base font-medium leading-relaxed text-sub sm:text-lg">
                SKORA is a digital marketing and technology studio based in Noida, India. We work
                across the whole arc of a digital business — the campaign that earns attention, the
                website that converts it, the cloud and product systems that keep it running.
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <Link href="/contact" className="btn-primary group">
                  <span>Start a project</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/services" className="btn-secondary">
                  See what we do
                </Link>
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

        {/* Principles */}
        <section className="border-t border-line bg-main py-16 sm:py-20">
          <div className="section-wrap">
            <SectionHeader
              badge="How we work"
              title={
                <>
                  Three habits that <span className="display-accent text-accent">hold up.</span>
                </>
              }
              subtext="The parts of a delivery that decide whether a project is worth doing twice."
            />
            <Reveal
              variant="fade-up"
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
              staggerSelector="[data-principle]"
              stagger={0.09}
            >
              {PRINCIPLES.map((principle) => (
                <div
                  key={principle.title}
                  data-principle
                  className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-6"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <principle.icon size={24} aria-hidden="true" />
                  </span>
                  <h2 className="text-base font-extrabold tracking-tight text-ink">
                    {principle.title}
                  </h2>
                  <p className="text-sm font-medium leading-relaxed text-sub">{principle.body}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* The team behind the articles */}
        <section className="border-t border-line bg-paper py-16 sm:py-20">
          <div className="section-wrap">
            <SectionHeader
              badge="The byline"
              title={
                <>
                  Who writes <span className="display-accent text-accent">on Insights.</span>
                </>
              }
              subtext="Every article on this site is written and edited in-house, by the people who did the work. Each post carries its author's name, and the schema behind it points here."
            />
            <Reveal variant="fade-up" className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-6 md:col-span-2">
                <h3 className="text-lg font-extrabold tracking-tight text-ink">The SKORA studio</h3>
                <p className="text-sm font-medium leading-relaxed text-sub">
                  The byline on an article is a person at SKORA, not a content farm or a guest
                  contributor network. Work is split across strategy, design, front-end, backend and
                  growth, and the person closest to the problem writes about it — a campaign lead on
                  paid acquisition, a platform engineer on deployment, a designer on interface
                  systems. Where an article needs a client&apos;s data or an engineer&apos;s detail, it
                  is written by whoever ran that work.
                </p>
                <p className="text-sm font-medium leading-relaxed text-sub">
                  Because the same people deliver the projects, the articles stay accountable: if we
                  publish something here, we are the ones who have to stand behind it on a live
                  build.
                </p>
                <Link
                  href="/insights"
                  className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[11px] font-black uppercase tracking-widest text-accent hover:underline"
                >
                  Read the insights <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>

              {/* Studio contact card — the address is the real one from
                  lib/site-defaults.ts, which the footer and contact page share. */}
              <address className="flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-6 not-italic">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-faint">
                  Where we are
                </h3>
                <p className="flex gap-3 text-sm font-medium leading-relaxed text-sub">
                  <MapPin size={16} className="mt-1 shrink-0 text-accent" aria-hidden="true" />
                  <span>{DEFAULT_SITE_CORE.address}</span>
                </p>
                <p className="flex gap-3 text-sm font-medium text-sub">
                  <Mail size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  <a href={`mailto:${DEFAULT_SITE_CORE.email}`} className="hover:text-accent">
                    {DEFAULT_SITE_CORE.email}
                  </a>
                </p>
                <p className="flex gap-3 text-sm font-medium text-sub">
                  <Phone size={16} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  <a href={`tel:${DEFAULT_SITE_CORE.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                    {DEFAULT_SITE_CORE.phone}
                  </a>
                </p>
                <p className="mt-auto pt-1 text-xs font-bold uppercase tracking-wider text-accent">
                  {DEFAULT_SITE_CORE.responseGuarantee}
                </p>
              </address>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-main pb-16 pt-4 sm:pb-20">
          <div className="section-wrap">
            <CtaBand
              title={
                <>
                  Bring us the <span className="display-accent">hard one.</span>
                </>
              }
              description="Migrations with no documentation, campaigns that stopped converting, products that outgrew their stack. Those are the projects we enjoy."
              primaryLabel="Talk to the team"
              primaryHref="/contact"
              secondaryLabel="Browse services"
              secondaryHref="/services"
              trustNote={CTA_TRUST_LINE}
            />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}