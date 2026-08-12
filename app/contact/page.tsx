"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles, Clock, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [service, setService] = useState("Website Design & Web Apps");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-[#F4F6F1] text-[#0B1310] font-sans selection:bg-[#22C55E] selection:text-white relative overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setModalOpen(true)} />

      {/* Hero Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#E1E6DF] shadow-sm text-xs font-semibold">
            <Mail className="w-4 h-4 text-[#22C55E]" />
            <span className="text-[#0B1310] font-bold">✦ CONTACT SKORA DIGITAL ENTERPRISE ✦</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0B1310] tracking-tight leading-[1.02] uppercase">
            LET'S BUILD SOMETHING <br />
            <span className="text-[#22C55E]">EXTRAORDINARY TOGETHER</span>
          </h1>

          <p className="text-lg text-slate-600 font-medium leading-relaxed">
            Have a project in mind, need software engineering guidance, or want to scale your revenue with performance marketing? Connect with our team today.
          </p>
        </motion.div>
      </section>

      {/* Main Contact Grid */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Contact Info & Office Locations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="p-8 rounded-[2.5rem] bg-white border border-[#E1E6DF] shadow-xl space-y-8">
              <h2 className="text-2xl font-black uppercase text-[#0B1310]">
                GET IN TOUCH
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F7ED] text-[#16A34A] flex items-center justify-center shrink-0 border border-[#22C55E]/30">
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Email Us</span>
                    <p className="text-base font-bold text-[#0B1310] mt-0.5">info@skora.digital</p>
                    <p className="text-xs text-slate-500 font-medium">Direct response within 4 business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F7ED] text-[#16A34A] flex items-center justify-center shrink-0 border border-[#22C55E]/30">
                    <Phone size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Call or WhatsApp</span>
                    <p className="text-base font-bold text-[#0B1310] mt-0.5">+91 92173 75835</p>
                    <p className="text-xs text-slate-500 font-medium">Mon - Sat: 9:00 AM - 8:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E8F7ED] text-[#16A34A] flex items-center justify-center shrink-0 border border-[#22C55E]/30">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Noida / Delhi NCR Studio</span>
                    <p className="text-base font-bold text-[#0B1310] mt-0.5">Gaur City 2, Greater Noida</p>
                    <p className="text-xs text-slate-500 font-medium">Uttar Pradesh, India — 201308</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E1E6DF] space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#16A34A]" />
                  <span className="text-xs font-bold text-slate-700">Rapid 4-Hour Response Guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#16A34A]" />
                  <span className="text-xs font-bold text-slate-700">Strict Non-Disclosure &amp; Data Privacy</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="lg:col-span-7"
          >
            <div className="p-8 sm:p-12 rounded-[2.5rem] bg-white border border-[#E1E6DF] shadow-xl space-y-8">
              {submitted ? (
                <div className="py-16 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full bg-[#E8F7ED] border border-[#22C55E] text-[#16A34A] flex items-center justify-center mx-auto shadow-xl">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-black text-[#0B1310] uppercase">
                    MESSAGE SENT SUCCESSFULLY!
                  </h2>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
                    Thank you, <strong className="text-[#0B1310]">{fullName}</strong>. Our senior strategy consultant will reach out to <strong className="text-[#0B1310]">{email}</strong> within 4 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-8 py-3.5 rounded-full bg-[#0B1310] hover:bg-[#22C55E] text-white font-extrabold text-xs shadow-xl transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#16A34A]">
                      Project Brief /
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#0B1310] uppercase">
                      SEND US A MESSAGE
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl px-4 py-3 text-xs text-[#0B1310] placeholder-slate-400 focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl px-4 py-3 text-xs text-[#0B1310] placeholder-slate-400 focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                        Company / Organization
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl px-4 py-3 text-xs text-[#0B1310] placeholder-slate-400 focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                        Primary Service Needed
                      </label>
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl px-4 py-3 text-xs text-[#0B1310] appearance-none focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors cursor-pointer font-medium"
                      >
                        <option value="Website Design & Web Apps">Website Design &amp; Web Apps</option>
                        <option value="Digital Marketing & Local SEO">Digital Marketing &amp; Local SEO</option>
                        <option value="Branding & Visual Identity">Branding &amp; Visual Identity</option>
                        <option value="Video Production & Reels">Video Production &amp; Reels</option>
                        <option value="Mobile App Development">Mobile App Development</option>
                        <option value="Cloud Services & DevOps">Cloud Services &amp; DevOps</option>
                        <option value="SaaS Platform Development">SaaS Platform Development</option>
                        <option value="Project Management System (PMS)">Project Management System (PMS)</option>
                        <option value="Custom CRM & Automations">Custom CRM &amp; Automations</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                      Message / Project Details *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your project goals, timelines, and technical requirements..."
                      className="w-full bg-[#F4F6F1] border border-[#E1E6DF] rounded-xl p-4 text-xs text-[#0B1310] placeholder-slate-400 focus:outline-none focus:border-[#22C55E] focus:bg-white transition-colors resize-none font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#0B1310] hover:bg-[#22C55E] text-white font-extrabold text-xs rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Submit Project Brief</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultService="General Inquiry"
      />
    </main>
  );
}
