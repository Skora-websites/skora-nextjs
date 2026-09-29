"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSiteContent } from "@/context/SiteContentContext";
import { useConsultation } from "@/context/ConsultationContext";
import Reveal from "@/components/animation/Reveal";
import SplitHeading from "@/components/animation/SplitHeading";
import { SERVICES } from "@/lib/services";
import { resolveSocialLinks } from "@/lib/socials";

interface FooterProps {
  /**
   * Optional override for pages that pre-select a topic (service pages).
   * Without it the site-wide consultation modal opens instead — previously
   * the button was a no-op on any page that passed nothing.
   */
  onOpenConsultation?: (topic?: string) => void;
}

/** All nine services, split across two columns so no column runs long. */
const serviceColumns = [SERVICES.slice(0, 5), SERVICES.slice(5)];

const companyLinks = [
  { label: "Home", href: "/" },
  { label: "Healthcare", href: "/healthcare" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Terms and conditions", href: "/terms" },
];

export default function Footer({ onOpenConsultation }: FooterProps) {
  const siteContent = useSiteContent();
  const { openConsultation } = useConsultation();

  // Profiles are maintained at /admin/seo; the row hides itself while empty.
  const socialLinks = resolveSocialLinks(siteContent.seo?.socials);

  const requestCallback = () => {
    if (onOpenConsultation) onOpenConsultation();
    else openConsultation();
  };

  const whatsappNumber = (siteContent.phone || "+447756083473").replace(/[^0-9]/g, "");
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi Skora team, I would like to discuss my requirements."
  )}`;
  const telHref = `tel:${siteContent.phone.replace(/[^0-9+]/g, "")}`;

  const contactTiles = [
    {
      label: "Email",
      value: siteContent.email,
      href: `mailto:${siteContent.email}`,
      icon: Mail,
      external: false,
    },
    {
      label: "WhatsApp",
      value: "Chat with the team",
      href: whatsappHref,
      icon: MessageCircle,
      external: true,
    },
    {
      label: "Call",
      value: siteContent.phone,
      href: telHref,
      icon: Phone,
      external: false,
    },
  ];

  return (
    <footer className="border-t border-line bg-surface text-ink">
      <div className="section-wrap space-y-14 py-16 sm:py-20">
        {/* Brand + contact card */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <Reveal variant="fade-up" className="space-y-6 lg:col-span-5">
            <Link href="/" className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tighter">
                SKORA<span className="text-accent">.</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-faint">
                Studio
              </span>
            </Link>
            <SplitHeading as="h2" className="display-hero max-w-md text-4xl sm:text-5xl">
              Let&apos;s build <span className="display-accent text-accent">it right.</span>
            </SplitHeading>
            <p className="max-w-md text-sm font-medium leading-relaxed text-sub sm:text-base">
              Websites, custom software, and marketing for businesses that need reliable delivery
              and clear reporting.
            </p>
            <button type="button" onClick={requestCallback} className="btn-primary group">
              <span>Request a callback</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </Reveal>

          <Reveal variant="zoom" delay={0.12} className="lg:col-span-7">
            <div className="glass-card h-full rounded-[2rem] p-6 sm:p-8">
              <span className="kicker">Get in touch</span>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight">Talk to the team</h3>
              <p className="mt-1 text-sm font-medium text-sub">
                {siteContent.responseGuarantee} · Mon to Sat, 9:00 AM to 8:00 PM IST
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {contactTiles.map((tile) => (
                  <a
                    key={tile.label}
                    href={tile.href}
                    {...(tile.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                    className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                      <tile.icon size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-faint">
                        {tile.label}
                      </span>
                      <span className="block truncate text-sm font-bold text-ink">{tile.value}</span>
                    </span>
                  </a>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                <p className="flex items-center gap-2 text-xs font-medium text-faint">
                  <Clock size={14} className="text-accent" aria-hidden="true" />
                  NDA available on request. Your information stays private.
                </p>
                {socialLinks.length > 0 && (
                  <div className="flex items-center gap-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={social.label}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-white text-sub transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                      >
                        <social.icon size={16} aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Link columns — every service is reachable from here */}
        <Reveal
          variant="fade-up"
          duration={0.8}
          className="grid grid-cols-2 gap-8 border-t border-line pt-10 text-sm md:grid-cols-4"
          staggerSelector="[data-foot-col]"
          stagger={0.1}
        >
          <div data-foot-col className="space-y-3">
            <Link
              href="/services"
              className="text-xs font-bold uppercase tracking-widest text-faint hover:text-accent"
            >
              Services
            </Link>
            <ul className="space-y-2 font-medium text-sub">
              {serviceColumns[0].map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="hover:text-accent">
                    {s.pill}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-foot-col className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-faint">
              More services
            </h4>
            <ul className="space-y-2 font-medium text-sub">
              {serviceColumns[1].map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="hover:text-accent">
                    {s.pill}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div data-foot-col className="space-y-3">
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

          <div data-foot-col className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-faint">Contact</h4>
            <p className="flex items-start gap-2 font-medium leading-relaxed text-sub">
              <MapPin size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <span>{siteContent.address}</span>
            </p>
            <p className="text-xs font-medium text-faint">Mon to Sat, 9:00 AM to 8:00 PM IST</p>
          </div>
        </Reveal>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs font-medium text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Skora. All rights reserved.</p>
          <p>NDA available on request. Your information stays private.</p>
        </div>
      </div>
    </footer>
  );
}
