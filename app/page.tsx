"use client";

import React, { useState } from "react";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ScrollReveal from "@/components/ScrollReveal";
import Navbar from "@/components/Navbar";
import EnterpriseHero from "@/components/EnterpriseHero";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import FeelTheMarket from "@/components/FeelTheMarket";
import TechExpertiseSection from "@/components/TechExpertiseSection";
import ProcessSection from "@/components/ProcessSection";
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
    <main className="min-h-screen bg-main text-ink flex flex-col relative overflow-hidden">
      {/* Top Sticky Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Navbar with white-glass scroll treatment */}
      <Navbar onOpenConsultation={handleOpenConsultation} />

      {/* 1. Hero */}
      <EnterpriseHero onOpenConsultation={handleOpenConsultation} />

      {/* 2. Services overview */}
      <ScrollReveal variant="fade-up" duration={800}>
        <CapabilitiesSection />
      </ScrollReveal>

      {/* 3. Why teams choose Skora */}
      <ScrollReveal variant="fade-up" duration={800}>
        <FeelTheMarket />
      </ScrollReveal>

      {/* 4. Process */}
      <ScrollReveal variant="fade-up" duration={800}>
        <ProcessSection />
      </ScrollReveal>

      {/* 5. Technology expertise */}
      <ScrollReveal variant="fade-up" duration={800}>
        <TechExpertiseSection />
      </ScrollReveal>

      {/* 5. Selected work */}
      <ScrollReveal variant="zoom" duration={900}>
        <LaptopSlider />
      </ScrollReveal>

      {/* 6. Client feedback */}
      <ScrollReveal variant="fade-up" duration={800}>
        <TestimonialsSection />
      </ScrollReveal>

      {/* 7. FOOTER */}
      <Footer onOpenConsultation={handleOpenConsultation} />

      {/* Consultation Lead Modal */}
      <ContactModal
        isOpen={consultationModalOpen}
        onClose={handleCloseConsultation}
        initialService={selectedServiceForConsultation}
      />
    </main>
  );
}
