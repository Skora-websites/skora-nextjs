"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { prefersReducedMotion } from "@/lib/gsap";
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

/** Index number + title + trailing arrow: one link row in the footer index. */
function FootColumn({
  index,
  title,
  href,
  items,
  children,
}: {
  index: string;
  title: string;
  href?: string;
  items?: { label: string; href: string }[];
  children?: React.ReactNode;
}) {
  return (
    <div data-foot-col className="group/col">
      <div className="flex items-baseline gap-2 border-b border-line pb-3 transition-colors duration-300 group-hover/col:border-accent/50">
        <span className="text-[10px] font-black tracking-[0.18em] text-accent">{index}</span>
        {href ? (
          <Link
            href={href}
            className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink transition-colors hover:text-accent"
          >
            {title}
          </Link>
        ) : (
          <h4 className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink">{title}</h4>
        )}
      </div>
      {items && (
        <ul className="mt-3 space-y-0.5">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group/i flex items-center justify-between gap-3 py-1.5 text-sm font-medium text-sub transition-colors hover:text-ink"
              >
                <span className="transition-transform duration-300 group-hover/i:translate-x-1">
                  {item.label}
                </span>
                <ArrowRight
                  size={13}
                  aria-hidden="true"
                  className="shrink-0 -translate-x-1.5 text-accent opacity-0 transition-all duration-300 group-hover/i:translate-x-0 group-hover/i:opacity-100"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
      {children && <div className="mt-4 space-y-3 text-sm">{children}</div>}
    </div>
  );
}

export default function Footer({ onOpenConsultation }: FooterProps) {
  const siteContent = useSiteContent();
  const { openConsultation } = useConsultation();

  // Profiles are maintained at /admin/seo; the row hides itself while empty.
  const socialLinks = resolveSocialLinks(siteContent.seo?.socials);

  const requestCallback = () => {
    if (onOpenConsultation) onOpenConsultation();
    else openConsultation();
  };

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
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

  const serviceItems = serviceColumns.map((column) =>
    column.map((s) => ({ label: s.pill, href: `/services/${s.slug}` }))
  );

  return (
    <footer className="relative overflow-hidden border-t border-line bg-surface text-ink">
      {/* One off-centre halo so the statement row sits in light, not on a slab. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[440px]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 55% 100% at 50% 0%, rgba(37, 99, 235, 0.08) 0%, rgba(255,255,255,0) 72%)",
        }}
        aria-hidden="true"
      />

      <div className="section-wrap relative pb-8 pt-16 sm:pt-24">
        {/* ── Statement + direct lines ───────────────────────────── */}
        <div className="grid grid-cols-1 gap-y-12 lg:grid-cols-12 lg:gap-x-16">
          <Reveal variant="fade-up" className="lg:col-span-7">
            <Link href="/" className="inline-flex items-baseline gap-2" aria-label="Skora home">
              <span className="text-2xl font-extrabold tracking-tighter">
                SKORA<span className="text-accent">.</span>
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.28em] text-faint">
                Studio
              </span>
            </Link>

            <div className="mt-8">
              <span className="kicker">Start a project</span>
            </div>
            <SplitHeading
              as="h2"
              className="display-hero mt-5 max-w-2xl text-5xl sm:text-6xl lg:text-7xl"
            >
              Let&apos;s build{" "}
              <span className="display-accent whitespace-nowrap text-accent">it right.</span>
            </SplitHeading>
            <p className="mt-6 max-w-lg text-sm font-medium leading-relaxed text-sub sm:text-base">
              Websites, custom software, and marketing for businesses that need reliable delivery
              and clear reporting.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button type="button" onClick={requestCallback} className="btn-primary sheen group">
                <span>Request a callback</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <Link href="/contact" className="btn-secondary group">
                <span>Start a brief</span>
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </Link>
            </div>

            <p className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold text-sub">
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span
                  className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden"
                  aria-hidden="true"
                />
                <span className="relative h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
              </span>
              Available for new projects
              <span className="hidden h-3 w-px bg-line sm:block" aria-hidden="true" />
              <span className="font-medium text-faint">{siteContent.responseGuarantee}</span>
            </p>
          </Reveal>

          <Reveal variant="fade-right" delay={0.12} className="lg:col-span-5">
            <span className="scene-marker">Direct lines</span>

            {/* Hairline rows instead of a card inside a card — each line is
                itself the hit area, with the arrow confirming where it goes. */}
            <div className="mt-6 border-t border-line">
              {contactTiles.map((tile) => (
                <a
                  key={tile.label}
                  href={tile.href}
                  {...(tile.external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
                  className="group flex items-center justify-between gap-4 border-b border-line py-4 transition-colors duration-300 hover:border-accent/40"
                >
                  <span className="flex min-w-0 items-center gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-line bg-elevated text-ink transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                      <tile.icon size={17} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[10px] font-black uppercase tracking-[0.18em] text-faint">
                        {tile.label}
                      </span>
                      <span className="block truncate text-sm font-bold text-ink transition-colors group-hover:text-accent">
                        {tile.value}
                      </span>
                    </span>
                  </span>
                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                    className="shrink-0 -translate-x-1.5 text-accent opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                  />
                </a>
              ))}
            </div>

            <p className="mt-4 flex items-center gap-2 text-xs font-medium text-faint">
              <Clock size={14} className="shrink-0 text-accent" aria-hidden="true" />
              NDA available on request. Your information stays private.
            </p>

            {socialLinks.length > 0 && (
              <div className="mt-6 flex items-center gap-2.5">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-line text-sub transition-all duration-300 hover:-translate-y-0.5 hover:border-accent hover:bg-accent hover:text-white"
                  >
                    <social.icon size={17} aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </Reveal>
        </div>

        {/* ── Link index — every service is reachable from here ──── */}
        <Reveal
          variant="fade-up"
          duration={0.8}
          className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-line pt-10 sm:mt-20 md:grid-cols-4"
          staggerSelector="[data-foot-col]"
          stagger={0.1}
        >
          <FootColumn index="01" title="Services" href="/services" items={serviceItems[0]} />
          <FootColumn index="02" title="More services" items={serviceItems[1]} />
          <FootColumn index="03" title="Company" items={companyLinks} />
          <FootColumn index="04" title="Contact">
            <p className="flex items-start gap-2 font-medium leading-relaxed text-sub">
              <MapPin size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <span>{siteContent.address}</span>
            </p>
            <p className="flex items-start gap-2 font-medium text-sub">
              <Clock size={15} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
              <span>Mon to Sat, 9:00 AM to 8:00 PM IST</span>
            </p>
          </FootColumn>
        </Reveal>

        {/* ── End-credits wordmark — letterboxed by the film gate ── */}
        <div className="frame-rule mt-16 py-6 sm:mt-20">
          <div className="flex items-center justify-between gap-6 px-1">
            <span className="scene-marker">Digital studio</span>
            <span className="hidden text-[10px] font-extrabold uppercase tracking-[0.3em] text-faint sm:block">
              Web · Software · Marketing
            </span>
          </div>
          <div className="mt-4 overflow-hidden" aria-hidden="true">
            <span className="ghost-numeral block translate-y-[26%] select-none text-center text-[15vw]">
              SKORA
            </span>
          </div>
        </div>

        {/* ── Legal bar — the frame-rule above is the divider ────── */}
        <div className="flex flex-col items-center justify-between gap-4 pt-6 text-xs font-medium text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} Skora. All rights reserved.</p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/privacy" className="transition-colors hover:text-accent">
              Privacy policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-accent">
              Terms and conditions
            </Link>
            <span className="h-3 w-px bg-line" aria-hidden="true" />
            <button
              type="button"
              onClick={backToTop}
              className="group flex items-center gap-1.5 transition-colors hover:text-accent"
            >
              Back to top
              <ArrowUp
                size={12}
                aria-hidden="true"
                className="transition-transform group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
