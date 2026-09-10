"use client";

import { Code } from "lucide-react";
import ServicePageTemplate from "@/components/landing/ServicePageTemplate";

export default function SaasDevelopmentPage() {
  return (
    <ServicePageTemplate
      pillIcon={Code}
      pill="SaaS development"
      title={<>Multi-user software with billing and roles</>}
      lead="Tenants, subscriptions, and team permissions built as one system with admin controls and data exports from the start."
      primaryCta="Scope a SaaS build"
      heroImage="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
      heroImageAlt="SaaS analytics dashboard"
      capabilitiesTitle="SaaS build scope"
      capabilities={[
        {
          title: "Tenants and roles",
          description: "Organizations, invites, and role-based access with audit logs for sensitive actions.",
          metric: "RBAC + audit",
        },
        {
          title: "Billing and plans",
          description: "Subscription plans, invoices, trials, and dunning emails connected to your gateway.",
          metric: "Stripe/Razorpay",
        },
        {
          title: "Core workflows",
          description: "Your main entities, lists, filters, and approvals designed around daily use.",
          metric: "Weekly demos",
        },
        {
          title: "Admin and data",
          description: "Support tooling, feature flags, exports, and usage metrics for your team.",
          metric: "Admin panel",
        },
      ]}
      stack={["Next.js", "TypeScript", "Node.js", "MongoDB", "Stripe", "Razorpay", "Redis", "Docker"]}
      deliverablesTitle="Deliverables"
      deliverables={[
        "Product scope with user stories",
        "Working staging build every sprint",
        "Billing with invoices and trials",
        "Roles, invites, and audit logs",
        "Admin panel and data exports",
        "Launch checklist and documentation",
      ]}
      ctaTitle="Building a SaaS product?"
      ctaDescription="Share your users and pricing model. We map build phases and what can wait."
      ctaButton="Request SaaS estimate"
      modalServiceName="SaaS development"
    />
  );
}
