"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Calendar, ArrowRight, Layers } from "lucide-react";
import Card3D from "./Card3D";
import gsap from "gsap";

// Hero 3D centerpiece — client-only, never blocks SSR
const HeroScene = dynamic(() => import("@/components/marketing/HeroScene"), { ssr: false });

const profileCards = [
  {
    title: "Healthcare IT",
    role: "Clinical Portals & EHR",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80",
    link: "/services/pms",
    badge: "HIPAA Compliant",
    glow: "hover:border-emerald-400/60 hover:shadow-[0_0_30px_rgba(52,211,153,0.25)]",
  },
  {
    title: "Custom Software",
    role: "Enterprise Platforms",
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
    link: "/services/saas-development",
    badge: "Multi-Tenant SaaS",
    glow: "hover:border-sky-400/60 hover:shadow-[0_0_30px_rgba(56,189,248,0.25)]",
  },
  {
    title: "Cloud Infra",
    role: "AWS & Azure Scaling",
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    link: "/services/cloud-services",
    badge: "99.99% Uptime",
    glow: "hover:border-indigo-400/60 hover:shadow-[0_0_30px_rgba(129,140,248,0.25)]",
  },
  {
    title: "UI / UX Design",
    role: "Cinematic Interfaces",
    img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80",
    link: "/services/website-design",
    badge: "High Conversion",
    glow: "hover:border-purple-400/60 hover:shadow-[0_0_30px_rgba(192,132,252,0.25)]",
  },
  {
    title: "Mobile Apps",
    role: "iOS & Android Engine",
    img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=600&q=80",
    link: "/services/mobile-development",
    badge: "Native Speed",
    glow: "hover:border-cyan-400/60 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]",
  },
];

interface EnterpriseHeroProps {
  onOpenConsultation: (topic?: string) => void;
}

export default function EnterpriseHero({ onOpenConsultation }: EnterpriseHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // Kinetic Title entrance
      gsap.fromTo(
        ".gsap-hero-title",
        { opacity: 0, y: 45, rotateX: -25 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1.0, stagger: 0.12, ease: "power3.out" }
      );

      // Buttons animation
      gsap.fromTo(
        ".gsap-hero-btn",
        { opacity: 0, scale: 0.88, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 0.3, ease: "back.out(1.5)" }
      );

      // Service Showcase Cards Stagger Zoom
      gsap.fromTo(
        ".gsap-card-item",
        { opacity: 0, y: 40, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.08, delay: 0.45, ease: "back.out(1.3)" }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[720px] overflow-hidden border-b border-white/10 pt-20 lg:pt-24 pb-12 [perspective:1200px]"
    >
      {/* Deep-space ambient backdrop */}
      <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(37,99,235,0.28)_0%,rgba(5,7,14,0)_65%)]" />
        <div className="animate-float-slow absolute -left-40 top-10 h-[30rem] w-[30rem] rounded-full bg-blue-700/15 blur-[140px]" />
        <div className="animate-float-reverse absolute -right-40 bottom-0 h-[26rem] w-[26rem] rounded-full bg-cyan-500/10 blur-[140px]" />
        {/* 3D rotating icosahedron + orbiting satellites behind the headline */}
        <HeroScene />
        {/* Animated neon perspective grid floor */}
        <div className="grid-floor" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 text-center">

        {/* Kinetic Hero Title */}
        <h1 className="gsap-hero-title text-glow-cyan mx-auto max-w-5xl text-5xl font-semibold leading-[1.03] tracking-[-0.05em] text-white sm:text-6xl lg:text-[5.4rem]">
          Innovation doesn&apos;t wait.<br />
          Neither does <span className="text-gradient-cyan">Skora.</span>
        </h1>

        {/* Subtitle */}
        <div className="gsap-hero-title mx-auto mt-5 max-w-2xl text-base sm:text-lg lg:text-xl font-medium leading-relaxed text-slate-300">
          We architect custom enterprise platforms, dedicated healthcare IT solutions, high-converting digital marketing, and scalable cloud architectures.
        </div>

        {/* Animated Neon Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Schedule Consultation Button */}
          <button
            onClick={() => onOpenConsultation()}
            className="gsap-hero-btn group relative inline-flex cursor-pointer items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 px-7 py-4 text-base font-extrabold text-white shadow-[0_0_35px_rgba(37,99,235,0.55)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_50px_rgba(56,189,248,0.7)]"
          >
            <div className="absolute inset-0 translate-y-full bg-white/20 transition-transform duration-300 group-hover:translate-y-0" />
            <Calendar size={18} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative z-10">Schedule Consultation</span>
            <ArrowRight size={17} className="relative z-10 group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>

          {/* Explore Capabilities Button */}
          <a
            href="#capabilities"
            className="gsap-hero-btn glass-pill group inline-flex items-center gap-3 rounded-xl px-7 py-4 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/60 hover:bg-white/10"
          >
            <Layers size={18} className="text-sky-300 group-hover:scale-110 transition-transform" />
            <span>Explore Capabilities</span>
          </a>
        </div>

        {/* 5 SERVICE SHOWCASE CARDS — neon glass tilt cards */}
        <div className="mt-10 w-full overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-stretch justify-center gap-3 px-2 lg:min-w-0 lg:flex-wrap">
            {profileCards.map((card, index) => (
              <a href={card.link} key={card.title} className="gsap-card-item block">
                <Card3D
                  maxTilt={14}
                  className={`neon-border w-[178px] overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F19]/70 p-2.5 text-left shadow-[0_14px_32px_rgba(2,6,23,0.6)] backdrop-blur-xl transition duration-300 ${card.glow}`}
                >
                  <div className="h-26 overflow-hidden rounded-xl relative">
                    <img
                      src={card.img}
                      alt={card.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80";
                      }}
                      className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070E]/70 to-transparent" />
                    <span className="absolute top-1.5 right-1.5 rounded-full border border-white/15 bg-[#05070E]/90 px-2 py-0.5 font-mono-accent text-[9px] font-bold text-sky-200 backdrop-blur-md">
                      {card.badge}
                    </span>
                  </div>
                  <div className="px-1 pb-1 pt-3">
                    <h2 className="truncate text-sm font-bold text-white">{card.title}</h2>
                    <p className="mt-1 truncate text-[11px] font-semibold text-sky-300">{card.role}</p>
                  </div>
                </Card3D>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
