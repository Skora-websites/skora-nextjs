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
    <section className="relative overflow-hidden border-t border-white/10 bg-[#05070E]/70 py-24">
      <style>{`
        @keyframes scrollMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .animate-scroll-marquee { display: flex; width: max-content; animation: scrollMarquee 42s linear infinite; }
        .marquee-track:hover .animate-scroll-marquee { animation-play-state: paused; }
      `}</style>

      <div aria-hidden="true" className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: "radial-gradient(rgba(148,163,184,0.4) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      <motion.div aria-hidden="true" animate={{ x: [0, 40, 0], y: [0, -25, 0] }} transition={{ duration: 19, repeat: Infinity, ease: "easeInOut" }} className="absolute -right-40 top-0 h-96 w-96 rounded-full bg-blue-600/15 blur-[100px]" />

      <div className="relative mx-auto mb-14 max-w-3xl px-4 text-center">
        <div className="glass-pill inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em]">
          <Star size={14} className="fill-sky-400 text-sky-400" /> Global Trust
        </div>
        <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-5xl">Partnered with the Best</h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">Hear from engineering leaders and executives who scaled their operations with Skora.</p>
      </div>

      <div className="marquee-track relative flex overflow-hidden py-4">
        <div className="edge-fade-l pointer-events-none absolute inset-y-0 left-0 z-10 w-20 md:w-48" />
        <div className="edge-fade-r pointer-events-none absolute inset-y-0 right-0 z-10 w-20 md:w-48" />

        <div className="animate-scroll-marquee gap-6 px-3">
          {[...testimonials, ...testimonials].map((item, index) => (
            <article key={`${item.name}-${index}`} className="glass-card glass-card-hover w-[350px] shrink-0 rounded-2xl p-8">
              <Quote size={36} className="text-sky-500/60" />
              <div className="mt-5 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={15} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mt-5 min-h-28 text-[15px] font-medium leading-relaxed text-slate-300">&ldquo;{item.quote}&rdquo;</p>
              <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
                <div className="flex items-center gap-3">
                  {/* Avatar with neon glow ring */}
                  <span className="relative inline-flex rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 p-[2px] shadow-[0_0_16px_rgba(56,189,248,0.45)]">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80";
                      }}
                      className="h-11 w-11 rounded-full border-2 border-[#05070E] object-cover"
                    />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.name}</h3>
                    <p className="font-mono-accent text-[10px] font-bold uppercase tracking-wider text-sky-300">{item.role}</p>
                  </div>
                </div>
                <item.Logo size={19} className="text-sky-400" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
