"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Stethoscope,
  ChevronDown,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Menu,
  X,
  Phone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center p-3 sm:p-5 transition-all duration-300 pointer-events-none">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-3.5 rounded-full bg-[#FDFBF7]/90 backdrop-blur-xl border border-[#DCE8E0] shadow-xl pointer-events-auto transition-all">
        {/* Brand Logo - Healthcare IT Style */}
        <Link
          href="/healthcare"
          className="flex items-center gap-2 text-xl sm:text-2xl font-extrabold text-[#11261D] tracking-tight group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#1F6B43] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Stethoscope size={16} />
          </div>
          <span>SKORA</span>
          <span className="text-[#1F6B43]">.health</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F6B43]" />
        </Link>

        {/* Center Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#E8F2EC]/70 p-1.5 rounded-full border border-[#DCE8E0]">
          {navLinks.map((link) => (
            <div key={link.name} className="relative">
              {link.hasDropdown ? (
                <button
                  onMouseEnter={() => setServicesDropdownOpen(true)}
                  onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#11261D] hover:bg-white hover:text-[#1F6B43] transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>{link.name}</span>
                  <ChevronDown size={14} className="text-[#1F6B43]" />
                </button>
              ) : (
                <a
                  href={link.href}
                  className="px-4 py-2 rounded-full text-xs font-bold text-[#11261D] hover:bg-white hover:text-[#1F6B43] transition-all block"
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
                      className="absolute top-full left-0 mt-3 w-64 p-3 rounded-2xl bg-white border border-[#DCE8E0] shadow-2xl space-y-1 text-[#11261D]"
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
                          className="block p-2.5 rounded-xl hover:bg-[#E8F2EC] transition-colors"
                        >
                          <div className="text-xs font-bold text-[#11261D]">{item.title}</div>
                          <div className="text-[10px] text-[#1F6B43] font-semibold">{item.desc}</div>
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </nav>

        {/* Right CTA Action Button - Framer Oral Care Solid Pill */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => onOpenConsultation?.("Doctor Growth Audit")}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#1F6B43] to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-lg shadow-[#1F6B43]/25 hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>BOOK FREE DOCTOR AUDIT</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2.5 rounded-full bg-[#E8F2EC] text-[#11261D] hover:bg-white transition-colors cursor-pointer"
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
            className="absolute top-full left-4 right-4 mt-2 p-6 rounded-3xl bg-white border border-[#DCE8E0] shadow-2xl pointer-events-auto space-y-4 text-[#11261D] lg:hidden"
          >
            <div className="space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-3 rounded-xl font-bold text-sm hover:bg-[#E8F2EC] text-[#11261D]"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConsultation?.("Doctor Growth Audit");
                }}
                className="w-full py-3.5 rounded-xl bg-[#1F6B43] text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
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
