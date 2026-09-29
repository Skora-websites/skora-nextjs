"use client";

import React, { useState } from "react";
import Footer from "@/components/Footer";
import Reveal from "@/components/animation/Reveal";
import SectionHeader from "@/components/landing/SectionHeader";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";
import { useConsultation } from "@/context/ConsultationContext";
import { SERVICES } from "@/lib/services";
import { CONTACT_FAQ } from "@/lib/faq";

/** Service picker reads from the shared list — never a hand-copied array. */
const SERVICE_OPTIONS = SERVICES.map((s) => s.pill);

/** Same budget ladder the consultation modal offers, plus an "unsure" escape. */
const BUDGET_OPTIONS = [
  "Under ₹25,000",
  "₹25,000 - ₹50,000",
  "₹50,000 - ₹1,50,000",
  "₹1,50,000+ Enterprise",
  "Not sure yet",
];

/**
 * The whole /contact body. Split out of the route so the page itself can be a
 * server component and export metadata + FAQPage JSON-LD.
 */
export default function ContactView() {
  const siteContent = useSiteContent();
  const { openConsultation } = useConsultation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [service, setService] = useState(SERVICE_OPTIONS[0]);
  const [budget, setBudget] = useState(BUDGET_OPTIONS[BUDGET_OPTIONS.length - 1]);
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — humans leave it empty
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          phone,
          company,
          service,
          budget,
          message,
          source: "Contact page form",
          website,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(
          data?.error ||
            "We couldn't send your message. Please email us directly and we'll reply within 4 business hours."
        );
        return;
      }

      setSubmitted(true);
    } catch {
      setError(
        "We couldn't reach the server. Check your connection and try again, or email us directly."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-main font-sans text-ink">
      {/* Hero */}
      <section className="relative overflow-hidden bg-paper pb-12 pt-32 sm:pt-36">
        <div
          className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]"
          aria-hidden="true"
        />
        <div className="section-wrap relative">
          <Reveal variant="blur" className="mx-auto max-w-3xl space-y-5 text-center">
            <span className="kicker justify-center">Contact Skora</span>
            <h1 className="display-hero text-5xl sm:text-7xl">
              Tell us about <span className="display-accent text-accent">your project.</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-sub sm:text-lg">
              Share your goals and timeline. We reply within 4 business hours with next steps and a
              fixed estimate.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Direct lines + form */}
      <section className="section-wrap grid grid-cols-1 items-start gap-6 pb-20 lg:grid-cols-12">
        <div className="space-y-7 rounded-[2rem] bg-ink-deep p-7 text-white sm:p-8 lg:col-span-5">
          <div>
            <span className="kicker !text-white/60">Direct lines</span>
            <h2 className="display-hero mt-3 text-3xl text-white">
              Talk to <span className="display-accent">us.</span>
            </h2>
          </div>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white">
                <Mail size={19} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-white/60">Email</p>
                <a
                  href={`mailto:${siteContent.email}`}
                  className="mt-0.5 block text-base font-bold text-white hover:text-accent"
                >
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
                <p className="text-xs font-bold uppercase tracking-wide text-white/60">
                  Phone and WhatsApp
                </p>
                <a
                  href={`tel:${siteContent.phone.replace(/[^0-9+]/g, "")}`}
                  className="mt-0.5 block text-base font-bold text-white hover:text-accent"
                >
                  {siteContent.phone}
                </a>
                <p className="text-xs font-medium text-white/50">
                  Mon to Sat, 9:00 AM to 8:00 PM IST
                </p>
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
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn-secondary px-8 py-3 text-xs"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-2xl font-extrabold tracking-tight">Project brief</h2>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4"
                >
                  <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600" />
                  <div className="space-y-1.5">
                    <p className="text-sm font-extrabold text-red-700">
                      Your message was not sent
                    </p>
                    <p className="text-sm font-medium leading-relaxed text-red-700/85">{error}</p>
                    <p className="text-sm font-medium text-red-700/85">
                      <a
                        href={`mailto:${siteContent.email}?subject=${encodeURIComponent(
                          "Project enquiry"
                        )}`}
                        className="font-bold underline"
                      >
                        Email us instead
                      </a>{" "}
                      — we still reply within 4 business hours.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-name"
                    className="text-xs font-bold uppercase tracking-wide text-faint"
                  >
                    Full name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your name"
                    className="input-dark text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className="text-xs font-bold uppercase tracking-wide text-faint"
                  >
                    Work email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input-dark text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-phone"
                    className="text-xs font-bold uppercase tracking-wide text-faint"
                  >
                    Phone (optional)
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+44 7700 900000"
                    className="input-dark text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-company"
                    className="text-xs font-bold uppercase tracking-wide text-faint"
                  >
                    Company
                  </label>
                  <input
                    id="contact-company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company name"
                    className="input-dark text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-service"
                    className="text-xs font-bold uppercase tracking-wide text-faint"
                  >
                    Service needed
                  </label>
                  <select
                    id="contact-service"
                    name="service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="input-dark cursor-pointer appearance-none text-sm"
                  >
                    {SERVICE_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-budget"
                    className="text-xs font-bold uppercase tracking-wide text-faint"
                  >
                    Budget range
                  </label>
                  <select
                    id="contact-budget"
                    name="budget"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="input-dark cursor-pointer appearance-none text-sm"
                  >
                    {BUDGET_OPTIONS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-message"
                  className="text-xs font-bold uppercase tracking-wide text-faint"
                >
                  Requirements and timeline
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What do you need, and when do you need it?"
                  className="input-dark resize-none text-sm"
                />
              </div>

              {/* Honeypot — hidden from people, tempting to bots */}
              <div className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
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

      {/* FAQ */}
      <section className="border-t border-line bg-paper py-16 sm:py-20">
        <div className="section-wrap">
          <SectionHeader
            badge="Before you write"
            title={
              <>
                Questions we <span className="display-accent text-accent">hear often.</span>
              </>
            }
          />
          <Reveal
            variant="fade-up"
            className="max-w-3xl space-y-3"
            staggerSelector="[data-faq]"
            stagger={0.07}
          >
            {CONTACT_FAQ.map((item) => (
              <details
                key={item.question}
                data-faq
                className="group rounded-2xl border border-line bg-surface px-6 py-4 transition-colors open:border-accent/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-extrabold text-ink [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <ChevronDown
                    size={16}
                    className="shrink-0 text-accent transition-transform group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="pt-3 text-sm font-medium leading-relaxed text-sub">{item.answer}</p>
              </details>
            ))}
          </Reveal>
        </div>
      </section>

      <Footer onOpenConsultation={() => openConsultation("General enquiry")} />
    </main>
  );
}
