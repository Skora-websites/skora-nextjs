"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import Card3D from "@/components/Card3D";
import { Layout, ArrowRight, Check, Globe } from "lucide-react";
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
    <main ref={containerRef} className="min-h-screen bg-[#F4F6F1] text-[#0B1310] font-sans relative overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setConsultationModalOpen(true)} />

      {/* Hero Header */}
      <section className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-[#E1E6DF] bg-white text-slate-800 shadow-sm">
            <Globe className="w-4 h-4 text-[#22C55E]" />
            <span>WEBSITE DESIGN &amp; WEB ENGINEERING</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0B1310] tracking-tight leading-[1.02] uppercase">
            BESPOKE NEXT.JS WEBSITES &amp; <br />
            <span className="text-[#22C55E]">HIGH CONVERSION WEB APPS</span>
          </h1>

          <p className="text-lg text-slate-600 font-normal leading-relaxed">
            Sub-second page speeds, custom UI/UX design systems, responsive mobile layouts, and high-converting web engineering engineered to scale revenue.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setConsultationModalOpen(true)}
              className="btn-emerald text-sm font-semibold px-8 py-3.5 rounded-lg cursor-pointer flex items-center gap-2"
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
          className="mt-16 rounded-xl overflow-hidden border border-[#E1E6DF] bg-white group cursor-pointer shadow-lg"
        >
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
            alt="Website Engineering Studio"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80";
            }}
            className="w-full h-[400px] sm:h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </motion.div>
      </section>

      {/* Capabilities Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E6DF]">
        <div className="text-left mb-12 space-y-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#22C55E]">
            Web Engineering /
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1310] uppercase">
            WEBSITE CAPABILITIES
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
              <Card3D maxTilt={6} className="p-8 rounded-xl bg-white border border-[#E1E6DF] space-y-4 h-full shadow-md">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] text-xs font-mono font-bold border border-[#22C55E]/20">
                    {cap.metrics}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0B1310]">{cap.title}</h3>
                <p className="text-sm text-slate-600 font-normal leading-relaxed">{cap.desc}</p>
              </Card3D>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack Chips Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E6DF]">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#22C55E]">
            Modern Tech Stack /
          </span>
          <h3 className="text-2xl font-bold text-[#0B1310] uppercase">
            ENGINEERED WITH MODERN SPEED FRAMEWORKS
          </h3>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {techStack.map((tech, idx) => (
            <span
              key={idx}
              className="px-4 py-2 rounded-lg bg-white border border-[#E1E6DF] text-xs font-mono font-bold text-[#0B1310] shadow-sm hover:border-[#22C55E] transition-colors"
            >
              ✦ {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E6DF]">
        <div className="text-left mb-16 space-y-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#22C55E]">
            Deliverables /
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase text-[#0B1310]">
            WEBSITE DELIVERABLES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliverables.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="gsap-scroll-card p-6 rounded-xl bg-white border border-[#E1E6DF] flex items-start gap-4 shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5 border border-[#22C55E]/20">
                <Check size={14} />
              </div>
              <p className="text-sm font-medium text-slate-700 leading-snug">{item}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-20 relative rounded-xl overflow-hidden bg-white p-10 sm:p-16 text-center text-[#0B1310] border border-[#E1E6DF] shadow-lg">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight uppercase">
              READY TO BUILD A HIGH-CONVERTING WEBSITE?
            </h2>
            <p className="text-slate-600 text-sm font-normal">
              Let's discuss how sub-second Next.js web engineering can transform your digital conversion rate.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setConsultationModalOpen(true)}
                className="btn-emerald text-sm font-semibold px-8 py-3.5 rounded-lg cursor-pointer"
              >
                Book Web Strategy Session
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
