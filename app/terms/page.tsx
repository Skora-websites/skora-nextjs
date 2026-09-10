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
    title: "Acceptance of Terms",
    body: 'By accessing, browsing, or utilizing the web development, mobile software, cloud engineering, or digital marketing services provided by SKORA ("Company", "We", "Us"), you ("Client", "User") agree to be bound by these Terms & Conditions. If you do not agree to all terms, you must cease use of our services immediately.',
  },
  {
    num: "02.",
    title: "Scope of Engineering & Marketing Services",
    body: "SKORA delivers custom Next.js web applications, mobile applications, AWS cloud infrastructure, SaaS platform engineering, GMB Local SEO, and video production services. Specific project scope, milestones, deliverables, and timelines are documented in individual Statements of Work (SOW) executed between SKORA and the Client.",
  },
  {
    num: "03.",
    title: "Intellectual Property & Ownership",
    body: "Upon full final payment of all invoiced milestone amounts, SKORA transfers 100% full ownership of custom application source code, designs, and assets created specifically for the Client under the agreed SOW. Pre-existing proprietary libraries, frameworks, or developer tools remain the intellectual property of SKORA.",
  },
  {
    num: "04.",
    title: "Payment Terms & Invoicing",
    body: "Invoices are issued according to project milestones detailed in your SOW. Milestone payments are due within 7 business days of invoice issuance. Late payments may incur a monthly interest rate of 1.5% until settled. Retainers for recurring digital marketing or cloud maintenance are billed on the 1st of each calendar month.",
  },
  {
    num: "05.",
    title: "Service Level Agreement (SLA) & Uptime Guarantee",
    body: "For managed cloud hosting and enterprise retainer contracts, SKORA maintains a 99.99% uptime target. Scheduled maintenance windows will be communicated at least 48 hours in advance. Emergency hotfixes are deployed without notice to protect security integrity.",
  },
  {
    num: "06.",
    title: "Limitation of Liability",
    body: "To the maximum extent permitted by law, SKORA shall not be liable for indirect, incidental, or consequential damages, lost profits, or data loss arising from service usage. Total liability shall not exceed the fees paid by Client to SKORA in the 3 months preceding the claim.",
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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto space-y-6 relative"
        >
          <span className="kicker justify-center">Legal agreement</span>

          <h1 className="display-hero text-4xl sm:text-6xl">
            Terms and <span className="display-accent text-accent">conditions.</span>
          </h1>

          <p className="text-sm sm:text-base text-sub font-medium leading-relaxed">
            Effective Date: January 1, 2026 • SKORA Technologies Inc.
          </p>
        </motion.div>
      </section>

      {/* Main Content Terms & Conditions Clauses */}
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
        defaultService="Legal Inquiry"
      />
    </main>
  );
}
