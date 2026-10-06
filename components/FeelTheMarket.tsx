"use client";

import React from "react";
import Reveal from "@/components/animation/Reveal";
import SplitHeading from "@/components/animation/SplitHeading";
import Counter from "@/components/animation/Counter";

/**
 * Verifiable counts only. AI_RULES.md forbids inventing metrics that cannot be
 * traced to something real, so nothing here claims a project total or an
 * industry breadth we cannot evidence — "9 practices" is the real size of
 * SERVICES, and the response time matches CTA_TRUST_LINE.
 */
const metrics = [
  { value: "9", label: "Service practices", note: "One accountable team" },
  { value: "9", label: "Disciplines in-house", note: "Design, build, marketing" },
  { value: "4 hrs", label: "Response time", note: "Business days, guaranteed" },
  { value: "NDA", label: "Before scoping", note: "On request, standard" },
];

export default function FeelTheMarket() {
  return (
    <section className="navy-band relative overflow-hidden py-20 text-white sm:py-28">
      {/* Lamp sweep — keeps the dark band from reading as a flat colour block. */}
      <span className="beam" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-[0.15]"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 65% 90% at 50% 50%, black, transparent 78%)",
          WebkitMaskImage: "radial-gradient(ellipse 65% 90% at 50% 50%, black, transparent 78%)",
        }}
      />
      {/* Lens vignette — darkens the corners so the numbers sit in the light. */}
      <span
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 78% 70% at 50% 45%, transparent 35%, rgba(6,13,34,0.7) 100%)",
        }}
      />

      <div className="section-wrap relative">
        <div className="flex flex-wrap items-end justify-between gap-6 pb-12">
          <Reveal variant="fade-left" className="max-w-2xl">
            <span className="kicker !text-white/60">Why Skora</span>
            <SplitHeading as="h2" className="display-hero mt-4 text-4xl text-white sm:text-6xl">
              Measured in <span className="display-accent text-white/90">outcomes.</span>
            </SplitHeading>
          </Reveal>
          <Reveal variant="fade-right" delay={0.15} className="max-w-sm">
            <p className="text-sm font-medium leading-relaxed text-white/70">
              No vanity metrics. Every project starts with a number we agree to move —
              then we report against it.
            </p>
          </Reveal>
        </div>

        <Reveal
          variant="fade-up"
          duration={0.8}
          className="relative grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/15 lg:grid-cols-4"
          staggerSelector="[data-metric]"
          stagger={0.1}
        >
          <span
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] bg-gradient-to-r from-white via-white/70 to-transparent"
            aria-hidden="true"
          />
          {metrics.map((m) => (
            <div key={m.label} data-metric className="bg-navy-deep/60 p-7 backdrop-blur-sm sm:p-9">
              <p className="font-display text-5xl italic sm:text-6xl">
                <Counter value={m.value} />
              </p>
              <p className="mt-3 text-sm font-extrabold uppercase tracking-widest">{m.label}</p>
              <p className="mt-1 text-xs font-medium text-white/60">{m.note}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
