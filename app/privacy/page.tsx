"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import { Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#F4F6F1] text-[#0B1310] font-sans relative overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setModalOpen(true)} />

      {/* Hero Header */}
      <section className="pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-[#E1E6DF] bg-white text-slate-800 shadow-sm">
            <Lock className="w-4 h-4 text-[#22C55E]" />
            <span>DATA PROTECTION &amp; PRIVACY</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0B1310] tracking-tight uppercase leading-[1.05]">
            PRIVACY <span className="text-[#22C55E]">POLICY</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            Effective Date: January 1, 2026 • SKORA Digital Technologies Inc.
          </p>
        </motion.div>
      </section>

      {/* Main Content Privacy Policy Clauses */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div className="p-8 sm:p-12 rounded-xl bg-white border border-[#E1E6DF] space-y-8 shadow-md">
          {/* Clause 1 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#0B1310] uppercase flex items-center gap-2">
              <span className="text-[#22C55E]">01.</span> Information We Collect
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              SKORA Digital collects personal and technical data required to deliver our services, including name, corporate email, phone number, company name, project brief parameters, server telemetry, and cookie performance analytics when interacting with our digital portals.
            </p>
          </div>

          {/* Clause 2 */}
          <div className="space-y-3 pt-6 border-t border-[#E1E6DF]">
            <h2 className="text-xl font-bold text-[#0B1310] uppercase flex items-center gap-2">
              <span className="text-[#22C55E]">02.</span> How We Use Your Data
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Your data is strictly utilized to execute software developments, configure AWS cloud infrastructure, dispatch strategy proposals, communicate sprint updates, and optimize your digital marketing campaigns. We never sell, rent, or trade your personal data to third parties.
            </p>
          </div>

          {/* Clause 3 */}
          <div className="space-y-3 pt-6 border-t border-[#E1E6DF]">
            <h2 className="text-xl font-bold text-[#0B1310] uppercase flex items-center gap-2">
              <span className="text-[#22C55E]">03.</span> Non-Disclosure &amp; Enterprise Security
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              All client code, database architectures, patient data (for Healthcare IT solutions), and business strategies are protected under strict Non-Disclosure Agreements (NDA). All infrastructure utilizes AES-256 bit encryption in transit and at rest on AWS/Azure ISO-certified data centers.
            </p>
          </div>

          {/* Clause 4 */}
          <div className="space-y-3 pt-6 border-t border-[#E1E6DF]">
            <h2 className="text-xl font-bold text-[#0B1310] uppercase flex items-center gap-2">
              <span className="text-[#22C55E]">04.</span> Cookies &amp; Tracking Technologies
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Our website uses essential performance cookies to manage user sessions and anonymous analytics cookies (Google Analytics 4) to monitor website traffic and user engagement. You can modify your browser settings to disable non-essential cookies at any time.
            </p>
          </div>

          {/* Clause 5 */}
          <div className="space-y-3 pt-6 border-t border-[#E1E6DF]">
            <h2 className="text-xl font-bold text-[#0B1310] uppercase flex items-center gap-2">
              <span className="text-[#22C55E]">05.</span> Your GDPR &amp; CCPA Data Rights
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Under applicable privacy laws (GDPR, CCPA), you have the right to request access to your personal data, request correction of inaccurate data, or request permanent deletion ("Right to be Forgotten") from our systems by emailing ashish17427@gmail.com.
            </p>
          </div>
        </div>
      </section>

      <Footer onOpenConsultation={() => setModalOpen(true)} />
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultService="Privacy Inquiries"
      />
    </main>
  );
}
