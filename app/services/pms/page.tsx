"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import ServicePageTemplate, { ServicePageData } from "@/components/marketing/ServicePageTemplate";
import { Layers } from "lucide-react";

const pageData: ServicePageData = {
  icon: Layers,
  badge: "✦ PROJECT MANAGEMENT SYSTEMS (PMS) ✦",
  titleLine1: "STREAMLINING ENTERPRISE",
  titleLine2: "PROJECTS & TEAM WORKFLOWS",
  description:
    "Custom PMS solutions engineered to align engineering teams, automate sprint delivery, and keep client communication crystal clear.",
  ctaLabel: "Build Custom PMS Platform",
  imageUrl: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "PMS Software",
  capabilitiesLabel: "PMS Architecture",
  capabilitiesTitle: "WORKFLOW CAPABILITIES",
  capabilities: [
    {
      title: "Agile Project Kanban & Gantt Roadmaps",
      desc: "Interactive visual project boards with dependency tracking, milestone deadlines, and real-time task status updates.",
      metrics: "Real-time Roadmaps",
    },
    {
      title: "Resource Allocation & Time Tracking",
      desc: "Track developer and team billable hours, capacity planning, sprint velocity, and project margin analytics.",
      metrics: "Capacity Planning",
    },
    {
      title: "Role-Based Client Portal & Approvals",
      desc: "Dedicated client-facing portals where clients can review progress, approve deliverables, and access project assets securely.",
      metrics: "Client Portals",
    },
    {
      title: "Automated Slack & Email Integration",
      desc: "Instant Slack alerts for task updates, status changes, deadline reminders, and milestone completion.",
      metrics: "Instant Slack Sync",
    },
  ],
  deliverablesTitle: "PMS DELIVERABLES",
  deliverables: [
    "Custom PMS Architecture & Task Workflow Mapping",
    "Interactive Kanban & Gantt Timeline Interfaces",
    "Client Portal Access & Asset Approval Module",
    "Time Tracking & Billable Resource Dashboard",
    "Slack, Email & Webhook Notification Engine",
    "Team Capacity & Sprint Velocity Reporting",
  ],
  ctaTitle: "READY TO OPTIMIZE YOUR PROJECT WORKFLOWS?",
  ctaSubtitle: "Connect with our software architects to build a custom PMS tailored to your enterprise delivery process.",
  defaultService: "Project Management Systems (PMS)",
};

export default function PmsPage() {
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
        defaultService="Project Management Systems (PMS)"
      />
    </main>
  );
}
