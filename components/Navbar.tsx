"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";

const services = [
  {
    name: "Branding & Strategy",
    icon: PenTool,
    link: "/services/website-design",
    desc: "Identity, Visual Guidelines & Creative Positioning",
    img: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Enterprise Software & Web",
    icon: Code,
    link: "/services/saas-development",
    desc: "Scalable Apps, SaaS Platforms & Mobile Engineering",
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Digital Marketing & AI SEO",
    icon: Video,
    link: "/services/digital-marketing",
    desc: "High-Conversion Campaigns & AI Search Optimization",
    img: "https://images.unsplash.com/photo-1601506521937-0121a7fc2a6b?auto=format&fit=crop&w=800&q=80",
  },
];

const inputClass =
  "mt-1.5 w-full rounded border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600";
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
  const isTransparentNav = isLandingPage && !isScrolled;

  const textClass = isTransparentNav
    ? "text-white hover:text-sky-300"
    : "text-gray-800 hover:text-blue-600";
  const logoTextClass = isTransparentNav ? "text-white" : "text-gray-900";
  const headerBgClass = isTransparentNav
    ? "bg-transparent border-transparent"
    : "bg-white border-b border-gray-200 shadow-sm";

  const whatsappNumber = "919999999999";
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
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b ${headerBgClass}`}>
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Skora Logo -> Redirects to Landing Page (/) */}
            <Link
              href="/"
              className={`relative z-50 flex items-center gap-1.5 text-2xl font-extrabold tracking-tight transition-colors duration-300 ${logoTextClass}`}
            >
              Skora{" "}
              <span
                className={`h-2 w-2 rounded-full ${
                  isTransparentNav ? "bg-sky-400 shadow-[0_0_8px_#38bdf8]" : "bg-blue-600"
                }`}
              />
            </Link>

            <nav className="hidden h-full items-center gap-8 lg:flex">
              {/* Home Link -> Redirects to Dedicated Home Page (/home) */}
              <Link
                href="/home"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${textClass}`}
              >
                Home
                <span className="absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 bg-blue-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>

              <button
                type="button"
                onClick={() => setIsServicesOpen(true)}
                className={`group relative flex h-full cursor-pointer items-center text-[15px] font-semibold transition-colors duration-300 gap-1 ${textClass}`}
              >
                Services{" "}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-300 ${isServicesOpen ? "rotate-180" : ""}`}
                />
                <span className="absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 bg-blue-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </button>

              {/* Healthcare IT Link -> Redirects to Doctor Healthcare Portal (/healthcare) */}
              <Link
                href="/healthcare"
                className={`group relative flex h-full items-center gap-1.5 text-[15px] font-semibold transition-colors duration-300 ${
                  isTransparentNav ? "text-emerald-300 hover:text-emerald-200" : "text-emerald-600 hover:text-emerald-500"
                }`}
              >
                <Activity size={16} /> Healthcare IT
                <span className="absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 bg-emerald-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>

              <Link
                href="/services/digital-marketing"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${textClass}`}
              >
                Digital Marketing
                <span className="absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 bg-blue-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>

              <button
                type="button"
                onClick={() => onOpenConsultation?.()}
                className={`group relative flex h-full cursor-pointer items-center text-[15px] font-semibold transition-colors duration-300 ${textClass}`}
              >
                Contact
                <span className="absolute bottom-0 left-0 h-[3px] w-full origin-left scale-x-0 bg-blue-600 transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </button>
            </nav>

            <div className="hidden items-center gap-4 lg:flex">
              <button
                type="button"
                onClick={() => setIsAuditOpen(true)}
                className={`flex items-center gap-2 rounded px-5 py-2.5 text-[14px] font-bold transition-all cursor-pointer ${
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
                className={`group flex items-center gap-2 rounded px-6 py-2.5 text-[14px] font-bold shadow-md transition-all cursor-pointer ${
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
              className={`relative z-50 rounded p-2 transition cursor-pointer lg:hidden border ${
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
            className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-slate-950/95 backdrop-blur-2xl px-4 py-6 sm:p-8"
          >
            <div className="flex w-full items-center justify-between mx-auto max-w-[90rem]">
              <div className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Skora{" "}
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
              </div>
              <button
                onClick={closeServices}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 hover:rotate-90 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-grow flex flex-col justify-center mx-auto w-full max-w-[90rem] py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-10 lg:mb-16 text-center lg:text-left"
              >
                <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
                  Our{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
                    Expertise
                  </span>
                </h2>
                <p className="mt-4 text-lg text-slate-400 font-medium">Select a division to explore our capabilities.</p>
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
                      className="group relative flex h-[350px] lg:h-[450px] w-full flex-col justify-end overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:border-sky-400/50 cursor-pointer"
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-90 transition-opacity group-hover:opacity-80"></div>
                      <div className="relative z-10 p-8">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-sky-400 backdrop-blur-md transition-colors group-hover:bg-sky-400 group-hover:text-white">
                          <item.icon size={28} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">{item.name}</h3>
                        <p className="text-slate-300 font-medium mb-6">{item.desc}</p>
                        <div className="flex items-center gap-2 text-sm font-bold text-sky-400">
                          <span>Explore Division</span>
                          <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
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
                <Link href="/home" className="border-b border-gray-100 pb-4 text-xl font-bold text-gray-900">
                  Home
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
                  className="flex items-center gap-3 text-lg font-bold text-emerald-600 mt-2"
                >
                  <div className="p-2 bg-emerald-50 rounded">
                    <Activity size={20} />
                  </div>{" "}
                  Healthcare IT
                </Link>
                <Link href="/services/digital-marketing" className="border-b border-gray-100 pb-4 text-xl font-bold text-gray-900 mt-2">
                  Digital Marketing
                </Link>
                <button onClick={() => onOpenConsultation?.()} className="border-b border-gray-100 pb-4 text-xl font-bold text-gray-900 text-left">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAudit}
              className="absolute inset-0 cursor-pointer bg-gray-900/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-y-auto rounded shadow-2xl bg-white"
            >
              <button
                type="button"
                onClick={closeAudit}
                className="absolute right-5 top-5 z-20 flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="border-b border-gray-200 bg-gray-50 px-7 py-7 sm:px-9">
                <div className="mb-4 inline-flex items-center gap-2 rounded bg-blue-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-blue-800">
                  <CalendarClock size={14} /> 30-minute consultation
                </div>
                <h2 className="pr-10 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">
                  Get Your Free Skora Audit
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-600">
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
                    <input id="audit-name" name="name" type="text" required className={inputClass} placeholder="John Doe" />
                  </div>
                  <div>
                    <label htmlFor="audit-email" className={labelClass}>
                      Work Email
                    </label>
                    <input id="audit-email" name="email" type="email" required className={inputClass} placeholder="john@company.com" />
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="audit-phone" className={labelClass}>
                      WhatsApp / Phone
                    </label>
                    <div className="relative">
                      <Phone size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input id="audit-phone" name="phone" type="tel" required className={`${inputClass} pl-10`} placeholder="+91 98765 43210" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="audit-service" className={labelClass}>
                      Service Needed <span className="normal-case text-gray-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <BriefcaseBusiness size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <select id="audit-service" name="service" className={`${inputClass} appearance-none pl-10`} defaultValue="">
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
                    <Globe2 size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input id="audit-website" name="website" type="url" className={`${inputClass} pl-10`} placeholder="https://yourcompany.com" />
                  </div>
                </div>
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded bg-blue-600 py-4 text-[15px] font-bold text-white shadow-md transition-colors hover:bg-blue-700 cursor-pointer"
                >
                  Request My Free Skora Audit <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
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
