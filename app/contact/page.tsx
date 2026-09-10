"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ContactModal from "@/components/ContactModal";
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useSiteContent } from "@/context/SiteContentContext";

const services = [
  "Website design and development",
  "Branding and identity",
  "SaaS development",
  "Mobile app development",
  "Cloud and DevOps",
  "CRM development",
  "Digital marketing and SEO",
  "Project management systems",
  "Video production",
];

export default function ContactPage() {
  const siteContent = useSiteContent();
  const [modalOpen, setModalOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [service, setService] = useState(services[0]);
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
          phone: siteContent.phone || "+44 07756083473",
          company,
          service,
          message,
          source: "Contact page form",
        }),
      });
    } catch {
      // Confirmation still shown; user can retry via email.
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-main font-sans text-ink">
      <ScrollProgressBar />
      <Navbar onOpenConsultation={() => setModalOpen(true)} />

      <section className="relative overflow-hidden bg-paper pb-12 pt-32 sm:pt-36">
        <div className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]" aria-hidden="true" />
        <div className="section-wrap relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl space-y-5 text-center"
          >
            <span className="kicker justify-center">Contact Skora</span>
            <h1 className="display-hero text-5xl sm:text-7xl">
              Tell us about <span className="display-accent text-accent">your project.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-sub sm:text-lg">
              Share your goals and timeline. We reply within 4 business hours with next steps and a fixed estimate.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-wrap grid grid-cols-1 items-start gap-6 pb-20 lg:grid-cols-12">
        <div className="space-y-7 rounded-[2rem] bg-ink-deep p-7 text-white sm:p-8 lg:col-span-5">
          <div>
            <span className="kicker !text-white/60">Direct lines</span>
            <h2 className="display-hero mt-3 text-3xl text-white">Talk to <span className="display-accent">us.</span></h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Mail size={19} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/60">Email</p>
                <a href={`mailto:${siteContent.email}`} className="mt-0.5 block text-base font-bold text-white hover:text-accent">
                  {siteContent.email}
                </a>
                <p className="text-xs font-medium text-white/50">Replies within 4 business hours</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Phone size={19} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/60">Phone and WhatsApp</p>
                <a
                  href={`tel:${siteContent.phone.replace(/[^0-9+]/g, "")}`}
                  className="mt-0.5 block text-base font-bold text-white hover:text-accent"
                >
                  {siteContent.phone}
                </a>
                <p className="text-xs font-medium text-white/50">Mon to Sat, 9:00 AM to 8:00 PM IST</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                <MapPin size={19} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/60">Office</p>
                <p className="mt-0.5 text-base font-bold text-white">{siteContent.address}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 border-t border-white/15 pt-6 text-sm font-medium text-white/75">
            <p className="flex items-center gap-2.5">
              <Clock size={16} className="text-accent" />
              {siteContent.responseGuarantee}
            </p>
            <p className="flex items-center gap-2.5">
              <ShieldCheck size={16} className="text-accent" />
              NDA available on request. Your details stay private.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-[2rem] p-7 sm:p-10 lg:col-span-7">
          {submitted ? (
            <div className="space-y-5 py-12 text-center">
              <div className="glass-pill mx-auto flex h-16 w-16 items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">Message received</h2>
              <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-sub">
                Thank you, {fullName}. We will reply to {email} within 4 business hours.
              </p>
              <button type="button" onClick={() => setSubmitted(false)} className="btn-secondary px-8 py-3 text-xs">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-2xl font-extrabold tracking-tight">Project brief</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="contact-name" className="text-xs font-bold uppercase tracking-wide text-faint">
                    Full name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="input-dark text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="text-xs font-bold uppercase tracking-wide text-faint">
                    Work email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input-dark text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="contact-company" className="text-xs font-bold uppercase tracking-wide text-faint">
                    Company
                  </label>
                  <input
                    id="contact-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                    className="input-dark text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="contact-service" className="text-xs font-bold uppercase tracking-wide text-faint">
                    Service needed
                  </label>
                  <select
                    id="contact-service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="input-dark cursor-pointer appearance-none text-sm"
                  >
                    {services.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="contact-message" className="text-xs font-bold uppercase tracking-wide text-faint">
                  Requirements and timeline
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What do you need, and when do you need it?"
                  className="input-dark resize-none text-sm"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-sm">
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <span>Send project brief</span>
                    <Send size={15} />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer onOpenConsultation={() => setModalOpen(true)} />
      <ContactModal isOpen={modalOpen} onClose={() => setModalOpen(false)} defaultService="General enquiry" />
    </main>
  );
}
