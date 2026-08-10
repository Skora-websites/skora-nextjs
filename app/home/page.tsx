"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Calendar,
  Clock,
  CheckCircle2,
  Code,
  Cloud,
  FileText,
  Globe,
  Layers,
  Megaphone,
  MessageSquare,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  Users,
  Video,
  Zap,
  ChevronRight,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import Card3D from "@/components/Card3D";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";

const clientLogos = [
  { name: "Opendoor", logo: "Opendoor" },
  { name: "DocuSign", logo: "DocuSign" },
  { name: "Slack", logo: "slack" },
  { name: "Splunk", logo: "splunk>" },
  { name: "Atlassian", logo: "▲ ATLASSIAN" },
];

const appointments = [
  {
    id: 1,
    name: "Wilson Rhiel Madsen",
    time: "8:00 - 12:00 Am",
    eta: "in 10 min",
    status: "Confirmed",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 2,
    name: "Elena Rodriguez",
    time: "1:30 - 2:15 Pm",
    eta: "in 2 hours",
    status: "Waiting Room",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
];

const coreServices = [
  { title: "Digital Marketing & AI SEO", desc: "150+ battle-tested SEO & GEO strategies driving organic search & AI citations.", icon: Megaphone, link: "/services/digital-marketing", color: "from-blue-500 to-cyan-500" },
  { title: "Website Design & Web Apps", desc: "Cinematic interfaces, glassmorphism design systems, and fluid Next.js web applications.", icon: Globe, link: "/services/website-design", color: "from-purple-500 to-indigo-500" },
  { title: "Mobile App Engineering", desc: "High-performance iOS & Android applications built with Swift, Kotlin, and React Native.", icon: Smartphone, link: "/services/mobile-development", color: "from-sky-400 to-blue-600" },
  { title: "Cloud Services & DevOps", desc: "Secure AWS & Azure deployments, automated CI/CD pipelines, and 99.99% uptime.", icon: Cloud, link: "/services/cloud-services", color: "from-indigo-500 to-purple-600" },
  { title: "SaaS Platform Development", desc: "Multi-tenant architectures, automated Stripe billing, and scalable subscriptions.", icon: Code, link: "/services/saas-development", color: "from-emerald-400 to-teal-600" },
  { title: "Project Management (PMS)", desc: "Sprint roadmaps, kanban workflows, and real-time project collaboration tools.", icon: Layers, link: "/services/pms", color: "from-amber-400 to-orange-500" },
  { title: "CRM Automations", desc: "Lead pipeline sync, automated email triggers, and AI-powered sales intelligence.", icon: Users, link: "/services/crm", color: "from-rose-500 to-pink-600" },
];

export default function HomePage() {
  const [consultationModalOpen, setConsultationModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(appointments[0]);
  const [sessionActive, setSessionActive] = useState(false);

  const handleOpenConsultation = (topic?: string) => {
    setSelectedService(topic || "");
    setConsultationModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-[#05030A] text-white selection:bg-purple-600 selection:text-white flex flex-col relative overflow-hidden font-sans">
      {/* Top Scroll Progress Indicator */}
      <ScrollProgressBar />

      {/* DUAL COSMIC LIGHT FLARES (Warm Ember Left + Electric Violet Right as in Mockup) */}
      <div className="absolute top-0 -left-48 w-[800px] h-[800px] bg-gradient-to-r from-orange-600/30 via-amber-500/15 to-transparent rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-0 -right-48 w-[800px] h-[800px] bg-gradient-to-l from-purple-600/35 via-violet-500/20 to-transparent rounded-full blur-[150px] pointer-events-none" />

      {/* Cyber Blueprint Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* FLOATING PILL NAVBAR MATCHING REFERENCE IMAGE */}
      <header className="fixed top-6 inset-x-0 z-50 flex justify-center px-4">
        <div className="flex items-center justify-between gap-6 px-6 py-3 rounded-full bg-[#0A0612]/80 border border-white/15 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8)] max-w-5xl w-full">
          {/* Brand Logo */}
          <Link href="/" className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5 shrink-0">
            <span>SKORA</span>
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_#a855f7]" />
          </Link>

          {/* Center Links Capsule */}
          <nav className="hidden md:flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold">
            <Link href="/home" className="px-4 py-1.5 rounded-full bg-white/15 text-white font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Home</span>
            </Link>
            <a href="#services" className="px-3.5 py-1.5 text-slate-300 hover:text-white transition-colors">
              Services
            </a>
            <Link href="/healthcare" className="px-3.5 py-1.5 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 font-bold">
              <Activity size={14} /> Healthcare Portal
            </Link>
            <a href="#capabilities" className="px-3.5 py-1.5 text-slate-300 hover:text-white transition-colors">
              Capabilities
            </a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleOpenConsultation()}
              className="text-xs font-bold text-slate-300 hover:text-white transition-colors hidden sm:inline-block"
            >
              Log In
            </button>
            <button
              onClick={() => handleOpenConsultation()}
              className="px-5 py-2.5 rounded-full bg-white text-[#0A0612] hover:bg-slate-100 font-extrabold text-xs shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_rgba(255,255,255,0.7)] transition-all cursor-pointer"
            >
              Book a Demo
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION MATCHING REFERENCE IMAGE MOCKUP */}
      <section className="pt-36 pb-16 px-4 max-w-6xl mx-auto text-center relative z-10">
        {/* Glow Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(168,85,247,0.25)]">
          <Sparkles size={14} className="animate-spin text-purple-400" />
          <span>✦ Smart Scheduler & Digital AI Automation ✦</span>
        </div>

        {/* Display Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.06] max-w-5xl mx-auto">
          Smart Scheduler Effortless <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-purple-400 drop-shadow-[0_0_35px_rgba(168,85,247,0.5)]">
            Digital & Healthcare Automation!
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          Imagine digital marketing growth and doctor ABA patient scheduling happening automatically.
        </p>

        {/* Dual Glowing CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => handleOpenConsultation()}
            className="group px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 hover:from-purple-500 hover:to-violet-500 text-white font-extrabold text-base shadow-[0_0_35px_rgba(168,85,247,0.5)] hover:shadow-[0_0_55px_rgba(168,85,247,0.8)] hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Book a Demo</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <Link
            href="/healthcare"
            className="group px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 font-extrabold text-base backdrop-blur-xl shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-105 transition-all flex items-center gap-2"
          >
            <Activity size={18} className="text-emerald-400" />
            <span>Enter Doctor Healthcare Portal →</span>
          </Link>
        </div>

        {/* Client Logo Marquee */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 sm:gap-14 text-slate-400 font-mono text-sm sm:text-base opacity-75">
          {clientLogos.map((client, idx) => (
            <span key={idx} className="hover:text-white transition-colors cursor-default tracking-widest font-bold">
              {client.logo}
            </span>
          ))}
        </div>
      </section>

      {/* DUAL 3D INTERACTIVE PANELS MATCHING REFERENCE IMAGE */}
      <section className="py-10 px-4 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Panel (Solar Ember Amber Glow) */}
          <div className="lg:col-span-6">
            <Card3D
              maxTilt={8}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#140B06] via-[#0E0919] to-[#0A0612] border-2 border-orange-500/40 shadow-[0_0_60px_rgba(249,115,22,0.25)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>You have 3 new appointment</span>
                </h2>
                <div className="w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 relative">
                  <Bell size={18} className="animate-bounce" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500" />
                </div>
              </div>

              {/* Patient Card */}
              <div className="mt-5 p-5 rounded-2xl bg-gradient-to-r from-orange-500/20 via-orange-600/10 to-transparent border border-orange-500/50 shadow-[0_0_25px_rgba(249,115,22,0.2)]">
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                    alt="Wilson Rhiel Madsen"
                    className="w-14 h-14 rounded-full object-cover border-2 border-orange-400"
                  />
                  <div>
                    <h3 className="text-xl font-extrabold text-white">Wilson Rhiel Madsen</h3>
                    <p className="text-xs text-orange-300 font-mono mt-0.5">
                      8:00 - 12:00Am. in 10 min
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={() => alert("Preparing patient chart...")}
                    className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white border border-white/15 transition-all cursor-pointer"
                  >
                    Prepare
                  </button>
                  <button
                    onClick={() => setSessionActive(true)}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-xs font-extrabold text-white shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Video size={14} />
                    <span>Start sessions</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 flex justify-between items-center text-xs text-slate-400">
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 font-mono">
                  Notes to complete
                </span>
                <span className="font-mono text-orange-300">May 23, 2026</span>
              </div>
            </Card3D>
          </div>

          {/* Right Panel (Electric Violet Purple Glow) */}
          <div className="lg:col-span-6">
            <Card3D
              maxTilt={8}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#120720] via-[#0E0919] to-[#0A0612] border-2 border-purple-500/40 shadow-[0_0_60px_rgba(168,85,247,0.25)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold">
                    S
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-purple-300 block">Sessions</span>
                    <h3 className="text-base font-bold text-white">Session with peter</h3>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Live session • Started 6 min ago
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300">Data logging</span>
                    <span className="text-purple-300 font-mono">Last logged 3s ago</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-900/70 to-purple-600/40 border border-purple-400/50 flex items-center justify-between shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    <div className="flex items-center gap-2.5 text-xs font-bold text-white">
                      <Zap size={15} className="text-purple-300 animate-bounce" />
                      <span>Model prompt</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-200 bg-purple-500/40 px-2 py-0.5 rounded">
                      1s ago
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 pl-2">Engage with play item</p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/50 to-slate-900/40 border border-purple-500/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-purple-300">
                    <span>Engage with play items</span>
                    <span className="text-slate-400">Skill acquisition</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      😊
                    </div>
                    <span className="font-bold text-white">Completed</span>
                    <span className="text-[10px] font-mono text-slate-400 ml-auto">10:35 am</span>
                  </div>
                </div>
              </div>
            </Card3D>
          </div>
        </div>
      </section>

      {/* DEDICATED HEALTHCARE PORTAL SECTION FOR DOCTORS */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        <ScrollReveal variant="zoom" duration={800}>
          <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-[#0C1527] via-[#0E0919] to-[#120B1D] border-2 border-emerald-500/50 shadow-[0_0_70px_rgba(16,185,129,0.25)] backdrop-blur-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-500/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest">
                  <Activity size={16} className="animate-spin" />
                  <span>SPECIALIZED DOCTOR PORTAL DIVISION</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
                  Skora Healthcare IT & <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-400">
                    Clinical Doctor Portal.
                  </span>
                </h2>

                <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-medium">
                  HIPAA-compliant EHR data logging, automated patient appointment queues, encrypted telemedicine video, and clinical ABA progress tools for doctors.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {["HIPAA Certified", "99.99% EHR Sync", "Telemedicine Video", "SOAP Notes", "Patient Queue", "Rx Prescriptions"].map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-center gap-4 w-full sm:w-auto">
                <Link
                  href="/healthcare"
                  className="w-full sm:w-auto px-9 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-extrabold text-base shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:shadow-[0_0_60px_rgba(16,185,129,0.8)] hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Activity size={20} />
                  <span>Enter Doctor Healthcare Portal</span>
                  <ArrowRight size={18} />
                </Link>
                <span className="text-xs text-slate-400 font-mono">2,400+ Active Doctors Registered</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 7 CORE SKORA SERVICES HUB */}
      <section id="services" className="py-20 px-4 max-w-7xl mx-auto w-full relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            <Zap size={14} className="text-purple-400" />
            <span>FULL-STACK ENTERPRISE SERVICES</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Our 7 Core Digital Divisions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-medium">
            Architecting end-to-end digital scale from AI marketing to multi-tenant SaaS.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreServices.map((srv, idx) => (
            <ScrollReveal key={idx} variant="fade-up" duration={700 + idx * 50}>
              <Link href={srv.link} className="block h-full">
                <Card3D
                  maxTilt={10}
                  className="group relative h-full p-7 rounded-3xl bg-[#0E0919]/90 border border-white/10 hover:border-purple-500/60 shadow-xl backdrop-blur-2xl transition-all duration-500 hover:scale-[1.02]"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${srv.color} p-0.5 mb-6`}>
                    <div className="w-full h-full bg-[#0E0919] rounded-[14px] flex items-center justify-center text-white">
                      <srv.icon size={24} />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors mb-2">
                    {srv.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                    {srv.desc}
                  </p>
                  <div className="mt-auto flex items-center gap-2 text-xs font-bold text-purple-400 group-hover:text-purple-300">
                    <span>Explore Division</span>
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card3D>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer onOpenConsultation={handleOpenConsultation} />

      {/* Consultation Modal */}
      <ContactModal
        isOpen={consultationModalOpen}
        onClose={() => setConsultationModalOpen(false)}
        initialService={selectedService}
      />
    </main>
  );
}
