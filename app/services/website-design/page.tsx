"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import Card3D from "@/components/Card3D";
import { Layout, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function WebsiteDesignPage() {
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const capabilities = [
    {
      title: "Bespoke Next.js 16 Architectures",
      desc: "High-performance frontends built with Next.js 16 App Router, React 19, TypeScript, and server-side components for maximum speed and security.",
      metrics: "Sub-100ms LCP",
    },
    {
      title: "Modern Glassmorphism & Micro-animations",
      desc: "Stunning visual aesthetics with dark ambient lighting, subtle glassmorphic blurs, and smooth GSAP animation transitions.",
      metrics: "High Conversion",
    },
    {
      title: "Core Web Vitals 99+ Speed Tuning",
      desc: "Zero-CLS layout stability, optimized WebP/AVIF image pipelines, code-splitting, and edge CDN distribution.",
      metrics: "99/100 PageSpeed",
    },
    {
      title: "Mobile-First Responsive Engineering",
      desc: "Pixel-perfect experience across all mobile, tablet, and desktop screens with custom touch gestures and instant load times.",
      metrics: "100% Responsive",
    },
  ];

  const techStack = [
    "Next.js 16",
    "React 19",
    "Tailwind CSS v4+",
    "TypeScript",
    "GSAP Animations",
    "Framer Motion",
    "Vercel Edge",
    "PostCSS",
  ];

  const deliverables = [
    "Custom UI/UX Wireframes & Interactive Prototypes",
    "Full-Stack Next.js Codebase with TypeScript",
    "SEO Schema Markup & OpenGraph Metadata",
    "Headless CMS Integration (Sanity / Strapi)",
    "Speed Optimization & Lighthouse 95+ Audit",
    "SSL Security & Domain CDN Setup",
  ];

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();
      gsap.utils.toArray<HTMLElement>(".gsap-scroll-card").forEach((card) => {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
            },
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-[#F8F9F6] text-[#0B1310] font-sans selection:bg-[#2563EB] selection:text-white relative overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setConsultationModalOpen(true)} />

      {/* Hero Header — Consultiv Dribbble Theme */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-sm text-xs font-semibold">
            <Layout className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[#0B1310] font-bold">✦ WEB ENGINEERING & DESIGN EXPERTISE ✦</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0B1310] tracking-tight leading-[1.02] uppercase">
            WEBSITE DESIGN & <br />
            <span className="text-[#2563EB]">HIGH-CONVERTING WEB APPS</span>
          </h1>

          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Bespoke Next.js and React web applications engineered with modern glassmorphic UI cards, sub-second page loads, and high conversion rate optimization.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setConsultationModalOpen(true)}
              className="px-8 py-4 rounded-full bg-[#0B1310] hover:bg-[#2563EB] text-white font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <span>Start Web Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Feature Gallery Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#E2E8F0] bg-white group cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
            alt="Web Design Studio"
            className="w-full h-[400px] sm:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </motion.div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-left mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2563EB]">
            Technical Standards /
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0B1310] uppercase mt-1">
            CORE CAPABILITIES & SPEED STANDARDS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {capabilities.map((cap, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="gsap-scroll-card"
            >
              <Card3D maxTilt={10} className="p-8 rounded-[2.2rem] bg-white border border-[#E2E8F0] shadow-lg space-y-4 h-full">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold font-mono">
                    {cap.metrics}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-[#0B1310]">{cap.title}</h3>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">{cap.desc}</p>
              </Card3D>
            </motion.div>
          ))}
        </div>

        {/* Tech Stack Chips */}
        <div className="mt-12 p-8 rounded-[2rem] bg-white border border-[#E2E8F0] shadow-lg gsap-scroll-card">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-4">
            STACK & FRAMEWORKS WE USE
          </h4>
          <div className="flex flex-wrap gap-3">
            {techStack.map((tech, idx) => (
              <span key={idx} className="px-4 py-2 rounded-xl bg-[#F8F9F6] border border-[#E2E8F0] text-xs font-bold text-[#0B1310]">
                ⚡ {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Light Glass Deliverables Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-[3rem] border border-[#E2E8F0] shadow-xl my-12">
        <div className="text-left mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2563EB]">
            What You Receive /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0B1310] mt-1">
            PROJECT DELIVERABLES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliverables.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="gsap-scroll-card p-6 rounded-2xl bg-[#F8F9F6] border border-[#E2E8F0] flex items-start gap-4 hover:border-[#2563EB]/60 transition-colors shadow-md"
            >
              <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5 border border-[#2563EB]/30">
                <Check size={16} />
              </div>
              <p className="text-sm font-bold text-slate-800 leading-snug">{item}</p>
            </motion.div>
          ))}
        </div>

        {/* Liquid Emerald CTA Banner */}
        <div className="mt-24 relative rounded-[3rem] overflow-hidden bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#0284C7] p-10 sm:p-16 text-center text-white border border-[#2563EB]/30 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight uppercase">
              READY TO BUILD YOUR NEXT WEB APP?
            </h2>
            <p className="text-white/90 text-sm font-medium">
              Let's discuss your project scope, custom architecture, and launch timeline.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setConsultationModalOpen(true)}
                className="px-10 py-4 rounded-full bg-white hover:bg-slate-100 text-[#0B1310] font-black text-sm shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Book Free Consultation
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer onOpenConsultation={() => setConsultationModalOpen(true)} />
      <ContactModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        defaultService="Website Design & Engineering"
      />
    </main>
  );
}
