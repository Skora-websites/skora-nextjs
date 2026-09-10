"use client";

import React from "react";
import { motion } from "framer-motion";
import { ClipboardList, PenTool, Code2, Rocket } from "lucide-react";

const steps = [
  {
    index: "01",
    Icon: ClipboardList,
    title: "Scope in writing",
    description: "You get a fixed scope, timeline, and price before anything starts. No open-ended billing.",
  },
  {
    index: "02",
    Icon: PenTool,
    title: "Design you approve",
    description: "Wireframes first, then final layouts. Two structured revision rounds — no endless loops.",
  },
  {
    index: "03",
    Icon: Code2,
    title: "Build in the open",
    description: "Weekly staging demos, shared task board, and a group chat with the people doing the work.",
  },
  {
    index: "04",
    Icon: Rocket,
    title: "Launch and handover",
    description: "Deployment, analytics, documentation, and a training session so your team owns it after.",
  },
];

export default function ProcessSection() {
  return (
    <section className="border-t border-line bg-main py-20 sm:py-28">
      <div className="section-wrap">
        <div className="max-w-2xl pb-12">
          <span className="kicker">How we work</span>
          <h2 className="display-hero mt-4 text-4xl sm:text-6xl">
            No black box, <span className="display-accent text-accent">ever.</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.index}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-line bg-surface p-7 transition-all hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(11,18,32,0.25)]"
            >
              <span className="ghost-numeral absolute -right-2 -top-4 text-7xl transition group-hover:[-webkit-text-stroke-color:var(--accent-primary)]">
                {s.index}
              </span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <s.Icon size={22} />
              </span>
              <h3 className="relative mt-6 text-lg font-extrabold tracking-tight">{s.title}</h3>
              <p className="relative mt-2 text-sm font-medium leading-relaxed text-sub">{s.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
