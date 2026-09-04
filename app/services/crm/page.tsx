"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import ServicePageTemplate, { ServicePageData } from "@/components/marketing/ServicePageTemplate";
import { MessageCircle } from "lucide-react";

const pageData: ServicePageData = {
  icon: MessageCircle,
  badge: "✦ CUSTOM CRM & WHATSAPP AUTOMATIONS ✦",
  titleLine1: "CONSOLIDATING LEADS &",
  titleLine2: "AUTOMATING WHATSAPP PIPELINES",
  description:
    "Consolidate inquiries from Meta Ads, Google PPC, and website forms into a unified sales pipeline with instant automated WhatsApp & email nurture sequences.",
  ctaLabel: "Build Custom CRM Engine",
  imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "Custom CRM Software",
  capabilitiesLabel: "Pipeline Engine",
  capabilitiesTitle: "CRM & AUTOMATION CAPABILITIES",
  capabilities: [
    {
      title: "WhatsApp Cloud API Automated Sequences",
      desc: "Trigger instant personalized WhatsApp confirmation messages, appointment follow-ups, and promotional offers within 5 seconds of form fill.",
      metrics: "5s Response Time",
    },
    {
      title: "Omnichannel Lead Pipeline Centralization",
      desc: "Consolidate lead inquiries from Meta Lead Ads, Google PPC, website forms, and phone calls into a single real-time sales pipeline.",
      metrics: "100% Lead Capture",
    },
    {
      title: "Automated Lead Scoring & Agent Routing",
      desc: "Route high-intent leads to specific sales representatives or clinicians based on geographic location, service requested, and lead score.",
      metrics: "Smart Lead Routing",
    },
    {
      title: "Real-Time Sales Conversion Analytics",
      desc: "Track pipeline velocity, sales agent conversion rates, cost-per-acquisition (CPA), and revenue attribution dashboards.",
      metrics: "Full Attribution",
    },
  ],
  deliverablesTitle: "CRM DELIVERABLES",
  deliverables: [
    "Custom CRM Pipeline & Lead Stage Architecture",
    "WhatsApp Business Cloud API Automation Setup",
    "Meta Ads & Google Lead Form Webhook Integrations",
    "Lead Scoring Rules & Automated Agent Routing Engine",
    "Real-time Analytics Dashboard & Sales Reports",
    "SMS & Email Drip Sequence Automation",
  ],
  ctaTitle: "READY TO AUTOMATE YOUR LEAD CONVERSION?",
  ctaSubtitle: "Talk to our automation engineers to connect your lead sources to WhatsApp workflows.",
  defaultService: "Custom CRM & Automations",
};

export default function CrmPage() {
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
        defaultService="Custom CRM & Automations"
      />
    </main>
  );
}
