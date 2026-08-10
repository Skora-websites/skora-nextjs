"use client";

import React, { useState } from "react";
import LandingIntro from "@/components/LandingIntro";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ScrollReveal from "@/components/ScrollReveal";
import Navbar from "@/components/Navbar";
import EnterpriseHero from "@/components/EnterpriseHero";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import FeelTheMarket from "@/components/FeelTheMarket";
import LaptopSlider from "@/components/LaptopSlider";
import TestimonialsSection from "@/components/TestimonialsSection";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";

export default function Home() {
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [selectedServiceForConsultation, setSelectedServiceForConsultation] = useState<string>("");

  const handleOpenConsultation = (serviceTitle?: string) => {
    if (serviceTitle) {
      setSelectedServiceForConsultation(serviceTitle);
    } else {
      setSelectedServiceForConsultation("");
    }
    setConsultationModalOpen(true);
  };

  const handleCloseConsultation = () => {
    setConsultationModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative overflow-hidden">
      {/* High-Impact Cinematic GSAP 3D Intro Sequence */}
      <LandingIntro />

      {/* Top Scroll Progress Indicator */}
      <ScrollProgressBar />

      {/* Navbar with exact scroll transition logic */}
      <Navbar onOpenConsultation={handleOpenConsultation} />

      {/* 1. ENTERPRISE HERO SECTION — DARK THEME (#071a42) */}
      <EnterpriseHero onOpenConsultation={handleOpenConsultation} />

      {/* 2. CAPABILITIES SECTION — LIGHT THEME (bg-slate-50) */}
      <ScrollReveal variant="fade-up" duration={800}>
        <CapabilitiesSection />
      </ScrollReveal>

      {/* 3. FEEL THE MARKET ICE CUBES & TECH MARQUEES — DARK THEME (#030914) & LIGHT MARQUEES */}
      <ScrollReveal variant="fade-up" duration={800}>
        <FeelTheMarket />
      </ScrollReveal>

      {/* 4. 3D 6-LAPTOP CAROUSEL WHEEL — DARK THEME (#030914) */}
      <ScrollReveal variant="zoom" duration={900}>
        <LaptopSlider />
      </ScrollReveal>

      {/* 5. TESTIMONIALS SECTION — LIGHT THEME (#f8fbff) */}
      <ScrollReveal variant="fade-up" duration={800}>
        <TestimonialsSection />
      </ScrollReveal>

      {/* 6. FOOTER — DARK THEME (#020409) WITH FLOATING PARTICLES */}
      <Footer />

      {/* Consultation Lead Modal */}
      <ContactModal
        isOpen={consultationModalOpen}
        onClose={handleCloseConsultation}
        initialService={selectedServiceForConsultation}
      />
    </main>
  );
}
