"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";

interface FooterProps {
  onOpenConsultation?: (topic?: string) => void;
}

const serviceLinks = [
  { label: "Website design and development", href: "/services/website-design" },
  { label: "Digital marketing and SEO", href: "/services/digital-marketing" },
  { label: "Branding and identity", href: "/services/branding" },
  { label: "Mobile app development", href: "/services/mobile-development" },
  { label: "Cloud and DevOps", href: "/services/cloud-services" },
  { label: "SaaS development", href: "/services/saas-development" },
];

const companyLinks = [
  { label: "Home", href: "/" },
  { label: "Healthcare", href: "/healthcare" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms and conditions", href: "/terms" },
];

export default function Footer({ onOpenConsultation }: FooterProps) {
  const siteContent = useSiteContent();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("Website design and development");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setLoading(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: name,
          email,
          phone: siteContent.phone || "+44 7756 083473",
          company: "Website footer enquiry",
          service: interest,
          message: `Footer enquiry: ${interest}`,
          source: "Footer contact form",
        }),
      });
    } catch {
      // Show confirmation anyway; lead can retry via contact page.
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <footer className="border-t border-line bg-surface text-ink">
      <div className="section-wrap space-y-14 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tighter">
                SKORA<span className="text-accent">.</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-faint">
                Studio
              </span>
            </Link>
            <h2 className="display-hero max-w-md text-4xl sm:text-5xl">
              Let&apos;s build <span className="display-accent text-accent">it right.</span>
            </h2>
            <p className="max-w-md text-sm font-medium leading-relaxed text-sub sm:text-base">
              Websites, custom software, and marketing for businesses that need reliable delivery and clear reporting.
            </p>
            <div className="space-y-3 text-sm font-medium text-sub">
              <p className="flex items-center gap-3">
                <Mail size={16} className="shrink-0 text-accent" />
                <a href={`mailto:${siteContent.email}`} className="font-bold text-ink hover:text-accent">
                  {siteContent.email}
                </a>
              </p>
              <p className="flex items-center gap-3">
                <Phone size={16} className="shrink-0 text-accent" />
                <a href={`tel:${siteContent.phone.replace(/[^0-9+]/g, "")}`} className="font-bold text-ink hover:text-accent">
                  {siteContent.phone}
                </a>
              </p>
              <p className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-accent" />
                <span>{siteContent.address}</span>
              </p>
            </div>
            <button type="button" onClick={() => onOpenConsultation?.()} className="btn-primary group">
              <span>Request a callback</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="lg:col-span-7">
            <div className="glass-card rounded-[2rem] p-6 sm:p-8">
              {submitted ? (
                <div className="space-y-4 py-10 text-center">
                  <div className="glass-pill mx-auto flex h-16 w-16 items-center justify-center">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="text-2xl font-extrabold">Thank you, {name}</h3>
                  <p className="mx-auto max-w-md text-sm font-medium leading-relaxed text-sub">
                    We received your enquiry and will reply to {email} within 4 business hours.
                  </p>
                  <button type="button" onClick={() => setSubmitted(false)} className="btn-secondary px-6 py-3 text-xs">
                    Send another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="text-xl font-extrabold tracking-tight">Get a project estimate</h3>
                    <p className="mt-1 text-sm font-medium text-sub">Share your details. No commitment required.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="footer-name" className="text-xs font-bold uppercase tracking-wide text-faint">
                        Full name
                      </label>
                      <input
                        id="footer-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="input-dark text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="footer-email" className="text-xs font-bold uppercase tracking-wide text-faint">
                        Work email
                      </label>
                      <input
                        id="footer-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="input-dark text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="footer-interest" className="text-xs font-bold uppercase tracking-wide text-faint">
                      Service needed
                    </label>
                    <select
                      id="footer-interest"
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      className="input-dark cursor-pointer appearance-none text-sm"
                    >
                      {serviceLinks.map((s) => (
                        <option key={s.label} value={s.label}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-sm">
                    {loading ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    ) : (
                      <>
                        <span>Request estimate</span>
                        <Send size={15} />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs font-medium text-faint">{siteContent.responseGuarantee}</p>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 border-t border-line pt-10 text-sm md:grid-cols-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-faint">Services</h4>
            <ul className="space-y-2 font-medium text-sub">
              {serviceLinks.slice(0, 4).map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="hover:text-accent">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-faint">More services</h4>
            <ul className="space-y-2 font-medium text-sub">
              {serviceLinks.slice(4).map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="hover:text-accent">
                    {s.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services/crm" className="hover:text-accent">
                  CRM development
                </Link>
              </li>
              <li>
                <Link href="/services/video-production" className="hover:text-accent">
                  Video production
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-faint">Company</h4>
            <ul className="space-y-2 font-medium text-sub">
              {companyLinks.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="hover:text-accent">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-faint">Contact</h4>
            <p className="font-medium leading-relaxed text-sub">{siteContent.address}</p>
            <p className="text-xs font-medium text-faint">Mon to Sat, 9:00 AM to 8:00 PM IST</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs font-medium text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Skora. All rights reserved.</p>
          <p>NDA available on request. Your information stays private.</p>
        </div>
      </div>
    </footer>
  );
}
