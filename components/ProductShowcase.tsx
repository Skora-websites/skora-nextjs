"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Cloud,
  Kanban,
  Users,
  Activity,
} from "lucide-react";
import Card3D from "./Card3D";

export default function ProductShowcase({
  onOpenConsultation,
}: {
  onOpenConsultation: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"marketing" | "cloud" | "pms" | "crm">("marketing");

  const checklist = [
    "Rank higher on Google, Bing & Generative AI Engines",
    "Get cited in ChatGPT, Gemini, Perplexity & Copilot",
    "Build high-converting Web, Mobile & SaaS solutions",
    "Streamline teams & client pipelines with integrated PMS & CRM",
  ];

  return (
    <section id="showcase" className="py-28 relative bg-[#080A0F] border-t border-white/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column — 3D Dashboard Mockup Presentation */}
          <div className="lg:col-span-7">
            <Card3D maxTilt={6} className="relative rounded-xl border border-white/10 bg-[#0E121B] overflow-hidden">
              {/* Top Window Bar */}
              <div className="bg-[#080A0F] px-6 py-3.5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-neutral-700"></div>
                </div>
                <span className="text-xs font-mono text-neutral-400">
                  https://dashboard.skora.digital/{activeTab}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-[#22C55E] font-mono font-semibold">
                  <Activity className="w-3.5 h-3.5" />
                  <span>LIVE OS</span>
                </div>
              </div>

              {/* Dashboard Tab Bar Switcher */}
              <div className="bg-[#080A0F]/80 px-4 py-2 border-b border-white/10 flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("marketing")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "marketing"
                      ? "bg-[#22C55E] text-[#050805]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>AI SEO & Marketing</span>
                </button>
                <button
                  onClick={() => setActiveTab("cloud")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "cloud"
                      ? "bg-[#22C55E] text-[#050805]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  <span>Cloud & DevOps</span>
                </button>
                <button
                  onClick={() => setActiveTab("pms")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "pms"
                      ? "bg-[#22C55E] text-[#050805]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>PMS Sprint Tracker</span>
                </button>
                <button
                  onClick={() => setActiveTab("crm")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === "crm"
                      ? "bg-[#22C55E] text-[#050805]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>CRM Lead Pipeline</span>
                </button>
              </div>

              {/* Dashboard Tab Contents */}
              <div className="p-6 space-y-6">
                {activeTab === "marketing" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                        <span className="text-[11px] text-neutral-400 block font-medium">Organic Traffic</span>
                        <span className="text-xl font-extrabold text-white">142.8k/mo</span>
                        <span className="text-xs text-[#22C55E] block mt-1">+48.2% vs last month</span>
                      </div>
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                        <span className="text-[11px] text-neutral-400 block font-medium">AI Generative Citations</span>
                        <span className="text-xl font-extrabold text-white">18.4k</span>
                        <span className="text-xs text-neutral-300 block mt-1">ChatGPT & Gemini</span>
                      </div>
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                        <span className="text-[11px] text-neutral-400 block font-medium">Avg GEO Rank</span>
                        <span className="text-xl font-extrabold text-white">#1.4 Top</span>
                        <span className="text-xs text-neutral-300 block mt-1">High Intent Snippets</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10 space-y-2">
                      <div className="flex justify-between text-xs text-neutral-300 font-medium">
                        <span>Generative Engine Citation Share</span>
                        <span className="text-[#22C55E] font-mono">88% Dominance</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
                        <div className="h-full bg-[#22C55E] w-[60%]" title="ChatGPT"></div>
                        <div className="h-full bg-emerald-700 w-[25%]" title="Gemini"></div>
                        <div className="h-full bg-neutral-600 w-[15%]" title="Perplexity"></div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "cloud" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                        <span className="text-[11px] text-neutral-400 block font-medium">AWS Cluster Health</span>
                        <span className="text-xl font-extrabold text-[#22C55E]">Optimal</span>
                        <span className="text-xs text-neutral-400 block mt-1">12 Microservices Active</span>
                      </div>
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                        <span className="text-[11px] text-neutral-400 block font-medium">Container Uptime</span>
                        <span className="text-xl font-extrabold text-white">99.99%</span>
                        <span className="text-xs text-neutral-300 block mt-1">Zero Downtime Deploy</span>
                      </div>
                      <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                        <span className="text-[11px] text-neutral-400 block font-medium">API Latency</span>
                        <span className="text-xl font-extrabold text-white">34ms</span>
                        <span className="text-xs text-neutral-300 block mt-1">Global CDN Edge</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "pms" && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                        <span className="text-xs font-semibold text-white">Sprint #24: Mobile App Swift UI Refactor</span>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] font-mono border border-[#22C55E]/20">100% Done</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                        <span className="text-xs font-semibold text-white">Sprint #25: AI GEO Keyword Scraper API</span>
                      </div>
                      <span className="text-xs px-2.5 py-0.5 rounded bg-white/[0.04] text-neutral-300 font-mono border border-white/10">In Progress</span>
                    </div>
                  </div>
                )}

                {activeTab === "crm" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10 text-center">
                        <span className="text-[10px] text-neutral-400 block">New Inquiries</span>
                        <span className="text-lg font-bold text-white">412</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10 text-center">
                        <span className="text-[10px] text-neutral-400 block">Qualified</span>
                        <span className="text-lg font-bold text-white">284</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10 text-center">
                        <span className="text-[10px] text-neutral-400 block">Proposals</span>
                        <span className="text-lg font-bold text-white">98</span>
                      </div>
                      <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10 text-center">
                        <span className="text-[10px] text-neutral-400 block">Won Revenue</span>
                        <span className="text-lg font-bold text-[#22C55E]">$340k</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card3D>
          </div>

          {/* Right Column — Value Proposition Copy */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold border border-white/10 bg-white/[0.03] text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
              <span>SKORA UNIFIED OS</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Your Playbook for <br />
              <span className="text-[#22C55E]">SEO & Enterprise Scale</span>
            </h2>

            <p className="text-base text-neutral-400 leading-relaxed font-normal">
              Gain instant access to our unified platform and strategic blueprints. Seamlessly integrate digital marketing campaigns with high-performing Web/Mobile builds, resilient Cloud infrastructure, and custom PMS/CRM pipelines.
            </p>

            <div className="space-y-3.5 pt-2">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-neutral-200">
                  <div className="w-5 h-5 rounded bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-[#22C55E]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <button
                onClick={onOpenConsultation}
                className="btn-emerald text-sm font-semibold px-6 py-3 rounded-lg flex items-center gap-2 cursor-pointer"
              >
                <span>Explore All Strategies</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
