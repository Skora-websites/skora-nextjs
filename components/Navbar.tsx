"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteContent } from "@/context/SiteContentContext";
import Overlay from "@/components/animation/Overlay";
import { gsap, prefersReducedMotion, CINEMA } from "@/lib/gsap";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  ChevronDown,
  Globe2,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  X,
  ArrowLeft,
} from "lucide-react";
import { SERVICES } from "@/lib/services";

/** Nav presentation of the shared service list — one edit in lib/services.ts updates every surface. */
const services = SERVICES.map((service) => ({
  name: service.navName,
  icon: service.icon,
  link: `/services/${service.slug}`,
  desc: service.navDesc,
}));

const inputClass = "input-dark";
const labelClass = "ml-1 text-xs font-bold uppercase tracking-wide text-sub";

interface NavbarProps {
  onOpenConsultation?: (topic?: string) => void;
}

export default function Navbar({ onOpenConsultation }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);
  const hiddenRef = useRef(false);

  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isHomePage = pathname === "/";
  const isHealthcarePage = pathname === "/healthcare";
  const isServicesPage = pathname.startsWith("/services");
  // Transparent at the very top of the landing page, white glass once scrolled.
  const isTransparentNav = isLandingPage && !isScrolled;

  const textClass = isTransparentNav
    ? "text-ink/80 hover:text-accent"
    : "text-ink/80 hover:text-accent";
  const headerBgClass = isTransparentNav
    ? "bg-transparent border-transparent"
    : "bg-white/85 backdrop-blur-xl border-line shadow-[0_1px_2px_rgba(11,18,32,0.04)]";

  const siteContent = useSiteContent();
  const whatsappNumber = (siteContent.phone || "+447756083473").replace(/[^0-9]/g, "");
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi Skora Analytics Team, I would like to discuss my digital and technology requirements."
  )}`;

  // Scroll state for the white-glass treatment, plus the cinematic
  // hide-on-scroll-down / reveal-on-scroll-up header.
  const overlayOpen = isServicesOpen || mobileMenuOpen || isAuditOpen;
  useEffect(() => {
    const header = headerRef.current;
    const handleScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 20);
      if (!header || prefersReducedMotion()) return;

      const delta = y - lastY.current;
      lastY.current = y;
      // Never tuck the bar away while a menu/modal is open or at the very top.
      if (overlayOpen || y < 80) {
        if (hiddenRef.current) {
          hiddenRef.current = false;
          gsap.to(header, { yPercent: 0, duration: 0.45, ease: CINEMA.enter, overwrite: true });
        }
        return;
      }
      if (delta > 6 && !hiddenRef.current) {
        hiddenRef.current = true;
        gsap.to(header, { yPercent: -105, duration: 0.4, ease: CINEMA.exit, overwrite: true });
      } else if (delta < -6 && hiddenRef.current) {
        hiddenRef.current = false;
        gsap.to(header, { yPercent: 0, duration: 0.45, ease: CINEMA.enter, overwrite: true });
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [overlayOpen]);

  // Reset menus on navigation via render-phase adjustment (no effect needed).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    if (mobileMenuOpen) setMobileMenuOpen(false);
    if (isServicesOpen) setIsServicesOpen(false);
  }

  const closeAudit = () => setIsAuditOpen(false);
  const closeServices = () => setIsServicesOpen(false);

  useEffect(() => {
    if (isServicesOpen || mobileMenuOpen || isAuditOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isServicesOpen, mobileMenuOpen, isAuditOpen]);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-[100] border-b transition-[background-color,border-color,box-shadow] duration-300 ${headerBgClass}`}
      >
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Skora Logo -> Redirects to Landing Page (/) */}
<Link
  href="/"
  className="relative z-50 flex items-center transition-colors duration-300"
>
  <img 
    src="/skora-logo.png" 
    alt="Skora Infotech Logo" 
    className="h-10 w-auto" 
  />
