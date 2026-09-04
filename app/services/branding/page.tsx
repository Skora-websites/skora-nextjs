"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import ServicePageTemplate, { ServicePageData } from "@/components/marketing/ServicePageTemplate";
import { Palette } from "lucide-react";

const pageData: ServicePageData = {
  icon: Palette,
  badge: "✦ BRANDING & VISUAL IDENTITY ✦",
  titleLine1: "CRAFTING ICONIC BRAND",
  titleLine2: "POSITIONING & VISUAL IDENTITY",
  description:
    "We define your visual story, build instant brand recognition, and design aesthetic identity systems that command trust.",
  ctaLabel: "Start Branding Project",
  imageUrl: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "Branding Design Studio",
  capabilitiesLabel: "Brand Excellence",
  capabilitiesTitle: "BRANDING CAPABILITIES",
  capabilities: [
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
  ],
  deliverablesTitle: "BRAND DELIVERABLES",
  deliverables: [
    "Brand Positioning & Messaging Architecture",
    "Primary Logo, Secondary Mark & Favicon Assets",
    "Complete Typography, Color & Design Token Palette",
    "Brand Style Guide & Corporate Brand Book PDF",
    "Social Media Graphic Templates & Banner Packs",
    "High-Resolution Print & Vector Source Files (AI/SVG/PNG)",
  ],
  ctaTitle: "READY TO REINVENT YOUR BRAND IDENTITY?",
  ctaSubtitle: "Let's discuss how customized brand positioning can elevate your business perception.",
  defaultService: "Branding & Visual Identity",
};

export default function BrandingPage() {
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
        defaultService="Branding & Visual Identity"
      />
    </main>
  );
}
