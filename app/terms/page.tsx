"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import Pill from "@/components/landing/Pill";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

const clauses = [
  {
    num: "01.",
    title: "Acceptance of Terms",
    body: 'By accessing, browsing, or utilizing the web development, mobile software, cloud engineering, or digital marketing services provided by SKORA Digital ("Company", "We", "Us"), you ("Client", "User") agree to be bound by these Terms & Conditions. If you do not agree to all terms, you must cease use of our services immediately.',
  },
  {
    num: "02.",
    title: "Scope of Engineering & Marketing Services",
    body: "SKORA Digital delivers custom Next.js web applications, mobile applications, AWS cloud infrastructure, SaaS platform engineering, GMB Local SEO, and video production services. Specific project scope, milestones, deliverables, and timelines are documented in individual Statements of Work (SOW) executed between SKORA and the Client.",
  },
  {
    num: "03.",
    title: "Intellectual Property & Ownership",
    body: "Upon full final payment of all invoiced milestone amounts, SKORA Digital transfers 100% full ownership of custom application source code, designs, and assets created specifically for the Client under the agreed SOW. Pre-existing proprietary libraries, frameworks, or developer tools remain the intellectual property of SKORA Digital.",
  },
  {
    num: "04.",
    title: "Payment Terms & Invoicing",
    body: "Invoices are issued according to project milestones detailed in your SOW. Milestone payments are due within 7 business days of invoice issuance. Late payments may incur a monthly interest rate of 1.5% until settled. Retainers for recurring digital marketing or cloud maintenance are billed on the 1st of each calendar month.",
  },
  {
    num: "05.",
    title: "Service Level Agreement (SLA) & Uptime Guarantee",
    body: "For managed cloud hosting and enterprise retainer contracts, SKORA Digital maintains a 99.99% uptime target. Scheduled maintenance windows will be communicated at least 48 hours in advance. Emergency hotfixes are deployed without notice to protect security integrity.",
  },
  {
    num: "06.",
    title: "Limitation of Liability",
    body: "To the maximum extent permitted by law, SKORA Digital shall not be liable for indirect, incidental, or consequential damages, lost profits, or data loss arising from service usage. Total liability shall not exceed the fees paid by Client to SKORA Digital in the 3 months preceding the claim.",
  },
];

export default function TermsPage() {
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
            <FileText className="w-3.5 h-3.5" />
            <span>✦ LEGAL AGREEMENT ✦</span>
          </Pill>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-ink tracking-tight leading-[1.05]">
            TERMS &amp; <span className="text-gradient">CONDITIONS</span>
          </h1>

          <p className="text-sm sm:text-base text-sub font-medium leading-relaxed">
            Effective Date: January 1, 2026 • SKORA Digital Technologies Inc.
          </p>
        </motion.div>
      </section>

      {/* Main Content Terms & Conditions Clauses */}
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
        defaultService="Legal Inquiry"
      />
    </main>
  );
}
