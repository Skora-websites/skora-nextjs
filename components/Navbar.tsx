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
    desc: "Bespoke Next.js, Sub-second Page Speed & High Conversion UI",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Digital Marketing & Local SEO",
    icon: Video,
    link: "/services/digital-marketing",
    desc: "Google Maps #1 Ranking, Meta Ads & AI Search Optimization",
    img: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Branding & Visual Identity",
    icon: PenTool,
    link: "/services/branding",
    desc: "Logo Design, Positioning & Corporate Visual Style Guides",
    img: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Video Production & Reels",
    icon: BriefcaseBusiness,
    link: "/services/video-production",
    desc: "Commercial Product Videos, Instagram Reels & Executive Intros",
    img: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Mobile App Development",
    icon: Code,
    link: "/services/mobile-development",
    desc: "Native iOS & Android Applications Built for Scale",
    img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Cloud Services & DevOps",
    icon: Activity,
    link: "/services/cloud-services",
    desc: "AWS/Azure Migrations, 99.99% Uptime & CI/CD Pipelines",
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "SaaS Platform Development",
    icon: Code,
    link: "/services/saas-development",
    desc: "Multi-Tenant Cloud SaaS & Automated Recurring Billing",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Custom CRM & Automations",
    icon: MessageCircle,
    link: "/services/crm",
    desc: "Lead Pipeline Sync & Automated WhatsApp Triggers",
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Project Management Systems",
    icon: CalendarClock,
    link: "/services/pms",
    desc: "Agile Task Workflows, Gantt Charts & Client Approval Portals",
    img: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=800&q=80",
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
  // Single dark behavior: transparent at the very top, dark glass once scrolled.
  const isTransparentNav = isLandingPage && !isScrolled;

  const textClass = isTransparentNav
    ? "text-white hover:text-accent-light"
    : "text-ink hover:text-accent-light";
  const logoTextClass = "text-white";
  const headerBgClass = isTransparentNav
    ? "bg-transparent border-transparent"
    : "glass-card border-b border-white/10";

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
              className={`relative z-50 flex items-center gap-1.5 text-2xl font-extrabold tracking-tight transition-colors duration-300 ${logoTextClass}`}
            >
              Skora{" "}
              <span className="h-2.5 w-2.5 rounded-full bg-glow shadow-[0_0_8px_#3b82f6]" />
            </Link>

            <nav className="hidden h-full items-center gap-8 lg:flex">
              {/* Home Link -> Highlighted if on / */}
              <Link
                href="/"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${
                  isHomePage ? "text-accent-light font-extrabold" : textClass
                }`}
              >
                <span>Home</span>
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-accent transition-transform duration-300 ease-out ${
                    isHomePage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>

              {/* Services Dropdown */}
              <button
                type="button"
                onClick={() => setIsServicesOpen(true)}
                className={`group relative flex h-full cursor-pointer items-center text-[15px] font-semibold transition-colors duration-300 gap-1 ${
                  isServicesPage ? "text-accent-light font-extrabold" : textClass
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
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-accent transition-transform duration-300 ease-out ${
                    isServicesPage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>

              {/* Healthcare IT Link (emerald reserved for healthcare content) */}
              <Link
                href="/healthcare"
                className={`group relative flex h-full items-center gap-1.5 text-[15px] font-semibold transition-colors duration-300 ${
                  isHealthcarePage
                    ? "text-emerald-400 font-extrabold"
                    : "text-emerald-300/90 hover:text-emerald-200"
                }`}
              >
                <Activity
                  size={16}
                  className={isHealthcarePage ? "animate-spin text-emerald-400" : ""}
                />
                <span>Healthcare IT</span>
                {isHealthcarePage && (
                  <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                    ACTIVE
                  </span>
                )}
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-emerald-400 transition-transform duration-300 ease-out ${
                    isHealthcarePage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>

              <Link
                href="/contact"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${
                  pathname === "/contact" ? "text-accent-light font-extrabold" : textClass
                }`}
              >
                <span>Contact</span>
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-accent transition-transform duration-300 ease-out ${
                    pathname === "/contact" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            </nav>

            <div className="hidden items-center gap-4 lg:flex">
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
                  ? "border-white/30 text-white hover:bg-white/10"
                  : "border-white/15 bg-white/5 text-ink hover:bg-white/10"
              }`}
              onClick={() => setMobileMenuOpen((current) => !current)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* FULL-SCREEN SERVICES MODAL — dark glass */}
      <AnimatePresence>
        {isServicesOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[1000] flex flex-col overflow-y-auto bg-main/95 backdrop-blur-2xl px-4 py-6 sm:p-8 text-ink"
          >
            <div className="flex w-full items-center justify-between mx-auto max-w-[90rem]">
              <button
                onClick={closeServices}
                className="btn-secondary px-4 py-2 text-xs"
              >
                <ArrowLeft size={16} className="text-accent-light" />
                <span>Return to Previous Page</span>
              </button>

              <button
                onClick={closeServices}
                className="flex h-11 w-11 items-center justify-center rounded-full glass-card text-ink transition hover:bg-white/10 hover:rotate-90 cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-grow flex flex-col justify-center mx-auto w-full max-w-[90rem] py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10 lg:mb-16 text-center lg:text-left"
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

              <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3">
                {services.map((item, idx) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.1, duration: 0.4 }}
                  >
                    <Link
                      href={item.link}
                      onClick={closeServices}
                      className="glass-card group relative flex h-[350px] lg:h-[420px] w-full flex-col justify-end overflow-hidden rounded-3xl transition-all duration-500 hover:-translate-y-2 hover:border-blue-500/40 cursor-pointer"
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05070E] via-[#05070E]/90 to-[#05070E]/40 transition-opacity group-hover:from-[#05070E]" />
                      <div className="relative z-10 p-8">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl glass-pill transition-colors group-hover:bg-accent group-hover:text-white group-hover:border-accent">
                          <item.icon size={28} />
                        </div>
                        <h3 className="text-2xl font-extrabold text-white mb-2">{item.name}</h3>
                        <p className="text-sub font-medium mb-6 text-sm leading-relaxed">{item.desc}</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-accent-light">
                          <span>Explore Division</span>
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-2"
                          />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MOBILE MENU — dark glass */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-40 bg-main overflow-y-auto lg:hidden"
          >
            <div className="flex flex-col pt-24 px-6 pb-12 min-h-screen">
              <div className="flex flex-col gap-6 flex-grow">
                <Link
                  href="/"
                  className={`border-b border-white/10 pb-4 text-xl font-bold ${
                    isHomePage ? "text-accent-light font-extrabold" : "text-ink"
                  }`}
                >
                  Home {isHomePage && "●"}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsServicesOpen(true);
                  }}
                  className="flex w-full justify-between items-center border-b border-white/10 pb-4 text-xl font-bold text-ink cursor-pointer"
                >
                  Services <ArrowRight size={20} className="text-accent-light" />
                </button>
                <Link
                  href="/healthcare"
                  className={`flex items-center gap-3 text-lg font-bold ${
                    isHealthcarePage ? "text-emerald-400 font-extrabold" : "text-emerald-300/90"
                  }`}
                >
                  <div className="p-2 rounded bg-emerald-500/10">
                    <Activity size={20} />
                  </div>{" "}
                  Healthcare IT {isHealthcarePage && "●"}
                </Link>
                <button
                  onClick={() => onOpenConsultation?.()}
                  className="border-b border-white/10 pb-4 text-xl font-bold text-ink text-left mt-2"
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

      {/* FREE AUDIT MODAL — dark glass */}
      <AnimatePresence>
        {isAuditOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAudit}
              className="absolute inset-0 cursor-pointer bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 my-auto flex max-h-[85vh] sm:max-h-[88vh] w-full max-w-2xl flex-col overflow-y-auto rounded-3xl glass-card shadow-2xl"
            >
              {/* Top Navigation Bar inside Modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <button
                  type="button"
                  onClick={closeAudit}
                  className="btn-secondary px-3.5 py-1.5 text-xs"
                >
                  <ArrowLeft size={16} className="text-accent-light" />
                  <span>Return to Previous Page</span>
                </button>

                <button
                  type="button"
                  onClick={closeAudit}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-sub transition-colors hover:bg-white/10 hover:text-ink cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="border-b border-white/10 px-7 py-6 sm:px-9">
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
                        <option value="" disabled className="bg-surface">
                          Select a service
                        </option>
                        <option className="bg-surface">Custom Enterprise Software</option>
                        <option className="bg-surface">Healthcare IT & EHR Solutions</option>
                        <option className="bg-surface">Cloud Architecture & Migration</option>
                        <option className="bg-surface">UI / UX & Product Design</option>
                        <option className="bg-surface">Mobile Applications</option>
                        <option className="bg-surface">Branding & Digital Experience</option>
                        <option className="bg-surface">Video Production</option>
                        <option className="bg-surface">Not sure — I need guidance</option>
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
                <div className="flex flex-col items-center gap-2 border-t border-white/10 pt-6 text-center sm:flex-row sm:justify-center">
                  <span className="text-sm text-sub">Prefer WhatsApp?</span>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 transition hover:text-emerald-300 cursor-pointer"
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
