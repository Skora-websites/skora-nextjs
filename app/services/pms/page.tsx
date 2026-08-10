"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThreeBackground from "@/components/ThreeBackground";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import Card3D from "@/components/Card3D";
import ContactModal from "@/components/ContactModal";
import { Kanban, ArrowRight } from "lucide-react";

export default function PMSPage() {
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  const capabilities = [
    { title: "Custom Kanban & Gantt Roadmaps", desc: "Interactive Drag-and-drop sprint boards, dependency tracking, and milestone charts.", metrics: "+45% Efficiency" },
    { title: "White-Label Client Portals", desc: "Dedicated guest access portals for project approval, deliverable reviews, and transparent feedback.", metrics: "Client Portal" },
    { title: "Automated Time & Task Tracking", desc: "Real-time task timers, resource capacity heatmaps, and automated status notifications.", metrics: "Real-time Sync" },
    { title: "Workflows & Integrations", desc: "WebSocket live updates, Slack/Teams notifications, and GitHub/Jira two-way sync.", metrics: "Automated Rules" },
  ];

  return (
    <main className="min-h-screen bg-[#05070E] text-[#F8FAFC] flex flex-col relative overflow-hidden">
      <ThreeBackground />
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setConsultationModalOpen(true)} />

      <section className="pt-36 pb-20 relative [perspective:1200px]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill text-xs font-semibold uppercase tracking-wider">
              <Kanban className="w-4 h-4 text-emerald-400" />
              <span>Project Management System</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Custom PMS <br /><span className="text-gradient">Agile Workflows & Portals</span>
            </h1>
            <p className="text-lg text-[#94A3B8] leading-relaxed">
              Tailor-made PMS software built to streamline sprint roadmaps, team resource allocation, automated task routing, and client feedback portals.
            </p>
            <button onClick={() => setConsultationModalOpen(true)} className="btn-primary text-base px-8 py-4 rounded-xl shadow-2xl shadow-blue-600/40">
              <span>Request Custom PMS Demo</span> <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 relative bg-[#070A12] border-y border-white/5 [perspective:1000px]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {capabilities.map((cap, idx) => (
              <Card3D key={idx} maxTilt={10} className="glass-card rounded-2xl p-8 border border-white/10 bg-[#0B0F19]">
                <div className="space-y-4 [transform-style:preserve-3d]">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{cap.metrics}</span>
                  <h3 className="text-xl font-bold text-white">{cap.title}</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{cap.desc}</p>
                </div>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ContactModal isOpen={consultationModalOpen} onClose={() => setConsultationModalOpen(false)} initialService="Project Management System (PMS)" />
    </main>
  );
}
