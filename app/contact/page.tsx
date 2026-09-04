"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import { Mail, Phone, MapPin, Send, CheckCircle2, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/context/SiteContentContext";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all font-medium focus:border-sky-400 focus:bg-white/10 focus:ring-1 focus:ring-sky-400/60 focus:shadow-[0_0_18px_rgba(56,189,248,0.25)]";
const labelClass =
  "font-mono-accent text-xs font-bold uppercase tracking-wider text-slate-500";

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
    <main className="min-h-screen bg-[#05070E] text-white font-sans selection:bg-[#2563EB] selection:text-white relative overflow-x-hidden">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setModalOpen(true)} />

      {/* Hero Header */}
      <section className="relative px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-radial-halo absolute -top-40 left-1/2 h-[32rem] w-[56rem] -translate-x-1/2 rounded-full blur-[130px]" />
          <div className="grid-floor" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto max-w-3xl space-y-6 text-center"
        >
          <div className="glass-pill inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
            <Mail className="h-4 w-4 text-sky-300" />
            <span className="font-bold">✦ CONTACT SKORA DIGITAL ENTERPRISE ✦</span>
          </div>

          <h1 className="text-4xl font-black uppercase leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
            LET&apos;S BUILD SOMETHING <br />
            <span className="text-gradient-cyan">EXTRAORDINARY TOGETHER</span>
          </h1>

          <p className="text-lg font-medium leading-relaxed text-slate-400">
            Have a project in mind, need software engineering guidance, or want to scale your revenue with performance marketing? Connect with our team today.
          </p>
        </motion.div>
      </section>

      {/* Main Contact Grid */}
      <section className="relative pb-24 px-4 sm:px-6 lg:px-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-radial-halo-subtle absolute left-0 top-1/3 h-[28rem] w-[34rem] rounded-full blur-[130px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Left Column: Direct Contact Info & Office Locations */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 space-y-8"
          >
            <div className="glass-card space-y-8 rounded-[2.5rem] p-8">
              <h2 className="text-2xl font-black uppercase text-white">
                GET IN TOUCH
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500/10 text-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.3)]">
                    <Mail size={20} />
                  </div>
                  <div>
                    <span className="font-mono-accent text-xs font-bold uppercase tracking-wider text-slate-500">Email Us</span>
                    <a href={`mailto:${siteContent.email}`} className="mt-0.5 block text-base font-bold text-white transition-colors hover:text-sky-300">{siteContent.email}</a>
                    <p className="text-xs font-medium text-slate-500">Direct response within 4 business hours</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500/10 text-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.3)]">
                    <Phone size={20} />
                  </div>
                  <div>
                    <span className="font-mono-accent text-xs font-bold uppercase tracking-wider text-slate-500">Call or WhatsApp</span>
                    <div className="mt-0.5 flex items-center gap-3">
                      <a href={`tel:${siteContent.phone.replace(/[^0-9+]/g, '')}`} className="text-base font-bold text-white transition-colors hover:text-sky-300">{siteContent.phone}</a>
                      <a href={`https://wa.me/${siteContent.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="rounded border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 font-mono-accent text-[10px] font-bold text-emerald-300 transition-colors hover:bg-emerald-500/20">WhatsApp</a>
                    </div>
                    <p className="text-xs font-medium text-slate-500">Mon - Sat: 9:00 AM - 8:00 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500/10 text-sky-300 shadow-[0_0_18px_rgba(56,189,248,0.3)]">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="font-mono-accent text-xs font-bold uppercase tracking-wider text-slate-500">Noida / Delhi NCR Studio</span>
                    <p className="mt-0.5 text-base font-bold text-white">{siteContent.address}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-sky-300" />
                  <span className="text-xs font-bold text-slate-300">{siteContent.responseGuarantee}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-sky-300" />
                  <span className="text-xs font-bold text-slate-300">Strict Non-Disclosure &amp; Data Privacy</span>
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
            <div className="glass-card neon-border space-y-8 rounded-[2.5rem] p-8 sm:p-12">
              {submitted ? (
                <div className="space-y-6 py-16 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-sky-400 bg-sky-500/10 text-sky-300 shadow-[0_0_30px_rgba(56,189,248,0.4)]">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h2 className="text-3xl font-black uppercase text-white">
                    MESSAGE SENT SUCCESSFULLY!
                  </h2>
                  <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-slate-400">
                    Thank you, <strong className="text-white">{fullName}</strong>. Our senior strategy consultant will reach out to <strong className="text-white">{email}</strong> within 4 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn-secondary cursor-pointer px-8 py-3.5 text-xs"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <div className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold">
                      <Sparkles className="h-3.5 w-3.5 text-sky-300" />
                      <span>Start A Project Brief</span>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                      TELL US ABOUT YOUR PROJECT
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@company.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        Company / Brand Name
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={labelClass}>
                        Primary Capability Needed
                      </label>
                      <select
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                        className={`${inputClass} cursor-pointer appearance-none [&>option]:bg-[#0B0F19]`}
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
                    <label className={labelClass}>
                      Project Requirements &amp; Goals
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share details about target goals, deliverables, and deadline expectations..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex w-full cursor-pointer items-center justify-center gap-2 py-4 text-xs"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <span>Submit Project Brief</span>
                        <Send className="h-4 w-4" />
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
