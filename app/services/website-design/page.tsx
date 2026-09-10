"use client";

import { Layout } from "lucide-react";
import ServicePageTemplate from "@/components/landing/ServicePageTemplate";

export default function WebsiteDesignPage() {
  return (
    <ServicePageTemplate
      pillIcon={Layout}
      pill="Website design and development"
      title={
        <>
          Websites that load fast and turn visits into enquiries
        </>
      }
      lead="We design and build Next.js websites with clear structure, on-page SEO, and content your team can update without developer help."
      primaryCta="Start a website project"
      heroImage="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
      heroImageAlt="Website design project on a laptop"
      capabilitiesTitle="What is included in a website project"
      capabilitiesIntro="Design, development, and launch handled as one scope with staging links you can review."
      capabilities={[
        {
          title: "Design based on your content",
          description: "Wireframes and final layouts built around your services, pricing, and contact flow — not filler sections.",
          metric: "2 design rounds",
        },
        {
          title: "Next.js development",
          description: "React and TypeScript codebase with reusable components, forms, and schema markup for search.",
          metric: "95+ Lighthouse target",
        },
        {
          title: "Speed and SEO setup",
          description: "Image optimization, caching, sitemap, metadata, and analytics so you can measure enquiries.",
          metric: "Core Web Vitals",
        },
        {
          title: "Launch and handover",
          description: "Domain, SSL, deployment, and a walkthrough video so your team can publish updates.",
          metric: "Training included",
        },
      ]}
      stack={["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Framer Motion", "GSAP", "Vercel", "GA4"]}
      deliverablesTitle="Deliverables"
      deliverables={[
        "Sitemap and wireframes approved before design",
        "Responsive website with CMS-ready content areas",
        "Contact forms with email and WhatsApp notifications",
        "On-page SEO: titles, descriptions, and schema",
        "Speed optimization and launch checklist",
        "Handover video and 30 days of launch support",
      ]}
      ctaTitle="Need a new website or a rebuild?"
      ctaDescription="Share your current site and goals. We reply with scope, timeline, and fixed pricing."
      ctaButton="Request website estimate"
      modalServiceName="Website design and development"
    />
  );
}
