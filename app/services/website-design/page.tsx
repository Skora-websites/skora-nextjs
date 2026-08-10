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
  Layout,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Code,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  Smartphone,
} from "lucide-react";

export default function WebsiteDesignPage() {
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  const capabilities = [
    {
      title: "Bespoke Next.js & React Architectures",
      desc: "High-performance frontends built with Next.js 16 App Router, React 19, TypeScript, and server components.",
      metrics: "Sub-100ms LCP",
    },
    {
      title: "Dark Cyberpunk & Glassmorphism UI/UX",
      desc: "Stunning visual aesthetics with pitch dark backgrounds, neon blue lighting halos, and subtle backdrop blurs.",
      metrics: "High Conversion",
    },
    {
      title: "Core Web Vitals 99+ Speed Tuning",
      desc: "Zero-CLS layout stability, optimized image pipelines, code-splitting, and edge CDN distribution.",
      metrics: "99/100 PageSpeed",
    },
    {
      title: "Interactive Micro-Animations & 3D WebGL",
      desc: "Fluid interactive animations powered by GSAP, Three.js WebGL, and hardware-accelerated 3D transforms.",
      metrics: "60 FPS Smooth",
    },
  ];

  const techStack = [
    "Next.js 16",
    "React 19",
    "Tailwind CSS v4+",
    "TypeScript",
    "GSAP",
    "Three.js",
    "Vercel Edge",
    "PostCSS",
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
              <Layout className="w-4 h-4 text-cyan-400" />
              <span>Web Engineering Expertise</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Website Design & <br />
              <span className="text-gradient-cyan">High-Converting Web Apps</span>
            </h1>

            <p className="text-lg text-[#94A3B8] leading-relaxed">
              Bespoke Next.js and React web applications engineered with modern dark cyber aesthetics, glassmorphic UI cards, instant page loads, and high conversion rate optimization.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setConsultationModalOpen(true)}
                className="btn-primary text-base px-8 py-4 rounded-xl shadow-2xl shadow-blue-600/40"
              >
                <span>Start Web Project</span>
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
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
              WEB ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              State-of-the-Art <span className="text-gradient">Frontend Capabilities</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap, idx) => (
              <Card3D key={idx} maxTilt={10} className="glass-card rounded-2xl p-8 border border-white/10 bg-[#0B0F19]">
                <div className="space-y-4 [transform-style:preserve-3d]">
                  <div className="flex items-center justify-between [transform:translateZ(30px)]">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {cap.metrics}
                    </span>
                    <Code className="w-5 h-5 text-blue-400" />
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

      {/* Tech Stack Pills */}
      <section className="py-20 relative bg-[#05070E]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10 text-center space-y-8">
          <h3 className="text-xl font-bold text-white uppercase tracking-wider">
            Supported Web Technologies
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {techStack.map((tech, idx) => (
              <span
                key={idx}
                className="px-5 py-2.5 rounded-xl glass-card border border-white/10 text-sm font-mono text-cyan-300 bg-[#0B0F19]/90"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ContactModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        initialService="Website Design & Web Apps"
      />
    </main>
  );
}
