"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSiteContent } from "@/context/SiteContentContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  ChevronDown,
  Code,
  Globe2,
  Menu,
  MessageCircle,
  PenTool,
  Phone,
  ShieldCheck,
  Video,
  X,
  ArrowLeft,
} from "lucide-react";

const services = [
  {
    name: "Website Design & Engineering",
    icon: Globe2,
    link: "/services/website-design",
    desc: "Bespoke Next.js, sub-second page speed & high-conversion UI.",
  },
  {
    name: "Digital Marketing & Local SEO",
    icon: Video,
    link: "/services/digital-marketing",
    desc: "Google Maps #1 ranking, Meta Ads & AI search optimization.",
  },
  {
    name: "Branding & Visual Identity",
    icon: PenTool,
    link: "/services/branding",
    desc: "Logo design, positioning & corporate visual style guides.",
  },
  {
    name: "Video Production & Reels",
    icon: BriefcaseBusiness,
    link: "/services/video-production",
    desc: "Commercial product videos, Instagram reels & executive intros.",
  },
  {
    name: "Mobile App Development",
    icon: Code,
    link: "/services/mobile-development",
    desc: "Native iOS & Android applications built for scale.",
  },
  {
    name: "Cloud Services & DevOps",
    icon: Activity,
    link: "/services/cloud-services",
    desc: "AWS/Azure migrations, 99.99% uptime & CI/CD pipelines.",
  },
  {
    name: "SaaS Platform Development",
    icon: Code,
    link: "/services/saas-development",
    desc: "Multi-tenant cloud SaaS & automated recurring billing.",
  },
  {
    name: "Custom CRM & Automations",
    icon: MessageCircle,
    link: "/services/crm",
    desc: "Lead pipeline sync & automated WhatsApp triggers.",
  },
  {
    name: "Project Management Systems",
    icon: CalendarClock,
    link: "/services/pms",
    desc: "Agile task workflows, Gantt charts & client approval portals.",
  },
];

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
  const whatsappNumber = (siteContent.phone || "+919217375835").replace(/[^0-9]/g, "");
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Hi Skora Analytics Team, I would like to discuss my digital and technology requirements."
  )}`;

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setIsServicesOpen(false);
  }, [pathname]);

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
      <header className={`fixed inset-x-0 top-0 z-[100] transition-all duration-300 border-b ${headerBgClass}`}>
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Skora Logo -> Redirects to Landing Page (/) */}
            <Link
              href="/"
              className={`relative z-50 flex items-center gap-1.5 text-2xl font-extrabold tracking-tight transition-colors duration-300 text-ink`}
            >
              Skora{" "}
              <span className="h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
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

              {/* Healthcare IT Link (emerald reserved for healthcare content) */}
              <Link
                href="/healthcare"
                className={`group relative flex h-full items-center gap-1.5 text-[15px] font-semibold transition-colors duration-300 ${
                  isHealthcarePage
                    ? "text-emerald-600 font-extrabold"
                    : "text-emerald-600/80 hover:text-emerald-600"
                }`}
              >
                <Activity
                  size={16}
                  className={isHealthcarePage ? "animate-spin text-emerald-600" : ""}
                />
                <span>Healthcare IT</span>
                {isHealthcarePage && (
                  <span className="ml-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-700">
                    ACTIVE
                  </span>
                )}
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left rounded-full bg-emerald-500 transition-transform duration-300 ease-out ${
                    isHealthcarePage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
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
                className="btn-secondary px-5 py-2.5 text-[14px]"
              >
                <ShieldCheck size={16} /> Free SKORA Audit
              </button>

              <button
                type="button"
                onClick={() => onOpenConsultation?.()}
                className="btn-primary group px-6 py-2.5 text-[14px]"
              >
                <span>Start Project</span>
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
      <AnimatePresence>
        {isServicesOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10 lg:mb-14 text-center lg:text-left"
              >
                <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                  Our{" "}
                  <span className="text-gradient">
                    Expertise
                  </span>
                </h2>
                <p className="mt-4 text-lg text-sub font-medium">
                  Select a division to explore our capabilities.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5 lg:grid-cols-3">
                {services.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05, duration: 0.4 }}
                  >
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
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE MENU — white */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* FREE AUDIT MODAL — white card on soft scrim */}
      <AnimatePresence>
        {isAuditOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAudit}
              className="absolute inset-0 cursor-pointer bg-scrim backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2 }}
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
