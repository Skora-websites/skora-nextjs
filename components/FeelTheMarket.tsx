"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Globe2, Activity, Users } from "lucide-react";

const metrics = [
  {
    Icon: TrendingUp,
    value: "+312%",
    label: "Average campaign ROI",
  },
  {
    Icon: Globe2,
    value: "15+",
    label: "Global markets served",
  },
  {
    Icon: Activity,
    value: "99.99%",
    label: "Cloud infrastructure uptime",
  },
  {
    Icon: Users,
    value: "120+",
    label: "Brands scaled with Skora",
  },
];

export default function FeelTheMarket() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-main py-28 border-t border-line">
      {/* Radial light mesh */}
      <div className="market-halo absolute inset-0 pointer-events-none" />

      {/* Soft floating orbs */}
      {mounted && (
        <>
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, -24, 0], x: [0, 18, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-16 left-[8%] h-64 w-64 rounded-full bg-sky-300/20 blur-[90px] pointer-events-none"
          />
          <motion.div
            aria-hidden="true"
            animate={{ y: [0, 20, 0], x: [0, -16, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 right-[6%] h-72 w-72 rounded-full bg-blue-300/20 blur-[100px] pointer-events-none"
          />
        </>
      )}

      {/* Statement */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        <motion.span
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
        >
          Why teams choose Skora
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-6 text-5xl font-extrabold tracking-tight text-ink sm:text-6xl lg:text-7xl leading-[1.02]"
        >
          feel the market <br />
          <span className="text-gradient">in your favour.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-sub"
        >
          Dominate every channel. Our engineered digital strategies align your enterprise with the platforms that drive absolute, quantifiable scale.
        </motion.p>
      </div>

      {/* Metric cards */}
      <div className="relative z-10 mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ Icon, value, label }, idx) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            className="glass-card glass-card-hover rounded-2xl p-6 text-center"
          >
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Icon size={22} />
            </div>
            <p className="text-3xl font-extrabold tracking-tight text-ink">{value}</p>
            <p className="mt-1.5 text-sm font-medium text-sub">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
