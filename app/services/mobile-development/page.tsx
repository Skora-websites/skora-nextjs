"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import ServicePageTemplate, { ServicePageData } from "@/components/marketing/ServicePageTemplate";
import { Smartphone } from "lucide-react";

const pageData: ServicePageData = {
  icon: Smartphone,
  badge: "✦ MOBILE APP ENGINEERING ✦",
  titleLine1: "NATIVE iOS & ANDROID",
  titleLine2: "MOBILE APPLICATION DEVELOPMENT",
  description:
    "High-performance mobile applications engineered with React Native and Flutter for seamless user retention, offline capabilities, and instant push alerts.",
  ctaLabel: "Build Mobile App",
  imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
  imageAlt: "Mobile App Development",
  capabilitiesLabel: "Mobile Architecture",
  capabilitiesTitle: "MOBILE CAPABILITIES",
  capabilities: [
    {
      title: "Cross-Platform React Native & Flutter",
      desc: "Single codebase efficiency targeting both iOS App Store and Google Play Store with 60FPS native rendering performance.",
      metrics: "iOS & Android",
    },
    {
      title: "Offline Storage & Real-Time Syncing",
      desc: "Robust SQLite / WatermelonDB local databases ensuring full offline availability with background cloud synchronization.",
      metrics: "Offline First",
    },
    {
      title: "Push Notifications & In-App Engagement",
      desc: "Automated Firebase / OneSignal push alert sequences for appointment reminders, transactional updates, and promotional triggers.",
      metrics: "Real-time Push",
    },
    {
      title: "App Store Publishing & Compliance",
      desc: "End-to-end management of Apple App Store Review Guidelines and Google Play Store Developer Console publishing.",
      metrics: "Guaranteed Approval",
    },
  ],
  deliverablesTitle: "APP DELIVERABLES",
  deliverables: [
    "Native iOS (Swift/React Native) & Android (Kotlin/Flutter) Code",
    "Figma Mobile UI Design Systems & Icon Packs",
    "App Store & Google Play Store Submission Setup",
    "Firebase Analytics, Crashlytics & Push Alert Engine",
    "Bi-weekly Mobile TestFlight & APK Beta Builds",
    "Post-Launch Maintenance & Version Upgrades",
  ],
  ctaTitle: "READY TO LAUNCH YOUR MOBILE APP?",
  ctaSubtitle: "Schedule an architecture call with our mobile software engineers.",
  defaultService: "Mobile App Development",
};

export default function MobileDevelopmentPage() {
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
        defaultService="Mobile App Development"
      />
    </main>
  );
}
