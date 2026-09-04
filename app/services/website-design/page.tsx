"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import ServicePageTemplate, { ServicePageData } from "@/components/marketing/ServicePageTemplate";
import { Layout } from "lucide-react";

const pageData: ServicePageData = {
  icon: Layout,
  badge: "✦ WEB ENGINEERING & DESIGN EXPERTISE ✦",
  titleLine1: "WEBSITE DESIGN &",
  titleLine2: "HIGH-CONVERTING WEB APPS",
  description:
    "Bespoke Next.js and React web applications engineered with modern glassmorphic UI cards, sub-second page loads, and high conversion rate optimization.",
  ctaLabel: "Start Web Project",
  imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "Web Design Studio",
  capabilitiesLabel: "Technical Standards",
  capabilitiesTitle: "CORE CAPABILITIES & SPEED STANDARDS",
  capabilities: [
    {
      title: "Bespoke Next.js 16 Architectures",
      desc: "High-performance frontends built with Next.js 16 App Router, React 19, TypeScript, and server-side components for maximum speed and security.",
      metrics: "Sub-100ms LCP",
    },
    {
      title: "Modern Glassmorphism & Micro-animations",
      desc: "Stunning visual aesthetics with dark ambient lighting, subtle glassmorphic blurs, and smooth GSAP animation transitions.",
      metrics: "High Conversion",
    },
    {
      title: "Core Web Vitals 99+ Speed Tuning",
      desc: "Zero-CLS layout stability, optimized WebP/AVIF image pipelines, code-splitting, and edge CDN distribution.",
      metrics: "99/100 PageSpeed",
    },
    {
      title: "Mobile-First Responsive Engineering",
      desc: "Pixel-perfect experience across all mobile, tablet, and desktop screens with custom touch gestures and instant load times.",
      metrics: "100% Responsive",
    },
  ],
  techStack: [
    "Next.js 16",
    "React 19",
    "Tailwind CSS v4+",
    "TypeScript",
    "GSAP Animations",
    "Framer Motion",
    "Vercel Edge",
    "PostCSS",
  ],
  deliverablesTitle: "PROJECT DELIVERABLES",
  deliverables: [
    "Custom UI/UX Wireframes & Interactive Prototypes",
    "Full-Stack Next.js Codebase with TypeScript",
    "SEO Schema Markup & OpenGraph Metadata",
    "Headless CMS Integration (Sanity / Strapi)",
    "Speed Optimization & Lighthouse 95+ Audit",
    "SSL Security & Domain CDN Setup",
  ],
  ctaTitle: "READY TO BUILD YOUR NEXT WEB APP?",
  ctaSubtitle: "Let's discuss your project scope, custom architecture, and launch timeline.",
  defaultService: "Website Design & Engineering",
};

export default function WebsiteDesignPage() {
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
        defaultService="Website Design & Engineering"
      />
    </main>
  );
}
