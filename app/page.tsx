"use client";

import React, { useState } from "react";
import LandingIntro from "@/components/LandingIntro";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ScrollReveal from "@/components/ScrollReveal";
import Navbar from "@/components/Navbar";
import EnterpriseHero from "@/components/EnterpriseHero";
import CapabilitiesSection from "@/components/CapabilitiesSection";
import FeelTheMarket from "@/components/FeelTheMarket";
import TechExpertiseSection from "@/components/TechExpertiseSection";
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
    <main className="min-h-screen bg-[#05070E] text-white flex flex-col relative overflow-hidden">
      {/* High-Impact GSAP 3D Cyber Intro Sequence */}
      <LandingIntro />

      {/* Top Sticky Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Navbar with transparent-to-white scroll transition logic */}
      <Navbar onOpenConsultation={handleOpenConsultation} />

      {/* 1. ENTERPRISE HERO — Electric Blue Theme & 5 Front Showcase 3D Cards */}
      <EnterpriseHero onOpenConsultation={handleOpenConsultation} />

      {/* 2. WHAT WE BUILD AT SKORA — MNC Corporate Glassmorphism Capabilities */}
      <ScrollReveal variant="fade-up" duration={800}>
        <CapabilitiesSection />
      </ScrollReveal>

      {/* 3. FEEL THE MARKET IN YOUR FAVOUR — 3D Rusty Frosty Ice Cubes & Melting Water Drip Loop */}
      <ScrollReveal variant="fade-up" duration={800}>
        <FeelTheMarket />
      </ScrollReveal>

      {/* 4. OUR TECH & MEDIA EXPERTISE — Pure White Background */}
      <ScrollReveal variant="fade-up" duration={800}>
        <TechExpertiseSection />
      </ScrollReveal>

      {/* 5. 3D 6-LAPTOP CAROUSEL WHEEL */}
      <ScrollReveal variant="zoom" duration={900}>
        <LaptopSlider />
      </ScrollReveal>

      {/* 6. TESTIMONIALS SECTION ("Partnered with the Best") */}
      <ScrollReveal variant="fade-up" duration={800}>
        <TestimonialsSection />
      </ScrollReveal>

      {/* 7. FOOTER */}
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
