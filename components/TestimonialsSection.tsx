"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Skora rebuilt our platform and documented everything. Our team now ships updates without waiting on external help.",
    name: "Elena Rodriguez",
    role: "Chief Technology Officer",
  },
  {
    quote: "They delivered our clinic portal with attention to privacy and clinician workflows. Training took one session.",
    name: "Dr. James Carter",
    role: "Director of Health IT",
  },
  {
    quote: "The new website is faster and easier to update. Enquiries from the contact form doubled in two months.",
    name: "Sarah Lin",
    role: "VP of Product",
  },
  {
    quote: "Our iOS and Android apps shipped on the agreed dates, with testing builds shared every week.",
    name: "Marcus Johnson",
    role: "Founder and CEO",
  },
  {
    quote: "They moved our infrastructure to AWS over a weekend plan and stayed on call through the cutover.",
    name: "Priya Patel",
    role: "Lead Architect",
  },
  {
    quote: "Weekly demos meant no surprises. What we approved on Friday was live on Monday.",
    name: "Arjun Mehta",
    role: "Operations Director",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-paper py-20 sm:py-28">
      <div className="section-wrap">
        <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
          <div className="max-w-2xl">
            <span className="kicker">Client words</span>
            <h2 className="display-hero mt-4 text-4xl sm:text-6xl">
              Trusted with <span className="display-accent text-accent">real work.</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className="fill-gold text-gold" />
              ))}
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-faint">5.0 average</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: (i % 3) * 0.08 }}
              className={`flex flex-col justify-between rounded-3xl border border-line p-7 ${
                i === 0 ? "bg-ink-deep text-white md:col-span-2 lg:col-span-1" : "bg-surface"
              }`}
            >
              <div>
                <span className={`font-display text-5xl italic leading-none ${i === 0 ? "text-accent" : "text-accent/60"}`}>
                  &ldquo;
                </span>
                <blockquote className={`-mt-2 text-[15px] font-medium leading-relaxed ${i === 0 ? "text-white/90" : "text-sub"}`}>
                  {t.quote}
                </blockquote>
              </div>
              <figcaption className={`mt-6 flex items-center gap-3 border-t pt-5 ${i === 0 ? "border-white/15" : "border-line"}`}>
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-extrabold ${i === 0 ? "bg-accent text-white" : "bg-elevated text-ink"}`}>
                  {t.name.split(" ").map((w) => w[0]).join("")}
                </span>
                <span>
                  <span className={`block text-sm font-extrabold ${i === 0 ? "text-white" : "text-ink"}`}>{t.name}</span>
                  <span className={`block text-[11px] font-bold uppercase tracking-widest ${i === 0 ? "text-white/60" : "text-faint"}`}>{t.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
