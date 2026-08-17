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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          phone: "+91 92173 75835", // Default or user provided
          company,
          service,
          message,
          source: "Contact Page Form",
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-[#F4F6F1] text-[#0B1310] font-sans relative overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setModalOpen(true)} />

      {/* Hero Header */}
      <section className="pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider border border-[#E1E6DF] bg-white text-slate-800 shadow-sm">
            <Mail className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>CONTACT SKORA DIGITAL ENTERPRISE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#0B1310] tracking-tight leading-[1.02] uppercase">
            LET'S BUILD SOMETHING <br />
            <span className="text-[#22C55E]">EXTRAORDINARY TOGETHER</span>
          </h1>

          <p className="text-lg text-slate-600 font-normal leading-relaxed">
            Have a project in mind, need software engineering guidance, or want to scale your revenue with performance marketing? Connect with our team today.
          </p>
        </motion.div>
      </section>

      {/* Main Contact Grid */}
      <section className="pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Contact Info & Office Locations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="p-8 rounded-xl bg-white border border-[#E1E6DF] shadow-md space-y-8">
              <h2 className="text-xl font-bold uppercase text-[#0B1310] tracking-wide">
                GET IN TOUCH
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0 border border-[#22C55E]/20">
                    <Mail size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">Email Us</span>
                    <a href="mailto:ashish17427@gmail.com" className="block text-sm font-bold text-[#0B1310] hover:text-[#22C55E] transition-colors mt-0.5">ashish17427@gmail.com</a>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">Direct response within 4 business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0 border border-[#22C55E]/20">
                    <Phone size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">Call or WhatsApp</span>
                    <div className="flex items-center gap-3 mt-0.5">
                      <a href="tel:+919217375835" className="text-sm font-bold text-[#0B1310] hover:text-[#22C55E] transition-colors">+91 92173 75835</a>
                      <a href="https://wa.me/919217375835" target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded bg-[#22C55E]/10 text-[#22C55E] text-[10px] font-bold font-mono hover:bg-[#22C55E]/20 transition-colors border border-[#22C55E]/20">WhatsApp</a>
                    </div>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">Mon - Sat: 9:00 AM - 8:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 text-[#22C55E] flex items-center justify-center shrink-0 border border-[#22C55E]/20">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-medium text-slate-500 uppercase tracking-wider">Noida / Delhi NCR Studio</span>
                    <p className="text-sm font-bold text-[#0B1310] mt-0.5">Gaur City 2, Greater Noida</p>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">Uttar Pradesh, India — 201308</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E1E6DF] space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-xs font-medium text-slate-700">Rapid 4-Hour Response Guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                  <span className="text-xs font-medium text-slate-700">Strict Non-Disclosure &amp; Data Privacy</span>
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
            <div className="p-8 sm:p-10 rounded-xl bg-white border border-[#E1E6DF] shadow-md space-y-8">
              {submitted ? (
                <div className="py-16 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0B1310] uppercase">
                    MESSAGE SENT SUCCESSFULLY!
                  </h2>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-normal">
                    Thank you, <strong className="text-[#0B1310]">{fullName}</strong>. Our senior strategy consultant will reach out to <strong className="text-[#0B1310]">{email}</strong> within 4 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-emerald text-xs font-semibold px-6 py-3 rounded-lg cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded text-[11px] font-semibold text-[#22C55E] border border-[#22C55E]/20 bg-[#22C55E]/10">
                      <Sparkles className="w-3.5 h-3.5 text-[#22C55E]" />
                      <span>Start A Project Brief</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#0B1310] uppercase tracking-tight">
                      TELL US ABOUT YOUR PROJECT
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-medium uppercase tracking-wider text-slate-600">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-[#F8F9F6] border border-[#E1E6DF] rounded-lg px-4 py-3 text-xs text-[#0B1310] placeholder-slate-400 focus:outline-none focus:border-[#22C55E] transition-colors font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-medium uppercase tracking-wider text-slate-600">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        className="w-full bg-[#F8F9F6] border border-[#E1E6DF] rounded-lg px-4 py-3 text-xs text-[#0B1310] placeholder-slate-400 focus:outline-none focus:border-[#22C55E] transition-colors font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-medium uppercase tracking-wider text-slate-600">
                        Company / Brand Name
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="w-full bg-[#F8F9F6] border border-[#E1E6DF] rounded-lg px-4 py-3 text-xs text-[#0B1310] placeholder-slate-400 focus:outline-none focus:border-[#22C55E] transition-colors font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono font-medium uppercase tracking-wider text-slate-600">
                        Primary Capability Needed
                      </label>
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="w-full bg-[#F8F9F6] border border-[#E1E6DF] rounded-lg px-4 py-3 text-xs text-[#0B1310] appearance-none focus:outline-none focus:border-[#22C55E] transition-colors cursor-pointer font-medium"
                      >
                        <option value="Website Design & Web Apps">Website Design & Web Apps</option>
                        <option value="Branding & Identity System">Branding & Identity System</option>
                        <option value="SaaS Architecture Engineering">SaaS Architecture Engineering</option>
                        <option value="Mobile App Development">Mobile App Development</option>
                        <option value="Cloud Infrastructure & DevOps">Cloud Infrastructure & DevOps</option>
                        <option value="Custom CRM Engineering">Custom CRM Engineering</option>
                        <option value="Digital Marketing & Performance SEO">Digital Marketing & Performance SEO</option>
                        <option value="Property Mgmt Systems">Property Mgmt Systems</option>
                        <option value="High-Impact Video Reels Studio">High-Impact Video Reels Studio</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-medium uppercase tracking-wider text-slate-600">
                      Project Requirements &amp; Goals
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share details about target goals, deliverables, and deadline expectations..."
                      className="w-full bg-[#F8F9F6] border border-[#E1E6DF] rounded-lg p-4 text-xs text-[#0B1310] placeholder-slate-400 focus:outline-none focus:border-[#22C55E] transition-colors resize-none font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-emerald py-3.5 text-xs rounded-lg font-bold justify-center cursor-pointer"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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

      <Footer onOpenConsultation={() => setModalOpen(true)} />
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultService="General Inquiry"
      />
    </main>
  );
}
