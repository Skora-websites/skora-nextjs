"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import SectionHeader from "@/components/landing/SectionHeader";
import CtaBand from "@/components/landing/CtaBand";
import { ArrowRight, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ServiceCapability {
  title: string;
  description: string;
  metric: string;
}

export interface ServicePageTemplateProps {
  pillIcon: LucideIcon;
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

export default function ServicePageTemplate(props: ServicePageTemplateProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();
      gsap.utils.toArray<HTMLElement>(".gsap-scroll-card").forEach((card) => {
        gsap.fromTo(
          card,
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-main font-sans text-ink">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setModalOpen(true)} />

      <section className="relative overflow-hidden bg-paper pb-16 pt-32 sm:pb-20 sm:pt-36">
        <div className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]" aria-hidden="true" />
        <div className="section-wrap relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl space-y-6"
          >
            <span className="kicker">{props.pill}</span>
            <h1 className="display-hero text-5xl sm:text-7xl">
              {props.title}
            </h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-sub sm:text-lg">{props.lead}</p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button type="button" onClick={() => setModalOpen(true)} className="btn-primary group">
                <span>{props.primaryCta}</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a href="#capabilities" className="btn-secondary">
                View capabilities
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="glass-card group relative mt-12 cursor-default overflow-hidden rounded-[2rem]"
          >
            <img
              src={props.heroImage}
              alt={props.heroImageAlt}
              className="h-[320px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] sm:h-[440px]"
              loading="eager"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-main/70 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>

      <section id="capabilities" className="border-t border-line bg-main py-16 sm:py-20">
        <div className="section-wrap">
          <SectionHeader title={props.capabilitiesTitle} subtext={props.capabilitiesIntro} />
          <div className="overflow-hidden rounded-3xl border border-line bg-surface">
            {props.capabilities.map((cap, i) => (
              <div
                key={cap.title}
                className="gsap-scroll-card grid grid-cols-[auto_1fr] items-start gap-4 border-b border-line px-6 py-7 last:border-0 sm:grid-cols-[72px_1fr_auto] sm:items-center sm:gap-8 sm:px-8"
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
          </div>

          <div className="gsap-scroll-card mt-8 rounded-3xl bg-ink-deep p-7 text-white sm:p-8">
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
        </div>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <div className="section-wrap">
          <SectionHeader title={props.deliverablesTitle} />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {props.deliverables.map((item, i) => (
              <div
                key={item}
                className="gsap-scroll-card group flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-20px_rgba(11,18,32,0.25)]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent font-display text-sm italic text-white">
                  {i + 1}
                </span>
                <p className="pt-1.5 text-sm font-bold leading-snug text-sub">{item}</p>
              </div>
            ))}
          </div>

        <div className="mt-16">
          <CtaBand
            title={props.ctaTitle}
            description={props.ctaDescription}
            primaryLabel={props.ctaButton}
            onPrimary={() => setModalOpen(true)}
            secondaryNote="Response within 4 business hours. NDA available on request."
          />
        </div>
        </div>
      </section>

      <Footer onOpenConsultation={() => setModalOpen(true)} />
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultService={props.modalServiceName}
      />
    </main>
  );
}
