"use client";

import { Users } from "lucide-react";
import ServicePageTemplate from "@/components/landing/ServicePageTemplate";

export default function CrmPage() {
  return (
    <ServicePageTemplate
      pillIcon={Users}
      pill="CRM development"
      title={<>A CRM that matches how your team sells</>}
      lead="Leads, follow-ups, and WhatsApp updates organized around your pipeline, with imports from spreadsheets and old tools."
      primaryCta="Map my sales process"
      heroImage="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80"
      heroImageAlt="Sales team reviewing pipeline"
      capabilitiesTitle="CRM scope"
      capabilities={[
        {
          title: "Pipeline and stages",
          description: "Custom stages, lost reasons, and assignment rules based on your current process.",
          metric: "Process mapped",
        },
        {
          title: "Follow-ups and reminders",
          description: "Tasks, overdue alerts, and daily lists so no lead waits more than a day.",
          metric: "Daily lists",
        },
        {
          title: "WhatsApp and email updates",
          description: "Templates and triggers for new leads, follow-ups, and payment reminders.",
          metric: "Templates included",
        },
        {
          title: "Reports",
          description: "Source-wise leads, stage conversion, and team activity in one weekly view.",
          metric: "Weekly report",
        },
      ]}
      stack={["Next.js", "Node.js", "MongoDB", "WhatsApp API", "Email SMTP", "CSV import", "Role access", "Exports"]}
      deliverablesTitle="Deliverables"
      deliverables={[
        "Pipeline mapped to your stages",
        "Lead import from sheets or old CRM",
        "Follow-up tasks and reminders",
        "WhatsApp and email templates",
        "Team activity and conversion reports",
        "Training session and user guide",
      ]}
      ctaTitle="Losing track of follow-ups?"
      ctaDescription="Describe your lead sources and team size. We suggest pipeline and automation."
      ctaButton="Request CRM estimate"
      modalServiceName="CRM development"
    />
  );
}
