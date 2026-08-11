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
  Layers,
  Globe,
  Zap,
  Activity,
  Volume2,
} from "lucide-react";
import { motion } from "framer-motion";
import Card3D from "./Card3D";
import gsap from "gsap";

// Web Audio API Synthesizer Chime for Pluckable Strings
const playPluckSound = (frequency = 440) => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {
    // Ignore audio policy restrictions
  }
};

// 3D Animated Background Sparkle Particles for Footer
const Footer3DParticles = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const particles = Array.from({ length: 28 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8]"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
            y: Math.random() * 600,
            opacity: Math.random() * 0.7 + 0.2,
            scale: Math.random() * 2 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -300 - 50],
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

// TRIONN Style Interactive Pluckable Strings Logo
const TRIONNPluckableLogo = () => {
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const frequencies = [329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];

  const handlePluck = (index: number) => {
    setActiveLine(index);
    playPluckSound(frequencies[index % frequencies.length]);
    setTimeout(() => setActiveLine(null), 400);
  };

  return (
    <div className="relative py-8 flex flex-col items-center justify-center select-none group/logo cursor-pointer">
      <div className="flex items-center gap-2 mb-2">
        <Volume2 size={14} className="text-cyan-400 animate-pulse" />
        <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
          ✦ Hover & Pluck Strings For Interactive Audio ✦
        </span>
      </div>

      <div className="relative w-full max-w-4xl h-28 flex items-center justify-between px-4 border-y border-white/10 my-4 bg-gradient-to-r from-transparent via-cyan-950/20 to-transparent">
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
                ? "bg-cyan-400 shadow-[0_0_25px_#38bdf8]"
                : "bg-gradient-to-b from-blue-600/40 via-cyan-400/20 to-blue-600/40 hover:bg-cyan-400"
            }`}
          />
        ))}

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-6xl sm:text-8xl lg:text-9xl font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-blue-400 opacity-90 drop-shadow-[0_0_35px_rgba(56,189,248,0.5)]">
            SKORA
          </span>
        </div>
      </div>
    </div>
  );
};

interface FooterProps {
  onOpenConsultation?: (topic?: string) => void;
}

export default function Footer({ onOpenConsultation }: FooterProps) {
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
        ".gsap-trionn-footer",
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
      className="relative text-white pt-20 pb-12 overflow-hidden bg-gradient-to-b from-[#02040A] via-[#050814] to-[#010206] border-t border-cyan-500/30 [perspective:1200px]"
    >
      {/* 3D Animated Background Particles */}
      <Footer3DParticles />

      {/* TRIONN Ambient Light & Grid */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent rounded-[100%] blur-[140px] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 1. TRIONN PLUCKABLE STRINGS BRAND EMBLEM */}
        <TRIONNPluckableLogo />

        {/* 2. 4-COLUMN 3D GLASS CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 py-12 border-y border-white/10">
          {/* Brand & Telemetry Card */}
          <div className="gsap-trionn-footer">
            <Card3D maxTilt={8} className="h-full p-6 rounded-2xl bg-[#090D1A]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
              <Link href="/" className="text-3xl font-extrabold tracking-tight flex items-center gap-2 text-white">
                <span>SKORA</span>
                <span className="text-blue-500 font-black">.digital</span>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_20px_#22d3ee] animate-pulse" />
              </Link>
              <p className="text-[#94A3B8] text-sm leading-relaxed font-medium">
                Architecting mission-critical enterprise platforms, healthcare IT systems, and high-converting AI digital marketing engines.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
                  <Globe size={14} />
                  <span>MUMBAI, IN • {timeString}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>99.99% Cloud Uptime</span>
                </div>
              </div>
            </Card3D>
          </div>

          {/* Core Divisions Card */}
          <div className="gsap-trionn-footer">
            <Card3D maxTilt={8} className="h-full p-6 rounded-2xl bg-[#090D1A]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-3">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2">
                Core Divisions
              </h4>
              <ul className="space-y-2 text-xs font-medium text-[#94A3B8]">
                {[
                  { name: "Digital Marketing & AI SEO", link: "/services/digital-marketing" },
                  { name: "Website Design & Web Apps", link: "/services/website-design" },
                  { name: "Mobile Applications", link: "/services/mobile-development" },
                  { name: "Cloud Services & DevOps", link: "/services/cloud-services" },
                  { name: "SaaS Platform Engineering", link: "/services/saas-development" },
                  { name: "Project Management (PMS)", link: "/services/pms" },
                  { name: "CRM Automations", link: "/services/crm" },
                ].map((item, idx) => (
                  <li key={idx} className="hover:text-cyan-300 transition-colors">
                    <Link href={item.link} className="flex items-center gap-2">
                      <ArrowRight size={12} className="text-blue-500 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card3D>
          </div>

          {/* Specialized IT & Doctor Agency Card */}
          <div className="gsap-trionn-footer">
            <Card3D maxTilt={8} className="h-full p-6 rounded-2xl bg-[#090D1A]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-3">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2">
                Specialized Solutions
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-[#94A3B8]">
                <li className="hover:text-emerald-400 transition-colors">
                  <Link href="/healthcare" className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Activity size={14} />
                    <span>Healthcare Division for Doctors</span>
                  </Link>
                </li>
                <li>
                  <button onClick={() => onOpenConsultation?.()} className="hover:text-cyan-300 transition-colors text-left flex items-center gap-2">
                    <ShieldCheck size={14} className="text-cyan-400" />
                    <span>Request Free SKORA Audit</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenConsultation?.()} className="hover:text-cyan-300 transition-colors text-left flex items-center gap-2">
                    <Calendar size={14} className="text-blue-400" />
                    <span>Schedule Consultation</span>
                  </button>
                </li>
                <li>
                  <a href="#capabilities" className="hover:text-cyan-300 transition-colors flex items-center gap-2">
                    <Layers size={14} className="text-purple-400" />
                    <span>Explore Capabilities</span>
                  </a>
                </li>
              </ul>
            </Card3D>
          </div>

          {/* Intelligence Wire Newsletter Card */}
          <div className="gsap-trionn-footer">
            <Card3D maxTilt={8} className="h-full p-6 rounded-2xl bg-[#090D1A]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-3">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2">
                Intelligence Wire
              </h4>
              <p className="text-xs text-[#94A3B8] font-medium leading-relaxed">
                Get tech architecture dispatches & growth blueprints weekly.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="space-y-2.5">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter work email"
                  required
                  className="w-full bg-[#05070E] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(34,211,238,0.3)] flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {newsletterSubmitted ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-300" />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    <>
                      <span>Join Intelligence Network</span>
                      <Send size={12} />
                    </>
                  )}
                </button>
              </form>
            </Card3D>
          </div>
        </div>

        {/* 3. TRIONN BOTTOM BAR WITH FLOATING MAGNETIC SOCIAL SPHERES & TOP BUTTON */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-6 text-xs font-medium text-[#64748B] relative z-20">
          <p>© {new Date().getFullYear()} SKORA Technologies Inc. All rights reserved.</p>

          <div className="flex items-center gap-3">
            {/* Facebook Orb */}
            <motion.a
              whileHover={{ y: -4, scale: 1.1 }}
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="w-10 h-10 bg-[#090D1A] hover:bg-[#1877F2] hover:text-white rounded-full flex items-center justify-center transition-all border border-white/15 text-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
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
              className="w-10 h-10 bg-[#090D1A] hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] hover:text-white rounded-full flex items-center justify-center transition-all border border-white/15 text-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
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
              className="w-10 h-10 bg-[#090D1A] hover:bg-[#0A66C2] hover:text-white rounded-full flex items-center justify-center transition-all border border-white/15 text-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </motion.a>

            {/* Glowing Back-to-Top Button */}
            <button
              onClick={scrollToTop}
              className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600/30 to-cyan-500/30 border border-cyan-400/50 hover:border-cyan-300 rounded-full text-xs font-mono font-bold text-white transition-all shadow-[0_0_25px_rgba(34,211,238,0.35)] hover:shadow-[0_0_40px_rgba(56,189,248,0.7)] cursor-pointer ml-4 backdrop-blur-md"
            >
              <span>TOP</span>
              <ArrowUp size={14} className="group-hover:-translate-y-1 transition-transform text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
