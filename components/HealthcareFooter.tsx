"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowUp,
  Sparkles,
  Send,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Activity,
  Globe,
  Volume2,
  Stethoscope,
} from "lucide-react";
import { motion } from "framer-motion";
import Card3D from "./Card3D";
import gsap from "gsap";

// Web Audio API Synthesizer Chime for Pluckable Strings
const playPluckSound = (frequency = 523.25) => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Ignore audio policy restrictions
  }
};

// 3D Animated Background Sage Sparkle Particles for Healthcare Footer
const Healthcare3DParticles = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const particles = Array.from({ length: 24 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-[#1F6B43] shadow-[0_0_12px_#1f6b43]"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
            y: Math.random() * 500,
            opacity: Math.random() * 0.7 + 0.2,
            scale: Math.random() * 2 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -250 - 50],
            opacity: [null, Math.random() * 0.9 + 0.3, 0],
            scale: [null, 1.8, 0.5],
          }}
          transition={{
            duration: Math.random() * 8 + 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// TRIONN Style Doctor Interactive Pluckable Strings Logo (Oral Care Sage Palette)
const HealthcarePluckableLogo = () => {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const frequencies = [349.23, 392.0, 440.0, 523.25, 659.25, 698.46, 783.99];

  const handlePluck = (index: number) => {
    setActiveLine(index);
    playPluckSound(frequencies[index % frequencies.length]);
    setTimeout(() => setActiveLine(null), 400);
  };

  return (
    <div className="relative py-8 flex flex-col items-center justify-center select-none group/logo cursor-pointer">
      <div className="flex items-center gap-2 mb-2">
        <Volume2 size={14} className="text-[#1F6B43] animate-pulse" />
        <span className="text-[11px] font-mono font-bold text-[#1F6B43] uppercase tracking-widest">
          ✦ Hover & Pluck Strings For Doctor Audio Telemetry ✦
        </span>
      </div>

      <div className="relative w-full max-w-4xl h-28 flex items-center justify-between px-4 border-y border-[#DCE8E0] my-4 bg-gradient-to-r from-transparent via-[#E8F2EC]/60 to-transparent">
        {[1, 2, 3, 4, 5, 6, 7].map((num, i) => (
          <motion.div
            key={i}
            onMouseEnter={() => handlePluck(i)}
            animate={{
              scaleY: activeLine === i ? [1, 1.4, 0.8, 1] : 1,
              skewX: activeLine === i ? [0, 15, -15, 0] : 0,
            }}
            transition={{ duration: 0.4 }}
            className={`h-full w-2 sm:w-3 rounded-full cursor-pointer transition-colors duration-200 ${
              activeLine === i
                ? "bg-[#1F6B43] shadow-[0_0_25px_#1f6b43]"
                : "bg-gradient-to-b from-emerald-700/40 via-[#1F6B43]/30 to-emerald-700/40 hover:bg-[#1F6B43]"
            }`}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[0.12em] text-transparent bg-clip-text bg-gradient-to-r from-[#11261D] via-[#1F6B43] to-[#2A8C57] opacity-95 drop-shadow-md uppercase">
            SKORA HEALTH
          </span>
        </div>
      </div>
    </div>
  );
};

interface HealthcareFooterProps {
  onOpenConsultation?: (topic?: string) => void;
}

export default function HealthcareFooter({ onOpenConsultation }: HealthcareFooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const [timeString, setTimeString] = useState("");
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " GMT+5:30"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-doc-footer",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitted(true);
    setTimeout(() => {
      setNewsletterSubmitted(false);
      setNewsletterEmail("");
    }, 4000);
  };

  return (
    <footer
      ref={footerRef}
      className="relative text-[#11261D] pt-20 pb-12 overflow-hidden bg-gradient-to-b from-[#FDFBF7] via-[#F5F2EA] to-[#EFECE3] border-t-2 border-[#1F6B43]/30 [perspective:1200px]"
    >
      {/* Sage Ambient Light Orbs */}
      <Healthcare3DParticles />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-gradient-to-b from-[#1F6B43]/15 via-emerald-200/20 to-transparent rounded-[100%] blur-[140px] pointer-events-none" />

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 1. TRIONN DOCTOR PLUCKABLE STRINGS LOGO */}
        <HealthcarePluckableLogo />

        {/* 2. 4-COLUMN DOCTOR 3D LIGHT GLASS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12 border-y border-[#DCE8E0]">
          {/* Brand & Telemetry Card */}
          <div className="gsap-doc-footer">
            <Card3D maxTilt={8} className="h-full p-6 rounded-2xl bg-white/95 border border-[#DCE8E0] backdrop-blur-xl shadow-lg space-y-4 text-[#11261D]">
              <Link href="/healthcare" className="text-2xl font-extrabold tracking-tight flex items-center gap-2 text-[#11261D]">
                <Stethoscope size={22} className="text-[#1F6B43]" />
                <span>SKORA</span>
                <span className="text-[#1F6B43] font-black">.health</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#1F6B43] shadow-[0_0_15px_#1f6b43] animate-pulse" />
              </Link>
              <p className="text-slate-600 text-sm leading-relaxed font-medium">
                Dedicated digital agency division for doctors, medical specialists, clinics, and hospital practices.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1F6B43]">
                  <Globe size={14} />
                  <span>MUMBAI, IN • {timeString}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                  <span>350+ Partnered Clinics Active</span>
                </div>
              </div>
            </Card3D>
          </div>

          {/* Doctor Growth Services Card */}
          <div className="gsap-doc-footer">
            <Card3D maxTilt={8} className="h-full p-6 rounded-2xl bg-white/95 border border-[#DCE8E0] backdrop-blur-xl shadow-lg space-y-3 text-[#11261D]">
              <h4 className="text-xs font-mono font-bold text-[#1F6B43] uppercase tracking-widest border-b border-slate-200 pb-2">
                Doctor Services
              </h4>
              <ul className="space-y-2 text-xs font-medium text-slate-700">
                {[
                  "Custom Doctor Website Creation",
                  "GMB Profile Optimization",
                  "Social Media & Reels Branding",
                  "Meta Ads & Google PPC",
                  "Google Maps & Local SEO Pack",
                  "Patient Engagement Campaigns",
                  "Medical Content & PR",
                  "Appointment Lead Generation",
                ].map((item, idx) => (
                  <li key={idx} className="hover:text-[#1F6B43] transition-colors flex items-center gap-2">
                    <ArrowRight size={12} className="text-[#1F6B43] shrink-0" />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            </Card3D>
          </div>

          {/* Doctor Packages Card */}
          <div className="gsap-doc-footer">
            <Card3D maxTilt={8} className="h-full p-6 rounded-2xl bg-white/95 border border-[#DCE8E0] backdrop-blur-xl shadow-lg space-y-3 text-[#11261D]">
              <h4 className="text-xs font-mono font-bold text-[#1F6B43] uppercase tracking-widest border-b border-slate-200 pb-2">
                Growth Tiers & Audit
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-slate-700">
                <li>
                  <a href="#packages" className="hover:text-[#1F6B43] transition-colors flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#1F6B43]" />
                    <span>Basic Plan — ₹5,000 / mo</span>
                  </a>
                </li>
                <li>
                  <a href="#packages" className="hover:text-[#1F6B43] transition-colors flex items-center gap-2 font-bold text-[#1F6B43]">
                    <CheckCircle2 size={14} className="text-emerald-700" />
                    <span>Standard Plan (Popular) — ₹15,000 / mo</span>
                  </a>
                </li>
                <li>
                  <a href="#packages" className="hover:text-[#1F6B43] transition-colors flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-[#1F6B43]" />
                    <span>Premium Plan — ₹32,000 / mo</span>
                  </a>
                </li>
                <li>
                  <button onClick={() => onOpenConsultation?.("Doctor Growth Audit")} className="hover:text-[#1F6B43] transition-colors text-left flex items-center gap-2 pt-2 font-bold">
                    <ShieldCheck size={14} className="text-[#1F6B43]" />
                    <span>Free Practice Growth Audit</span>
                  </button>
                </li>
              </ul>
            </Card3D>
          </div>

          {/* Doctor Dispatches Newsletter Card */}
          <div className="gsap-doc-footer">
            <Card3D maxTilt={8} className="h-full p-6 rounded-2xl bg-white/95 border border-[#DCE8E0] backdrop-blur-xl shadow-lg space-y-3 text-[#11261D]">
              <h4 className="text-xs font-mono font-bold text-[#1F6B43] uppercase tracking-widest border-b border-slate-200 pb-2">
                Clinician Dispatches
              </h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Receive weekly healthcare marketing dispatches and patient lead strategy blueprints.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter doctor work email"
                  required
                  className="w-full bg-[#FDFBF7] border border-[#DCE8E0] rounded-xl px-3.5 py-2.5 text-xs text-[#11261D] placeholder-slate-400 focus:outline-none focus:border-[#1F6B43] transition-colors font-medium"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-[#1F6B43] to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {newsletterSubmitted ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-200" />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    <>
                      <span>Join Doctor Network</span>
                      <Send size={12} />
                    </>
                  )}
                </button>
              </form>
            </Card3D>
          </div>
        </div>

        {/* 3. TRIONN BOTTOM BAR WITH DOCTOR SOCIAL SPHERES & TOP BUTTON */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-6 text-xs font-semibold text-slate-600 relative z-20">
          <p>© {new Date().getFullYear()} SKORA Healthcare Digital Division. All rights reserved.</p>

          <div className="flex items-center gap-3">
            {/* Facebook Orb */}
            <motion.a
              whileHover={{ y: -4, scale: 1.1 }}
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 bg-white hover:bg-[#1877F2] hover:text-white rounded-full flex items-center justify-center transition-all border border-slate-300 text-slate-700 shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z" />
              </svg>
            </motion.a>

            {/* Instagram Orb */}
            <motion.a
              whileHover={{ y: -4, scale: 1.1 }}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="w-10 h-10 bg-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] hover:text-white rounded-full flex items-center justify-center transition-all border border-slate-300 text-slate-700 shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </motion.a>

            {/* LinkedIn Orb */}
            <motion.a
              whileHover={{ y: -4, scale: 1.1 }}
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 bg-white hover:bg-[#0A66C2] hover:text-white rounded-full flex items-center justify-center transition-all border border-slate-300 text-slate-700 shadow-sm"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </motion.a>

            {/* Glowing Back-to-Top Button */}
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white border border-[#1F6B43]/50 hover:border-[#1F6B43] rounded-full text-xs font-mono font-bold text-[#11261D] transition-all shadow-md cursor-pointer ml-4 backdrop-blur-md"
            >
              <span>TOP</span>
              <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform text-[#1F6B43]" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
