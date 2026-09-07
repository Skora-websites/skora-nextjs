"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import Pill from "@/components/landing/Pill";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

const clauses = [
  {
    num: "01.",
    title: "Information We Collect",
    body: "SKORA Digital collects personal and technical data required to deliver our services, including name, corporate email, phone number, company name, project brief parameters, server telemetry, and cookie performance analytics when interacting with our digital portals.",
  },
  {
    num: "02.",
    title: "How We Use Your Data",
    body: "Your data is strictly utilized to execute software developments, configure AWS cloud infrastructure, dispatch strategy proposals, communicate sprint updates, and optimize your digital marketing campaigns. We never sell, rent, or trade your personal data to third parties.",
  },
  {
    num: "03.",
    title: "Non-Disclosure & Enterprise Security",
    body: "All client code, database architectures, patient data (for Healthcare IT solutions), and business strategies are protected under strict Non-Disclosure Agreements (NDA). All infrastructure utilizes AES-256 bit encryption in transit and at rest on AWS/Azure ISO-certified data centers.",
  },
  {
    num: "04.",
    title: "Cookies & Tracking Technologies",
    body: "Our website uses essential performance cookies to manage user sessions and anonymous analytics cookies (Google Analytics 4) to monitor website traffic and user engagement. You can modify your browser settings to disable non-essential cookies at any time.",
  },
  {
    num: "05.",
    title: "Your GDPR & CCPA Data Rights",
    body: 'Under applicable privacy laws (GDPR, CCPA), you have the right to request access to your personal data, request correction of inaccurate data, or request permanent deletion ("Right to be Forgotten") from our systems by emailing privacy@skora.digital.',
  },
];

export default function PrivacyPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-main text-ink font-sans relative overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setModalOpen(true)} />

      {/* Hero Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="absolute -top-10 left-1/4 w-[500px] h-[400px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto space-y-6 relative"
        >
          <Pill>
            <Lock className="w-3.5 h-3.5" />
            <span>✦ DATA PROTECTION &amp; PRIVACY ✦</span>
          </Pill>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-ink tracking-tight leading-[1.05]">
            PRIVACY <span className="text-gradient">POLICY</span>
          </h1>

          <p className="text-sm sm:text-base text-sub font-medium leading-relaxed">
            Effective Date: January 1, 2026 • SKORA Digital Technologies Inc.
          </p>
        </motion.div>
      </section>

      {/* Main Content Privacy Policy Clauses */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-[2.5rem] glass-card space-y-8">
          {clauses.map((clause, idx) => (
            <div key={clause.num} className={`space-y-3 ${idx > 0 ? "pt-6 border-t border-line" : ""}`}>
              <h2 className="text-xl font-extrabold text-ink uppercase flex items-center gap-2">
                <span className="text-accent-light">{clause.num}</span> {clause.title}
              </h2>
              <p className="text-xs sm:text-sm text-sub font-medium leading-relaxed">
                {clause.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer onOpenConsultation={() => setModalOpen(true)} />
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultService="Privacy Inquiry"
      />
    </main>
  );
}
