"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  Layout,
  Smartphone,
  Cloud,
  Layers,
  Kanban,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Code2,
} from "lucide-react";
import Card3D from "./Card3D";
import gsap from "gsap";

export interface ServiceDetail {
  id: string;
  title: string;
  category: "marketing" | "web_mobile" | "cloud_saas" | "enterprise";
  tagline: string;
  icon: React.ReactNode;
  description: string;
  features: string[];
  techStack: string[];
  metrics: string;
  color: string;
}

interface ServicesGridProps {
  onSelectService: (service: ServiceDetail) => void;
  onOpenConsultation: (serviceTitle?: string) => void;
}

export const SERVICES_DATA: ServiceDetail[] = [
  {
    id: "digital-marketing",
    title: "Digital Marketing & AI SEO",
    category: "marketing",
    tagline: "Organic Dominance & Generative Engine Optimization (GEO)",
    icon: <TrendingUp className="w-6 h-6 text-blue-400" />,
    description:
      "150+ proven SEO and AI SEO strategies helping your brand rank #1 on Google & Bing while getting cited inside ChatGPT, Gemini, Perplexity, and Copilot.",
    features: [
      "Generative Engine Optimization (GEO)",
      "Technical & Schema Markup SEO",
      "High-Intent Content Strategy",
      "Precision PPC & Performance Ads",
    ],
    techStack: ["ChatGPT API", "Google Search Console", "Ahrefs", "Semrush", "Perplexity AI"],
    metrics: "+340% Organic Traffic",
    color: "from-blue-500/20 to-cyan-500/10",
  },
  {
    id: "website-design",
    title: "Website Design & Web Apps",
    category: "web_mobile",
    tagline: "High-Converting UI/UX & High-Performance Frontends",
    icon: <Layout className="w-6 h-6 text-cyan-400" />,
    description:
      "Bespoke, lightning-fast website designs and Next.js / React web applications built with dark cyber aesthetics, glassmorphism, and seamless conversion flows.",
    features: [
      "Custom Next.js & React Architectures",
      "Glassmorphism & Cyberpunk Design",
      "Core Web Vitals 99+ Speed Tuning",
      "Interactive Micro-Animations",
    ],
    techStack: ["Next.js 16", "React 19", "Tailwind CSS", "TypeScript", "GSAP"],
    metrics: "99/100 PageSpeed Score",
    color: "from-cyan-500/20 to-blue-500/10",
  },
  {
    id: "mobile-development",
    title: "Mobile Development",
    category: "web_mobile",
    tagline: "Native iOS & Android + Cross-Platform Apps",
    icon: <Smartphone className="w-6 h-6 text-sky-400" />,
    description:
      "Scalable mobile application development engineered for fluid performance, offline support, push notifications, and App Store Optimization (ASO).",
    features: [
      "iOS (Swift) & Android (Kotlin)",
      "React Native & Flutter Cross-Platform",
      "Biometric Authentication & Security",
      "App Store Optimization (ASO)",
    ],
    techStack: ["React Native", "Flutter", "Swift", "Kotlin", "Firebase"],
    metrics: "4.9★ Store Rating",
    color: "from-sky-500/20 to-indigo-500/10",
  },
  {
    id: "cloud-services",
    title: "Cloud Services & DevOps",
    category: "cloud_saas",
    tagline: "AWS, Azure & GCP Scalable Infrastructure",
    icon: <Cloud className="w-6 h-6 text-indigo-400" />,
    description:
      "Enterprise cloud infrastructure, CI/CD pipeline automation, serverless microservices, zero-trust security compliance, and 99.99% uptime SLA.",
    features: [
      "AWS / GCP Infrastructure as Code",
      "Docker & Kubernetes Containerization",
      "Automated CI/CD Deployment Pipelines",
      "Zero-Trust Cloud Security & Audits",
    ],
    techStack: ["AWS", "Google Cloud", "Docker", "Kubernetes", "Terraform"],
    metrics: "99.99% Guaranteed Uptime",
    color: "from-indigo-500/20 to-purple-500/10",
  },
  {
    id: "saas-development",
    title: "SaaS Platform Development",
    category: "cloud_saas",
    tagline: "Multi-Tenant Cloud Software Solutions",
    icon: <Layers className="w-6 h-6 text-purple-400" />,
    description:
      "End-to-end multi-tenant SaaS engineering with automated Stripe recurring billing, role-based access control (RBAC), and robust public REST/GraphQL APIs.",
    features: [
      "Multi-Tenant Database Architecture",
      "Automated Stripe & PayPal Billing",
      "Role-Based Access Control (RBAC)",
      "Developer API & Webhooks Engine",
    ],
    techStack: ["Next.js", "Node.js", "PostgreSQL", "Stripe", "GraphQL"],
    metrics: "Sub-50ms API Latency",
    color: "from-purple-500/20 to-blue-500/10",
  },
  {
    id: "pms",
    title: "Project Management System (PMS)",
    category: "enterprise",
    tagline: "Agile Sprints, Workflows & Resource Tracker",
    icon: <Kanban className="w-6 h-6 text-emerald-400" />,
    description:
      "Custom PMS built to streamline team collaboration, sprint boards, automated task routing, time tracking, resource allocation, and white-label client portals.",
    features: [
      "Custom Kanban & Gantt Roadmaps",
      "Client Portal & Feedback Tools",
      "Automated Task & Time Tracking",
      "Resource Capacity Planning",
    ],
    techStack: ["React", "WebSockets", "Node.js", "Redis", "Tailwind"],
    metrics: "+45% Team Productivity",
    color: "from-emerald-500/20 to-teal-500/10",
  },
  {
    id: "crm",
    title: "CRM (Customer Relationship)",
    category: "enterprise",
    tagline: "Lead Automation, Sales Pipelines & Analytics",
    icon: <Users className="w-6 h-6 text-amber-400" />,
    description:
      "Omnichannel Customer Relationship Management system integrating lead scoring, automated email/SMS follow-ups, deal tracking, and predictive sales analytics.",
    features: [
      "Automated Sales Pipeline Stages",
      "Omnichannel Lead Capture",
      "AI Predictive Lead Scoring",
      "Custom Analytics & Reports",
    ],
    techStack: ["Node.js", "PostgreSQL", "Twilio", "SendGrid", "Chart.js"],
    metrics: "3.2x Lead Conversion",
    color: "from-amber-500/20 to-orange-500/10",
  },
];

