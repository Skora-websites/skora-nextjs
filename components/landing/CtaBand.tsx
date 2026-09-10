"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface CtaBandProps {
  title: string;
  description: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryNote?: string;
}

/** Navy enterprise CTA band — one per page max. */
export default function CtaBand({ title, description, primaryLabel, onPrimary, secondaryNote }: CtaBandProps) {
  return (
    <div className="navy-band relative overflow-hidden rounded-[2rem] p-10 text-center text-white sm:p-14">
      <div
        className="absolute inset-0 opacity-20"
        aria-hidden="true"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(ellipse 60% 80% at 50% 50%, black, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 80% at 50% 50%, black, transparent 75%)",
        }}
      />
      <div className="relative mx-auto max-w-2xl space-y-5">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
        <p className="text-sm font-medium leading-relaxed text-white/80 sm:text-base">{description}</p>
        <div className="pt-2">
          <button
            type="button"
            onClick={onPrimary}
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-extrabold text-[#1D4ED8] shadow-xl transition-all hover:-translate-y-0.5 hover:bg-blue-50"
          >
            <span>{primaryLabel}</span>
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          {secondaryNote && <p className="pt-3 text-xs font-medium text-white/60">{secondaryNote}</p>}
        </div>
      </div>
    </div>
  );
}
