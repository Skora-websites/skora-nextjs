"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Stethoscope,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

interface HealthcareNavbarProps {
  onOpenConsultation?: (topic?: string) => void;
}

export default function HealthcareNavbar({ onOpenConsultation }: HealthcareNavbarProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/home" },
    { name: "Services", href: "#services", hasDropdown: true },
    { name: "Why Us", href: "#why-us" },
    { name: "Packages", href: "#packages" },
    { name: "Doctor Reviews", href: "#testimonials" },
    { name: "Insights", href: "#news" },
  ];

  return (
    <header className="media-dark fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-3 sm:p-5 transition-all duration-300 pointer-events-none">
      <div className={`w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5 rounded-full border shadow-[0_10px_40px_rgba(2,20,12,0.6)] pointer-events-auto transition-all ${
        scrolled
          ? "bg-[#04120B]/90 border-emerald-500/30 backdrop-blur-xl"
          : "bg-[#04120B]/70 border-emerald-500/20 backdrop-blur-xl"
      }`}>
        {/* Brand Logo */}
        <Link
          href="/healthcare"
          className="group flex items-center gap-2 text-xl sm:text-2xl font-black text-white tracking-tight"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_0_16px_rgba(52,211,153,0.5)] transition-transform group-hover:scale-105">
            <Stethoscope size={18} />
          </div>
          <span>SKORA</span>
          <span className="text-emerald-400">.health</span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-ping" />
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-1.5">
          {navLinks.map((link) => (
            <div key={link.name} className="relative">
              {link.hasDropdown ? (
                <button
                  onMouseEnter={() => setServicesDropdownOpen(true)}
                  onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                  className="flex cursor-pointer items-center gap-1 rounded-full px-4 py-2 text-xs font-bold text-slate-200 transition-all hover:bg-white/10 hover:text-emerald-300"
                >
                  <span>{link.name}</span>
                  <ChevronDown size={14} className="text-emerald-400" />
                </button>
              ) : (
                <a
                  href={link.href}
                  className="block rounded-full px-4 py-2 text-xs font-bold text-slate-200 transition-all hover:bg-white/10 hover:text-emerald-300"
                >
                  {link.name}
                </a>
              )}

              {/* Services Dropdown */}
              {link.hasDropdown && (
                <AnimatePresence>
                  {servicesDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      onMouseLeave={() => setServicesDropdownOpen(false)}
                      className="absolute top-full left-0 mt-3 w-64 space-y-1 rounded-2xl border border-white/10 bg-[#04120B]/95 p-3 shadow-2xl backdrop-blur-xl"
                    >
                      {[
                        { title: "Custom Medical Websites", desc: "HIPAA Compliant" },
                        { title: "Google My Business (GMB)", desc: "Local Map Rank #1" },
                        { title: "Social Media & Reels", desc: "Patient Engagement" },
                        { title: "Meta Ads & Google PPC", desc: "High-Intent Leads" },
                        { title: "Patient Engagement", desc: "WhatsApp Automation" },
                      ].map((item, idx) => (
                        <a
                          key={idx}
                          href="#services"
                          onClick={() => setServicesDropdownOpen(false)}
                          className="block rounded-xl p-2.5 transition-colors hover:bg-emerald-500/10"
                        >
                          <div className="text-xs font-bold text-white">{item.title}</div>
                          <div className="text-[10px] font-semibold text-emerald-400">{item.desc}</div>
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>

        {/* Right CTA Action Button */}
        <div className="hidden sm:flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => onOpenConsultation?.("Doctor Growth Audit")}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-xs font-extrabold text-white shadow-[0_0_25px_rgba(52,211,153,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(52,211,153,0.5)]"
          >
            <span>BOOK FREE DOCTOR AUDIT</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="cursor-pointer rounded-full border border-white/10 bg-white/5 p-2.5 text-slate-100 transition-colors hover:bg-white/10 lg:hidden"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-4 right-4 mt-2 space-y-4 rounded-3xl border border-white/10 bg-[#04120B]/95 p-6 shadow-2xl backdrop-blur-xl pointer-events-auto lg:hidden"
          >
            <div className="space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-xl p-3 text-sm font-bold text-slate-100 hover:bg-emerald-500/10"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation?.("Doctor Growth Audit");
                }}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-xs font-extrabold text-white shadow-[0_0_25px_rgba(52,211,153,0.35)]"
              >
                <span>BOOK FREE DOCTOR AUDIT</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
