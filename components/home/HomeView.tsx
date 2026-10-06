"use client";

import React from "react";
import EnterpriseHero from "@/components/EnterpriseHero";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import FeelTheMarket from "@/components/FeelTheMarket";
import TechExpertiseSection from "@/components/TechExpertiseSection";
import ProcessSection from "@/components/ProcessSection";
import WorkReel from "@/components/WorkReel";
import Footer from "@/components/Footer";
import { useConsultation } from "@/context/ConsultationContext";

/**
 * Homepage body. Client because every section is a client component and two of
 * them open the shared consultation modal; `app/page.tsx` stays the server
 * route that owns metadata + schema. Same split as `/contact` and `/terms`.
 *
 * No chrome here: the navbar, scroll progress bar and consultation modal are
 * hoisted into the root layout (see SiteChrome / ConsultationContext) so they
 * sit outside ScrollSmoother's transformed wrapper and survive navigation.
 * Each section owns its own scroll choreography rather than being wrapped in
 * a reveal layer that would animate twice.
 */
export default function HomeView() {
  const { openConsultation } = useConsultation();

  return (
    <main className="min-h-screen bg-main text-ink flex flex-col relative overflow-hidden">
      {/* 1. Hero */}
      <EnterpriseHero onOpenConsultation={openConsultation} />

      {/* 2. Services overview */}
      <CapabilitiesSection />

      {/* 3. Why teams choose Skora */}
      <FeelTheMarket />

      {/* 4. Process */}
      <ProcessSection />

      {/* 5. Technology expertise */}
      <TechExpertiseSection />

      {/* 6. Selected work */}
      <WorkReel />

      {/* 7. Footer */}
      <Footer onOpenConsultation={openConsultation} />
    </main>
  );
}