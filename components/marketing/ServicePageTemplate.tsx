"use client";

import React from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, LucideIcon } from "lucide-react";
import Card3D from "@/components/Card3D";
import { PageHero, SectionHeading, CtaBanner } from "./PageHero";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ServiceCapability {
  title: string;
  desc: string;
  metrics: string;
}

export interface ServicePageData {
  icon: LucideIcon;
  badge: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  ctaLabel: string;
  imageUrl: string;
  imageAlt: string;
  capabilitiesLabel: string;
  capabilitiesTitle: string;
  capabilities: ServiceCapability[];
  techStack?: string[];
  deliverablesTitle: string;
  deliverables: string[];
  ctaTitle: string;
  ctaSubtitle: string;
  defaultService: string;
  accentClass?: string;
}

interface ServicePageTemplateProps {
  data: ServicePageData;
  onOpenConsultation: () => void;
}

/** Shared dark-neon layout for all 9 /services/* pages (content arrays are per-page). */
export default function ServicePageTemplate({ data, onOpenConsultation }: ServicePageTemplateProps) {
  const {
    icon,
    badge,
    titleLine1,
    titleLine2,
    description,
    ctaLabel,
    imageUrl,
    imageAlt,
    capabilitiesLabel,
    capabilitiesTitle,
    capabilities,
    techStack,
    deliverablesTitle,
    deliverables,
    ctaTitle,
    ctaSubtitle,
    accentClass = "text-sky-400",
  } = data;

  const runReveal = (container: HTMLElement | null) => {
    if (typeof window === "undefined" || !container) return () => {};
    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();
      gsap.utils.toArray<HTMLElement>(".gsap-scroll-card").forEach((card) => {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          }
        );
      });
    }, container);
    return () => ctx.revert();
  };

  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const cleanup = runReveal(containerRef.current);
    return cleanup;
  }, []);

  return (
    <div ref={containerRef}>
      <PageHero
        icon={icon}
        badge={badge}
        title={
          <>
            {titleLine1} <br />
            <span className={`text-gradient-cyan ${accentClass}`}>{titleLine2}</span>
          </>
        }
        description={description}
        ctaLabel={ctaLabel}
        onCta={onOpenConsultation}
        imageUrl={imageUrl}
        imageAlt={imageAlt}
        accentClass={accentClass}
      />

      {/* Capabilities — dark 3D tilt cards */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-left">
          <SectionHeading label={capabilitiesLabel} title={capabilitiesTitle} align="left" accentClass={accentClass} />
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {capabilities.map((cap, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="gsap-scroll-card"
            >
              <Card3D
                maxTilt={10}
                className="glass-card glass-card-hover neon-border h-full space-y-4 rounded-[2.2rem] p-8"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold font-mono ${accentClass}`}>
                    {cap.metrics}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-white">{cap.title}</h3>
                <p className="text-sm font-medium leading-relaxed text-slate-400">{cap.desc}</p>
              </Card3D>
            </motion.div>
          ))}
        </div>

        {/* Tech stack chips */}
        {techStack && techStack.length > 0 ? (
          <div className="glass-card gsap-scroll-card mt-12 rounded-[2rem] p-8">
            <h3 className="font-mono-accent mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              STACK &amp; FRAMEWORKS WE USE
            </h3>
            <div className="flex flex-wrap gap-3">
              {techStack.map((tech, idx) => (
                <span
                  key={idx}
                  className="glass-pill rounded-xl px-4 py-2 text-xs font-bold text-slate-200"
                >
                  ⚡ {tech}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {/* Deliverables + CTA */}
      <section className="glass-card mx-auto my-12 max-w-7xl rounded-[3rem] px-4 py-20 sm:px-6 lg:px-12">
        <div className="mb-16 text-left">
          <SectionHeading label="What You Receive" title={deliverablesTitle} align="left" accentClass={accentClass} />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {deliverables.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="gsap-scroll-card flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-6 shadow-md transition-colors hover:border-sky-500/40"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-sky-500/40 bg-sky-500/10 text-sky-300 mt-0.5 shadow-[0_0_12px_rgba(56,189,248,0.3)]">
                <Check size={16} />
              </div>
              <p className="text-sm font-bold leading-snug text-slate-200">{item}</p>
            </motion.div>
          ))}
        </div>

        <CtaBanner title={ctaTitle} subtitle={ctaSubtitle} onCta={onOpenConsultation} />
      </section>
    </div>
  );
}
