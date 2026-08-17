"use client";

import React, { useState } from "react";
import { Calculator, ArrowRight, Check, Sparkles, TrendingUp } from "lucide-react";
import Card3D from "./Card3D";

interface ProjectCalculatorProps {
  onOpenConsultation: (details?: string) => void;
}

export default function ProjectCalculator({ onOpenConsultation }: ProjectCalculatorProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([
    "digital-marketing",
    "website-design",
  ]);
  const [projectScale, setProjectScale] = useState<"startup" | "growth" | "enterprise">("growth");
  const [timeline, setTimeline] = useState<"fast" | "standard" | "extended">("standard");

  const servicesList = [
    { id: "digital-marketing", name: "Digital Marketing & AI SEO", basePrice: 1500 },
    { id: "website-design", name: "Website Design & Web App", basePrice: 2500 },
    { id: "mobile-dev", name: "Mobile Development (iOS/Android)", basePrice: 3500 },
    { id: "cloud-devops", name: "Cloud Infrastructure & DevOps", basePrice: 2000 },
    { id: "saas-dev", name: "SaaS Multi-Tenant Platform", basePrice: 4000 },
    { id: "pms-system", name: "Custom Project Management (PMS)", basePrice: 2800 },
    { id: "crm-system", name: "Customer Relationship (CRM)", basePrice: 2600 },
  ];

  const toggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== id));
      }
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const rawBaseSum = servicesList
    .filter((s) => selectedServices.includes(s.id))
    .reduce((acc, curr) => acc + curr.basePrice, 0);

  const scaleMultiplier = projectScale === "startup" ? 0.8 : projectScale === "growth" ? 1.0 : 1.6;
  const timelineMultiplier = timeline === "fast" ? 1.2 : timeline === "standard" ? 1.0 : 0.9;

  const estimatedCost = Math.round(rawBaseSum * scaleMultiplier * timelineMultiplier);
  const estimatedROI = (2.5 + selectedServices.length * 0.4).toFixed(1);
  const estimatedTrafficBoost = `${120 + selectedServices.length * 45}%`;

  const handleBookEstimate = () => {
    const summary = `Selected Services: ${selectedServices.join(", ")}, Scale: ${projectScale}, Estimated Budget: $${estimatedCost.toLocaleString()}`;
    onOpenConsultation(summary);
  };

  return (
    <section id="estimator" className="py-28 relative bg-[#080A0F] border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-white/10 bg-white/[0.03] text-neutral-300">
            <Calculator className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>PROJECT CALCULATOR</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Calculate Your Custom <span className="text-[#22C55E]">Project & Growth Plan</span>
          </h2>

          <p className="text-base sm:text-lg text-neutral-400 font-normal">
            Select your required tech & marketing modules to estimate project investment and expected ROI returns.
          </p>
        </div>

        {/* Interactive Estimator Card */}
        <Card3D maxTilt={6} className="rounded-xl p-6 sm:p-10 border border-white/10 bg-[#0E121B]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Options Selector (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#22C55E] text-[#050805] flex items-center justify-center text-xs font-bold">1</span>
                  Select Required Services
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {servicesList.map((service) => {
                    const isSelected = selectedServices.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        onClick={() => toggleService(service.id)}
                        className={`p-3 rounded-lg border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#22C55E]/10 border-[#22C55E] text-white"
                            : "bg-white/[0.02] border-white/10 text-neutral-400 hover:border-white/20"
                        }`}
                      >
                        <span className="text-xs font-medium truncate pr-2">{service.name}</span>
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                            isSelected
                              ? "bg-[#22C55E] border-[#22C55E] text-[#050805]"
                              : "border-white/20"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#22C55E] text-[#050805] flex items-center justify-center text-xs font-bold">2</span>
                  Select Business Scale
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "startup", title: "Startup / SME", sub: "Core MVP & Launch" },
                    { id: "growth", title: "Growth Brand", sub: "Scale & Optimize" },
                    { id: "enterprise", title: "Enterprise", sub: "Dedicated Team & SLA" },
                  ].map((scale) => (
                    <button
                      key={scale.id}
                      onClick={() => setProjectScale(scale.id as any)}
                      className={`p-3 rounded-lg border text-center transition-all cursor-pointer ${
                        projectScale === scale.id
                          ? "bg-[#22C55E]/10 border-[#22C55E] text-white"
                          : "bg-white/[0.02] border-white/10 text-neutral-400 hover:border-white/20"
                      }`}
                    >
                      <span className="text-xs font-bold block text-white">{scale.title}</span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5 font-normal">{scale.sub}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Result Dashboard (5 Cols) */}
            <div className="lg:col-span-5 rounded-lg bg-[#080A0F] border border-white/10 p-6 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <span className="text-xs font-mono text-neutral-400">ESTIMATION SUMMARY</span>
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                    {selectedServices.length} Modules Active
                  </span>
                </div>

                <div>
                  <span className="text-xs font-normal text-neutral-400 block mb-1">
                    Estimated Project Investment Range
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-white">
                      ${estimatedCost.toLocaleString()}
                    </span>
                    <span className="text-xs text-neutral-400">/ estimate</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1 font-normal">
                      <TrendingUp className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>Est. ROI Impact</span>
                    </div>
                    <span className="text-xl font-bold text-white">{estimatedROI}x</span>
                  </div>

                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1 font-normal">
                      <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>Traffic Boost</span>
                    </div>
                    <span className="text-xl font-bold text-[#22C55E]">{estimatedTrafficBoost}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/10 text-xs text-neutral-400 space-y-1 font-normal">
                  <div className="flex justify-between">
                    <span>Guaranteed SLA:</span>
                    <span className="text-white font-medium">99.99% Cloud Uptime</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Includes:</span>
                    <span className="text-white font-medium">Full IP Ownership & Support</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookEstimate}
                className="w-full btn-emerald justify-center py-3.5 rounded-lg text-sm cursor-pointer"
              >
                <span>Lock In Estimate & Strategy Session</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card3D>
      </div>
    </section>
  );
}
