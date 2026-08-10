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
  Code,
  Smartphone,
  Cloud,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import Card3D from "./Card3D";
import gsap from "gsap";

const FloatingParticles = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const particles = Array.from({ length: 24 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_15px_#38bdf8]"
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
            y: Math.random() * 600,
            opacity: Math.random() * 0.6 + 0.2,
            scale: Math.random() * 2 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -350 - 50],
            opacity: [null, Math.random() * 0.9 + 0.3, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

const EqualizerBars = () => (
  <div className="flex items-end gap-1 h-6">
    {[40, 70, 30, 90, 50, 80, 60, 100, 45, 85].map((height, idx) => (
      <motion.div
        key={idx}
        animate={{ height: ["20%", `${height}%`, "30%"] }}
        transition={{ duration: 0.8 + idx * 0.1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="w-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full"
      />
    ))}
  </div>
);

interface FooterProps {
  onOpenConsultation?: (topic?: string) => void;
}

export default function Footer({ onOpenConsultation }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-footer-card",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: "power3.out" }
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
      className="relative text-white pt-24 pb-12 overflow-hidden bg-gradient-to-b from-[#030712] via-[#050B1A] to-[#010308] border-t border-cyan-500/30 [perspective:1200px]"
    >
      {/* 3D Atmospheric Particles */}
      <FloatingParticles />

      {/* Deep Space Ambient Light Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-gradient-to-b from-blue-600/20 via-cyan-500/10 to-transparent rounded-[100%] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Cyber Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 1. GIANT 3D HOLOGRAPHIC CALLOUT BANNER WITH WAVE EQUALIZER */}
        <div className="mb-20">
          <Card3D
            maxTilt={6}
            className="group relative p-8 sm:p-14 rounded-3xl bg-gradient-to-br from-[#0B0F19]/95 via-[#081329]/95 to-[#0B0F19]/95 border-2 border-cyan-500/40 backdrop-blur-3xl shadow-[0_0_80px_rgba(37,99,235,0.25)] overflow-hidden"
          >
            {/* Holographic Laser Scanner Line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#38bdf8]" />
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/35 transition-all duration-700 pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 [transform-style:preserve-3d]">
              <div>
                <div className="flex items-center gap-3 mb-4 [transform:translateZ(30px)]">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(34,211,238,0.25)]">
                    <Sparkles size={14} className="animate-spin" />
                    <span>✦ SKORA ENTERPRISE ARCHITECTURE ✦</span>
                  </div>
                  <EqualizerBars />
                </div>

                <h3 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 [transform:translateZ(40px)]">
                  Ready to scale your platform <br className="hidden sm:inline" />
                  into the <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-blue-400 drop-shadow-[0_0_25px_rgba(56,189,248,0.6)]">future?</span>
                </h3>

                <p className="text-[#94A3B8] text-base max-w-xl font-medium leading-relaxed [transform:translateZ(20px)]">
                  Partner with SKORA&apos;s elite engineers to build high-performance cloud infrastructure, high-converting AI SEO campaigns, and cinematic web interfaces.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto [transform:translateZ(35px)]">
                <button
                  onClick={() => onOpenConsultation?.()}
                  className="w-full sm:w-auto px-9 py-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-base rounded-2xl transition-all duration-300 shadow-[0_0_35px_rgba(37,99,235,0.5)] hover:shadow-[0_0_55px_rgba(56,189,248,0.8)] hover:scale-105 flex items-center justify-center gap-2 group/btn cursor-pointer"
                >
                  <Calendar size={18} className="group-hover/btn:rotate-12 transition-transform" />
                  <span>Book a Consultation</span>
                  <ArrowRight size={18} className="group-hover/btn:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </Card3D>
        </div>

        {/* 2. 4-COLUMN 3D CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-16 border-b border-slate-800">
          {/* Brand & Telemetry Card */}
          <div className="gsap-footer-card">
            <Card3D maxTilt={8} className="h-full p-6 rounded-2xl bg-[#0B0F19]/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
              <Link href="/" className="text-3xl font-extrabold tracking-tight flex items-center gap-2 text-white">
                <span>SKORA</span>
                <span className="text-blue-500 font-black">.digital</span>
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_20px_#22d3ee] animate-pulse" />
              </Link>
              <p className="text-[#94A3B8] text-sm leading-relaxed font-medium">
                Architecting mission-critical enterprise platforms, HIPAA-compliant healthcare systems, and digital growth engines globally.
              </p>
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>99.99% Cloud Uptime</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
                  <ShieldCheck size={14} />
                  <span>HIPAA & Enterprise Certified</span>
                </div>
              </div>
            </Card3D>
          </div>

          {/* Core Divisions Card */}
          <div className="gsap-footer-card">
            <Card3D maxTilt={8} className="h-full p-6 rounded-2xl bg-[#0B0F19]/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-3">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2">
                Core Divisions
              </h4>
              <ul className="space-y-2 text-xs font-medium text-[#94A3B8]">
                {["Digital Marketing & AI SEO", "Website Design & Web Apps", "Mobile Applications", "Cloud Services & DevOps", "SaaS Platform Engineering", "Project Management (PMS)", "CRM Automations"].map((item, idx) => (
                  <li key={idx} className="hover:text-cyan-300 transition-colors">
                    <Link href="/services/digital-marketing" className="flex items-center gap-2">
                      <ArrowRight size={12} className="text-blue-500 shrink-0" />
                      <span className="truncate">{item}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card3D>
          </div>

          {/* Healthcare & Platform Card */}
          <div className="gsap-footer-card">
            <Card3D maxTilt={8} className="h-full p-6 rounded-2xl bg-[#0B0F19]/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-3">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest border-b border-white/10 pb-2">
                Specialized IT
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-[#94A3B8]">
                <li className="hover:text-emerald-400 transition-colors">
                  <Link href="/services/pms" className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Activity size={14} />
                    <span>Healthcare IT & EHR</span>
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
          <div className="gsap-footer-card">
            <Card3D maxTilt={8} className="h-full p-6 rounded-2xl bg-[#0B0F19]/80 border border-white/10 backdrop-blur-xl shadow-xl space-y-3">
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

        {/* 3. BOTTOM BAR WITH FLOATING NEON 3D SOCIAL SPHERES & TOP BUTTON */}
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
              className="w-10 h-10 bg-[#0B0F19] hover:bg-[#1877F2] hover:text-white rounded-full flex items-center justify-center transition-all border border-white/15 text-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
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
              className="w-10 h-10 bg-[#0B0F19] hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] hover:text-white rounded-full flex items-center justify-center transition-all border border-white/15 text-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </motion.a>

            {/* Twitter/X Orb */}
            <motion.a
              whileHover={{ y: -4, scale: 1.1 }}
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="w-10 h-10 bg-[#0B0F19] hover:bg-black hover:border-slate-500 hover:text-white rounded-full flex items-center justify-center transition-all border border-white/15 text-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </motion.a>

            {/* LinkedIn Orb */}
            <motion.a
              whileHover={{ y: -4, scale: 1.1 }}
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="w-10 h-10 bg-[#0B0F19] hover:bg-[#0A66C2] hover:text-white rounded-full flex items-center justify-center transition-all border border-white/15 text-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
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
