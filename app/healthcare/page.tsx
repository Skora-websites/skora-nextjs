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
  FileText,
  Lock,
  MessageCircle,
  Phone,
  ShieldCheck,
  User,
  Users,
  Video,
  Zap,
  ChevronRight,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import Card3D from "@/components/Card3D";

const appointments = [
  {
    id: 1,
    name: "Wilson Rhiel Madsen",
    time: "8:00 - 12:00 Am",
    eta: "in 10 min",
    type: "Clinical ABA Session",
    status: "Confirmed",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    glow: "border-orange-500/40 shadow-orange-500/20",
  },
  {
    id: 2,
    name: "Elena Rodriguez",
    time: "1:30 - 2:15 Pm",
    eta: "in 2 hours",
    type: "Cardiology Follow-Up",
    status: "Waiting Room",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    glow: "border-purple-500/40 shadow-purple-500/20",
  },
  {
    id: 3,
    name: "Dr. James Carter",
    time: "4:00 - 5:00 Pm",
    eta: "in 4 hours",
    type: "EHR Integration Review",
    status: "Scheduled",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    glow: "border-blue-500/40 shadow-blue-500/20",
  },
];

export default function HealthcarePortal() {
  const [activeTab, setActiveTab] = useState<"appointments" | "telemedicine" | "ehr">("appointments");
  const [selectedPatient, setSelectedPatient] = useState(appointments[0]);
  const [sessionActive, setSessionActive] = useState(false);

  return (
    <main className="min-h-screen bg-[#05030A] text-white selection:bg-purple-600 selection:text-white flex flex-col relative overflow-hidden font-sans">
      {/* Dual Cosmic Light Flares */}
      <div className="absolute top-0 -left-40 w-[700px] h-[700px] bg-gradient-to-r from-orange-600/25 via-amber-500/15 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-20 -right-40 w-[700px] h-[700px] bg-gradient-to-l from-purple-600/30 via-violet-500/20 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Cyber Grid Matrix */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#a855f7 1px, transparent 1px), linear-gradient(90deg, #a855f7 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0A0612]/90 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-white">
            <span>SKORA</span>
            <span className="text-emerald-400 font-black">.healthcare</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              DOCTOR PORTAL
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <Link href="/" className="text-slate-400 hover:text-white transition-colors">
              Landing Page
            </Link>
            <Link href="/home" className="text-slate-400 hover:text-white transition-colors">
              Home
            </Link>
            <span className="text-emerald-400 font-bold border-b-2 border-emerald-400 pb-1">
              Healthcare Portal
            </span>
            <a href="#demo" className="text-slate-400 hover:text-white transition-colors">
              Request Demo
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#demo"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
            >
              Doctor Login
            </a>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="pt-32 pb-12 px-4 max-w-7xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest mb-4">
          <Activity size={14} className="animate-spin" />
          <span>SPECIALIZED CLINICAL & EHR DIVISION</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08]">
          Dedicated Healthcare Portal & <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-400">
            EHR Automation For Doctors.
          </span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
          HIPAA-compliant patient scheduling, automated ABA session logging, encrypted telemedicine video, and clinical data pipelines.
        </p>

        {/* Telemetry Metrics */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
          {[
            { label: "HIPAA Compliant", value: "100% Certified", color: "text-emerald-400" },
            { label: "EHR Sync Uptime", value: "99.99%", color: "text-cyan-400" },
            { label: "Active Doctors", value: "2,400+", color: "text-purple-400" },
            { label: "Patient Sessions", value: "150K+/mo", color: "text-amber-400" },
          ].map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[11px] text-slate-400 block font-medium">{item.label}</span>
              <span className={`text-lg font-bold ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* DOCTOR DASHBOARD INTERACTIVE WIDGET (Matching Design1 Image Aesthetics) */}
      <section className="py-10 px-4 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Doctor Appointment Queue Panel (Amber Ember Glow) */}
          <div className="lg:col-span-6">
            <Card3D
              maxTilt={6}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#120B06] via-[#0E0919] to-[#0A0612] border-2 border-orange-500/40 shadow-[0_0_50px_rgba(249,115,22,0.2)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>You have 3 new appointments</span>
                  </h2>
                  <p className="text-xs text-orange-300 font-mono">Today&apos;s Clinical Queue • May 23, 2026</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 relative">
                  <Bell size={18} className="animate-pulse" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-orange-500" />
                </div>
              </div>

              {/* Patient Cards List */}
              <div className="mt-5 space-y-4">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedPatient(apt)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedPatient.id === apt.id
                        ? "bg-gradient-to-r from-orange-500/20 via-orange-600/10 to-transparent border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.25)]"
                        : "bg-white/5 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={apt.avatar} alt={apt.name} className="w-12 h-12 rounded-full object-cover border border-white/20" />
                        <div>
                          <h3 className="text-base font-bold text-white">{apt.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                            <Clock size={12} className="text-orange-400" />
                            <span>{apt.time}</span>
                            <span className="text-orange-400 font-mono">({apt.eta})</span>
                          </div>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 shrink-0">
                        {apt.status}
                      </span>
                    </div>

                    {selectedPatient.id === apt.id && (
                      <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-3">
                        <button
                          onClick={() => alert(`Preparing medical records for ${apt.name}...`)}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all border border-white/15"
                        >
                          Prepare
                        </button>
                        <button
                          onClick={() => setSessionActive(true)}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-xs font-extrabold text-white shadow-[0_0_20px_rgba(249,115,22,0.5)] transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Video size={14} />
                          <span>Start Session</span>
                        </button>
                        <button
                          onClick={() => alert("Opening SOAP notes editor...")}
                          className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-300 transition-all ml-auto"
                        >
                          Notes to complete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card3D>
          </div>

          {/* Right Doctor Active Session & Data Logging Panel (Violet Purple Glow) */}
          <div className="lg:col-span-6">
            <Card3D
              maxTilt={6}
              className="p-6 rounded-3xl bg-gradient-to-br from-[#10081C] via-[#0E0919] to-[#0A0612] border-2 border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.2)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img src={selectedPatient.avatar} alt={selectedPatient.name} className="w-10 h-10 rounded-full object-cover border border-purple-500/40" />
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest block">
                      {sessionActive ? "● LIVE CLINICAL SESSION" : "NEXT UP IN QUEUE"}
                    </span>
                    <h3 className="text-lg font-bold text-white">Session with {selectedPatient.name.split(" ")[0]}</h3>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {sessionActive ? "Started 6 min ago" : "Ready"}
                </span>
              </div>

              {/* Data Logging Widget */}
              <div className="mt-5 space-y-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-purple-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300">Data Logging</span>
                    <span className="text-purple-400 font-mono">Last logged 3s ago</span>
                  </div>

                  <div className="p-3 rounded-xl bg-gradient-to-r from-purple-900/60 to-purple-600/30 border border-purple-400/40 flex items-center justify-between shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <Zap size={14} className="text-purple-300 animate-bounce" />
                      <span>Model prompt: Clinical ABA & Skill Assessment</span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-500/30 px-2 py-0.5 rounded">
                      1s ago
                    </span>
                  </div>
                </div>

                {/* Session Timeline Items */}
                <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-950/40 to-slate-900/40 border border-purple-500/20 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-purple-300">
                    <span>Engage with play items</span>
                    <span className="text-slate-400">Skill Acquisition</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      ✓
                    </div>
                    <span className="font-medium text-white">Target Behavioral Response Recorded</span>
                    <span className="text-[10px] font-mono text-slate-400 ml-auto">10:35 am</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 text-xs font-bold text-purple-400">
                    <FileText size={14} />
                    <span>Auto-generating HIPAA EHR Progress Notes...</span>
                  </div>
                </div>
              </div>
            </Card3D>
          </div>
        </div>
      </section>

      {/* DEMO CONSULTATION REQUEST FORM FOR DOCTORS */}
      <section id="demo" className="py-20 px-4 max-w-4xl mx-auto w-full relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0B0F19] via-[#0E0919] to-[#0A0612] border-2 border-emerald-500/40 shadow-[0_0_60px_rgba(16,185,129,0.2)] backdrop-blur-2xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest mb-3">
              <ShieldCheck size={14} /> CLINICIAN REGISTRATION
            </div>
            <h2 className="text-3xl font-extrabold text-white">Schedule a Doctor Portal Demo</h2>
            <p className="mt-2 text-slate-300 text-sm font-medium">
              Join 2,400+ doctors using SKORA to streamline EHR data logging and patient telemedicine.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Doctor Portal demo request submitted! Our Healthcare IT team will contact you within 2 hours.");
            }}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Doctor Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Dr. Sarah Carter, MD"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Medical License / NPI Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="NPI-1234567890"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="doctor@clinic.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Phone / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-extrabold text-sm shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
            >
              Request Access to Healthcare Doctor Portal
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} SKORA Healthcare IT Division. All rights reserved.</p>
      </footer>
    </main>
  );
}
