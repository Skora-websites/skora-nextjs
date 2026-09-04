"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
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

// One shared WebGL canvas behind the entire page (client-only)
const ThreeBackground = dynamic(() => import("@/components/ThreeBackground"), { ssr: false });

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
      {/* Shared WebGL Deep-Space Particle Canvas */}
      <ThreeBackground />

      {/* High-Impact GSAP 3D Cyber Intro Sequence */}
      <LandingIntro />

      {/* Top Sticky Scroll Progress Bar */}
      <ScrollProgressBar />

      {/* Navbar — dark glass with neon logo dot */}
      <Navbar onOpenConsultation={handleOpenConsultation} />

      {/* 1. ENTERPRISE HERO — WebGL icosahedron centerpiece, grid floor & 5 neon showcase cards */}
      <EnterpriseHero onOpenConsultation={handleOpenConsultation} />

      {/* 2. WHAT WE BUILD AT SKORA — Deep-space glassmorphism capabilities */}
      <ScrollReveal variant="fade-up" duration={800}>
        <CapabilitiesSection />
      </ScrollReveal>

      {/* 3. FEEL THE MARKET IN YOUR FAVOUR — 3D Frosty Ice Cubes & Melting Water Drip Loop */}
      <ScrollReveal variant="fade-up" duration={800}>
        <FeelTheMarket />
      </ScrollReveal>

      {/* 4. OUR TECH & MEDIA EXPERTISE — Dark glowing marquee */}
      <ScrollReveal variant="fade-up" duration={800}>
        <TechExpertiseSection />
      </ScrollReveal>

      {/* 5. 3D 6-LAPTOP CAROUSEL WHEEL — reflection floor + neon rim */}
      <ScrollReveal variant="zoom" duration={900}>
        <LaptopSlider />
      </ScrollReveal>

      {/* 6. TESTIMONIALS SECTION ("Partnered with the Best") */}
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
