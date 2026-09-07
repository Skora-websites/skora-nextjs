"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import Pill from "@/components/landing/Pill";
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/context/SiteContentContext";

const labelCls = "text-xs font-mono font-bold uppercase tracking-wider text-faint";

export default function ContactPage() {
  const siteContent = useSiteContent();
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
    <main className="min-h-screen bg-main text-ink font-sans relative overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setModalOpen(true)} />

      {/* Hero Header */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="absolute -top-10 left-1/4 w-[500px] h-[400px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto space-y-6 relative"
        >
          <Pill>
            <Mail className="w-3.5 h-3.5" />
            <span>✦ CONTACT SKORA DIGITAL ENTERPRISE ✦</span>
          </Pill>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-ink tracking-tight leading-[1.02]">
            LET&apos;S BUILD SOMETHING <br />
            <span className="text-gradient">EXTRAORDINARY TOGETHER</span>
          </h1>

          <p className="text-lg text-sub font-medium leading-relaxed">
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
            <div className="p-8 rounded-[2.5rem] glass-card space-y-8">
              <h2 className="text-2xl font-extrabold text-ink">
                GET IN TOUCH
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl glass-pill flex items-center justify-center shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-faint uppercase tracking-wider">Email Us</span>
                    <a href={`mailto:${siteContent.email}`} className="block text-base font-bold text-ink hover:text-accent-light transition-colors mt-0.5">{siteContent.email}</a>
                    <p className="text-xs text-faint font-medium">Direct response within 4 business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl glass-pill flex items-center justify-center shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-faint uppercase tracking-wider">Call or WhatsApp</span>
                    <div className="flex items-center gap-3 mt-0.5">
                      <a href={`tel:${siteContent.phone.replace(/[^0-9+]/g, '')}`} className="text-base font-bold text-ink hover:text-accent-light transition-colors">{siteContent.phone}</a>
                      <a href={`https://wa.me/${siteContent.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono hover:bg-emerald-500/20 transition-colors border border-emerald-400/30">WhatsApp</a>
                    </div>
                    <p className="text-xs text-faint font-medium">Mon - Sat: 9:00 AM - 8:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl glass-pill flex items-center justify-center shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-faint uppercase tracking-wider">Noida / Delhi NCR Studio</span>
                    <p className="text-base font-bold text-ink mt-0.5">{siteContent.address}</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent-light" />
                  <span className="text-xs font-bold text-[#CBD5E1]">{siteContent.responseGuarantee}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-accent-light" />
                  <span className="text-xs font-bold text-[#CBD5E1]">Strict Non-Disclosure &amp; Data Privacy</span>
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
            <div className="p-8 sm:p-12 rounded-[2.5rem] glass-card space-y-8">
              {submitted ? (
                <div className="py-16 text-center space-y-6">
                  <div className="w-20 h-20 rounded-full glass-pill flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-extrabold text-ink">
                    MESSAGE SENT SUCCESSFULLY!
                  </h2>
                  <p className="text-sm text-sub max-w-md mx-auto leading-relaxed font-medium">
                    Thank you, <strong className="text-ink">{fullName}</strong>. Our senior strategy consultant will reach out to <strong className="text-ink">{email}</strong> within 4 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-secondary px-8 py-3.5 text-xs"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <span className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Start A Project Brief</span>
                    </span>
                    <h2 className="text-2xl font-extrabold text-ink tracking-tight">
                      TELL US ABOUT YOUR PROJECT
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelCls}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="input-dark text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelCls}>
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        className="input-dark text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={labelCls}>
                        Company / Brand Name
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="input-dark text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelCls}>
                        Primary Capability Needed
                      </label>
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className="input-dark text-xs appearance-none cursor-pointer"
                      >
                        <option value="Website Design & Web Apps" className="bg-surface">Website Design & Web Apps</option>
                        <option value="Branding & Identity System" className="bg-surface">Branding & Identity System</option>
                        <option value="SaaS Architecture Engineering" className="bg-surface">SaaS Architecture Engineering</option>
                        <option value="Mobile App Development" className="bg-surface">Mobile App Development</option>
                        <option value="Cloud Infrastructure & DevOps" className="bg-surface">Cloud Infrastructure & DevOps</option>
                        <option value="Custom CRM Engineering" className="bg-surface">Custom CRM Engineering</option>
                        <option value="Digital Marketing & Performance SEO" className="bg-surface">Digital Marketing & Performance SEO</option>
                        <option value="Property Mgmt Systems" className="bg-surface">Property Mgmt Systems</option>
                        <option value="High-Impact Video Reels Studio" className="bg-surface">High-Impact Video Reels Studio</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelCls}>
                      Project Requirements &amp; Goals
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share details about target goals, deliverables, and deadline expectations..."
                      className="input-dark text-xs resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 text-xs"
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

      <Footer onOpenConsultation={() => setModalOpen(true)} />
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultService="General Inquiry"
      />
    </main>
  );
}
