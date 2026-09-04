"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

const clauses = [
  {
    title: "Information We Collect",
    body: "SKORA Digital collects personal and technical data required to deliver our services, including name, corporate email, phone number, company name, project brief parameters, server telemetry, and cookie performance analytics when interacting with our digital portals.",
  },
  {
    title: "How We Use Your Data",
    body: "Your data is strictly utilized to execute software developments, configure AWS cloud infrastructure, dispatch strategy proposals, communicate sprint updates, and optimize your digital marketing campaigns. We never sell, rent, or trade your personal data to third parties.",
  },
  {
    title: "Non-Disclosure & Enterprise Security",
    body: "All client code, database architectures, patient data (for Healthcare IT solutions), and business strategies are protected under strict Non-Disclosure Agreements (NDA). All infrastructure utilizes AES-256 bit encryption in transit and at rest on AWS/Azure ISO-certified data centers.",
  },
  {
    title: "Cookies & Tracking Technologies",
    body: "Our website uses essential performance cookies to manage user sessions and anonymous analytics cookies (Google Analytics 4) to monitor website traffic and user engagement. You can modify your browser settings to disable non-essential cookies at any time.",
  },
  {
    title: "Your GDPR & CCPA Data Rights",
    body: 'Under applicable privacy laws (GDPR, CCPA), you have the right to request access to your personal data, request correction of inaccurate data, or request permanent deletion ("Right to be Forgotten") from our systems by emailing privacy@skora.digital.',
  },
];

export default function PrivacyPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#05070E] text-white font-sans selection:bg-[#2563EB] selection:text-white relative overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setModalOpen(true)} />

      {/* Hero Header */}
      <section className="relative px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-radial-halo absolute -top-40 left-1/2 h-[30rem] w-[52rem] -translate-x-1/2 rounded-full blur-[130px]" />
          <div className="grid-floor" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto max-w-3xl space-y-6 text-center"
        >
          <div className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
            <Lock className="h-4 w-4 text-sky-300" />
            <span className="font-bold">✦ DATA PROTECTION &amp; PRIVACY ✦</span>
          </div>

          <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-6xl">
            PRIVACY <span className="text-gradient-cyan">POLICY</span>
          </h1>

          <p className="text-sm font-medium leading-relaxed text-slate-400 sm:text-base">
            Effective Date: January 1, 2026 • SKORA Digital Technologies Inc.
          </p>
        </motion.div>
      </section>

      {/* Main Content Privacy Policy Clauses */}
      <section className="relative mx-auto max-w-5xl space-y-8 px-4 pb-24 sm:px-6 lg:px-8">
        <div className="glass-card space-y-8 rounded-[2.5rem] p-8 sm:p-12">
          {clauses.map((clause, idx) => (
            <div key={idx} className={`space-y-3 ${idx > 0 ? "border-t border-white/10 pt-6" : ""}`}>
              <h2 className="flex items-center gap-2 text-xl font-extrabold uppercase text-white">
                <span className="text-sky-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]">{String(idx + 1).padStart(2, "0")}.</span> {clause.title}
              </h2>
              <p className="text-xs font-medium leading-relaxed text-slate-400 sm:text-sm">
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
