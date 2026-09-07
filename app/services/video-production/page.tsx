"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import Card3D from "@/components/Card3D";
import { Film, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function VideoProductionPage() {
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const capabilities = [
    {
      title: "Instagram & TikTok Short-Form Reels",
      desc: "High-converting short-form video reels scripted, edited, and formatted specifically for social media algorithm viral reach.",
      metrics: "Viral Reach",
    },
    {
      title: "Doctor & Corporate Executive Introductions",
      desc: "Professional video intros showcasing clinician expertise, facility tours, and corporate leadership messaging.",
      metrics: "Trust Building",
    },
    {
      title: "Product Explainer & Promo Videos",
      desc: "3D animated product walk-throughs, SaaS feature demos, and high-impact commercial promo videos.",
      metrics: "High Conversion",
    },
    {
      title: "Scriptwriting, Motion Graphics & Sound Design",
      desc: "Full post-production pipeline including script writing, kinetic typography, color grading, and licensed audio tracks.",
      metrics: "4K Cinema Quality",
    },
  ];

  const deliverables = [
    "Monthly Reel Content Calendar (Scripting + Editing)",
    "4K Video Shoots & On-Location Filming Direction",
    "Professional Motion Graphics & Kinetic Subtitles",
    "Licensed Sound Tracks & Audio Post-Production",
    "Vertical (9:16) & Horizontal (16:9) Format Exports",
    "Ad Creative Video Cuts for Meta & YouTube Campaigns",
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
    <main ref={containerRef} className="min-h-screen bg-main text-ink font-sans relative overflow-x-hidden">
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
          <div className="glass-pill inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold">
            <Film className="w-3.5 h-3.5" />
            <span>✦ VIDEO PRODUCTION & COMMERCIAL REELS ✦</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-ink tracking-tight leading-[1.02]">
            HIGH-CONVERTING REELS &amp; <br />
            <span className="text-gradient">COMMERCIAL VIDEO PRODUCTION</span>
          </h1>

          <p className="text-lg text-sub font-medium leading-relaxed">
            Captivate your audience with cinematic video content, educational Reels, and product commercials that drive engagement and sales.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setConsultationModalOpen(true)}
              className="btn-primary group"
            >
              <span>Start Video Production</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Feature Gallery Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 rounded-[2.5rem] overflow-hidden glass-card group cursor-pointer relative"
        >
          <img
            src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80"
            alt="Video Production Studio"
            className="w-full h-[400px] sm:h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </motion.div>
      </section>

      {/* Capabilities Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-left mb-12">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent-light">
            Production Suite /
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink mt-1">
            VIDEO CAPABILITIES
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
              <Card3D maxTilt={10} className="p-8 rounded-[2.2rem] glass-card glass-card-hover space-y-4 h-full">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full glass-pill text-xs font-bold font-mono">
                    {cap.metrics}
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-ink">{cap.title}</h3>
                <p className="text-sm text-sub font-medium leading-relaxed">{cap.desc}</p>
              </Card3D>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Light Glass Deliverables Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto glass-card rounded-[3rem] my-12">
        <div className="text-left mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-accent-light">
            Deliverables /
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-ink mt-1">
            PRODUCTION DELIVERABLES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliverables.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="gsap-scroll-card p-6 rounded-2xl glass-card glass-card-hover flex items-start gap-4 transition-colors"
            >
              <div className="w-8 h-8 rounded-full glass-pill flex items-center justify-center shrink-0 mt-0.5">
                <Check size={16} />
              </div>
              <p className="text-sm font-bold text-sub leading-snug">{item}</p>
            </motion.div>
          ))}
        </div>

        {/* Liquid Emerald CTA Banner */}
        <div className="mt-24 relative rounded-[3rem] overflow-hidden bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#3B82F6] p-10 sm:p-16 text-center text-white border border-[#2563EB]/30 shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              READY TO PRODUCE VIRAL VIDEO CONTENT?
            </h2>
            <p className="text-white/90 text-sm font-medium">
              Talk to our creative directors to script and produce your next video campaign.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setConsultationModalOpen(true)}
                className="px-10 py-4 rounded-xl bg-white hover:bg-blue-50 text-[#1D4ED8] font-extrabold text-sm shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                Book Video Strategy Call
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer onOpenConsultation={() => setConsultationModalOpen(true)} />
      <ContactModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        defaultService="Video Production & Commercial Reels"
      />
    </main>
  );
}
