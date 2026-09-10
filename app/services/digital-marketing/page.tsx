"use client";

import { Megaphone } from "lucide-react";
import ServicePageTemplate from "@/components/landing/ServicePageTemplate";

export default function DigitalMarketingPage() {
  return (
    <ServicePageTemplate
      pillIcon={Megaphone}
      pill="Digital marketing and SEO"
      title={<>Marketing focused on enquiries, calls, and sales</>}
      lead="Local SEO, Google and Meta ads, and content reporting tied to leads — not vanity metrics. You see spend, leads, and cost per lead."
      primaryCta="Plan a marketing engagement"
      heroImage="https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1200&q=80"
      heroImageAlt="Marketing reports and planning"
      capabilitiesTitle="How we run marketing"
      capabilitiesIntro="Monthly plan, execution, and a report you can read in five minutes."
      capabilities={[
        {
          title: "Local SEO and Google profile",
          description: "Profile setup, categories, reviews process, and location pages for searches near you.",
          metric: "Monthly local report",
        },
        {
          title: "Google and Meta ads",
          description: "Campaign structure, negatives, and landing pages with conversion tracking from day one.",
          metric: "ROAS tracking",
        },
        {
          title: "Content and social",
          description: "Practical posts and short videos explaining your services, published on a shared calendar.",
          metric: "Shared calendar",
        },
        {
          title: "Lead tracking",
          description: "GA4, pixels, and call/WhatsApp tracking so every enquiry is attributed to a channel.",
          metric: "Full attribution",
        },
      ]}
      stack={["Google Ads", "Meta Ads", "Google Business Profile", "GA4", "Search Console", "Tag Manager", "WhatsApp API", "Looker Studio"]}
      deliverablesTitle="Deliverables"
      deliverables={[
        "Account audit and measurement setup",
        "Keyword and audience plan",
        "Ad campaigns with budgets and negatives",
        "Content calendar with designs and captions",
        "Monthly report: spend, leads, cost per lead",
        "Lead alerts on email and WhatsApp",
      ]}
      ctaTitle="Want steadier enquiries?"
      ctaDescription="Tell us your services and monthly budget. We suggest channels and expected lead volume."
      ctaButton="Request marketing plan"
      modalServiceName="Digital marketing and SEO"
    />
  );
}
