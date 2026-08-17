"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star, Quote, Hexagon, Activity, Triangle, CircleDot, Cloud } from "lucide-react";

const testimonials = [
  { quote: "Skora didn't just build our platform; they re-engineered our entire digital architecture. The cloud scalability they achieved is entirely unmatched.", name: "Elena Rodriguez", role: "Chief Technology Officer", Logo: Hexagon, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
  { quote: "HIPAA compliance was our biggest hurdle. Skora delivered a seamless, ultra-secure EHR portal that our clinicians actually love using every day.", name: "Dr. James Carter", role: "Director of Health IT", Logo: Activity, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" },
  { quote: "Their cinematic UI approach completely elevated our brand. We saw a 300% increase in user retention within the first month of launching.", name: "Sarah Lin", role: "VP of Product", Logo: Triangle, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" },
  { quote: "Flawless cross-platform execution. Skora delivered our iOS and Android applications ahead of schedule without sacrificing any performance.", name: "Marcus Johnson", role: "Founder & CEO", Logo: CircleDot, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
  { quote: "The architectural precision of the Skora team is phenomenal. They handled our AWS migration with zero downtime during peak operations.", name: "Priya Patel", role: "Lead Architect", Logo: Cloud, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
];

export default function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#080A0F] py-28">
      <style>{`
        @keyframes scrollMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-scroll-marquee { display: flex; width: max-content; animation: scrollMarquee 42s linear infinite; }
        .marquee-track:hover .animate-scroll-marquee { animation-play-state: paused; }
      `}</style>

      <div className="relative mx-auto mb-16 max-w-3xl px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded text-xs font-semibold uppercase tracking-wider text-neutral-300 border border-white/10 bg-white/[0.03] px-3 py-1">
          <Star size={13} className="fill-[#22C55E] text-[#22C55E]" /> Global Trust
        </div>
        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">Partnered with the Best</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-neutral-400 font-normal">Hear from engineering leaders and executives who scaled their operations with Skora.</p>
      </div>

      <div className="marquee-track relative flex overflow-hidden py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#080A0F] to-transparent md:w-48" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#080A0F] to-transparent md:w-48" />

        <div className="animate-scroll-marquee gap-6 px-3">
          {[...testimonials, ...testimonials].map((item, index) => (
            <article key={`${item.name}-${index}`} className="w-[350px] shrink-0 rounded-xl border border-white/10 bg-[#0E121B] p-7 transition duration-200 hover:border-white/25">
              <Quote size={28} className="text-[#22C55E]/40" />
              <div className="mt-4 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={14} className="fill-[#22C55E] text-[#22C55E]" />
                ))}
              </div>
              <p className="mt-4 min-h-24 text-sm font-normal leading-relaxed text-neutral-300">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80";
                    }}
                    className="h-10 w-10 rounded-full object-cover filter grayscale-[20%]"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white">{item.name}</h3>
                    <p className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">{item.role}</p>
                  </div>
                </div>
                <item.Logo size={18} className="text-[#22C55E]" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
