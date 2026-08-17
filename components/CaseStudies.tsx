"use client";

import React from "react";
import { Sparkles, ArrowRight, TrendingUp, Cpu, Smartphone } from "lucide-react";
import Card3D from "./Card3D";

interface CaseStudiesProps {
  onOpenConsultation: (topic?: string) => void;
}

export default function CaseStudies({ onOpenConsultation }: CaseStudiesProps) {
  const caseStudies = [
    {
      client: "FinTech Scaleup",
      title: "Generative Engine SEO & ChatGPT Citation Dominance",
      service: "Digital Marketing & AI SEO",
      metrics: "+340% Traffic",
      highlight: "#1 Cited Brand in ChatGPT & Perplexity",
      description: "Implemented schema markup, entity-based AI SEO, and high-intent topical authority clusters to capture 18,000+ generative AI search citations.",
      icon: <TrendingUp className="w-5 h-5 text-[#22C55E]" />,
    },
    {
      client: "Global E-Commerce SaaS",
      title: "Next.js Web Redesign & Cloud Microservices Migration",
      service: "Website Design & Cloud Services",
      metrics: "99/100 Speed",
      highlight: "3.8x Sales Conversion Boost",
      description: "Re-engineered frontend with Next.js App Router and containerized microservices on AWS, achieving sub-100ms load times globally.",
      icon: <Cpu className="w-5 h-5 text-[#22C55E]" />,
    },
    {
      client: "Logistics Enterprise",
      title: "Cross-Platform Mobile App, PMS & Custom CRM Engine",
      service: "Mobile Dev, PMS & CRM",
      metrics: "+45% Efficiency",
      highlight: "$1.2M New Annual Revenue Pipeline",
      description: "Deployed Swift/Kotlin mobile apps with real-time WebSocket PMS sprint trackers and an automated CRM sales pipeline.",
      icon: <Smartphone className="w-5 h-5 text-[#22C55E]" />,
    },
  ];

  return (
    <section id="case-studies" className="py-28 relative bg-[#080A0F] border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-white/10 bg-white/[0.03] text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>ENTERPRISE CASE STUDIES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Real Transformations, <span className="text-[#22C55E]">Measurable Impact</span>
          </h2>

          <p className="text-base sm:text-lg text-neutral-400 font-normal">
            Discover how SKORA delivers market dominance through AI SEO, web applications, cloud scale, and custom enterprise tools.
          </p>
        </div>

        {/* 3D Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {caseStudies.map((study, idx) => (
            <Card3D
              key={idx}
              maxTilt={8}
              className="rounded-xl border border-white/10 bg-[#0E121B] group h-full transition hover:border-white/25"
            >
              <div className="p-7 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider">
                      {study.client}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                      {study.metrics}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-[#22C55E] transition-colors leading-snug">
                    {study.title}
                  </h3>

                  <p className="text-xs text-[#22C55E] font-medium">
                    ✦ {study.highlight}
                  </p>

                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">
                    {study.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400">{study.service}</span>
                  <button
                    onClick={() => onOpenConsultation(study.title)}
                    className="text-xs font-semibold text-neutral-300 hover:text-[#22C55E] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Read Blueprint</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Card3D>
          ))}
        </div>
      </div>
    </section>
  );
}
