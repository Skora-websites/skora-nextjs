"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import { motion } from "framer-motion";

const clauses = [
  {
    num: "01.",
    title: "Information We Collect",
    body: "SKORA collects personal and technical data required to deliver our services, including name, corporate email, phone number, company name, project brief parameters, server telemetry, and cookie performance analytics when interacting with our digital portals.",
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
    body: 'Under applicable privacy laws (GDPR, CCPA), you have the right to request access to your personal data, request correction of inaccurate data, or request permanent deletion ("Right to be Forgotten") from our systems by emailing info@skorainfotech.com.',
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto space-y-6 relative"
        >
          <span className="kicker justify-center">Data protection and privacy</span>

          <h1 className="display-hero text-4xl sm:text-6xl">
            Privacy <span className="display-accent text-accent">policy.</span>
          </h1>

          <p className="text-sm sm:text-base text-sub font-medium leading-relaxed">
            Effective Date: January 1, 2026 • SKORA Technologies Inc.
          </p>
        </motion.div>
      </section>

      {/* Main Content Privacy Policy Clauses */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="overflow-hidden rounded-[2rem] border border-line bg-surface">
          {clauses.map((clause) => (
            <div key={clause.num} className="grid grid-cols-[auto_1fr] gap-4 border-b border-line px-6 py-7 last:border-0 sm:gap-8 sm:px-10">
              <span className="ghost-numeral text-3xl sm:text-4xl">{clause.num}</span>
              <div className="space-y-2">
                <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">
                  {clause.title}
                </h2>
                <p className="text-xs sm:text-sm text-sub font-medium leading-relaxed">
                  {clause.body}
                </p>
              </div>
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
