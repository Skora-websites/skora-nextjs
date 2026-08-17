"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Code, Activity, Cloud, LayoutTemplate, Smartphone, ArrowRight, CheckCircle2, Zap } from "lucide-react";
import Card3D from "./Card3D";
import gsap from "gsap";

const cards = [
  {
    link: "/services/pms",
    Icon: Activity,
    title: "Healthcare IT Portals",
    badge: "HIPAA EHR",
    description: "HIPAA-compliant clinic systems, patient management portals, telemedicine tools, and secure EHR integrations.",
  },
  {
    link: "/services/cloud-services",
    Icon: Cloud,
    title: "Cloud Architecture",
    badge: "AWS & Azure",
    description: "Secure AWS & Azure deployments, automated CI/CD pipelines, database migrations, and 99.99% uptime infrastructure.",
  },
  {
    link: "/services/website-design",
    Icon: LayoutTemplate,
    title: "Cinematic UI / UX",
    badge: "High Conversion",
    description: "Premium digital design, visual identity precision, responsive UI components, and fluid web experiences.",
  },
  {
    link: "/services/mobile-development",
    Icon: Smartphone,
    title: "Mobile Applications",
    badge: "iOS & Android",
    description: "High-performance cross-platform mobile apps engineered for speed using Swift, Kotlin, and React Native.",
  },
];

export default function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-cap-card",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power2.out" }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="capabilities" className="bg-[#080A0F] py-28 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-mono font-semibold uppercase tracking-wider mb-4 border border-white/10 bg-white/[0.03] text-neutral-400">
            <Zap size={13} className="text-[#22C55E]" />
            <span>ENTERPRISE CAPABILITIES</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            What We Build at <span className="text-[#22C55E]">Skora</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-400 font-normal leading-relaxed">
            Empowering global institutions with battle-tested enterprise platforms, cloud infrastructure, and specialized healthcare solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Big Featured Left Card */}
          <a href="/services/saas-development" className="gsap-cap-card lg:row-span-2 block">
            <Card3D
              maxTilt={8}
              className="group relative h-full overflow-hidden rounded-xl border border-white/10 bg-[#0E121B] p-8 sm:p-10 transition duration-300 hover:border-white/25"
            >
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <div className="mb-8 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/[0.04] text-[#22C55E] border border-white/10">
                    <Code size={24} />
                  </div>
                  <span className="block text-xs font-mono font-semibold text-[#22C55E] uppercase tracking-widest mb-2">
                    FEATURED DIVISION
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Custom Enterprise Platforms
                  </h3>
                  <p className="mt-4 text-base leading-relaxed text-neutral-400 font-normal">
                    We engineer scalable web applications, SaaS multi-tenant platforms, and multi-user systems tailored to high-volume operational workflows.
                  </p>

                  <div className="mt-8 space-y-3">
                    {["Multi-Tenant Systems", "Automated Stripe Billing", "Role-Based Access Controls"].map((feat, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm font-medium text-neutral-300">
                        <CheckCircle2 size={15} className="text-[#22C55E]" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-white/10 flex items-center justify-between font-semibold text-white group-hover:text-[#22C55E] transition-colors">
                  <span>Explore Enterprise Solutions</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </Card3D>
          </a>

          {/* 4 Cards Grid */}
          {cards.map(({ link, Icon, title, badge, description }) => (
            <a key={title} href={link} className="gsap-cap-card block">
              <Card3D
                maxTilt={8}
                className="group relative h-full overflow-hidden rounded-xl border border-white/10 bg-[#0E121B] p-7 transition duration-300 hover:border-white/25"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/[0.04] text-[#22C55E] border border-white/10">
                      <Icon size={20} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-medium bg-white/[0.03] text-neutral-300 border border-white/10">
                      {badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#22C55E] transition-colors">
                    {title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-neutral-400 font-normal">
                    {description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-neutral-300 group-hover:text-[#22C55E] transition-colors">
                    <span>Learn More</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Card3D>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
