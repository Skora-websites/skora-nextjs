"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import ServicePageTemplate, { ServicePageData } from "@/components/marketing/ServicePageTemplate";
import { Megaphone } from "lucide-react";

const pageData: ServicePageData = {
  icon: Megaphone,
  badge: "✦ DIGITAL MARKETING & LOCAL SEO ✦",
  titleLine1: "SCALING ONLINE REVENUE &",
  titleLine2: "LOCAL MARKET DOMINANCE",
  description:
    "Data-driven performance marketing campaigns, Google Maps #1 optimization, Meta lead ads, and viral short-form video reels that drive customer acquisition.",
  ctaLabel: "Launch Growth Campaign",
  imageUrl: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "Digital Marketing Studio",
  capabilitiesLabel: "Growth Channels",
  capabilitiesTitle: "PERFORMANCE MARKETING CAPABILITIES",
  capabilities: [
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
  ],
  deliverablesTitle: "CAMPAIGN DELIVERABLES",
  deliverables: [
    "Comprehensive Local SEO & GMB Audit Report",
    "Meta Ads & Google Ads Campaign Setup & Management",
    "Monthly Social Media Content Calendar & Graphic Assets",
    "Conversion Tracking (GA4, Meta Pixel, GTM Integration)",
    "Bi-weekly Strategy Calls & Transparent ROI Dashboards",
    "Automated Lead Notification Workflows (Slack & Email)",
  ],
  ctaTitle: "READY TO DOMINATE YOUR LOCAL MARKET?",
  ctaSubtitle: "Schedule a strategy audit call with our performance marketing directors today.",
  defaultService: "Digital Marketing & Local SEO",
};

export default function DigitalMarketingPage() {
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
        defaultService="Digital Marketing & Local SEO"
      />
    </main>
  );
}