export default function ServicesGrid({
  onSelectService,
  onOpenConsultation,
}: ServicesGridProps) {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const gridRef = useRef<HTMLDivElement>(null);

  const filterTabs = [
    { id: "all", label: "All 7 Core Services" },
    { id: "marketing", label: "Digital Marketing" },
    { id: "web_mobile", label: "Web & Mobile" },
    { id: "cloud_saas", label: "Cloud & SaaS" },
    { id: "enterprise", label: "PMS & CRM Enterprise" },
  ];

  const filteredServices =
    activeFilter === "all"
      ? SERVICES_DATA
      : SERVICES_DATA.filter((s) => s.category === activeFilter);

  useEffect(() => {
    if (!gridRef.current) return;
    gsap.fromTo(
      ".gsap-service-card",
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }
    );
  }, [activeFilter]);

  return (
    <section id="services" className="py-28 relative bg-[#080A0F]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-white/10 bg-white/[0.03] text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>ENTERPRISE CAPABILITIES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Our 7 Core <span className="text-[#22C55E]">Tech & Marketing Services</span>
          </h2>

          <p className="text-base sm:text-lg text-neutral-400 leading-relaxed font-normal">
            From search dominance and mobile apps to scalable cloud architecture and custom PMS & CRM solutions.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2.5 mb-14">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 border cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-[#22C55E] text-[#050805] border-[#22C55E]"
                  : "bg-[#0E121B] text-neutral-300 border-white/10 hover:text-white hover:border-white/20"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Services Cards Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card3D
              key={service.id}
              maxTilt={8}
              className="gsap-service-card rounded-xl border border-white/10 bg-[#0E121B] group relative overflow-hidden h-full transition hover:border-white/25"
            >
              <div className="p-7 flex flex-col justify-between h-full">
                <div className="relative z-10 space-y-5">
                  {/* Header Icon + Metric Badge */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-[#22C55E]">
                      {service.icon}
                    </div>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                      {service.metrics}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#22C55E] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-xs font-medium text-neutral-400 mt-1">
                      {service.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-400 leading-relaxed line-clamp-3 font-normal">
                    {service.description}
                  </p>

                  {/* Checklist Features */}
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {service.techStack.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.03] border border-white/10 text-neutral-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => onSelectService(service)}
                    className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Specs</span>
                    <Code2 className="w-3.5 h-3.5 text-[#22C55E]" />
                  </button>

                  <button
                    onClick={() => onOpenConsultation(service.title)}
                    className="px-3.5 py-1.5 rounded-md text-xs font-semibold bg-[#22C55E]/10 hover:bg-[#22C55E] text-[#22C55E] hover:text-[#050805] border border-[#22C55E]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Book Service</span>
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