</Link>
            <nav className="hidden h-full items-center gap-8 lg:flex">
              {/* Home Link -> Highlighted if on / */}
              <Link
                href="/"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${
                  isHomePage ? "text-accent font-extrabold" : textClass
                }`}
              >
                <span>Home</span>
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left rounded-full bg-accent transition-transform duration-300 ease-out ${
                    isHomePage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>

              {/* Services Dropdown */}
              <button
                type="button"
                onClick={() => setIsServicesOpen(true)}
                className={`group relative flex h-full cursor-pointer items-center text-[15px] font-semibold transition-colors duration-300 gap-1 ${
                  isServicesPage ? "text-accent font-extrabold" : textClass
                }`}
              >
                <span>Services</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${
                    isServicesOpen ? "rotate-180" : ""
                  }`}
                />
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left rounded-full bg-accent transition-transform duration-300 ease-out ${
                    isServicesPage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>

              {/* Healthcare link (emerald reserved for healthcare content) */}
              <Link
                href="/healthcare"
                className={`group relative flex h-full items-center gap-1.5 text-[15px] font-semibold transition-colors duration-300 ${
                  isHealthcarePage
                    ? "text-emerald-700 font-extrabold"
                    : "text-emerald-700/80 hover:text-emerald-700"
                }`}
              >
                <Activity size={16} className="text-emerald-600" />
                <span>Healthcare</span>
                {isHealthcarePage && (
                  <span className="ml-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                    You are here
                  </span>
                )}
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left rounded-full bg-emerald-500 transition-transform duration-300 ease-out ${
                    isHealthcarePage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>

              <Link
                href="/blog"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${
                  pathname.startsWith("/blog") ? "text-accent font-extrabold" : textClass
                }`}
              >
                <span>Blog</span>
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left rounded-full bg-accent transition-transform duration-300 ease-out ${
                    pathname.startsWith("/blog") ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>

              <Link
                href="/contact"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${
                  pathname === "/contact" ? "text-accent font-extrabold" : textClass
                }`}
              >
                <span>Contact</span>
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left rounded-full bg-accent transition-transform duration-300 ease-out ${
                    pathname === "/contact" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            </nav>

            <div className="hidden items-center gap-3 lg:flex">
              <button
                type="button"
                onClick={() => setIsAuditOpen(true)}
                className="link-fill px-1 py-2 text-[14px] font-bold text-ink"
              >
                Free audit
              </button>

              <button
                type="button"
                onClick={() => onOpenConsultation?.()}
                className="btn-primary group rounded-full px-6 py-2.5 text-[14px]"
              >
                <span>Start a project</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <button
              type="button"
              className={`relative z-50 rounded-xl p-2 transition cursor-pointer lg:hidden border ${
                isTransparentNav
                  ? "border-line bg-white/70 text-ink hover:bg-surface"
                  : "border-line bg-white text-ink hover:bg-elevated"
              }`}
              onClick={() => setMobileMenuOpen((current) => !current)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* FULL-SCREEN SERVICES MEGA-MENU — white glass */}
      <Overlay
        open={isServicesOpen}
        duration={0.45}
        frame={{ enter: { opacity: 0, y: -32 }, exit: { opacity: 0, y: -32 } }}
        itemSelector="[data-service-card]"
        className="fixed inset-0 z-[1000] flex flex-col overflow-y-auto bg-white/95 backdrop-blur-2xl px-4 py-6 sm:p-8 text-ink"
      >
            <div className="flex w-full items-center justify-between mx-auto max-w-[90rem]">
              <button
                onClick={closeServices}
                className="btn-secondary px-4 py-2 text-xs"
              >
                <ArrowLeft size={16} className="text-accent" />
                <span>Return to Previous Page</span>
              </button>

              <button
                onClick={closeServices}
                aria-label="Close services menu"
                className="btn-icon-ghost flex h-11 w-11 items-center justify-center rounded-full glass-card transition hover:rotate-90 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-grow flex flex-col justify-center mx-auto w-full max-w-[90rem] py-12">
              <div className="mb-10 flex flex-col gap-5 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
                <div className="text-center lg:text-left">
                  <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                    Our{" "}
                    <span className="text-gradient">
                      Expertise
                    </span>
                  </h2>
                  <p className="mt-4 text-lg text-sub font-medium">
                    Select a division to explore our capabilities.
                  </p>
                </div>
                <Link
                  href="/services"
                  onClick={closeServices}
                  className="group inline-flex items-center gap-2 self-center rounded-xl border border-line bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-ink transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent lg:self-auto"
                >
                  All services overview
                  <ArrowRight
                    size={15}
                    className="text-accent transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 lg:grid-cols-3">
                {services.map((item) => (
                  <div key={item.name} data-service-card>
                    <Link
                      href={item.link}
                      onClick={closeServices}
                      className="group flex h-full flex-col gap-4 rounded-2xl border border-line bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_16px_36px_-16px_rgba(37,99,235,0.25)] cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                          <item.icon size={24} />
                        </div>
                        <ArrowRight
                          size={18}
                          className="text-faint transition-all group-hover:translate-x-1 group-hover:text-accent"
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-ink mb-1">{item.name}</h3>
                        <p className="text-sub text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
      </Overlay>

      {/* MOBILE MENU — white */}
      <Overlay
        open={mobileMenuOpen}
        duration={0.4}
        frame={{ enter: { opacity: 0, x: "100%" }, exit: { opacity: 0, x: "100%" } }}
        className="fixed inset-0 z-40 bg-white overflow-y-auto lg:hidden"
      >
            <div className="flex flex-col pt-24 px-6 pb-12 min-h-screen">
              <div className="flex flex-col gap-6 flex-grow">
                <Link
                  href="/"
                  className={`border-b border-line pb-4 text-xl font-bold ${
                    isHomePage ? "text-accent font-extrabold" : "text-ink"
                  }`}
                >
                  Home {isHomePage && "●"}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsServicesOpen(true);
                  }}
                  className="flex w-full justify-between items-center border-b border-line pb-4 text-xl font-bold text-ink cursor-pointer"
                >
                  Services <ArrowRight size={20} className="text-accent" />
                </button>
                <Link
                  href="/healthcare"
                  className={`flex items-center gap-3 text-lg font-bold ${
                    isHealthcarePage ? "text-emerald-600 font-extrabold" : "text-emerald-600/80"
                  }`}
                >
                  <div className="p-2 rounded bg-emerald-500/10">
                    <Activity size={20} />
                  </div>{" "}
                  Healthcare IT {isHealthcarePage && "●"}
                </Link>
                <Link
                  href="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`border-b border-line pb-4 text-xl font-bold ${
                    pathname.startsWith("/blog") ? "text-accent font-extrabold" : "text-ink"
                  }`}
                >
                  Blog {pathname.startsWith("/blog") && "●"}
                </Link>
                <button
                  onClick={() => onOpenConsultation?.()}
                  className="border-b border-line pb-4 text-xl font-bold text-ink text-left mt-2"
                >
                  Contact
                </button>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAuditOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="btn-secondary w-full py-4"
                >
                  <ShieldCheck size={18} /> Request Free Audit
                </button>
                <button
                  onClick={() => onOpenConsultation?.()}
                  className="btn-primary w-full py-4"
                >
                  <span>Start Project</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
      </Overlay>

      {/* FREE AUDIT MODAL — white card on soft scrim */}
      <Overlay
        open={isAuditOpen}
        duration={0.35}
        frame={{ enter: { opacity: 0 }, exit: { opacity: 0 } }}
        panel={{
          enter: { opacity: 0, scale: 0.97, y: 14 },
          exit: { opacity: 0, scale: 0.97, y: 14 },
        }}
        className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
            <div
              onClick={closeAudit}
              className="absolute inset-0 cursor-pointer bg-scrim backdrop-blur-sm"
            />
            <div
              data-overlay-panel
              className="relative z-10 my-auto flex max-h-[85vh] sm:max-h-[88vh] w-full max-w-2xl flex-col overflow-y-auto rounded-3xl glass-card shadow-2xl"
            >
              {/* Top Navigation Bar inside Modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-line">
                <button
                  type="button"
                  onClick={closeAudit}
                  className="btn-secondary px-3.5 py-1.5 text-xs"
                >
                  <ArrowLeft size={16} className="text-accent" />
                  <span>Return to Previous Page</span>
                </button>

                <button
                  type="button"
                  onClick={closeAudit}
                  aria-label="Close audit modal"
                  className="btn-icon-ghost flex h-9 w-9 items-center justify-center rounded-xl bg-elevated transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="border-b border-line px-7 py-6 sm:px-9">
                <div className="mb-3">
                  <span className="glass-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest">
                    <CalendarClock size={14} /> 30-minute consultation
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                  Get Your Free Skora Audit
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-sub font-medium">
                  Our Analytics Team will review your digital presence, technology stack, performance, security, and scalability priorities.
                </p>
              </div>
              <form
                className="space-y-6 p-7 sm:p-9"
                onSubmit={(event) => {
                  event.preventDefault();
                  alert("Audit request submitted. Our Analytics Team will be in touch shortly.");
                  closeAudit();
                }}
              >
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="audit-name" className={labelClass}>
                      Full Name
                    </label>
                    <input
                      id="audit-name"
                      name="name"
                      type="text"
                      required
                      className={inputClass}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="audit-email" className={labelClass}>
                      Work Email
                    </label>
                    <input
                      id="audit-email"
                      name="email"
                      type="email"
                      required
                      className={inputClass}
                      placeholder="john@company.com"
                    />
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="audit-phone" className={labelClass}>
                      WhatsApp / Phone
                    </label>
                    <div className="relative">
                      <Phone
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
                      />
                      <input
                        id="audit-phone"
                        name="phone"
                        type="tel"
                        required
                        className={`${inputClass} pl-10`}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="audit-service" className={labelClass}>
                      Service Needed <span className="normal-case text-faint">(Optional)</span>
                    </label>
                    <div className="relative">
                      <BriefcaseBusiness
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
                      />
                      <select
                        id="audit-service"
                        name="service"
                        className={`${inputClass} appearance-none pl-10`}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select a service
                        </option>
                        <option>Custom Enterprise Software</option>
                        <option>Healthcare IT & EHR Solutions</option>
                        <option>Cloud Architecture & Migration</option>
                        <option>UI / UX & Product Design</option>
                        <option>Mobile Applications</option>
                        <option>Branding & Digital Experience</option>
                        <option>Video Production</option>
                        <option>Not sure — I need guidance</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label htmlFor="audit-website" className={labelClass}>
                    Company Website <span className="normal-case text-faint">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Globe2
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-faint"
                    />
                    <input
                      id="audit-website"
                      name="website"
                      type="url"
                      className={`${inputClass} pl-10`}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-primary group w-full py-4 text-[15px]"
                >
                  Request My Free Skora Audit{" "}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
                <div className="flex flex-col items-center gap-2 border-t border-line pt-6 text-center sm:flex-row sm:justify-center">
                  <span className="text-sm text-sub">Prefer WhatsApp?</span>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 transition hover:text-emerald-700 cursor-pointer"
                  >
                    <MessageCircle size={17} /> Chat with our Analytics Team now
                  </a>
                </div>
              </form>
            </div>
      </Overlay>
    </>
  );
}
