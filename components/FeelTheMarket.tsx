"use client";

import React from "react";
import { motion } from "framer-motion";

const metrics = [
  { value: "120+", label: "Projects delivered", note: "Web, software, apps and marketing" },
  { value: "9", label: "Service practices", note: "One accountable team" },
  { value: "15+", label: "Industries served", note: "Including healthcare" },
  { value: "4 hrs", label: "Response time", note: "Business days, guaranteed" },
];

export default function FeelTheMarket() {
  return (
    <section className="navy-band relative overflow-hidden py-20 text-white sm:py-28">
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
      <div className="section-wrap relative">
        <div className="flex flex-wrap items-end justify-between gap-6 pb-12">
          <div className="max-w-2xl">
            <span className="kicker !text-white/60">Why Skora</span>
            <h2 className="display-hero mt-4 text-4xl text-white sm:text-6xl">
              Measured in <span className="display-accent text-white/90">outcomes.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm font-medium leading-relaxed text-white/70">
            No vanity metrics. Every project starts with a number we agree to move —
            then we report against it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/15 lg:grid-cols-4">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-navy-deep/60 p-7 backdrop-blur-sm sm:p-9"
            >
              <p className="font-display text-5xl italic sm:text-6xl">{m.value}</p>
              <p className="mt-3 text-sm font-extrabold uppercase tracking-widest">{m.label}</p>
              <p className="mt-1 text-xs font-medium text-white/60">{m.note}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
