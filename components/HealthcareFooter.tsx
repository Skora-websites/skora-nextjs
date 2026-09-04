"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Stethoscope } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Card3D from "./Card3D";
import { useSiteContent } from "@/context/SiteContentContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Interactive 3D Medical Emerald Floating Particles (dark variant)
const HealthcarePetals = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const particles = Array.from({ length: 24 });

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-400 opacity-50 shadow-[0_0_18px_rgba(52,211,153,0.7)]"
          style={{ width: i % 4 === 0 ? "3px" : "8px", height: i % 4 === 0 ? "3px" : "8px" }}
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1200),
            y: Math.random() * 800,
            scale: Math.random() * 1.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -400 - 100],
            x: [null, "+=50", "-=50"],
            opacity: [null, 0.7, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

interface HealthcareFooterProps {
  onOpenConsultation?: (topic?: string) => void;
}

export default function HealthcareFooter({ onOpenConsultation }: HealthcareFooterProps) {
  const siteContent = useSiteContent();
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedInterest, setSelectedInterest] = useState<string>("CLINIC-SEO");
  const [selectedBudget, setSelectedBudget] = useState<string>("2.5K-5K");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const footerRef = useRef<HTMLElement>(null);

  const interests = [
    "CLINIC-SEO",
    "DOCTOR-WEBSITE",
    "TELEHEALTH-APP",
    "PATIENT-RECALL",
    "BRANDING",
  ];

  const budgets = ["<25K", "25K-50K", "50K-1.5L", ">1.5L", "NEED GUIDANCE"];

  // GSAP ScrollTrigger On-Scroll Animations Setup
  useEffect(() => {
    if (typeof window === "undefined" || !footerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();

      // 1. Title Reveal Animation
      gsap.fromTo(
        ".gsap-doc-footer-title",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".gsap-doc-footer-title",
            start: "top 85%",
          },
        }
      );

      // 2. Form Card 3D Entrance
      gsap.fromTo(
        ".gsap-doc-footer-form",
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 1.1,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: ".gsap-doc-footer-form",
            start: "top 85%",
          },
        }
      );

      // 3. Footer Links Stagger Reveal
      gsap.fromTo(
        ".gsap-doc-footer-row",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".gsap-doc-footer-row",
            start: "top 90%",
          },
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setLoading(true);

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          email: email,
          phone: "+91 92173 75835",
          company: "Healthcare Practice",
          service: selectedInterest || "Healthcare IT & EHR Systems",
          budget: selectedBudget,
          message: `Healthcare Footer Inquiry for ${selectedInterest} with budget ${selectedBudget}`,
          source: "Healthcare Footer Form",
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <footer
      ref={footerRef}
      className="media-dark relative overflow-hidden bg-[#04120B] pt-24 pb-12 text-white selection:bg-emerald-500 selection:text-white"
    >
      {/* Neon divider beam along the top edge */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />

      {/* 3D Medical Emerald Floating Particles */}
      <HealthcarePetals />

      {/* Deep Ambient Dark Shield for Crisp Contrast */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#04120B]/80 via-[#04120B]/60 to-[#04120B]/95" />
        {/* Ambient Fresh Emerald Glow Accents */}
        <div className="absolute left-10 top-10 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 h-[420px] w-[420px] rounded-full bg-teal-500/[0.07] blur-[140px] pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-[90rem] space-y-24 px-4 sm:px-6 lg:px-8">
        {/* TOP SECTION: BRAND LOGO, LET'S CONNECT & 3D DARK GLASSMORPHIC CONTACT CARD */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Left Column: Brand Emblem, Headline & Mail CTA */}
          <div className="space-y-10 lg:col-span-5">
            {/* Top Serif Logo */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: -3 }}
              className="inline-flex cursor-pointer items-center gap-2 text-4xl font-serif italic tracking-wider text-emerald-400"
            >
              <Stethoscope className="h-8 w-8 text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
              <span>s.health</span>
            </motion.div>

            <div className="gsap-doc-footer-title space-y-6">
              <span className="block font-mono-accent text-xs font-bold uppercase tracking-widest text-emerald-400">
                NOW IT&apos;S TIME TO ELEVATE YOUR MEDICAL PRACTICE &amp; PATIENT ACQUISITION
              </span>
              <h2 className="text-5xl font-serif leading-[1.02] tracking-tight text-white sm:text-7xl lg:text-8xl">
                Let&apos;s connect
              </h2>
            </div>

            <div className="gsap-doc-footer-title">
              <a
                href={`mailto:${siteContent.healthcareEmail || siteContent.email || "ashish17427@gmail.com"}`}
                onClick={(e) => {
                  if (onOpenConsultation) {
                    onOpenConsultation("Healthcare Email Inquiry");
                  }
                }}
                className="group inline-flex transform cursor-pointer items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-7 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-[0_0_30px_rgba(52,211,153,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_45px_rgba(52,211,153,0.55)]"
              >
                <span>SEND A MAIL</span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-700 transition-transform group-hover:rotate-45">
                  <ArrowUpRight size={14} />
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: 3D Interactive Dark Glassmorphic Contact Card */}
          <div className="gsap-doc-footer-form lg:col-span-7">
            <Card3D maxTilt={6} className="w-full">
              <div className="relative space-y-8 overflow-hidden rounded-[2.5rem] border border-emerald-500/25 bg-[#06180F]/85 p-6 shadow-[0_25px_60px_rgba(2,20,12,0.8)] backdrop-blur-2xl sm:p-10">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="submitted"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6 py-16 text-center"
                    >
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400 bg-emerald-500/10 text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.4)]">
                        <CheckCircle2 size={40} />
                      </div>
                      <h3 className="font-serif text-3xl text-white">
                        Practice Audit Scheduled!
                      </h3>
                      <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-slate-400">
                        Thank you, <strong className="text-white">{name}</strong>. Our medical practice growth director will respond to <strong className="text-white">{email}</strong> within 4 business hours.
                      </p>
                      <button
                        onClick={() => setSubmitted(false)}
                        className="btn-secondary cursor-pointer rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-wider"
                      >
                        Schedule Another Session
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      {/* Section 1: Contact Info */}
                      <div className="space-y-3">
                        <label className="block font-mono-accent text-xs font-bold uppercase tracking-wider text-slate-400">
                          CONTACT INFO*
                        </label>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="YOUR NAME*"
                            className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3.5 font-mono-accent text-xs font-bold uppercase text-white shadow-inner outline-none transition-all placeholder:text-slate-500 focus:border-emerald-400 focus:bg-white/10"
                          />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="YOUR E-MAIL*"
                            className="w-full rounded-full border border-white/10 bg-white/5 px-6 py-3.5 font-mono-accent text-xs font-bold uppercase text-white shadow-inner outline-none transition-all placeholder:text-slate-500 focus:border-emerald-400 focus:bg-white/10"
                          />
                        </div>
                      </div>

                      {/* Section 2: Interest Pills */}
                      <div className="space-y-3">
                        <label className="block font-mono-accent text-xs font-bold uppercase tracking-wider text-slate-400">
                          YOU ARE INTERESTED IN*
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {interests.map((item) => {
                            const active = selectedInterest === item;
                            return (
                              <motion.button
                                key={item}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedInterest(item)}
                                className={`cursor-pointer rounded-full border px-5 py-2.5 font-mono-accent text-[11px] font-bold tracking-wider transition-all ${
                                  active
                                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
                                    : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:text-white"
                                }`}
                              >
                                {item}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 3: Budget Pills */}
                      <div className="space-y-3">
                        <label className="block font-mono-accent text-xs font-bold uppercase tracking-wider text-slate-400">
                          Your budget in INR (₹)*
                        </label>
                        <div className="flex flex-wrap gap-2.5">
                          {budgets.map((b) => {
                            const active = selectedBudget === b;
                            return (
                              <motion.button
                                key={b}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedBudget(b)}
                                className={`cursor-pointer rounded-full border px-5 py-2.5 font-mono-accent text-[11px] font-bold tracking-wider transition-all ${
                                  active
                                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.35)]"
                                    : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-400/40 hover:text-white"
                                }`}
                              >
                                {b}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Submit Action Button */}
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_30px_rgba(52,211,153,0.35)] transition-all"
                      >
                        {loading ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : (
                          <span>START DOCTOR JOURNEY</span>
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </Card3D>
          </div>
        </div>

        {/* BOTTOM FOOTER ROW */}
        <div className="relative grid grid-cols-1 gap-10 border-t border-white/10 pt-12 text-xs font-medium text-slate-400 sm:grid-cols-2 lg:grid-cols-4">
          {/* Neon divider beam */}
          <div aria-hidden="true" className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />

          {/* Column 1: Keep in touch */}
          <div className="gsap-doc-footer-row space-y-3">
            <h4 className="text-sm font-bold tracking-wide text-white">
              Keep in touch
            </h4>
            <p className="font-mono-accent text-slate-300">{siteContent.healthcareEmail || siteContent.email || "ashish17427@gmail.com"}</p>
            <p className="pt-4 text-slate-500" suppressHydrationWarning>
              © {new Date().getFullYear()} SKORA Healthcare IT Division. All Rights Reserved.
            </p>
          </div>

          {/* Column 2: FIND US HERE */}
          <div className="gsap-doc-footer-row space-y-3">
            <h4 className="font-mono-accent text-xs font-bold uppercase tracking-widest text-emerald-400">
              FIND US HERE
            </h4>
            <p className="font-medium leading-relaxed text-slate-300">
              {siteContent.address || "Gaur City 2, Greater Noida, Uttar Pradesh 201308, India"}
            </p>
          </div>

          {/* Column 3: CONTACT US (Social Media Icons) */}
          <div className="gsap-doc-footer-row space-y-4">
            <h4 className="font-mono-accent text-xs font-bold uppercase tracking-widest text-emerald-400">
              CONTACT US
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              {/* Facebook Icon */}
              <motion.a
                whileHover={{ y: -4, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 shadow-lg transition-all hover:bg-[#1877F2] hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z" />
                </svg>
              </motion.a>

              {/* Instagram Icon */}
              <motion.a
                whileHover={{ y: -4, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 shadow-lg transition-all hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#e6683c] hover:to-[#bc1888] hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </motion.a>

              {/* X (Twitter) Icon */}
              <motion.a
                whileHover={{ y: -4, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X Twitter"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 shadow-lg transition-all hover:bg-slate-800 hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </motion.a>

              {/* LinkedIn Icon */}
              <motion.a
                whileHover={{ y: -4, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 shadow-lg transition-all hover:bg-[#0A66C2] hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </motion.a>

              {/* WhatsApp Icon */}
              <motion.a
                whileHover={{ y: -4, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href={`https://wa.me/${(siteContent.phone || "+919217375835").replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 shadow-lg transition-all hover:bg-[#25D366] hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.205 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </motion.a>
            </div>
          </div>

          {/* Column 4: LEGAL & POLICIES */}
          <div className="gsap-doc-footer-row relative space-y-4">
            <h4 className="font-mono-accent text-xs font-bold uppercase tracking-widest text-emerald-400">
              LEGAL &amp; POLICIES
            </h4>
            <ul className="space-y-2.5 font-medium text-slate-300">
              <li>
                <Link
                  href="/terms"
                  className="inline-block font-semibold transition-all duration-200 hover:translate-x-1 hover:text-emerald-300"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="inline-block font-semibold transition-all duration-200 hover:translate-x-1 hover:text-emerald-300"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
