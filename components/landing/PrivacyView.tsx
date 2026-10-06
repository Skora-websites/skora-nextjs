"use client";

import React from "react";
import Footer from "@/components/Footer";
import Reveal from "@/components/animation/Reveal";
import SplitHeading from "@/components/animation/SplitHeading";
import { useConsultation } from "@/context/ConsultationContext";
import { DEFAULT_SITE_CORE } from "@/lib/site-defaults";

/**
 * Privacy policy clauses.
 *
 * Skora is registered in India, so the data-rights clause is written against the
 * Digital Personal Data Protection Act, 2023 (DPDP Act) rather than the EU/UK
 * GDPR. `data.retention` notes are deliberately plain: they describe what we
 * actually do with an enquiry, not certifications we cannot evidence.
 */
const clauses = [
  {
    num: "01.",
    title: "Information We Collect",
    body: "SKORA collects personal and technical data required to deliver our services, including name, corporate email, phone number, company name, project brief parameters, server telemetry, and cookie performance analytics when interacting with our digital portals.",
  },
  {
    num: "02.",
    title: "How We Use Your Data",
    body: "Your data is strictly utilized to execute software developments, configure cloud infrastructure, dispatch strategy proposals, communicate sprint updates, and optimize your digital marketing campaigns. We never sell, rent, or trade your personal data to third parties.",
  },
  {
    num: "03.",
    title: "Non-Disclosure & Security",
    body: "All client code, database architectures, credentials and business strategies are protected under strict Non-Disclosure Agreements (NDA). Project data is held on cloud infrastructure we control, encrypted with AES-256 in transit and at rest, and access is limited to the people working on your engagement.",
  },
  {
    num: "04.",
    title: "Cookies & Tracking Technologies",
    body: "Our website uses essential performance cookies to manage user sessions and anonymous analytics cookies (Google Analytics 4) to monitor website traffic and user engagement. You can modify your browser settings to disable non-essential cookies at any time.",
  },
  {
    num: "05.",
    title: "Your DPDP Act 2023 Data Rights",
    body: `Under the Digital Personal Data Protection Act, 2023 and the rules made under it, you may ask us for access to the personal data we hold about you, correction of inaccurate or incomplete data, and erasure of that data once our legal and contractual record-keeping obligations are met. You also have the right to nominate someone to exercise these rights on your behalf, and to raise a grievance with us or with the Data Protection Board of India. Send any request or grievance to ${DEFAULT_SITE_CORE.email} and we will acknowledge it and respond within the timelines the Act prescribes.`,
  },
];

export default function PrivacyView() {
  const { openConsultation } = useConsultation();

  return (
    <main className="min-h-screen bg-main text-ink font-sans relative overflow-x-hidden">
      {/* Hero Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <Reveal variant="blur" className="text-center max-w-3xl mx-auto space-y-6 relative">
          <span className="kicker justify-center">Data protection and privacy</span>

          <SplitHeading as="h1" className="display-hero text-4xl sm:text-6xl" delay={0.1}>
            Privacy <span className="display-accent text-accent">policy.</span>
          </SplitHeading>

          <p className="text-sm sm:text-base text-sub font-medium leading-relaxed">
            Effective Date: January 1, 2026 • Skora Infotech, Noida, Uttar Pradesh, India
          </p>
        </Reveal>
      </section>

      {/* Main Content Privacy Policy Clauses */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <Reveal
          variant="fade-up"
          className="overflow-hidden rounded-[2rem] border border-line bg-surface"
          staggerSelector="[data-clause]"
          stagger={0.12}
        >
          {clauses.map((clause) => (
            <div
              key={clause.num}
              data-clause
              className="grid grid-cols-[auto_1fr] gap-4 border-b border-line px-6 py-7 last:border-0 sm:gap-8 sm:px-10"
            >
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
        </Reveal>
      </section>

      <Footer onOpenConsultation={() => openConsultation("Privacy Inquiry")} />
    </main>
  );
}