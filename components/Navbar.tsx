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

const inputClass =
  "mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400 focus:bg-white/10 focus:ring-1 focus:ring-sky-400/60";
const labelClass = "ml-1 text-xs font-bold uppercase tracking-wide text-slate-400 font-mono-accent";

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
  const isHomePage = pathname === "/home";
  const isHealthcarePage = pathname === "/healthcare";
  const isServicesPage = pathname.startsWith("/services");
  const isTransparentNav = isLandingPage && !isScrolled;

  const textClass = isTransparentNav
    ? "text-white hover:text-sky-300"
    : "text-slate-200 hover:text-sky-300";
  const logoTextClass = "text-white";
  const headerBgClass = isTransparentNav
    ? "bg-transparent border-transparent"
    : "bg-[#05070E]/85 border-b border-white/10 shadow-[0_8px_30px_rgba(2,6,23,0.6)] backdrop-blur-xl";

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
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  isTransparentNav ? "bg-sky-400 shadow-[0_0_8px_#38bdf8]" : "bg-sky-400 shadow-[0_0_10px_#38bdf8]"
                }`}
              />
            </Link>

            <nav className="hidden h-full items-center gap-8 lg:flex">
              {/* Home Link -> Highlighted if on /home */}
              <Link
                href="/home"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${
                  isHomePage ? "text-sky-300 font-extrabold" : textClass
                }`}
              >
                <span>Home</span>
                {isHomePage && (
                  <span className="ml-1.5 h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8] animate-pulse" />
                )}
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-gradient-to-r from-sky-400 to-blue-600 shadow-[0_0_12px_rgba(56,189,248,0.7)] transition-transform duration-300 ease-out ${
                    isHomePage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>

              {/* Services Dropdown */}
              <button
                type="button"
                onClick={() => setIsServicesOpen(true)}
                className={`group relative flex h-full cursor-pointer items-center text-[15px] font-semibold transition-colors duration-300 gap-1 ${
                  isServicesPage ? "text-sky-300 font-extrabold" : textClass
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
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-gradient-to-r from-sky-400 to-blue-600 shadow-[0_0_12px_rgba(56,189,248,0.7)] transition-transform duration-300 ease-out ${
                    isServicesPage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>

              {/* Healthcare IT Link -> Highlighted if on /healthcare */}
              <Link
                href="/healthcare"
                className={`group relative flex h-full items-center gap-1.5 text-[15px] font-semibold transition-colors duration-300 ${
                  isHealthcarePage
                    ? "text-emerald-400 font-extrabold"
                    : isTransparentNav
                    ? "text-emerald-300 hover:text-emerald-200"
                    : "text-emerald-400 hover:text-emerald-300"
                }`}
              >
                <Activity
                  size={16}
                  className={isHealthcarePage ? "animate-spin text-emerald-400" : ""}
                />
                <span>Healthcare IT</span>
                {isHealthcarePage && (
                  <span className="ml-1 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 font-mono-accent text-[10px] font-bold text-emerald-300">
                    ACTIVE
                  </span>
                )}
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.7)] transition-transform duration-300 ease-out ${
                    isHealthcarePage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>

              <Link
                href="/contact"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${
                  pathname === "/contact" ? "text-sky-300 font-extrabold" : textClass
                }`}
              >
                <span>Contact</span>
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-gradient-to-r from-sky-400 to-blue-600 shadow-[0_0_12px_rgba(56,189,248,0.7)] transition-transform duration-300 ease-out ${
                    pathname === "/contact" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            </nav>

            <div className="hidden items-center gap-4 lg:flex">
              <button
                type="button"
                onClick={() => setIsAuditOpen(true)}
                className="glass-pill flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold transition-all hover:border-sky-400/60 hover:text-sky-200"
              >
                <ShieldCheck size={16} /> Free SKORA Audit
              </button>

              <button
                type="button"
                onClick={() => onOpenConsultation?.()}
                className="group flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 px-6 py-2.5 text-[14px] font-bold text-white shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(56,189,248,0.65)]"
              >
                <span>Start Project</span>
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            <button
              type="button"
              className={`relative z-50 cursor-pointer rounded-xl border p-2 transition ${
                isTransparentNav
                  ? "border-white/25 text-white hover:bg-white/10"
                  : "border-white/15 bg-white/5 text-slate-100 hover:bg-white/10"
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
            className="fixed inset-0 z-[1000] flex flex-col overflow-y-auto bg-[#05070E]/98 px-4 py-6 text-white backdrop-blur-2xl sm:p-8"
          >
            {/* Ambient orbs */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="bg-radial-halo absolute -top-48 left-1/2 h-[34rem] w-[60rem] -translate-x-1/2 rounded-full blur-[130px]" />
              <div className="grid-floor opacity-60" />
            </div>

            <div className="relative flex w-full items-center justify-between mx-auto max-w-[90rem]">
              <button
                onClick={closeServices}
                className="glass-pill inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all hover:border-sky-400/60"
              >
                <ArrowLeft size={16} className="text-sky-300" />
                <span>Return to Previous Page</span>
              </button>

              <button
                onClick={closeServices}
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:rotate-90 hover:bg-white/10"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative flex-grow flex flex-col justify-center mx-auto w-full max-w-[90rem] py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10 lg:mb-16 text-center lg:text-left"
              >
                <h2 className="text-4xl font-black uppercase tracking-tight text-white md:text-5xl lg:text-6xl">
                  Our{" "}
                  <span className="text-gradient-cyan">
                    Expertise
                  </span>
                </h2>
                <p className="mt-4 text-lg font-medium text-slate-400">
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
                      className="group neon-border relative flex h-[350px] lg:h-[420px] w-full cursor-pointer flex-col justify-end overflow-hidden rounded-[2.2rem] border border-white/10 bg-[#0B0F19]/70 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-sky-400/60 hover:shadow-[0_20px_60px_rgba(37,99,235,0.35)]"
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#05070E] via-[#05070E]/80 to-transparent transition-opacity group-hover:opacity-90"></div>
                      <div className="relative z-10 p-8">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-400/40 bg-sky-500/10 text-sky-300 shadow-[0_0_20px_rgba(56,189,248,0.35)] backdrop-blur-md transition-colors group-hover:bg-sky-500 group-hover:text-white">
                          <item.icon size={28} />
                        </div>
                        <h3 className="mb-2 text-2xl font-extrabold text-white">{item.name}</h3>
                        <p className="mb-6 text-sm font-medium leading-relaxed text-slate-400">{item.desc}</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-sky-300">
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
            className="fixed inset-0 z-40 overflow-y-auto bg-[#05070E] lg:hidden"
          >
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="bg-radial-halo absolute -top-32 left-1/2 h-[28rem] w-[36rem] -translate-x-1/2 rounded-full blur-[120px]" />
            </div>
            <div className="relative flex min-h-screen flex-col px-6 pb-12 pt-24">
              <div className="flex flex-grow flex-col gap-6">
                <Link
                  href="/home"
                  className={`border-b border-white/10 pb-4 text-xl font-bold ${
                    isHomePage ? "text-sky-300 font-extrabold" : "text-white"
                  }`}
                >
                  Home {isHomePage && "●"}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsServicesOpen(true);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between border-b border-white/10 pb-4 text-xl font-bold text-white"
                >
                  Services <ArrowRight size={20} className="text-sky-300" />
                </button>
                <Link
                  href="/healthcare"
                  className={`flex items-center gap-3 text-lg font-bold ${
                    isHealthcarePage ? "text-emerald-400 font-extrabold" : "text-emerald-400"
                  }`}
                >
                  <div className="rounded border border-emerald-400/30 bg-emerald-500/10 p-2">
                    <Activity size={20} />
                  </div>{" "}
                  Healthcare IT {isHealthcarePage && "●"}
                </Link>
                <button
                  onClick={() => onOpenConsultation?.()}
                  className="cursor-pointer border-b border-white/10 pb-4 text-left text-xl font-bold text-white"
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
                  className="glass-pill flex cursor-pointer items-center justify-center gap-2 rounded py-4 font-bold"
                >
                  <ShieldCheck size={18} /> Request Free Audit
                </button>
                <button
                  onClick={() => onOpenConsultation?.()}
                  className="flex cursor-pointer items-center justify-center gap-2 rounded bg-gradient-to-r from-blue-600 to-sky-500 py-4 font-bold text-white shadow-[0_0_25px_rgba(37,99,235,0.5)]"
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
          <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAudit}
              className="absolute inset-0 cursor-pointer bg-[#020409]/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2 }}
              className="glass-card relative z-10 my-auto flex max-h-[85vh] sm:max-h-[88vh] w-full max-w-2xl flex-col overflow-y-auto rounded-3xl shadow-[0_30px_90px_rgba(2,6,23,0.9)]"
            >
              {/* Top Navigation Bar inside Modal */}
              <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-6 py-4">
                <button
                  type="button"
                  onClick={closeAudit}
                  className="glass-pill inline-flex cursor-pointer items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all"
                >
                  <ArrowLeft size={16} className="text-sky-300" />
                  <span>Return to Previous Page</span>
                </button>

                <button
                  type="button"
                  onClick={closeAudit}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="border-b border-white/10 px-7 py-6 sm:px-9">
                <div className="glass-pill mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.1em]">
                  <CalendarClock size={14} className="text-sky-300" /> 30-minute consultation
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Get Your Free Skora Audit
                </h2>
                <p className="mt-2 text-sm font-medium leading-relaxed text-slate-400">
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
                        className="pointer-events-none absolute left-4 top-1/2 mt-1.5 -translate-y-1/2 text-slate-500"
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
                      Service Needed <span className="normal-case text-slate-600">(Optional)</span>
                    </label>
                    <div className="relative">
                      <BriefcaseBusiness
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 mt-1.5 -translate-y-1/2 text-slate-500"
                      />
                      <select
                        id="audit-service"
                        name="service"
                        className={`${inputClass} appearance-none pl-10 [&>option]:bg-[#0B0F19]`}
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
                    Company Website <span className="normal-case text-slate-600">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Globe2
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 mt-1.5 -translate-y-1/2 text-slate-500"
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
                  className="btn-primary group flex w-full cursor-pointer items-center justify-center gap-2 py-4 text-[15px]"
                >
                  Request My Free Skora Audit{" "}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
                <div className="flex flex-col items-center gap-2 border-t border-white/10 pt-6 text-center sm:flex-row sm:justify-center">
                  <span className="text-sm text-slate-500">Prefer WhatsApp?</span>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-emerald-400 transition hover:text-emerald-300"
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
