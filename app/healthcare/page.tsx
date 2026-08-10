"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Globe,
  Heart,
  MapPin,
  Megaphone,
  MessageSquare,
  Phone,
  Search,
  Share2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  UserCheck,
  Users,
  Video,
  Zap,
} from "lucide-react";
import { motion, useInView } from "framer-motion";
import Card3D from "@/components/Card3D";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import gsap from "gsap";

// GSAP Animated EKG Heartbeat Waveform Canvas
const EkgHeartbeatWave = () => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const length = path.getTotalLength();

    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 2.2,
      repeat: Infinity,
      ease: "power2.inOut",
    });
  }, []);

  return (
    <div className="relative w-full h-24 overflow-hidden rounded-2xl bg-slate-900/90 border border-teal-500/30 p-4 flex items-center justify-between shadow-[0_0_30px_rgba(13,184,181,0.2)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0DB8B5]/20 border border-[#0DB8B5]/50 flex items-center justify-center text-[#0DB8B5] relative">
          <Heart size={20} className="animate-pulse text-[#0DB8B5]" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#0DB8B5] animate-ping" />
        </div>
        <div>
          <span className="text-[10px] font-mono text-teal-300 uppercase tracking-widest block">
            PATIENT GROWTH TELEMETRY
          </span>
          <span className="text-sm font-extrabold text-white">72 BPM • Sinus Rhythm Active</span>
        </div>
      </div>

      <svg className="w-48 h-12 text-[#0DB8B5]" viewBox="0 0 300 60" fill="none">
        <path
          ref={pathRef}
          d="M0 30 L40 30 L50 10 L60 50 L70 5 L80 40 L90 30 L130 30 L140 15 L150 45 L160 30 L300 30"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

// Animated On-Scroll Wrapper Component
function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.96 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const doctorServices = [
  {
    title: "Custom Medical Websites",
    desc: "We engineer and fully manage high-converting, HIPAA-compliant websites tailored specifically for medical practices and individual doctors.",
    img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    badge: "✦ Web Architecture ✦",
    glow: "shadow-teal-500/20 hover:border-teal-400",
  },
  {
    title: "Google My Business (GMB)",
    desc: "Optimizing your GMB profile to drive local phone calls, direction clicks, and direct patient appointment bookings.",
    img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80",
    badge: "✦ GMB Local SEO ✦",
    glow: "shadow-sky-500/20 hover:border-sky-400",
  },
  {
    title: "Social Media & Reels",
    desc: "Professional branding across Instagram, Facebook, and LinkedIn with medical reels, posts, and patient educational content.",
    img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    badge: "✦ Medical Branding ✦",
    glow: "shadow-purple-500/20 hover:border-purple-400",
  },
  {
    title: "Meta Ads & Google PPC",
    desc: "High-ROI paid ad campaigns targeting high-intent patients actively searching for specialists in your city.",
    img: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=800&q=80",
    badge: "✦ Patient Acquisition ✦",
    glow: "shadow-amber-500/20 hover:border-amber-400",
  },
  {
    title: "Google Maps & Local SEO",
    desc: "Dominate Google search rankings and Maps 3-pack so patients find your clinic before competitors.",
    img: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=800&q=80",
    badge: "✦ Map Rankings ✦",
    glow: "shadow-emerald-500/20 hover:border-emerald-400",
  },
  {
    title: "Patient Engagement Campaigns",
    desc: "Automated SMS & email nurture sequences, appointment reminders, and preventative care recall campaigns.",
    img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80",
    badge: "✦ Patient Retention ✦",
    glow: "shadow-cyan-500/20 hover:border-cyan-400",
  },
  {
    title: "Medical Content & PR",
    desc: "Authority-building medical blogs, doctor video interviews, and press releases to establish doctor trust.",
    img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=800&q=80",
    badge: "✦ Authority PR ✦",
    glow: "shadow-rose-500/20 hover:border-rose-400",
  },
  {
    title: "Appointment Lead Generation",
    desc: "Converting digital traffic directly into confirmed patient calendar slots with instant staff notification alerts.",
    img: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=800&q=80",
    badge: "✦ Direct Bookings ✦",
    glow: "shadow-indigo-500/20 hover:border-indigo-400",
  },
];

const whyChooseUs = [
  {
    title: "Exclusively Healthcare Focused",
    desc: "We only work with doctors, clinics, and medical practices. We understand medical ethics, HIPAA, and patient decision drivers.",
    icon: ShieldCheck,
  },
  {
    title: "Proven 320% Growth Track Record",
    desc: "Our partner doctors experience an average 320% increase in qualified patient inquiries within 90 days of launch.",
    icon: BarChart3,
  },
  {
    title: "All-in-One Digital Management",
    desc: "From custom website creation to daily social media posting and Google Ads—we handle everything end-to-end.",
    icon: Zap,
  },
  {
    title: "Transparent Reporting & Dashboards",
    desc: "Real-time analytics dispatches every 15 days showing exact phone calls, leads, and conversion metrics.",
    icon: Award,
  },
];

const packages = [
  {
    name: "Basic Service",
    price: "₹5,000",
    period: "+ GST / month",
    popular: false,
    subtitle: "Ideal for individual doctors building local presence",
    features: [
      "Facebook & Instagram Management",
      "GMB Profile Optimization",
      "12 Custom Posts / month",
      "Targeted Medical Keywords",
      "Local SEO Enhancement",
      "Monthly Growth Report",
    ],
  },
  {
    name: "Standard Service",
    price: "₹15,000",
    period: "+ GST / month",
    popular: true,
    subtitle: "Recommended for clinics expanding patient volume",
    features: [
      "Facebook, Instagram & LinkedIn",
      "GMB Profile Optimization",
      "14 Posts + 2 Reels / month",
      "High-Intent Local SEO Keywords",
      "Report Dispatched Every 15 Days",
      "Priority Clinical Support",
    ],
  },
  {
    name: "Premium Service",
    price: "₹32,000",
    period: "+ GST / month",
    popular: false,
    subtitle: "Complete digital dominance for multi-specialty centers",
    features: [
      "Facebook, Instagram, LinkedIn & GMB",
      "18 Posts + 4 Reels / month",
      "Dedicated Medical Content Team",
      "Weekly Analytical Dispatches",
      "Advanced Local SEO & Maps Ads",
      "24/7 Dedicated Account Manager",
    ],
  },
];

const doctorReviews = [
  {
    quote: "SKORA transformed our cardiology practice online. Our Google Maps calls tripled in 60 days, and our website conversion rate doubled.",
    doctor: "Dr. Rajiv Sharma, MD",
    specialty: "Cardiologist & Clinic Director",
    city: "Mumbai, India",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote: "Working with a team that strictly focuses on healthcare made all the difference. They manage our website, reels, and patient leads effortlessly.",
    doctor: "Dr. Ananya Patel",
    specialty: "Dermatology Specialist",
    city: "Delhi NCR",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1594824813566-88855ce78961?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote: "The GMB optimization and local SEO brought in over 45 new surgical inquiries last month alone. Transparent reporting and great support!",
    doctor: "Dr. Vikram Sethi",
    specialty: "Orthopedic Surgeon",
    city: "Bengaluru",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80",
  },
];

const healthcareNews = [
  {
    title: "How AI Search (GEO) Is Redefining Patient Acquisition in 2026",
    summary: "Discover why traditional SEO is evolving into AI citations and how doctors can optimize their clinical profiles for Perplexity & Google AI Overviews.",
    date: "August 2026",
    tag: "AI SEO Trends",
    img: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "5 Medical Website Mistakes That Are Costing Clinics New Patients",
    summary: "Slow load times, lack of online booking triggers, and weak local GMB integration are driving patients to competitors.",
    date: "July 2026",
    tag: "Web Architecture",
    img: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80",
  },
  {
    title: "Meta Ads vs. Google Search: Best Channel for Medical Specialties",
    summary: "A breakdown of patient acquisition cost (CPA) for dental, elective surgery, and emergency medical services.",
    date: "July 2026",
    tag: "Paid Acquisition",
    img: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80",
  },
];

export default function HealthcarePortal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      // Kinetic GSAP entrance for Hero elements
      gsap.fromTo(
        ".gsap-hero-item",
        { opacity: 0, y: 40, rotateX: -15 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1.0, stagger: 0.1, ease: "power3.out" }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleOpenConsultation = (topic?: string) => {
    setSelectedService(topic || "Doctor Healthcare Digital Growth");
    setModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-[#F0F7FF] text-[#0F172A] selection:bg-[#0DB8B5] selection:text-white font-sans flex flex-col relative overflow-hidden [perspective:1200px]">
      {/* Top Scroll Progress Indicator */}
      <ScrollProgressBar />

      {/* Ambient Soft Light Orbs Background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-gradient-to-b from-[#0DB8B5]/20 via-sky-300/15 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Translucent Capsule Header Bar */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between px-6 py-3.5 rounded-full bg-white/85 backdrop-blur-2xl border border-sky-100 shadow-lg shadow-sky-950/5">
          <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-slate-900">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-[#0DB8B5] to-teal-500 flex items-center justify-center text-white shadow-md">
              <Activity size={18} />
            </div>
            <span>SKORA</span>
            <span className="text-[#0DB8B5] font-black">.health</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <Link href="/home" className="hover:text-[#0DB8B5] transition-colors">
              Home
            </Link>
            <a href="#services" className="hover:text-[#0DB8B5] transition-colors">
              What We Do
            </a>
            <a href="#why-us" className="hover:text-[#0DB8B5] transition-colors">
              Why Choose Us
            </a>
            <a href="#packages" className="hover:text-[#0DB8B5] transition-colors">
              Packages
            </a>
            <a href="#testimonials" className="hover:text-[#0DB8B5] transition-colors">
              Doctor Reviews
            </a>
            <a href="#news" className="hover:text-[#0DB8B5] transition-colors">
              News
            </a>
          </nav>

          <button
            onClick={() => handleOpenConsultation()}
            className="group px-6 py-2.5 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 hover:from-[#0DB8B5] hover:to-teal-600 text-white text-xs font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>PARTNER WITH US</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* HEALTHCARE GSAP ANIMATED HERO SECTION */}
      <section ref={heroRef} className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-white via-sky-50/90 to-[#E0F2FE] border-2 border-sky-200 shadow-2xl p-6 sm:p-12 lg:p-16 overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Headline & EKG Heartbeat Animation */}
            <div className="lg:col-span-7 space-y-6">
              <div className="gsap-hero-item inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0DB8B5]/15 border border-[#0DB8B5]/40 text-[#0DB8B5] text-xs font-mono font-bold uppercase tracking-widest shadow-sm">
                <Sparkles size={14} className="animate-spin text-[#0DB8B5]" />
                <span>HEALTHCARE AGENCY & CLINICAL GROWTH ENGINE</span>
              </div>

              <h1 className="gsap-hero-item text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.06]">
                Architecting Digital Scale for <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0DB8B5] via-teal-600 to-sky-600">
                  Doctors & Medical Practices.
                </span>
              </h1>

              <p className="gsap-hero-item text-slate-600 text-base sm:text-lg font-medium leading-relaxed max-w-2xl">
                We engineer custom doctor websites, dominate Google Maps local search, execute Meta ads, and generate consistent, qualified patient appointment leads.
              </p>

              {/* GSAP EKG HEARTBEAT ANIMATION WIDGET */}
              <div className="gsap-hero-item">
                <EkgHeartbeatWave />
              </div>

              <div className="gsap-hero-item flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  onClick={() => handleOpenConsultation()}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#0DB8B5] to-teal-600 hover:from-teal-500 hover:to-cyan-600 text-white font-extrabold text-sm shadow-[0_10px_35px_rgba(13,184,181,0.4)] transition-all hover:scale-105 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Schedule Doctor Growth Audit</span>
                  <ArrowRight size={16} />
                </button>

                <a
                  href="#services"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white border border-slate-300 hover:border-[#0DB8B5] text-slate-800 font-extrabold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore What We Do</span>
                </a>
              </div>
            </div>

            {/* Right Column 3D Interactive Doctor Card */}
            <div className="lg:col-span-5 relative">
              <Card3D maxTilt={10} className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80"
                  alt="Doctor Agency Growth"
                  className="w-full h-[450px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />

                {/* Floating Partner Badge */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-white/95 backdrop-blur-xl text-slate-900 border border-white/80 shadow-2xl flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80"
                    alt="Dr. Rajiv Sharma"
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900">Dr. Rajiv Sharma, MD</h4>
                    <p className="text-[11px] font-bold text-[#0DB8B5]">320% Patient Call Growth</p>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                      <Star size={11} fill="currentColor" />
                      <span>4.9/5 Verified Partner Rating</span>
                    </div>
                  </div>
                </div>
              </Card3D>
            </div>
          </div>

          {/* Telemetry Metrics Row */}
          <div className="relative z-10 mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-sky-200/80">
            {[
              { value: "350+", label: "Doctors & Clinics Partnered" },
              { value: "320%", label: "Average Patient Inquiry Growth" },
              { value: "99.4%", label: "Client Retention Rate" },
              { value: "4.9 / 5", label: "Doctor Satisfaction Score" },
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/90 border border-sky-100 shadow-sm backdrop-blur-md">
                <span className="text-2xl sm:text-3xl font-black text-[#0DB8B5] block">{stat.value}</span>
                <span className="text-xs font-bold text-slate-600 mt-1 block">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT WE DO FOR DOCTORS — ULTRA-ATTRACTIVE 3D TILT IMAGE CARDS WITH ON-SCROLL ANIMATION */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0DB8B5] block mb-2">
            Services for Doctors & Clinics /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">
            WHAT WE DO FOR DOCTORS
          </h2>
          <p className="mt-4 text-slate-600 text-base font-medium">
            Complete end-to-end digital solutions engineered specifically for healthcare practitioners and medical practices.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctorServices.map((srv, idx) => (
            <AnimatedSection key={idx}>
              <Card3D
                maxTilt={12}
                className={`group relative h-[400px] rounded-3xl overflow-hidden shadow-xl hover:shadow-[0_20px_50px_rgba(13,184,181,0.3)] transition-all duration-500 border-2 border-slate-200/80 ${srv.glow} bg-slate-900 flex flex-col justify-between`}
              >
                {/* Background Curated Medical Image */}
                <img
                  src={srv.img}
                  alt={srv.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent opacity-90 transition-opacity group-hover:opacity-80" />

                <div className="relative z-10 p-7 flex flex-col justify-between h-full text-white [transform-style:preserve-3d]">
                  <div>
                    <div className="flex items-center justify-between mb-4 [transform:translateZ(25px)]">
                      <span className="px-3.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#0DB8B5] text-white shadow-md">
                        {srv.badge}
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-white group-hover:text-teal-300 transition-colors mb-3 [transform:translateZ(35px)]">
                      {srv.title}
                    </h3>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed [transform:translateZ(15px)]">
                      {srv.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs font-bold text-teal-300 group-hover:text-white [transform:translateZ(30px)]">
                    <span>Explore Capabilities</span>
                    <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </div>
                </div>
              </Card3D>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* WHY DOCTORS CHOOSE SKORA WITH ON-SCROLL ANIMATION */}
      <section id="why-us" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <AnimatedSection>
          <div className="p-8 sm:p-14 rounded-[2.5rem] bg-gradient-to-br from-white via-sky-50/60 to-white border-2 border-sky-200 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0DB8B5] block">
                  Why Partner With Us /
                </span>
                <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-950 uppercase leading-[1.08]">
                  WHY DOCTORS & CLINICS CHOOSE SKORA
                </h2>
                <p className="text-slate-600 text-base leading-relaxed font-medium">
                  Unlike generic agencies, we specialize exclusively in medical digital growth. We build high-converting websites, optimize local search, and manage patient lead generation with full HIPAA compliance.
                </p>

                <div className="pt-4 flex items-center gap-4">
                  <button
                    onClick={() => handleOpenConsultation()}
                    className="px-8 py-4 rounded-full bg-gradient-to-r from-[#0DB8B5] to-teal-600 hover:from-teal-500 hover:to-cyan-600 text-white font-extrabold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <span>Book Free Practice Strategy Call</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {whyChooseUs.map((item, idx) => (
                  <Card3D key={idx} maxTilt={10} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[#0DB8B5]">
                      <item.icon size={20} />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.desc}</p>
                  </Card3D>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* PACKAGES FOR DOCTORS WITH ON-SCROLL ANIMATION */}
      <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0DB8B5] block mb-2">
            Transparent Pricing Packages /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">
            DOCTOR GROWTH PACKAGES
          </h2>
          <p className="mt-4 text-slate-600 text-base font-medium">
            Select the growth tier that fits your practice scale—no hidden fees or long-term lock-in.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg, idx) => (
            <AnimatedSection key={idx}>
              <div
                className={`relative p-8 sm:p-10 rounded-[2.5rem] h-full transition-all duration-300 flex flex-col justify-between ${
                  pkg.popular
                    ? "bg-slate-900 text-white shadow-2xl scale-105 border-2 border-[#0DB8B5]"
                    : "bg-white text-slate-900 border border-slate-200/80 shadow-md hover:shadow-xl"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute top-6 right-6 px-4 py-1 rounded-full text-[10px] font-mono font-bold bg-[#0DB8B5] text-white tracking-widest shadow-md">
                    MOST POPULAR FOR CLINICS
                  </span>
                )}

                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">{pkg.name}</h3>
                  <p className="text-xs font-semibold mt-1 opacity-80">{pkg.subtitle}</p>

                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black">{pkg.price}</span>
                    <span className="text-xs font-bold opacity-75">{pkg.period}</span>
                  </div>

                  <ul className="mt-8 space-y-3.5 text-xs font-semibold">
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3">
                        <CheckCircle2 size={16} className={pkg.popular ? "text-[#0DB8B5]" : "text-teal-600"} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-200/20">
                  <button
                    onClick={() => handleOpenConsultation(pkg.name)}
                    className={`w-full py-4 rounded-full font-extrabold text-xs transition-all cursor-pointer shadow-md ${
                      pkg.popular
                        ? "bg-[#0DB8B5] hover:bg-teal-400 text-white shadow-[0_0_25px_rgba(13,184,181,0.4)]"
                        : "bg-slate-900 hover:bg-[#0DB8B5] text-white"
                    }`}
                  >
                    Book Growth Plan Now
                  </button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* WHAT DOCTORS SAY ABOUT US WITH ON-SCROLL ANIMATION */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0DB8B5] block mb-2">
            Client Testimonials /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">
            WHAT DOCTORS SAY ABOUT US
          </h2>
          <p className="mt-4 text-slate-600 text-base font-medium">
            Hear from medical directors and specialists who scaled their practice with SKORA.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {doctorReviews.map((rev, idx) => (
            <AnimatedSection key={idx}>
              <Card3D
                maxTilt={8}
                className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md hover:shadow-xl flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-500 mb-4">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>

                  <p className="text-slate-700 text-sm italic font-medium leading-relaxed mb-6">
                    &quot;{rev.quote}&quot;
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                  <img src={rev.avatar} alt={rev.doctor} className="w-11 h-11 rounded-full object-cover border border-slate-300" />
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{rev.doctor}</h4>
                    <p className="text-xs font-semibold text-[#0DB8B5]">{rev.specialty}</p>
                    <span className="text-[10px] text-slate-400 font-mono">{rev.city}</span>
                  </div>
                </div>
              </Card3D>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* HEALTHCARE NEWS WITH ON-SCROLL ANIMATION */}
      <section id="news" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#0DB8B5] block mb-2">
            Healthcare Dispatches /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">
            HEALTHCARE DIGITAL NEWS & INSIGHTS
          </h2>
          <p className="mt-4 text-slate-600 text-base font-medium">
            Stay ahead with actionable insights on medical marketing, AI SEO, and clinic growth.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {healthcareNews.map((news, idx) => (
            <AnimatedSection key={idx}>
              <div className="group rounded-3xl overflow-hidden bg-white border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 h-full">
                <div className="h-48 overflow-hidden relative">
                  <img src={news.img} alt={news.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-[#0DB8B5] text-white">
                    {news.tag}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-[11px] font-mono text-slate-400">{news.date}</span>
                  <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#0DB8B5] transition-colors leading-snug">
                    {news.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {news.summary}
                  </p>
                  <div className="pt-2 flex items-center gap-1 text-xs font-bold text-[#0DB8B5]">
                    <span>Read Article</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <Footer onOpenConsultation={handleOpenConsultation} />

      {/* CONSULTATION MODAL */}
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialService={selectedService}
      />
    </main>
  );
}
