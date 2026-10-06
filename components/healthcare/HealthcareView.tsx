"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";
import Reveal from "@/components/animation/Reveal";
import SplitHeading from "@/components/animation/SplitHeading";
import SectionHeader from "@/components/landing/SectionHeader";
import CtaBand from "@/components/landing/CtaBand";
import { useConsultation } from "@/context/ConsultationContext";
import { HEALTHCARE } from "@/lib/healthcare";
import { CTA, CTA_TRUST_LINE, TRUST_SIGNALS } from "@/lib/cta";

/** Pre-selects this option in the shared consultation modal. */
const MODAL_SERVICE_NAME = "Healthcare & clinics";

/**
 * Body of /healthcare. Client because it opens the shared consultation modal;
 * `app/healthcare/page.tsx` stays the server route that owns metadata + schema.
 *
 * Same anatomy as `ServicePageTemplate` (hero → blocks → deliverables → CTA)
 * so the two read as one system. No navbar or scroll-progress bar here: both are
 * hoisted into the root layout via SiteChrome, and rendering a second one is
 * what made the previous version of this page fight the chrome.
 */
export default function HealthcareView() {
  const { openConsultation } = useConsultation();

  // Pre-selects the service in the shared modal, so the visitor who clicks
  // through from this page lands on a form already scoped to healthcare rather
  // than an empty picker. Wrapped rather than passed straight to onClick:
  // `openConsultation` takes an optional service name, not a click event.
  const openHealthcareConsultation = useCallback(
    () => openConsultation(MODAL_SERVICE_NAME),
    [openConsultation]
  );

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-main font-sans text-ink">
      {/* Hero */}
      <section className="relative overflow-hidden bg-paper pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div
          className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]"
          aria-hidden="true"
        />
        <div className="section-wrap relative">
          <Reveal variant="blur" className="max-w-3xl space-y-6">
            <span className="kicker">{HEALTHCARE.kicker}</span>
            <SplitHeading as="h1" className="display-hero text-4xl sm:text-6xl lg:text-7xl" delay={0.08}>
              {HEALTHCARE.headline}{" "}
              <span className="display-accent text-accent">{HEALTHCARE.headlineAccent}</span>
            </SplitHeading>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-sub sm:text-lg">
              {HEALTHCARE.lead}
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              <button type="button" onClick={openHealthcareConsultation} className="btn-primary group">
                <span>{HEALTHCARE.primaryCta}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a href="#what-we-build" className="btn-secondary">
                See what we build
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

      {/* Hero image */}
      <section className="pb-16 sm:pb-20">
        <div className="section-wrap">
          <Reveal variant="fade-up" className="overflow-hidden rounded-[2rem] border border-line bg-surface">
            {/*
              `fill` so the wrapper owns the box: the image is a fixed-height
              crop, not a fixed-size asset, and declaring width/height here
              would reserve space for a ratio that is not the rendered one.
            */}
            <div className="relative h-[260px] w-full sm:h-[400px] lg:h-[460px]">
              <Image
                src={HEALTHCARE.heroImage}
                alt={HEALTHCARE.heroImageAlt}
                fill
                // Largest contentful element on the page, and the first thing a
                // visitor was asked for.
                preload
                sizes="(min-width: 1280px) 1216px, (min-width: 1024px) 96vw, 100vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* What we build */}
      <section id="what-we-build" className="border-t border-line bg-main py-16 sm:py-20">
        <div className="section-wrap">
          <SectionHeader
            badge="Services"
            title={HEALTHCARE.blocksTitle}
            subtext="Scoped as one piece of work, with a written plan before anything starts."
          />
          <Reveal
            variant="fade-up"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            staggerSelector="[data-block]"
            stagger={0.09}
          >
            {HEALTHCARE.blocks.map((block) => (
              <div
                key={block.title}
                data-block
                className="flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <block.icon size={22} aria-hidden="true" />
                  </span>
                  <span className="rounded-full border border-line px-3 py-1 text-[10px] font-black uppercase tracking-widest text-faint">
                    {block.tag}
                  </span>
                </div>
                <h2 className="text-lg font-extrabold tracking-tight text-ink">{block.title}</h2>
                <p className="text-sm font-medium leading-relaxed text-sub">{block.description}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Deliverables */}
      <section className="border-t border-line bg-paper py-16 sm:py-20">
        <div className="section-wrap">
          <Reveal variant="fade-up" className="grid gap-10 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-5">
              <SectionHeader
                badge="Included"
                title={HEALTHCARE.deliverablesTitle}
                subtext="The same base scope on every healthcare project, so there are no surprises at handover."
              />
            </div>
            <div className="lg:col-span-7">
              <Reveal
                variant="fade-up"
                className="space-y-3"
                staggerSelector="[data-deliverable]"
                stagger={0.07}
              >
                {HEALTHCARE.deliverables.map((item) => (
                  <p
                    key={item}
                    data-deliverable
                    className="flex items-start gap-3 rounded-xl border border-line bg-surface px-5 py-4 text-sm font-medium text-sub"
                  >
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                    {item}
                  </p>
                ))}
              </Reveal>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Links into the real service pages */}
      <section className="border-t border-line bg-main py-16 sm:py-20">
        <div className="section-wrap">
          <SectionHeader
            badge="How it fits"
            title={HEALTHCARE.relatedTitle}
            subtext={HEALTHCARE.relatedIntro}
          />
          <Reveal
            variant="fade-up"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
            staggerSelector="[data-service-link]"
            stagger={0.06}
          >
            {HEALTHCARE.serviceLinks.map((link) => (
              <Link
                key={link.slug}
                data-service-link
                href={`/services/${link.slug}`}
                className="group flex h-full flex-col gap-2 rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card"
              >
                <h3 className="text-base font-extrabold text-ink transition-colors group-hover:text-accent">
                  {link.title}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-sub">{link.description}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[11px] font-black uppercase tracking-widest text-accent">
                  Learn more
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
                {HEALTHCARE.ctaTitle.split("?")[0]}{" "}
                <span className={CTA.accent}>need?</span>
              </>
            }
            description={HEALTHCARE.ctaDescription}
            primaryLabel={CTA.primaryLabel}
            secondaryLabel="All services"
            secondaryHref="/services"
            trustNote={CTA_TRUST_LINE}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}