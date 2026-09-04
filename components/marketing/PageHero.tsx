"use client";

import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface NeonPillProps {
  icon?: LucideIcon;
  children: React.ReactNode;
  accentClass?: string;
  className?: string;
}

/** Dark glass mono micro-label pill with a neon status dot. */
export default function NeonPill({ icon: Icon, children, accentClass = "text-sky-300", className = "" }: NeonPillProps) {
  return (
    <span
      className={`glass-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-mono font-bold uppercase tracking-[0.18em] ${className}`}
    >
      {Icon ? <Icon size={14} className={accentClass} /> : null}
      <span className={`w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-pulse ${className.includes("emerald") ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : ""}`} />
      <span className="text-slate-200">{children}</span>
    </span>
  );
}

interface SectionHeadingProps {
  label: string;
  title: React.ReactNode;
  description?: string;
  align?: "left" | "center";
  accentClass?: string;
}

/** Consistent mono-label + kinetic title + lede heading block. */
export function SectionHeading({ label, title, description, align = "center", accentClass = "text-sky-400" }: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto items-center" : "text-left items-start";
  return (
    <div className={`flex max-w-3xl flex-col gap-4 ${alignClass}`}>
      <span className={`font-mono-accent text-xs font-bold uppercase tracking-[0.22em] ${accentClass}`}>
        {label} /
      </span>
      <h2 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base font-medium leading-relaxed text-slate-400 sm:text-lg">{description}</p>
      ) : null}
    </div>
  );
}

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;
}

/** Dark glass surface used for forms, document bodies and feature groups. */
export function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <div className={`glass-card rounded-[2.5rem] ${className}`}>{children}</div>
  );
}

interface PageHeroProps {
  icon: LucideIcon;
  badge: string;
  title: React.ReactNode;
  description: string;
  ctaLabel: string;
  onCta: () => void;
  imageUrl: string;
  imageAlt: string;
  accentClass?: string;
}

/**
 * Dark 3D hero shared by all marketing sub-pages: WebGL-free ambient orbs +
 * perspective grid + glow panels so it stays cheap on every route.
 */
export function PageHero({ icon: Icon, badge, title, description, ctaLabel, onCta, imageUrl, imageAlt, accentClass = "text-sky-400" }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8">
      {/* Ambient deep-space orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="bg-radial-halo absolute -top-40 left-1/2 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full blur-[120px]" />
        <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-blue-600/10 blur-[130px] animate-float-slow" />
        <div className="absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-[130px] animate-float-reverse" />
        <div className="grid-floor" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl space-y-6"
        >
          <NeonPill icon={Icon} accentClass={accentClass}>
            {badge}
          </NeonPill>

          <h1 className="text-4xl font-black uppercase leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {title}
          </h1>

          <p className="text-lg font-medium leading-relaxed text-slate-400">{description}</p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onCta}
              className="btn-primary cursor-pointer text-sm"
            >
              <span>{ctaLabel}</span>
              <motion.span className="inline-block" whileHover={{ x: 4 }}>
                →
              </motion.span>
            </button>
          </div>
        </motion.div>

        {/* Feature gallery banner with neon rim */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="neon-border group relative mt-16 cursor-pointer overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0B0F19]/60 shadow-[0_25px_80px_rgba(2,6,23,0.8)]"
        >
          {/* Laser accent sweeping across the top edge */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 z-20 h-px overflow-hidden">
            <div className="animate-beam-sweep h-px w-1/3 bg-gradient-to-r from-transparent via-sky-400 to-transparent" />
          </div>
          <img
            src={imageUrl}
            alt={imageAlt}
            className="h-[400px] w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105 sm:h-[500px]"
          />
          <div className="media-dark absolute inset-0 bg-gradient-to-t from-[#05070E] via-[#05070E]/25 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}

interface CtaBannerProps {
  title: string;
  subtitle: string;
  buttonLabel?: string;
  onCta: () => void;
}

/** Liquid neon gradient CTA banner (shared by all sub-pages). */
export function CtaBanner({ title, subtitle, buttonLabel = "Book Free Consultation", onCta }: CtaBannerProps) {
  return (
    <div className="media-dark relative mt-24 overflow-hidden rounded-[3rem] border border-sky-500/25 bg-gradient-to-br from-[#0B1B45] via-[#0A2A66] to-[#062A4D] p-10 text-center shadow-[0_0_60px_rgba(37,99,235,0.25)] sm:p-16">
      {/* Liquid glow layers */}
      <motion.div
        aria-hidden="true"
        animate={{ x: ["-30%", "30%", "-30%"], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-1/2 left-0 h-[140%] w-full bg-gradient-to-r from-transparent via-sky-400/25 to-transparent blur-[60px]"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />

      <div className="relative mx-auto max-w-2xl space-y-6">
        <h2 className="text-4xl font-black uppercase leading-tight tracking-tight text-white sm:text-5xl">
          {title}
        </h2>
        <p className="text-sm font-medium text-slate-300">{subtitle}</p>
        <div className="flex justify-center pt-4">
          <button onClick={onCta} className="btn-primary cursor-pointer text-sm">
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
