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
  "mt-1.5 w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600";
const labelClass = "ml-1 text-xs font-bold uppercase tracking-wide text-gray-700";

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
    : "text-gray-800 hover:text-blue-600";
  const logoTextClass = isTransparentNav ? "text-white" : "text-gray-900";
  const headerBgClass = isTransparentNav
    ? "bg-transparent border-transparent"
    : "bg-white/90 border-b border-gray-200/80 shadow-sm backdrop-blur-xl";

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
              className={`relative z-50 flex items-center transition-colors duration-300 ${logoTextClass}`}
            >
              <img
                src="/skora-logo.png"
                alt="Skora logo"
                className="h-9 w-9 object-contain rounded-full ring-1 ring-white/50 bg-white/10 shadow-sm"
              />
              <span
                className={`ml-2 h-2.5 w-2.5 rounded-full ${
                  isTransparentNav ? "bg-sky-400 shadow-[0_0_8px_#38bdf8]" : "bg-blue-600"
                }`}
              />
            </Link>

            <nav className="hidden h-full items-center gap-8 lg:flex">
              {/* Home Link -> Highlighted if on /home */}
              <Link
                href="/home"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${
                  isHomePage ? "text-blue-600 font-extrabold" : textClass
                }`}
              >
                <span>Home</span>
                {isHomePage && (
                  <span className="ml-1.5 w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                )}
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-blue-600 transition-transform duration-300 ease-out ${
                    isHomePage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>

              {/* Services Dropdown */}
              <button
                type="button"
                onClick={() => setIsServicesOpen(true)}
                className={`group relative flex h-full cursor-pointer items-center text-[15px] font-semibold transition-colors duration-300 gap-1 ${
                  isServicesPage ? "text-blue-600 font-extrabold" : textClass
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
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-blue-600 transition-transform duration-300 ease-out ${
                    isServicesPage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>

              {/* Healthcare IT Link -> Highlighted if on /healthcare */}
              <Link
                href="/healthcare"
                className={`group relative flex h-full items-center gap-1.5 text-[15px] font-semibold transition-colors duration-300 ${
                  isHealthcarePage
                    ? "text-emerald-600 font-extrabold"
                    : isTransparentNav
                    ? "text-emerald-300 hover:text-emerald-200"
                    : "text-emerald-600 hover:text-emerald-500"
                }`}
              >
                <Activity
                  size={16}
                  className={isHealthcarePage ? "animate-spin text-emerald-500" : ""}
                />
                <span>Healthcare IT</span>
                {isHealthcarePage && (
                  <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                    ACTIVE
                  </span>
                )}
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-emerald-500 transition-transform duration-300 ease-out ${
                    isHealthcarePage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>

              <Link
                href="/contact"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${
                  pathname === "/contact" ? "text-blue-600 font-extrabold" : textClass
                }`}
              >
                <span>Contact</span>
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left bg-blue-600 transition-transform duration-300 ease-out ${
                    pathname === "/contact" ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            </nav>

            <div className="hidden items-center gap-4 lg:flex">
              <button
                type="button"
                onClick={() => setIsAuditOpen(true)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold transition-all cursor-pointer ${
                  isTransparentNav
                    ? "border border-white/30 text-white hover:bg-white/10"
                    : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 hover:text-blue-600 shadow-sm"
                }`}
              >
                <ShieldCheck size={16} /> Free SKORA Audit
              </button>

              <button
                type="button"
                onClick={() => onOpenConsultation?.()}
                className={`group flex items-center gap-2 rounded-xl px-6 py-2.5 text-[14px] font-bold shadow-md transition-all cursor-pointer ${
                  isTransparentNav
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
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
                  : "border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
              }`}
              onClick={() => setMobileMenuOpen((current) => !current)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* FULL-SCREEN SERVICES MODAL */}
      <AnimatePresence>
        {isServicesOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[1000] flex flex-col overflow-y-auto bg-[#F4F6F1]/98 backdrop-blur-2xl px-4 py-6 sm:p-8 text-[#0B1310]"
          >
            <div className="flex w-full items-center justify-between mx-auto max-w-[90rem]">
              <button
                onClick={closeServices}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-[#EFF6FF] text-[#0B1310] text-xs font-bold transition-all border border-[#E2E8F0] shadow-sm cursor-pointer"
              >
                <ArrowLeft size={16} className="text-[#2563EB]" />
                <span>Return to Previous Page</span>
              </button>

              <button
                onClick={closeServices}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0B1310] border border-[#E2E8F0] shadow-sm transition hover:bg-slate-200 hover:rotate-90 cursor-pointer"
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
                <h2 className="text-4xl font-black tracking-tight text-[#0B1310] md:text-5xl lg:text-6xl uppercase">
                  Our{" "}
                  <span className="text-[#2563EB]">
                    Expertise
                  </span>
                </h2>
                <p className="mt-4 text-lg text-slate-600 font-medium">
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
                      className="group relative flex h-[350px] lg:h-[420px] w-full flex-col justify-end overflow-hidden rounded-[2.2rem] border border-[#E2E8F0] bg-white shadow-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-[#2563EB] cursor-pointer"
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/85 to-transparent opacity-95 transition-opacity group-hover:opacity-90"></div>
                      <div className="relative z-10 p-8">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#2563EB]/30 backdrop-blur-md transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
                          <item.icon size={28} />
                        </div>
                        <h3 className="text-2xl font-extrabold text-[#0B1310] mb-2">{item.name}</h3>
                        <p className="text-slate-600 font-medium mb-6 text-sm leading-relaxed">{item.desc}</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-[#2563EB]">
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

      {/* MOBILE MENU */}
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
                  href="/home"
                  className={`border-b border-gray-100 pb-4 text-xl font-bold ${
                    isHomePage ? "text-blue-600 font-extrabold" : "text-gray-900"
                  }`}
                >
                  Home {isHomePage && "●"}
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsServicesOpen(true);
                  }}
                  className="flex w-full justify-between items-center border-b border-gray-100 pb-4 text-xl font-bold text-gray-900 cursor-pointer"
                >
                  Services <ArrowRight size={20} className="text-blue-600" />
                </button>
                <Link
                  href="/healthcare"
                  className={`flex items-center gap-3 text-lg font-bold ${
                    isHealthcarePage ? "text-emerald-600 font-extrabold" : "text-emerald-600"
                  }`}
                >
                  <div className="p-2 bg-emerald-50 rounded">
                    <Activity size={20} />
                  </div>{" "}
                  Healthcare IT {isHealthcarePage && "●"}
                </Link>
                <button
                  onClick={() => onOpenConsultation?.()}
                  className="border-b border-gray-100 pb-4 text-xl font-bold text-gray-900 text-left mt-2"
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
                  className="flex items-center justify-center gap-2 rounded bg-gray-50 border border-gray-200 py-4 font-bold text-blue-600 cursor-pointer"
                >
                  <ShieldCheck size={18} /> Request Free Audit
                </button>
                <button
                  onClick={() => onOpenConsultation?.()}
                  className="flex items-center justify-center gap-2 rounded bg-blue-600 py-4 font-bold text-white shadow-md cursor-pointer"
                >
                  <span>Start Project</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FREE AUDIT MODAL */}
      <AnimatePresence>
        {isAuditOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAudit}
              className="absolute inset-0 cursor-pointer bg-gray-900/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 my-auto flex max-h-[85vh] sm:max-h-[88vh] w-full max-w-2xl flex-col overflow-y-auto rounded-3xl shadow-2xl bg-white"
            >
              {/* Top Navigation Bar inside Modal */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={closeAudit}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-gray-100 text-xs font-bold text-gray-700 border border-gray-200 shadow-sm transition-all cursor-pointer"
                >
                  <ArrowLeft size={16} className="text-blue-600" />
                  <span>Return to Previous Page</span>
                </button>

                <button
                  type="button"
                  onClick={closeAudit}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-200/80 text-gray-600 transition-colors hover:bg-gray-300 hover:text-gray-900 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="border-b border-gray-200 bg-white px-7 py-6 sm:px-9">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-blue-800">
                  <CalendarClock size={14} /> 30-minute consultation
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  Get Your Free Skora Audit
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 font-medium">
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
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                      Service Needed <span className="normal-case text-gray-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <BriefcaseBusiness
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                    Company Website <span className="normal-case text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Globe2
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-[15px] font-bold text-white shadow-md transition-colors hover:bg-blue-700 cursor-pointer"
                >
                  Request My Free Skora Audit{" "}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
                <div className="flex flex-col items-center gap-2 border-t border-gray-100 pt-6 text-center sm:flex-row sm:justify-center">
                  <span className="text-sm text-gray-500">Prefer WhatsApp?</span>
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
