"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import Card3D from "@/components/Card3D";
import { Palette, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function BrandingPage() {
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const capabilities = [
    {
      title: "Brand Strategy & Market Positioning",
      desc: "Brand Strategy defines who you are and how your audience connects with you. We create clear positioning, messaging, and long-term brand equity.",
      metrics: "Market Dominance",
    },
    {
      title: "Visual Identity & Logo Engineering",
      desc: "Custom logo design, typography systems, color palettes, and comprehensive visual style guides crafted for web and print.",
      metrics: "Bespoke Design",
    },
    {
      title: "Social Media & Performance Ad Creatives",
      desc: "High-converting graphic design assets for Instagram, Facebook, LinkedIn ads, banners, and digital marketing campaigns.",
      metrics: "3.2x Engagement",
    },
    {
      title: "Corporate Guidelines & Brand Assets",
      desc: "Comprehensive brand book documentation, business card designs, presentation templates, and marketing collateral.",
      metrics: "Full Brand Book",
    },
  ];

  const deliverables = [
    "Brand Positioning & Messaging Architecture",
    "Primary Logo, Secondary Mark & Favicon Assets",
    "Complete Typography, Color & Design Token Palette",
    "Brand Style Guide & Corporate Brand Book PDF",
    "Social Media Graphic Templates & Banner Packs",
    "High-Resolution Print & Vector Source Files (AI/SVG/PNG)",
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

      {/* Hero Header */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E2E8F0] shadow-sm text-xs font-semibold">
            <Palette className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[#0B1310] font-bold">✦ BRANDING & VISUAL IDENTITY ✦</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0B1310] tracking-tight leading-[1.02] uppercase">
            CRAFTING ICONIC BRAND <br />
            <span className="text-[#2563EB]">POSITIONING &amp; VISUAL IDENTITY</span>
          </h1>

          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            We define your visual story, build instant brand recognition, and design aesthetic identity systems that command trust.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setConsultationModalOpen(true)}
              className="px-8 py-4 rounded-full bg-[#0B1310] hover:bg-[#2563EB] text-white font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <span>Start Branding Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Feature Gallery Banner with Verified Active Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#E2E8F0] bg-white group cursor-pointer"
        >
          <img
            src="https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1200&q=80"
            alt="Branding Design Studio"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1200&q=80";
            }}
            className="w-full h-[400px] sm:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </motion.div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-left mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2563EB]">
            Brand Excellence /
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0B1310] uppercase mt-1">
            BRANDING CAPABILITIES
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
      </section>

      {/* Light Glass Deliverables Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-white rounded-[3rem] border border-[#E2E8F0] shadow-xl my-12">
        <div className="text-left mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#2563EB]">
            Deliverables /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0B1310] mt-1">
            BRAND DELIVERABLES
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
              READY TO REINVENT YOUR BRAND IDENTITY?
            </h2>
            <p className="text-white/90 text-sm font-medium">
              Let's discuss how customized brand positioning can elevate your business perception.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setConsultationModalOpen(true)}
                className="px-10 py-4 rounded-full bg-white hover:bg-slate-100 text-[#0B1310] font-black text-sm shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Book Brand Strategy Session
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer onOpenConsultation={() => setConsultationModalOpen(true)} />
      <ContactModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        defaultService="Branding & Visual Identity"
      />
    </main>
  );
}
