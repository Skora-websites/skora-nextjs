"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import ServicePageTemplate, { ServicePageData } from "@/components/marketing/ServicePageTemplate";
import { Code } from "lucide-react";

const pageData: ServicePageData = {
  icon: Code,
  badge: "✦ SAAS PLATFORM ENGINEERING ✦",
  titleLine1: "SCALABLE B2B & B2C",
  titleLine2: "SAAS PLATFORM DEVELOPMENT",
  description:
    "Multi-tenant cloud architectures engineered with automated recurring billing, user RBAC permissions, and scalable developer APIs.",
  ctaLabel: "Build SaaS Platform",
  imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "SaaS Platform Development",
  capabilitiesLabel: "SaaS Architecture",
  capabilitiesTitle: "SAAS CAPABILITIES",
  capabilities: [
    {
      title: "Multi-Tenant Database Architecture",
      desc: "Isolated data schemas and tenant-level encryption ensuring absolute security for enterprise B2B SaaS customers.",
      metrics: "Enterprise Security",
    },
    {
      title: "Stripe & Razorpay Billing Engines",
      desc: "Automated recurring subscription billing, tier management, dunning workflows, and metered usage invoicing.",
      metrics: "Automated ARR",
    },
    {
      title: "Role-Based Access (RBAC) & SSO",
      desc: "OAuth2, SAML, and Google/Microsoft Single Sign-On integration with granular admin permission controls.",
      metrics: "Enterprise SSO",
    },
    {
      title: "Scalable REST & GraphQL Developer APIs",
      desc: "Developer-friendly API documentation, webhook triggers, rate limiting, and SDK integrations for third-party tools.",
      metrics: "Developer Platform",
    },
  ],
  deliverablesTitle: "SAAS DELIVERABLES",
  deliverables: [
    "Multi-Tenant PostgreSQL / Supabase Database Architecture",
    "Stripe Subscription & Tiered Billing Integration",
    "Next.js 16 SaaS Dashboard with Tailwind CSS UI",
    "OAuth2, Google SSO & Role-Based RBAC System",
    "Developer API Portal & Webhook Notification Engine",
    "Automated CI/CD Pipeline & Vercel Edge Hosting",
  ],
  ctaTitle: "READY TO BUILD YOUR SAAS PRODUCT?",
  ctaSubtitle: "Talk to our SaaS architects to scope your database, multi-tenant billing, and launch MVP.",
  defaultService: "SaaS Platform Development",
};

export default function SaasDevelopmentPage() {
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
        defaultService="SaaS Platform Development"
      />
    </main>
  );
}
