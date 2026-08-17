"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Calendar,
  Layers,
  Globe,
  Bot,
  Cloud,
  Smartphone,
  BarChart3,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Card3D from "./Card3D";
import gsap from "gsap";

interface HeroProps {
  onOpenConsultation: (service?: string) => void;
}

const backgroundImages = [
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1920&q=80",
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80",
];

const profileCards = [
  { title: "Healthcare IT", role: "Clinical Portals & EHR", img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80", link: "/services/pms" },
  { title: "Custom Software", role: "Enterprise Platforms", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80", link: "/services/saas-development" },
  { title: "Cloud Infra", role: "AWS & Azure Scaling", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80", link: "/services/cloud-services" },
  { title: "UI / UX Design", role: "Cinematic Interfaces", img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=400&q=80", link: "/services/website-design" },
  { title: "Mobile Apps", role: "iOS & Android", img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400&q=80", link: "/services/mobile-development" },
];

export default function Hero({ onOpenConsultation }: HeroProps) {
  const [bgIndex, setBgIndex] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-hero-title",
        { opacity: 0, y: 40, rotateX: -20 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.9, stagger: 0.15, ease: "power3.out" }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const trustItems = [
    "150+ Tested Strategies",
    "Full-Stack Web & Mobile",
    "AI & Generative SEO (GEO)",
    "Enterprise Cloud & CRM",
  ];

  const floatingBadges = [
    {
      name: "Google Search",
      sub: "Rank #1 Organic",
      icon: <Globe className="w-5 h-5 text-blue-400" />,
      color: "from-blue-500/20 to-blue-600/10",
      position: "top-4 -left-6 sm:-left-10",
      animation: "animate-float-slow",
    },
    {
      name: "ChatGPT AI",
      sub: "Top Citation",
      icon: <Bot className="w-5 h-5 text-cyan-400" />,
      color: "from-cyan-500/20 to-blue-600/10",
      position: "top-20 -right-6 sm:-right-10",
      animation: "animate-float-reverse",
    },
    {
      name: "AWS Cloud",
      sub: "99.99% Uptime",
      icon: <Cloud className="w-5 h-5 text-sky-400" />,
      color: "from-sky-500/20 to-indigo-600/10",
      position: "bottom-32 -left-8 sm:-left-12",
      animation: "animate-float-reverse",
    },
    {
      name: "iOS & Android",
      sub: "Mobile Apps",
      icon: <Smartphone className="w-5 h-5 text-blue-400" />,
      color: "from-indigo-500/20 to-blue-600/10",
      position: "bottom-10 -right-4 sm:-right-8",
      animation: "animate-float-slow",
    },
  ];

  return (
    <section ref={heroRef} className="relative min-h-[760px] pt-32 pb-20 overflow-hidden border-b border-white/10 [perspective:1200px]">
      {/* Ken Burns Crossfading Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-30">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={bgIndex}
            src={backgroundImages[bgIndex]}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover filter blur-[2px]"
            alt="Enterprise Technology"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-[#05070E] via-[#05070E]/90 to-transparent z-10" />
      </div>

      {/* Subtle Dark Background Canvas Overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={bgIndex}
            src={backgroundImages[bgIndex]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover filter grayscale"
            alt="Enterprise Technology"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-[#080A0F] via-[#080A0F]/95 to-[#080A0F]/80 z-10" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
          {/* Left Column Copy */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="gsap-hero-title inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium border border-white/10 bg-white/[0.03] text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>Enterprise Engineering & Digital Scale Platform</span>
            </div>

            <h1 className="gsap-hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
              Architecting Digital Growth. <br />
              <span className="text-[#22C55E]">Engineered for Modern Scale.</span>
            </h1>

            <p className="gsap-hero-title text-base sm:text-lg text-neutral-400 max-w-[600px] leading-relaxed">
              We build custom enterprise platforms, high-performance web applications, mobile products, cloud infrastructure, and automated CRM workflows.
            </p>

            <div className="gsap-hero-title flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={() => onOpenConsultation()}
                className="btn-emerald text-sm font-semibold px-6 py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Strategy Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="px-4 py-2.5 rounded-lg border border-white/10 flex items-center gap-3 bg-[#0E121B]">
                <div className="text-left">
                  <span className="block text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                    Strategy Audit
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-white">Custom Proposal</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                  COMPLIMENTARY
                </span>
              </div>
            </div>

            {/* Trust Checks */}
            <div className="gsap-hero-title grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10">
              {trustItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs sm:text-sm text-neutral-400">
                  <div className="p-1 rounded bg-white/[0.04] border border-white/10 text-[#22C55E] shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium text-neutral-300 truncate">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column — Editorial Technical Console Showcase */}
          <div className="lg:col-span-5 relative flex justify-center">
            <Card3D maxTilt={10} className="w-full max-w-[440px] aspect-[4/5] border border-white/10 p-6 flex flex-col justify-between overflow-hidden bg-[#0E121B] rounded-xl shadow-xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
                </div>
                <span className="text-xs font-mono text-neutral-400">SKORA CORE OS • v5.5</span>
              </div>

              <div className="my-auto space-y-4">
                <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>Performance Efficiency Rate</span>
                    <span className="text-[#22C55E] font-mono font-semibold">+342.8%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#22C55E] w-[88%] rounded-full"></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/10">
                    <BarChart3 className="w-4 h-4 text-[#22C55E] mb-1" />
                    <span className="text-[11px] text-neutral-400 block">Lead Conversion</span>
                    <span className="text-base font-bold text-white">4.85x</span>
                  </div>
                  <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/10">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
                    <span className="text-[11px] text-neutral-400 block">Cloud Uptime</span>
                    <span className="text-base font-bold text-white">99.99%</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#22C55E]">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white block">Automated Infrastructure</span>
                      <span className="text-[10px] text-neutral-400">Real-time pipeline sync</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] font-mono font-semibold border border-[#22C55E]/20">Active</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
                <span>Enterprise Stack Architecture</span>
                <span className="text-neutral-200 font-medium hover:text-[#22C55E] cursor-pointer transition-colors" onClick={() => onOpenConsultation()}>View Architecture →</span>
              </div>
            </Card3D>
          </div>
        </div>

        {/* PROFILE CARDS ROW */}
        <div className="mt-16 w-full overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-stretch justify-center gap-3 px-2 lg:min-w-0 lg:flex-wrap">
            {profileCards.map((card, index) => (
              <a href={card.link} key={card.title}>
                <motion.article
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.06 }}
                  whileHover={{ y: -4 }}
                  className="w-[174px] overflow-hidden rounded-lg border border-white/10 bg-[#0E121B] p-2 text-left transition hover:border-white/25"
                >
                  <div className="h-24 overflow-hidden rounded-md">
                    <img
                      src={card.img}
                      alt={card.title}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105 filter grayscale-[30%]"
                    />
                  </div>
                  <div className="px-1 pb-1 pt-2.5">
                    <h2 className="text-xs font-bold text-white">{card.title}</h2>
                    <p className="mt-0.5 text-[11px] font-medium text-neutral-400">{card.role}</p>
                  </div>
                </motion.article>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
