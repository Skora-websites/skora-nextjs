"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import ServicePageTemplate, { ServicePageData } from "@/components/marketing/ServicePageTemplate";
import { Cloud } from "lucide-react";

const pageData: ServicePageData = {
  icon: Cloud,
  badge: "✦ CLOUD SOLUTIONS & DEVOPS ✦",
  titleLine1: "ENTERPRISE CLOUD",
  titleLine2: "INFRASTRUCTURE & DEVOPS",
  description:
    "Reliable cloud architecture, AWS/Azure server migrations, Kubernetes orchestration, and automated CI/CD deployment pipelines.",
  ctaLabel: "Consult Cloud Engineers",
  imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "Cloud Services Studio",
  capabilitiesLabel: "DevOps Architecture",
  capabilitiesTitle: "CLOUD CAPABILITIES",
  capabilities: [
    {
      title: "AWS & Azure Infrastructure Migration",
      desc: "Zero-downtime migration of legacy servers to auto-scaling AWS EC2, ECS, and Azure Kubernetes clusters.",
      metrics: "99.99% Uptime",
    },
    {
      title: "Automated CI/CD Deployment Pipelines",
      desc: "Continuous integration via GitHub Actions, Docker containers, and Terraform Infrastructure-as-Code.",
      metrics: "Instant Deploy",
    },
    {
      title: "Disaster Recovery & Data Redundancy",
      desc: "Automated multi-region database replication, daily snapshot backups, and point-in-time recovery protocols.",
      metrics: "Zero Data Loss",
    },
    {
      title: "Cloud Security & SOC2 Compliance",
      desc: "Vulnerability scanning, IAM role permission hardening, Web Application Firewall (WAF), and DDoS protection.",
      metrics: "Enterprise Shield",
    },
  ],
  deliverablesTitle: "CLOUD DELIVERABLES",
  deliverables: [
    "AWS / Azure Infrastructure Architecture Blueprint",
    "Docker Containerization & Kubernetes Cluster Setup",
    "Automated CI/CD Deployment Pipeline Configuration",
    "WAF, SSL & Cloudflare Enterprise DDoS Protection",
    "24/7 Server Health Monitoring & Alert Trigger System",
    "Monthly Cloud Cost Optimization & Audit Report",
  ],
  ctaTitle: "READY TO SCALE YOUR CLOUD INFRASTRUCTURE?",
  ctaSubtitle: "Connect with our certified DevOps architects to design your cloud roadmap.",
  defaultService: "Cloud Services & DevOps",
};

export default function CloudServicesPage() {
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
        defaultService="Cloud Services & DevOps"
      />
    </main>
  );
}
