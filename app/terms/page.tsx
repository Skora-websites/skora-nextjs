"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

const clauses = [
  {
    title: "Acceptance of Terms",
    body: 'By accessing, browsing, or utilizing the web development, mobile software, cloud engineering, or digital marketing services provided by SKORA Digital ("Company", "We", "Us"), you ("Client", "User") agree to be bound by these Terms & Conditions. If you do not agree to all terms, you must cease use of our services immediately.',
  },
  {
    title: "Scope of Engineering & Marketing Services",
    body: "SKORA Digital delivers custom Next.js web applications, mobile applications, AWS cloud infrastructure, SaaS platform engineering, GMB Local SEO, and video production services. Specific project scope, milestones, deliverables, and timelines are documented in individual Statements of Work (SOW) executed between SKORA and the Client.",
  },
  {
    title: "Intellectual Property & Ownership",
    body: "Upon full final payment of all invoiced milestone amounts, SKORA Digital transfers 100% full ownership of custom application source code, designs, and assets created specifically for the Client under the agreed SOW. Pre-existing proprietary libraries, frameworks, or developer tools remain the intellectual property of SKORA Digital.",
  },
  {
    title: "Payment Terms & Invoicing",
    body: "Invoices are issued according to project milestones detailed in your SOW. Milestone payments are due within 7 business days of invoice issuance. Late payments may incur a monthly interest rate of 1.5% until settled. Retainers for recurring digital marketing or cloud maintenance are billed on the 1st of each calendar month.",
  },
  {
    title: "Service Level Agreement (SLA) & Uptime Guarantee",
    body: "For managed cloud hosting and enterprise retainer contracts, SKORA Digital maintains a 99.99% uptime target. Scheduled maintenance windows will be communicated at least 48 hours in advance. Emergency hotfixes are deployed without notice to protect security integrity.",
  },
  {
    title: "Limitation of Liability",
    body: "To the maximum extent permitted by law, SKORA Digital shall not be liable for indirect, incidental, or consequential damages, lost profits, or data loss arising from service usage. Total liability shall not exceed the fees paid by Client to SKORA Digital in the 3 months preceding the claim.",
  },
];

export default function TermsPage() {
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
            <FileText className="h-4 w-4 text-sky-300" />
            <span className="font-bold">✦ LEGAL AGREEMENT ✦</span>
          </div>

          <h1 className="text-4xl font-black uppercase leading-[1.05] tracking-tight text-white sm:text-6xl">
            TERMS &amp; <span className="text-gradient-cyan">CONDITIONS</span>
          </h1>

          <p className="text-sm font-medium leading-relaxed text-slate-400 sm:text-base">
            Effective Date: January 1, 2026 • SKORA Digital Technologies Inc.
          </p>
        </motion.div>
      </section>

      {/* Main Content Terms & Conditions Clauses */}
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
        defaultService="Legal Inquiry"
      />
    </main>
  );
}
