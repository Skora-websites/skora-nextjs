"use client";

import React from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import SectionHeader from "@/components/landing/SectionHeader";
import CtaBand from "@/components/landing/CtaBand";
import Reveal from "@/components/animation/Reveal";
import SplitHeading from "@/components/animation/SplitHeading";
import Parallax from "@/components/animation/Parallax";
import { ArrowRight, ArrowUpRight, CheckCircle2, LucideIcon } from "lucide-react";
import { useConsultation } from "@/context/ConsultationContext";
import { CTA_TRUST_LINE, TRUST_SIGNALS } from "@/lib/cta";
import { getRelatedServices, SERVICES, type ServiceCapability } from "@/lib/services";

export type { ServiceCapability };

export interface ServicePageTemplateProps {
  /** Resolves the icon, breadcrumbs and related-services links. */
  slug: string;
  pill: string;
  title: React.ReactNode;
  lead: string;
  primaryCta: string;
  heroImage: string;
  heroImageAlt: string;
  capabilitiesTitle: string;
  capabilitiesIntro?: string;
  capabilities: ServiceCapability[];
  stackTitle?: string;
  stack: string[];
  deliverablesTitle: string;
  deliverables: string[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
  modalServiceName: string;
}

/**
 * Shared shell for all nine service pages.
 *
 * Chrome (navbar, progress bar, consultation modal) is hoisted into the root
 * layout; every entrance below goes through Reveal/SplitHeading so each block
 * animates exactly once, on scroll, after the preloader lifts.
 */
export default function ServicePageTemplate(props: ServicePageTemplateProps) {
  const { openConsultation } = useConsultation();
  const openModal = () => openConsultation(props.modalServiceName);

  const service = SERVICES.find((s) => s.slug === props.slug);
  // Icons are component references, which cannot cross the server→client
  // boundary, so the icon is resolved here from the slug instead.
  const PillIcon: LucideIcon = service?.icon ?? CheckCircle2;
  const related = getRelatedServices(props.slug, 3);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-main font-sans text-ink">
      {/* Hero */}
      <section className="relative overflow-hidden bg-paper pb-16 pt-28 sm:pb-20 sm:pt-32">
        <div
          className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]"
          aria-hidden="true"
        />
        <div className="section-wrap relative">
          <Reveal variant="blur" className="max-w-4xl space-y-6">
            {/* Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-faint">
              <Link href="/" className="transition-colors hover:text-accent">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/services" className="transition-colors hover:text-accent">
                Services
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-sub">{props.pill}</span>
            </nav>

            <span className="kicker">
              <PillIcon size={13} aria-hidden="true" />
              {props.pill}
            </span>
            <SplitHeading as="h1" className="display-hero text-4xl sm:text-6xl lg:text-7xl" delay={0.08}>
              {props.title}
            </SplitHeading>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-sub sm:text-lg">
              {props.lead}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button type="button" onClick={openModal} className="btn-primary group">
                <span>{props.primaryCta}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a href="#capabilities" className="btn-secondary">
                View capabilities
              </a>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-xs font-bold text-sub">
              {TRUST_SIGNALS.map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal variant="mask" delay={0.2} className="mt-12">
            <Parallax speed={1.08}>
              <div className="glass-card group relative cursor-default overflow-hidden rounded-[2rem]">
                <img
                  src={props.heroImage}
                  alt={props.heroImageAlt}
                  className="h-[320px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] sm:h-[440px]"
                  loading="eager"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-main/70 via-transparent to-transparent" />
              </div>
            </Parallax>
          </Reveal>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" className="border-t border-line bg-main py-16 sm:py-20">
        <div className="section-wrap">
          <SectionHeader title={props.capabilitiesTitle} subtext={props.capabilitiesIntro} />
          <Reveal
            variant="fade-up"
            className="overflow-hidden rounded-3xl border border-line bg-surface"
            staggerSelector="[data-cap]"
            stagger={0.1}
          >
            {props.capabilities.map((cap, i) => (
              <div
                key={cap.title}
                data-cap
                className="grid grid-cols-[auto_1fr] items-start gap-4 border-b border-line px-6 py-7 last:border-0 sm:grid-cols-[72px_1fr_auto] sm:items-center sm:gap-8 sm:px-8"
              >
                <span className="ghost-numeral text-3xl sm:text-4xl">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="text-lg font-extrabold tracking-tight sm:text-xl">{cap.title}</span>
                  <span className="mt-1 block max-w-2xl text-sm font-medium leading-relaxed text-sub">
                    {cap.description}
                  </span>
                </span>
                <span className="sticker-blue sticker col-start-2 !text-[10px] sm:col-start-auto">
                  {cap.metric}
                </span>
              </div>
            ))}
          </Reveal>

          <Reveal variant="fade-up" delay={0.1} className="mt-8">
            <div className="rounded-3xl bg-ink-deep p-7 text-white sm:p-8">
              <h4 className="mb-4 text-xs font-extrabold uppercase tracking-[0.22em] text-white/60">
                {props.stackTitle ?? "Tools and platforms we work with"}
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {props.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold text-white/90"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Deliverables */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="section-wrap">
          <SectionHeader title={props.deliverablesTitle} />
          <Reveal
            variant="fade-up"
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            staggerSelector="[data-deliverable]"
            stagger={0.09}
          >
            {props.deliverables.map((item, i) => (
              <div
                key={item}
                data-deliverable
                className="group flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(11,18,32,0.25)]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent font-display text-sm italic text-white">
                  {i + 1}
                </span>
                <p className="pt-1.5 text-sm font-bold leading-snug text-sub">{item}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* Related services — keeps the nine pages linked to each other */}
      <section className="border-t border-line bg-main py-16 sm:py-20">
        <div className="section-wrap">
          <SectionHeader
            badge="Keep exploring"
            title={
              <>
                Related <span className="display-accent text-accent">services.</span>
              </>
            }
            subtext="Most engagements combine two or more of these — start with the one that matches the problem."
          />
          <Reveal
            variant="fade-up"
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
            staggerSelector="[data-related]"
            stagger={0.08}
          >
            {related.map((item) => (
              <Link
                key={item.slug}
                data-related
                href={`/services/${item.slug}`}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_16px_36px_-16px_rgba(37,99,235,0.25)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <item.icon size={22} aria-hidden="true" />
                </span>
                <h3 className="text-base font-extrabold tracking-tight text-ink transition-colors group-hover:text-accent">
                  {item.navName}
                </h3>
                <p className="text-sm font-medium leading-relaxed text-sub">{item.navDesc}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[11px] font-black uppercase tracking-widest text-accent">
                  {item.pill}
                  <ArrowUpRight size={14} />
                </span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="section-wrap">
          <CtaBand
            title={props.ctaTitle}
            description={props.ctaDescription}
            primaryLabel={props.ctaButton}
            onPrimary={openModal}
            secondaryLabel="See all services"
            secondaryHref="/services"
            trustNote={CTA_TRUST_LINE}
          />
        </div>
      </section>

      <Footer onOpenConsultation={openModal} />
    </main>
  );
}
