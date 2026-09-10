"use client";

import { Cloud } from "lucide-react";
import ServicePageTemplate from "@/components/landing/ServicePageTemplate";

export default function CloudServicesPage() {
  return (
    <ServicePageTemplate
      pillIcon={Cloud}
      pill="Cloud and DevOps"
      title={<>Reliable cloud setup with monitoring and backups</>}
      lead="AWS and Azure configuration, deployments, and documentation with alerts, backups, and cost notes your team can follow."
      primaryCta="Review my infrastructure"
      heroImage="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
      heroImageAlt="Cloud infrastructure diagram"
      capabilitiesTitle="Cloud and DevOps scope"
      capabilities={[
        {
          title: "Setup and migration",
          description: "Accounts, networks, databases, and cutover plan with downtime window agreed in advance.",
          metric: "Cutover plan",
        },
        {
          title: "CI/CD pipelines",
          description: "Preview, staging, and production deploys with checks before release.",
          metric: "3 environments",
        },
        {
          title: "Monitoring and alerts",
          description: "Uptime checks, error alerts, and log retention with on-call routing.",
          metric: "Alert runbook",
        },
        {
          title: "Backups and costs",
          description: "Scheduled backups with restore test, plus monthly cost review and cleanup.",
          metric: "Restore tested",
        },
      ]}
      stack={["AWS", "Azure", "Docker", "GitHub Actions", "Nginx", "MongoDB", "Redis", "Grafana"]}
      deliverablesTitle="Deliverables"
      deliverables={[
        "Architecture diagram and access list",
        "Staging and production environments",
        "Deployment pipeline with checks",
        "Monitoring dashboard and alert rules",
        "Backup schedule with restore test",
        "Handover document and cost notes",
      ]}
      ctaTitle="Is your setup hard to maintain?"
      ctaDescription="Share your current stack. We audit it and suggest fixes in priority order."
      ctaButton="Request infrastructure audit"
      modalServiceName="Cloud and DevOps"
    />
  );
}
