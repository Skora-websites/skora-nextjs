"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import Overlay from "@/components/animation/Overlay";
import { gsap, prefersReducedMotion, CINEMA } from "@/lib/gsap";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { SERVICES } from "@/lib/services";
import { CTA } from "@/lib/cta";

/** Nav presentation of the shared service list — one edit in lib/services.ts updates every surface. */
const services = SERVICES.map((service) => ({
  name: service.navName,
  icon: service.icon,
  link: `/services/${service.slug}`,
  desc: service.navDesc,
}));

interface NavbarProps {
  onOpenConsultation?: (topic?: string) => void;
}

export default function Navbar({ onOpenConsultation }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const lastY = useRef(0);
  const hiddenRef = useRef(false);

  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const isHomePage = pathname === "/";
  const isServicesPage = pathname.startsWith("/services");
  const isHealthcarePage = pathname === "/healthcare";
  // Posts now live at the root (`/[slug]`), so there is no `/blog` prefix left
  // to match on. Only the index gets an active state — a single post's path is
  // indistinguishable from any other top-level slug.
  const isInsightsPage = pathname === "/insights";
  // Transparent at the very top of the landing page, white glass once scrolled.
  const isTransparentNav = isLandingPage && !isScrolled;

  const textClass = isTransparentNav
    ? "text-ink/80 hover:text-accent"
    : "text-ink/80 hover:text-accent";
  const headerBgClass = isTransparentNav
    ? "bg-transparent border-transparent"
    : "bg-white/85 backdrop-blur-xl border-line shadow-[0_1px_2px_rgba(11,18,32,0.04)]";


  // Scroll state for the white-glass treatment, plus the cinematic
  // hide-on-scroll-down / reveal-on-scroll-up header.
  const overlayOpen = isServicesOpen || mobileMenuOpen;
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

  const closeServices = () => setIsServicesOpen(false);

  useEffect(() => {
    if (isServicesOpen || mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isServicesOpen, mobileMenuOpen]);

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
  <Image
    src="/skora-logo.png"
    alt="Skora Infotech"
    width={160}
    height={40}
    // The header is above the fold on every route, so the logo is the LCP
    // candidate here — never lazy, and sized so the optimiser emits one
    // sensible variant instead of the full-resolution PNG.
    preload
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

              <Link
                href="/healthcare"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${
                  isHealthcarePage ? "text-accent font-extrabold" : textClass
                }`}
              >
                <span>Healthcare</span>
                <span
                  className={`absolute bottom-0 left-0 h-[3px] w-full origin-left rounded-full bg-accent transition-transform duration-300 ease-out ${
                    isHealthcarePage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>

              <Link
                href="/insights"
                className={`group relative flex h-full items-center text-[15px] font-semibold transition-colors duration-300 ${
                  isInsightsPage ? "text-accent font-extrabold" : textClass
                }`}
              >
                <span>Insights</span>
                <span
                  className={`absolute bottom-0 left-0 h-full w-full origin-left rounded-full transition-transform duration-300 ease-out ${
                    isInsightsPage ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
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

            {/* One conversion path, not two.
                The "Free audit" link that used to sit here opened an inline
                form whose submit handler only fired an `alert()` — no fetch, no
                persistence — so every lead taken through it was silently
                discarded instead of reaching POST /api/contact and
                /admin/leads. All conversions now route through the shared
                consultation modal, which is the form that actually persists. */}
            <div className="hidden items-center gap-3 lg:flex">
              <button
                type="button"
                onClick={() => onOpenConsultation?.()}
                className="btn-primary group rounded-full px-6 py-2.5 text-[14px]"
              >
                <span>{CTA.primaryLabel}</span>
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
                  onClick={() => setMobileMenuOpen(false)}
                  className={`border-b border-line pb-4 text-xl font-bold ${
                    isHealthcarePage ? "text-accent font-extrabold" : "text-ink"
                  }`}
                >
                  Healthcare {isHealthcarePage && "●"}
                </Link>
                <Link
                  href="/insights"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`border-b border-line pb-4 text-xl font-bold ${
                    isInsightsPage ? "text-accent font-extrabold" : "text-ink"
                  }`}
                >
                  Insights {isInsightsPage && "●"}
                </Link>
                <button
                  onClick={() => onOpenConsultation?.()}
                  className="border-b border-line pb-4 text-xl font-bold text-ink text-left mt-2"
                >
                  Contact
                </button>
              </div>
              {/* Same single-CTA rule as the desktop bar: the mobile menu's
                  "Request Free Audit" button opened that same dead `alert()`
                  form, so mobile taps were losing leads the same way. */}
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => onOpenConsultation?.()}
                  className="btn-primary w-full py-4"
                >
                  <span>{CTA.primaryLabel}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
      </Overlay>
    </>
  );
}
