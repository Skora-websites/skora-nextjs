"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
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
            <FileText className="w-4 h-4 text-[#22C55E]" />
            <span>LEGAL AGREEMENT</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#0B1310] tracking-tight uppercase leading-[1.05]">
            TERMS &amp; <span className="text-[#22C55E]">CONDITIONS</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            Effective Date: January 1, 2026 • SKORA Digital Technologies Inc.
          </p>
        </motion.div>
      </section>

      {/* Main Content Terms & Conditions Clauses */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div className="p-8 sm:p-12 rounded-xl bg-white border border-[#E1E6DF] space-y-8 shadow-md">
          {/* Clause 1 */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#0B1310] uppercase flex items-center gap-2">
              <span className="text-[#22C55E]">01.</span> Acceptance of Terms
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              By accessing, browsing, or utilizing the web development, mobile software, cloud engineering, or digital marketing services provided by SKORA Digital ("Company", "We", "Us"), you ("Client", "User") agree to be bound by these Terms &amp; Conditions. If you do not agree to all terms, you must cease use of our services immediately.
            </p>
          </div>

          {/* Clause 2 */}
          <div className="space-y-3 pt-6 border-t border-[#E1E6DF]">
            <h2 className="text-xl font-bold text-[#0B1310] uppercase flex items-center gap-2">
              <span className="text-[#22C55E]">02.</span> Scope of Engineering &amp; Marketing Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              SKORA Digital delivers custom Next.js web applications, mobile applications, AWS cloud infrastructure, SaaS platform engineering, GMB Local SEO, and video production services. Specific project scope, milestones, deliverables, and timelines are documented in individual Statements of Work (SOW) executed between SKORA and the Client.
            </p>
          </div>

          {/* Clause 3 */}
          <div className="space-y-3 pt-6 border-t border-[#E1E6DF]">
            <h2 className="text-xl font-bold text-[#0B1310] uppercase flex items-center gap-2">
              <span className="text-[#22C55E]">03.</span> Intellectual Property &amp; Ownership
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Upon full final payment of all invoiced milestone amounts, SKORA Digital transfers 100% full ownership of custom application source code, designs, and assets created specifically for the Client under the agreed SOW. Pre-existing proprietary libraries, frameworks, or developer tools remain the intellectual property of SKORA Digital.
            </p>
          </div>

          {/* Clause 4 */}
          <div className="space-y-3 pt-6 border-t border-[#E1E6DF]">
            <h2 className="text-xl font-bold text-[#0B1310] uppercase flex items-center gap-2">
              <span className="text-[#22C55E]">04.</span> Payment Terms &amp; Invoicing
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              Invoices are issued according to project milestones detailed in your SOW. Milestone payments are due within 7 business days of invoice issuance. Late payments may incur a monthly interest rate of 1.5% until settled. Retainers for recurring digital marketing or cloud maintenance are billed on the 1st of each calendar month.
            </p>
          </div>

          {/* Clause 5 */}
          <div className="space-y-3 pt-6 border-t border-[#E1E6DF]">
            <h2 className="text-xl font-bold text-[#0B1310] uppercase flex items-center gap-2">
              <span className="text-[#22C55E]">05.</span> Service Level Agreement (SLA) &amp; Uptime Guarantee
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              For managed cloud hosting and enterprise retainer contracts, SKORA Digital maintains a 99.99% uptime target. Scheduled maintenance windows will be communicated at least 48 hours in advance. Emergency hotfixes are deployed without notice to protect security integrity.
            </p>
          </div>

          {/* Clause 6 */}
          <div className="space-y-3 pt-6 border-t border-[#E1E6DF]">
            <h2 className="text-xl font-bold text-[#0B1310] uppercase flex items-center gap-2">
              <span className="text-[#22C55E]">06.</span> Limitation of Liability
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
              In no event shall SKORA Digital be liable for any indirect, incidental, consequential, or punitive damages arising from platform downtime, third-party API changes, or server interruptions beyond our direct control. Our total aggregate liability under any agreement shall not exceed the total fees paid by the Client to SKORA Digital in the preceding 3 months.
            </p>
          </div>
        </div>
      </section>

      <Footer onOpenConsultation={() => setModalOpen(true)} />
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultService="Terms Inquiries"
      />
    </main>
  );
}
