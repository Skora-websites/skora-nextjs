"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import ServicePageTemplate, { ServicePageData } from "@/components/marketing/ServicePageTemplate";
import { Film } from "lucide-react";

const pageData: ServicePageData = {
  icon: Film,
  badge: "✦ VIDEO PRODUCTION & COMMERCIAL REELS ✦",
  titleLine1: "HIGH-CONVERTING REELS &",
  titleLine2: "COMMERCIAL VIDEO PRODUCTION",
  description:
    "Captivate your audience with cinematic video content, educational Reels, and product commercials that drive engagement and sales.",
  ctaLabel: "Start Video Production",
  imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "Video Production Studio",
  capabilitiesLabel: "Production Suite",
  capabilitiesTitle: "VIDEO CAPABILITIES",
  capabilities: [
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
      title: "Product Demos & Promo Videos",
      desc: "Animated product walkthroughs, SaaS feature demos, and high-impact commercial promo videos.",
      metrics: "High Conversion",
    },
    {
      title: "Scriptwriting, Motion Graphics & Sound Design",
      desc: "Full post-production pipeline including script writing, kinetic typography, color grading, and licensed audio tracks.",
      metrics: "4K Cinema Quality",
    },
  ],
  deliverablesTitle: "PRODUCTION DELIVERABLES",
  deliverables: [
    "Monthly Reel Content Calendar (Scripting + Editing)",
    "4K Video Shoots & On-Location Filming Direction",
    "Professional Motion Graphics & Kinetic Subtitles",
    "Licensed Sound Tracks & Audio Post-Production",
    "Vertical (9:16) & Horizontal (16:9) Format Exports",
    "Ad Creative Video Cuts for Meta & YouTube Campaigns",
  ],
  ctaTitle: "READY TO PRODUCE VIRAL VIDEO CONTENT?",
  ctaSubtitle: "Talk to our creative directors to script and produce your next video campaign.",
  defaultService: "Video Production & Commercial Reels",
};

export default function VideoProductionPage() {
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#05070E] text-white font-sans selection:bg-[#2563EB] selection:text-white relative overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setConsultationModalOpen(true)} />

      <ServicePageTemplate
        data={pageData}
        onOpenConsultation={() => setConsultationModalOpen(true)}
      />

      <Footer onOpenConsultation={() => setConsultationModalOpen(true)} />
      <ContactModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        defaultService="Video Production & Commercial Reels"
      />
    </main>
  );
}
