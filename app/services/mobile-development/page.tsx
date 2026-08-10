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
  Smartphone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Layers,
  Globe,
} from "lucide-react";

export default function MobileDevelopmentPage() {
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  const capabilities = [
    {
      title: "Native iOS (Swift) & Android (Kotlin)",
      desc: "Platform-native mobile applications engineered for peak performance, smooth 120Hz UI frames, and camera/sensor integration.",
      metrics: "60-120 FPS",
    },
    {
      title: "Cross-Platform React Native & Flutter",
      desc: "Unified single-codebase mobile applications deployed simultaneously to App Store and Google Play with fast iteration.",
      metrics: "50% Time Saved",
    },
    {
      title: "Biometric Security & Offline Sync",
      desc: "FaceID/TouchID authentication, encrypted local storage, WebSocket real-time updates, and offline sync engines.",
      metrics: "SOC2 Security",
    },
    {
      title: "App Store Optimization (ASO)",
      desc: "Store listing metadata, keyword targeting, screenshot design, and review management to drive organic app installs.",
      metrics: "4.9★ Rating",
    },
  ];

  const techStack = [
    "React Native",
    "Flutter",
    "Swift",
    "Kotlin",
    "Firebase",
    "SQLite",
    "GraphQL",
    "App Store Connect",
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
              <Smartphone className="w-4 h-4 text-sky-400" />
              <span>Mobile Engineering</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Mobile Application <br />
              <span className="text-gradient">iOS & Android Development</span>
            </h1>

            <p className="text-lg text-[#94A3B8] leading-relaxed">
              Native and cross-platform mobile apps engineered for fluid 120Hz performance, offline synchronization, biometric encryption, and App Store dominance.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setConsultationModalOpen(true)}
                className="btn-primary text-base px-8 py-4 rounded-xl shadow-2xl shadow-blue-600/40"
              >
                <span>Start Mobile Project</span>
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
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">
              MOBILE STACK
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Enterprise <span className="text-gradient">Mobile Capabilities</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap, idx) => (
              <Card3D key={idx} maxTilt={10} className="glass-card rounded-2xl p-8 border border-white/10 bg-[#0B0F19]">
                <div className="space-y-4 [transform-style:preserve-3d]">
                  <div className="flex items-center justify-between [transform:translateZ(30px)]">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {cap.metrics}
                    </span>
                    <Smartphone className="w-5 h-5 text-indigo-400" />
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
            Supported Mobile Technologies
          </h3>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {techStack.map((tech, idx) => (
              <span
                key={idx}
                className="px-5 py-2.5 rounded-xl glass-card border border-white/10 text-sm font-mono text-sky-300 bg-[#0B0F19]/90"
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
        initialService="Mobile App Development"
      />
    </main>
  );
}
