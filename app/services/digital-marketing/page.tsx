"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import Card3D from "@/components/Card3D";
import { Megaphone, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function DigitalMarketingPage() {
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const capabilities = [
    {
      title: "Google My Business & Local Map #1 Ranking",
      desc: "Dominate high-intent local search queries in your zip code with automated review generation, schema citation building, and GMB optimization.",
      metrics: "#1 Map Rank",
    },
    {
      title: "High-ROI Meta & Google PPC Campaigns",
      desc: "Data-driven ad campaigns built around ROAS targets, negative keyword filtering, retargeting pixels, and A/B split landing pages.",
      metrics: "3.8x Avg ROAS",
    },
    {
      title: "Instagram Reels & TikTok Content Studio",
      desc: "Scripted vertical video reels, graphic design carousels, and viral social content designed to build brand authority.",
      metrics: "450k+ Views",
    },
    {
      title: "Conversion Rate Optimization (CRO)",
      desc: "Behavioral heatmaps, user session recordings, micro-copy testing, and checkout funnel optimization to turn clicks into buyers.",
      metrics: "+140% Conversions",
    },
  ];

  const deliverables = [
    "Comprehensive Local SEO & GMB Audit Report",
    "Meta Ads & Google Ads Campaign Setup & Management",
    "Monthly Social Media Content Calendar & Graphic Assets",
    "Conversion Tracking (GA4, Meta Pixel, GTM Integration)",
    "Bi-weekly Strategy Calls & Transparent ROI Dashboards",
    "Automated Lead Notification Workflows (Slack & Email)",
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
    <main ref={containerRef} className="min-h-screen bg-[#F8F9F6] text-[#0B1310] font-sans selection:bg-[#22C55E] selection:text-white relative overflow-x-hidden">
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
            <Megaphone className="w-4 h-4 text-[#22C55E]" />
            <span className="text-[#0B1310] font-bold">✦ DIGITAL MARKETING & LOCAL SEO ✦</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0B1310] tracking-tight leading-[1.02] uppercase">
            SCALING ONLINE REVENUE &amp; <br />
            <span className="text-[#22C55E]">LOCAL MARKET DOMINANCE</span>
          </h1>

          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Data-driven performance marketing campaigns, Google Maps #1 optimization, Meta lead ads, and viral short-form video reels that drive customer acquisition.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setConsultationModalOpen(true)}
              className="px-8 py-4 rounded-full bg-[#0B1310] hover:bg-[#22C55E] text-white font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
            >
              <span>Launch Growth Campaign</span>
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
            src="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1200&q=80"
            alt="Digital Marketing Studio"
            className="w-full h-[400px] sm:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </motion.div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-left mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#22C55E]">
            Growth Channels /
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0B1310] uppercase mt-1">
            PERFORMANCE MARKETING CAPABILITIES
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
                  <span className="px-3 py-1 rounded-full bg-[#E8F7ED] text-[#16A34A] text-xs font-bold font-mono">
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
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#22C55E]">
            What You Receive /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase text-[#0B1310] mt-1">
            CAMPAIGN DELIVERABLES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliverables.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="gsap-scroll-card p-6 rounded-2xl bg-[#F8F9F6] border border-[#E2E8F0] flex items-start gap-4 hover:border-[#22C55E]/60 transition-colors shadow-md"
            >
              <div className="w-8 h-8 rounded-full bg-[#E8F7ED] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5 border border-[#22C55E]/30">
                <Check size={16} />
              </div>
              <p className="text-sm font-bold text-slate-800 leading-snug">{item}</p>
            </motion.div>
          ))}
        </div>

        {/* Liquid Emerald CTA Banner */}
        <div className="mt-24 relative rounded-[3rem] overflow-hidden bg-gradient-to-r from-[#1E824C] via-[#27AE60] to-[#16A34A] p-10 sm:p-16 text-center text-white border border-[#22C55E]/30 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight uppercase">
              READY TO DOMINATE YOUR LOCAL MARKET?
            </h2>
            <p className="text-white/90 text-sm font-medium">
              Schedule a strategy audit call with our performance marketing directors today.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setConsultationModalOpen(true)}
                className="px-10 py-4 rounded-full bg-white hover:bg-slate-100 text-[#0B1310] font-black text-sm shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Claim Free Marketing Audit
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <ContactModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        defaultService="Digital Marketing & Local SEO"
      />
    </main>
  );
}
