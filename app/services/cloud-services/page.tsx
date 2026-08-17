"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import Card3D from "@/components/Card3D";
import { Cloud, ArrowRight, Check, Activity } from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function CloudServicesPage() {
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const capabilities = [
    {
      title: "AWS & Azure Infrastructure Migration",
      desc: "Zero-downtime migration of legacy servers to auto-scaling AWS EC2, ECS, and Azure Kubernetes clusters.",
      metrics: "99.99% Uptime",
    },
    {
      title: "Automated CI/CD Deployment Pipelines",
      desc: "Continuous integration via GitHub Actions, Docker containers, and Terraform Infrastructure-as-Code.",
      metrics: "Instant Deploy",
    },
    {
      title: "Disaster Recovery & Data Redundancy",
      desc: "Automated multi-region database replication, daily snapshot backups, and point-in-time recovery protocols.",
      metrics: "Zero Data Loss",
    },
    {
      title: "Cloud Security & SOC2 Compliance",
      desc: "Vulnerability scanning, IAM role permission hardening, Web Application Firewall (WAF), and DDoS protection.",
      metrics: "Enterprise Shield",
    },
  ];

  const deliverables = [
    "AWS / Azure Infrastructure Architecture Blueprint",
    "Docker Containerization & Kubernetes Cluster Setup",
    "Automated CI/CD Deployment Pipeline Configuration",
    "WAF, SSL & Cloudflare Enterprise DDoS Protection",
    "24/7 Server Health Monitoring & Alert Trigger System",
    "Monthly Cloud Cost Optimization & Audit Report",
  ];

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();
      gsap.utils.toArray<HTMLElement>(".gsap-scroll-card").forEach((card) => {
        gsap.fromTo(
          card,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
            },
          }
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <main ref={containerRef} className="min-h-screen bg-[#F4F6F1] text-[#0B1310] font-sans relative overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setConsultationModalOpen(true)} />

      {/* Hero Header */}
      <section className="pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-[#E1E6DF] bg-white text-slate-800 shadow-sm">
            <Activity className="w-4 h-4 text-[#22C55E]" />
            <span>CLOUD SERVICES & DEVOPS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0B1310] tracking-tight leading-[1.02] uppercase">
            SCALABLE CLOUD INFRASTRUCTURE &amp; <br />
            <span className="text-[#22C55E]">99.99% UPTIME DEVOPS</span>
          </h1>

          <p className="text-lg text-slate-600 font-normal leading-relaxed">
            AWS/Azure migrations, automated CI/CD pipelines, container orchestration, and 24/7 infrastructure monitoring for high-growth digital platforms.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setConsultationModalOpen(true)}
              className="btn-emerald text-sm font-semibold px-8 py-3.5 rounded-lg cursor-pointer flex items-center gap-2"
            >
              <span>Schedule Cloud Audit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Feature Gallery Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-16 rounded-xl overflow-hidden border border-[#E1E6DF] bg-white group cursor-pointer shadow-lg"
        >
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80"
            alt="Cloud Services Studio"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80";
            }}
            className="w-full h-[400px] sm:h-[500px] object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </motion.div>
      </section>

      {/* Capabilities Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E6DF]">
        <div className="text-left mb-12 space-y-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#22C55E]">
            Cloud Infrastructure /
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0B1310] uppercase">
            CLOUD CAPABILITIES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {capabilities.map((cap, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="gsap-scroll-card"
            >
              <Card3D maxTilt={6} className="p-8 rounded-xl bg-white border border-[#E1E6DF] space-y-4 h-full shadow-md">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] text-xs font-mono font-bold border border-[#22C55E]/20">
                    {cap.metrics}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0B1310]">{cap.title}</h3>
                <p className="text-sm text-slate-600 font-normal leading-relaxed">{cap.desc}</p>
              </Card3D>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E6DF]">
        <div className="text-left mb-16 space-y-1">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#22C55E]">
            Deliverables /
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase text-[#0B1310]">
            CLOUD DELIVERABLES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deliverables.map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="gsap-scroll-card p-6 rounded-xl bg-white border border-[#E1E6DF] flex items-start gap-4 shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0 mt-0.5 border border-[#22C55E]/20">
                <Check size={14} />
              </div>
              <p className="text-sm font-medium text-slate-700 leading-snug">{item}</p>
            </motion.div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="mt-20 relative rounded-xl overflow-hidden bg-white p-10 sm:p-16 text-center text-[#0B1310] border border-[#E1E6DF] shadow-lg">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight uppercase">
              READY TO SCALE YOUR CLOUD INFRASTRUCTURE?
            </h2>
            <p className="text-slate-600 text-sm font-normal">
              Let's discuss how customized AWS/Azure DevOps can optimize your platform uptime.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => setConsultationModalOpen(true)}
                className="btn-emerald text-sm font-semibold px-8 py-3.5 rounded-lg cursor-pointer"
              >
                Book Cloud Strategy Session
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer onOpenConsultation={() => setConsultationModalOpen(true)} />
      <ContactModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        defaultService="Cloud Services & DevOps"
      />
    </main>
  );
}
