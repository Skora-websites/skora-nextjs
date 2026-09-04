"use client";

import React, { useEffect, useRef } from "react";
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
    iconClass: "border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.25)]",
  },
  {
    link: "/services/cloud-services",
    Icon: Cloud,
    title: "Cloud Architecture",
    badge: "AWS & Azure",
    description: "Secure AWS & Azure deployments, automated CI/CD pipelines, database migrations, and 99.99% uptime infrastructure.",
    iconClass: "border border-indigo-400/40 bg-indigo-500/10 text-indigo-300 shadow-[0_0_18px_rgba(129,140,248,0.25)]",
  },
  {
    link: "/services/website-design",
    Icon: LayoutTemplate,
    title: "Cinematic UI / UX",
    badge: "High Conversion",
    description: "Premium digital design, visual identity precision, glassmorphism UI components, and fluid web experiences.",
    iconClass: "border border-purple-400/40 bg-purple-500/10 text-purple-300 shadow-[0_0_18px_rgba(192,132,252,0.25)]",
  },
  {
    link: "/services/mobile-development",
    Icon: Smartphone,
    title: "Mobile Applications",
    badge: "iOS & Android",
    description: "High-performance cross-platform mobile apps engineered for speed using Swift, Kotlin, and React Native.",
    iconClass: "border border-sky-400/40 bg-sky-500/10 text-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.25)]",
  },
];

export default function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-cap-card",
        { opacity: 0, y: 40, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: "power2.out" }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="capabilities" className="relative border-t border-white/10 bg-[#05070E]/60 py-24 [perspective:1200px]">
      {/* Ambient halo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-radial-halo-subtle absolute -top-32 right-0 h-[30rem] w-[46rem] rounded-full blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 max-w-2xl text-left">
          <div className="glass-pill mb-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono-accent text-xs font-bold uppercase tracking-wider">
            <Zap size={14} className="text-sky-300" />
            <span>MNC ENTERPRISE CAPABILITIES</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            What We Build at <span className="text-gradient-cyan">Skora</span>
          </h2>
          <p className="mt-3 text-base font-medium leading-relaxed text-slate-400 sm:text-lg">
            Empowering global institutions with battle-tested enterprise platforms, cloud infrastructure, and specialized healthcare solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Big Featured Left Card */}
          <a href="/services/saas-development" className="gsap-cap-card lg:row-span-2 block">
            <Card3D
              maxTilt={10}
              className="glass-card neon-border group relative h-full overflow-hidden rounded-3xl p-8 shadow-md transition duration-500 sm:p-10"
            >
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-2xl transition duration-700 group-hover:scale-150" />
              <div className="relative flex h-full flex-col justify-between [transform-style:preserve-3d]">
                <div>
                  <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500/10 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.3)] [transform:translateZ(40px)]">
                    <Code size={28} />
                  </div>
                  <span className="mb-2 block font-mono-accent text-xs font-bold uppercase tracking-widest text-sky-400 [transform:translateZ(25px)]">
                    FEATURED DIVISION
                  </span>
                  <h3 className="text-3xl font-extrabold tracking-tight text-white [transform:translateZ(35px)]">
                    Custom Enterprise Platforms
                  </h3>
                  <p className="mt-4 text-base font-medium leading-relaxed text-slate-400 [transform:translateZ(20px)]">
                    We engineer scalable web applications, SaaS multi-tenant platforms, and multi-user systems tailored to high-volume operational workflows.
                  </p>

                  <div className="mt-8 space-y-3 [transform:translateZ(25px)]">
                    {["Multi-Tenant Systems", "Automated Stripe Billing", "Role-Based Access Controls"].map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                        <CheckCircle2 size={16} className="text-sky-400" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-6 font-bold text-sky-300 [transform:translateZ(30px)]">
                  <span>Explore Enterprise Solutions</span>
                  <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Card3D>
          </a>

          {/* 4 Cards Grid */}
          {cards.map(({ link, Icon, title, badge, description, iconClass }) => (
            <a key={title} href={link} className="gsap-cap-card block">
              <Card3D
                maxTilt={10}
                className="glass-card glass-card-hover neon-border group relative h-full overflow-hidden rounded-3xl p-7"
              >
                <div className="[transform-style:preserve-3d]">
                  <div className="mb-6 flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass} [transform:translateZ(30px)]`}>
                      <Icon size={24} />
                    </div>
                    <span className="glass-pill rounded-full px-3 py-1 font-mono-accent text-xs font-bold [transform:translateZ(20px)]">
                      {badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white transition-colors group-hover:text-sky-300 [transform:translateZ(25px)]">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-slate-400 [transform:translateZ(15px)]">
                    {description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-sky-300 [transform:translateZ(20px)]">
                    <span>Learn More</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
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
