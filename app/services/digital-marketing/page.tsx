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
            <Megaphone className="w-4 h-4 text-[#22C55E]" />
            <span>DIGITAL MARKETING & LOCAL SEO</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0B1310] tracking-tight leading-[1.02] uppercase">
            DOMINATE SEARCH &amp; <br />
            <span className="text-[#22C55E]">SCALE HIGH-ROI CAMPAIGNS</span>
          </h1>

          <p className="text-lg text-slate-600 font-normal leading-relaxed">
            Google Maps #1 Rankings, precision Meta &amp; Google PPC ads, GMB optimization, and data-driven growth marketing to scale qualified inbound leads.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setConsultationModalOpen(true)}
              className="btn-emerald text-sm font-semibold px-8 py-3.5 rounded-lg cursor-pointer flex items-center gap-2"
            >
              <span>Get Marketing Audit</span>
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
            src="https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1200&q=80"
            alt="Digital Marketing Campaign"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1200&q=80";
            }}
            className="w-full h-[400px] sm:h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </motion.div>
      </section>

      {/* Capabilities Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E6DF]">
        <div className="text-left mb-12 space-y-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#22C55E]">
            Performance Marketing /
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1310] uppercase">
            MARKETING CAPABILITIES
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

      {/* Deliverables Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E6DF]">
        <div className="text-left mb-16 space-y-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#22C55E]">
            Deliverables /
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase text-[#0B1310]">
            MARKETING DELIVERABLES
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
              READY TO SCALE YOUR INBOUND SALES LEADS?
            </h2>
            <p className="text-slate-600 text-sm font-normal">
              Let's discuss how customized GMB SEO and Meta ad campaigns can accelerate your revenue growth.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setConsultationModalOpen(true)}
                className="btn-emerald text-sm font-semibold px-8 py-3.5 rounded-lg cursor-pointer"
              >
                Book Growth Strategy Session
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer onOpenConsultation={() => setConsultationModalOpen(true)} />
      <ContactModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        defaultService="Digital Marketing & Local SEO"
      />
    </main>
  );
}
