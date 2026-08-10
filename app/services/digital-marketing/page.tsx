"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThreeBackground from "@/components/ThreeBackground";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import Card3D from "@/components/Card3D";
import ScrollReveal from "@/components/ScrollReveal";
import ContactModal from "@/components/ContactModal";
import {
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Bot,
  Globe,
  Search,
  BarChart3,
  Zap,
  ShieldCheck,
  Code,
} from "lucide-react";

export default function DigitalMarketingPage() {
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  const capabilities = [
    {
      title: "Generative Engine Optimization (GEO)",
      desc: "Schema markup, entity relationships, and topical authority clusters designed so ChatGPT, Gemini, Perplexity & Copilot cite your brand.",
      metrics: "+340% Citations",
    },
    {
      title: "Technical & Schema SEO",
      desc: "Comprehensive crawl budget optimization, structured data, canonical mapping, and core web vitals speed tuning.",
      metrics: "99/100 Health",
    },
    {
      title: "High-Intent Content Strategy",
      desc: "Data-driven editorial calendars targeting transactional keywords that attract ready-to-buy decision-makers.",
      metrics: "4.8x ROI",
    },
    {
      title: "Precision PPC & Ads Management",
      desc: "Hyper-targeted Google Search Ads and Social Retargeting campaigns with automated bidding and ROI tracking.",
      metrics: "3.2x Conversions",
    },
  ];

  const processSteps = [
    { step: "01", name: "AI & SEO Audit", desc: "Deep-dive analysis of legacy search rankings, AI citations, and competitor gaps." },
    { step: "02", name: "Topical Architecture", desc: "Mapping entity relations, schema microdata, and keyword funnels." },
    { step: "03", name: "Content & GEO Execution", desc: "Publishing high-converting articles and AI-optimized brand assets." },
    { step: "04", name: "Analytics & Scaling", desc: "Real-time citation tracking and continuous conversion optimization." },
  ];

  return (
    <main className="min-h-screen bg-[#05070E] text-[#F8FAFC] flex flex-col relative overflow-hidden">
      <ThreeBackground />
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setConsultationModalOpen(true)} />

      {/* Hero Header */}
      <section className="pt-36 pb-20 relative [perspective:1200px]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill text-xs font-semibold uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Service Expertise</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Digital Marketing & <br />
              <span className="text-gradient">AI SEO (GEO) Dominance</span>
            </h1>

            <p className="text-lg text-[#94A3B8] leading-relaxed">
              150+ battle-tested strategies engineered to rank your brand #1 on Google & Bing while securing top cited recommendations inside ChatGPT, Gemini, Perplexity, and Copilot.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setConsultationModalOpen(true)}
                className="btn-primary text-base px-8 py-4 rounded-xl shadow-2xl shadow-blue-600/40"
              >
                <span>Book Marketing Strategy Session</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-20 relative bg-[#070A12] border-y border-white/5 [perspective:1000px]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest">
              CORE CAPABILITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              AI-First Search & <span className="text-gradient">Growth Engine</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap, idx) => (
              <Card3D key={idx} maxTilt={10} className="glass-card rounded-2xl p-8 border border-white/10 bg-[#0B0F19]">
                <div className="space-y-4 [transform-style:preserve-3d]">
                  <div className="flex items-center justify-between [transform:translateZ(30px)]">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {cap.metrics}
                    </span>
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                  </div>

                  <h3 className="text-xl font-bold text-white [transform:translateZ(40px)]">
                    {cap.title}
                  </h3>

                  <p className="text-sm text-[#94A3B8] leading-relaxed [transform:translateZ(20px)]">
                    {cap.desc}
                  </p>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* Process Workflow */}
      <section className="py-24 relative bg-[#05070E]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Our 4-Step <span className="text-gradient">GEO & SEO Methodology</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((p, idx) => (
              <div key={idx} className="p-6 rounded-2xl glass-card border border-white/10 bg-[#0B0F19] space-y-3">
                <span className="text-3xl font-extrabold text-blue-500 font-mono block">
                  {p.step}
                </span>
                <h4 className="text-lg font-bold text-white">{p.name}</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ContactModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        initialService="Digital Marketing & AI SEO"
      />
    </main>
  );
}
