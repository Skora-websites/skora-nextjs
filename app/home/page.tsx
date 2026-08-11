"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Globe,
  Megaphone,
  Smartphone,
  Cloud,
  Code,
  Layers,
  Users,
  Star,
  Sparkles,
  Award,
  Zap,
  TrendingUp,
  ShieldCheck,
  Headphones,
  LineChart,
  Settings,
  Film,
  Palette,
  Stethoscope,
  Building2,
  Check,
  Cpu,
  BarChart3,
  Rocket,
  Target,
  Compass,
  CheckSquare,
  Lock,
  Clock,
  Sparkle,
} from "lucide-react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";
import TechExpertiseSection from "@/components/TechExpertiseSection";
import Card3D from "@/components/Card3D";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// 100% Verified Active High-Res Images (Consultiv Dribbble Light Theme)
const heroGallery = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80",
    title: "Macro Flower Artwork",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    title: "Professional Portrait Study",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    title: "Creative Studio Photography",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=80",
    title: "Minimalist Green Aesthetics",
  },
  {
    id: 5,
    url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80",
    title: "Art Exhibition Gallery",
  },
];

// Partnerships & Collaborations Logos
const partnerLogos = [
  { name: "Opendoor" },
  { name: "DocuSign" },
  { name: "Slack" },
  { name: "Splunk>" },
  { name: "Atlassian" },
  { name: "Edskora" },
  { name: "Osborn Clinic" },
  { name: "Apex Enterprises" },
];

// All 9 Core Skora Capabilities & Services with Verified Images
const coreServices = [
  {
    id: "website-design",
    badge: "WEB & APP DEV",
    title: "Website Design & Web Engineering",
    desc: "We build fast, secure, and scalable websites and mobile applications. Our solutions are designed for performance, user experience, and growth.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    features: ["Responsive Next.js Architecture", "Sub-second Load Times", "Custom UI/UX Systems"],
    href: "/services/website-design",
  },
  {
    id: "digital-marketing",
    badge: "GROWTH & SEO",
    title: "Digital Marketing & Local SEO",
    desc: "Digital Marketing helps your business grow online through smart strategies and data-driven campaigns. We use SEO, social media, ads, and content to reach the right audience.",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=800&q=80",
    features: ["Google Maps #1 Ranking", "High-ROI PPC Campaigns", "Social Media Reels"],
    href: "/services/digital-marketing",
  },
  {
    id: "branding",
    badge: "BRAND STRATEGY",
    title: "Branding & Visual Identity",
    desc: "Brand Strategy defines who you are and how your audience connects with you. We create clear positioning, messaging, logos, and visual brand identity.",
    image: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=800&q=80",
    features: ["Logo & Brand Guidelines", "Visual Identity Systems", "Creative Ad Graphics"],
    href: "/services/branding",
  },
  {
    id: "video-production",
    badge: "CREATIVE REELS",
    title: "Video Production & Commercial Reels",
    desc: "High-converting video production, short-form Instagram reels, scriptwriting, and executive brand intros that capture immediate customer attention.",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
    features: ["Reels & Shorts Scriptwriting", "Professional 4K Editing", "Brand Storytelling"],
    href: "/services/video-production",
  },
  {
    id: "mobile-development",
    badge: "MOBILE APPS",
    title: "Mobile App Development",
    desc: "Native iOS & Android applications engineered for high performance, smooth animations, offline storage, and seamless user retention.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80",
    features: ["React Native & Flutter", "Real-time Push Alerts", "App Store Optimization"],
    href: "/services/mobile-development",
  },
  {
    id: "cloud-services",
    badge: "CLOUD INFRASTRUCTURE",
    title: "Cloud Solutions & DevOps",
    desc: "Cloud Solutions help businesses scale securely and efficiently. We provide reliable cloud infrastructure, AWS/Azure migration, and server management.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    features: ["AWS & Azure Migration", "99.99% Uptime SLA", "Disaster Recovery"],
    href: "/services/cloud-services",
  },
  {
    id: "saas-development",
    badge: "MULTI-TENANT SAAS",
    title: "SaaS Platform Development",
    desc: "Multi-tenant cloud architectures with automated recurring billing, user RBAC permissions, and scalable developer APIs.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    features: ["Multi-Tenant DB Architecture", "Stripe Recurring Billing", "OAuth2 & SSO Security"],
    href: "/services/saas-development",
  },
  {
    id: "crm",
    badge: "CRM AUTOMATION",
    title: "Custom CRM & WhatsApp Automations",
    desc: "Consolidate inquiries from Meta Ads, Google PPC, and website forms into a unified pipeline with automated WhatsApp & email triggers.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
    features: ["WhatsApp API Workflows", "Lead Scoring Pipeline", "Real-time Analytics"],
    href: "/services/crm",
  },
  {
    id: "pms",
    badge: "PROJECT MANAGEMENT",
    title: "Project Management Systems (PMS)",
    desc: "Agile task workflows, Kanban boards, Gantt timelines, billable resource tracking, and role-based client approval portals.",
    image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=800&q=80",
    features: ["Agile Kanban Boards", "Capacity Planning", "Client Approval Portals"],
    href: "/services/pms",
  },
];

// Skora Products Suite
const skoraProducts = [
  {
    title: "Website Development & Design Studio",
    category: "Web Engineering",
    desc: "User-friendly Next.js web applications, eCommerce solutions, API integrations, and SEO-optimized web development.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
    badge: "Engineering",
  },
  {
    title: "Digital Marketing & Local SEO Engine",
    category: "Performance Growth",
    desc: "Google My Business Maps #1 ranking, Meta lead ads, social media optimization (SMO), and content marketing.",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=600&q=80",
    badge: "Marketing",
  },
  {
    title: "Branding & Social Media Studio",
    category: "Visual Identity",
    desc: "Corporate brand positioning, logo design, visual guidelines, and high-converting performance ad creatives.",
    image: "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=600&q=80",
    badge: "Branding",
  },
  {
    title: "Custom Software & Cloud Solutions",
    category: "IT & Consulting",
    desc: "Custom software development, mobile app engineering, cloud infrastructure migration, and IT consulting.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    badge: "Cloud IT",
  },
];

// 4-Step Work Process
const workProcess = [
  {
    step: "01",
    title: "Discovery & Strategy Blueprint",
    desc: "We analyze your business goals, target audience, competitive landscape, and tech requirements to build a clear roadmap.",
    icon: Compass,
  },
  {
    step: "02",
    title: "UI/UX Design & Architecture",
    desc: "Our design team crafts bespoke wireframes, interactive prototypes, and scalable component systems before writing code.",
    icon: Palette,
  },
  {
    step: "03",
    title: "Agile Engineering & Quality Assurance",
    desc: "Full-stack development in 2-week sprints with continuous integration, unit testing, security audits, and performance tuning.",
    icon: Code,
  },
  {
    step: "04",
    title: "Deployment, SEO & Continuous Scale",
    desc: "Zero-downtime deployment to AWS/Vercel edge networks, schema markup for Google #1 rank, and ongoing SLA maintenance.",
    icon: Rocket,
  },
];

// 6 Key Differentiators - Why Choose Skora?
const whyChooseSkora = [
  {
    title: "Sub-Second Page Speed",
    desc: "100/100 Core Web Vitals speed tuning using Next.js 16 App Router and edge CDN distribution.",
    icon: Zap,
  },
  {
    title: "100% Custom Codebase",
    desc: "Zero bloated templates or slow page builders. Every line of code is custom engineered for your brand.",
    icon: Code,
  },
  {
    title: "Proven ROI & Growth Focus",
    desc: "Every campaign and feature is built around lead conversion, patient acquisition, and revenue growth.",
    icon: TrendingUp,
  },
  {
    title: "Enterprise Security & Compliance",
    desc: "HIPAA-ready healthcare workflows, SOC2 compliance standards, and end-to-end data encryption.",
    icon: ShieldCheck,
  },
  {
    title: "24/7 Dedicated Support",
    desc: "Direct access to project managers, lead engineers, and digital marketers with weekly sprint reports.",
    icon: Headphones,
  },
  {
    title: "All-in-One Digital Studio",
    desc: "From Web Dev to Meta Ads, Video Production & Cloud DevOps — everything managed under one roof.",
    icon: Award,
  },
];

// Value Proposition Cards
const valueProps = [
  {
    title: "DEDICATED SUPPORT",
    desc: "From the first consultation to final delivery, we stand by you offering guidance, clarity, and 24/7 reliable communication.",
    icon: Headphones,
  },
  {
    title: "PROVEN EXPERTISE",
    desc: "Our team brings years of development and digital marketing experience across industries helping clients achieve measurable, lasting results.",
    icon: Award,
  },
  {
    title: "DATA-DRIVEN INSIGHTS",
    desc: "We make every recommendation based on real data and deep analytics, ensuring smarter decisions and stronger outcomes.",
    icon: LineChart,
  },
  {
    title: "CUSTOMIZED SOLUTIONS",
    desc: "No templates. Every strategy & codebase is designed to match your specific business goals and unique market challenges.",
    icon: Settings,
  },
];

// Pricing Packages
const pricingPackages = [
  {
    name: "Audit & Consultation",
    price: "₹0",
    period: "/month",
    sub: "Growing teams and sales professionals.",
    extra: "Basic business consultation & digital audit.",
    features: [
      "1 Strategy session per month",
      "Email support",
      "Market overview report",
      "Access to core tools",
    ],
    featured: false,
  },
  {
    name: "Starter Growth",
    price: "₹15,000",
    period: "/month",
    sub: "Growing teams and sales professionals.",
    extra: "Basic business consultation & local visibility.",
    features: [
      "Everything in Audit",
      "Custom 5-page website",
      "Google My Business setup",
      "Monthly performance report",
      "Weekly strategy check-ins",
    ],
    featured: false,
  },
  {
    name: "Standard Growth",
    price: "₹25,000",
    period: "/month",
    sub: "Ideal for growing teams seeking market dominance.",
    extra: "Complete web development & active lead generation.",
    features: [
      "Everything in Starter",
      "Advanced analytics dashboard",
      "Competitor analysis",
      "Priority email & call support",
      "14 Social posts + 2 Reels/mo",
    ],
    featured: false,
  },
  {
    name: "Enterprise Suite",
    price: "₹49,000",
    period: "/month",
    sub: "Growing teams and ambitious brands.",
    extra: "Full custom development & dedicated marketing team.",
    features: [
      "Everything in Growth",
      "Dedicated account manager",
      "24/7 priority support",
      "Custom business solutions",
      "Full data insights & reporting",
      "Unlimited revision sprints",
    ],
    featured: true,
  },
];

// Testimonials Data
const testimonials = [
  {
    quote: "Skora transformed our digital presence completely. Our online patient inquiries tripled within 60 days of launching our new portal.",
    author: "Dr. Rajiv Sharma",
    role: "Director, Medical Care Center",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote: "The team delivered a custom SaaS solution in record time. Their attention to UX, data security, and load speed is unmatched.",
    author: "Ananya Patel",
    role: "Founder, TechFlow Systems",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote: "Our local Google Maps ranking jumped from page 3 to #1 in Mumbai. The ROI on our digital marketing campaign with Skora has been 4x.",
    author: "Vikramaditya Rao",
    role: "CEO, Apex Enterprises",
    image: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=200&q=80",
  },
];

export default function HomePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTopic, setModalTopic] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  const handleOpenConsultation = (topic?: string) => {
    setModalTopic(topic || "Strategy Session");
    setModalOpen(true);
  };

  // GSAP ScrollTrigger & Interactive Light Theme Animations Setup
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.refresh();

      // 1. Hero Title Reveal
      gsap.fromTo(
        ".gsap-hero-title",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.0, ease: "power4.out" }
      );

      gsap.fromTo(
        ".gsap-hero-sub",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" }
      );

      // 2. Hero Gallery Items Stagger & Parallax Entrance
      gsap.fromTo(
        ".gsap-gallery-item",
        { y: 80, opacity: 0, scale: 0.88 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.9,
          stagger: 0.1,
          delay: 0.3,
          ease: "back.out(1.4)",
        }
      );

      // 3. On-Scroll Section Card Reveals
      gsap.utils.toArray<HTMLElement>(".gsap-scroll-card").forEach((card) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, containerRef);

    // Interactive Mouse Movement Parallax
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const moveX = (e.clientX / innerWidth - 0.5) * 25;
      const moveY = (e.clientY / innerHeight - 0.5) * 25;

      gsap.to(".gsap-mouse-parallax", {
        x: moveX,
        y: moveY,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      ctx.revert();
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-[#F4F6F1] text-[#0B1310] font-sans selection:bg-[#22C55E] selection:text-white relative overflow-x-hidden"
    >
      <ScrollProgressBar />
      <Navbar onOpenConsultation={handleOpenConsultation} />

      {/* Light Background Morphing GSAP Ambient Blobs */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-200/35 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[800px] right-10 w-[500px] h-[500px] bg-[#E2ECE4]/70 rounded-full blur-[120px] pointer-events-none" />

      {/* =========================================================================
          1. HERO SECTION — CONSULTIV DRIBBBLE WARM LIGHT THEME
          ========================================================================= */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative z-10">
        {/* Social Proof Eyebrow Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white border border-[#E1E6DF] shadow-sm text-xs font-semibold mb-8"
        >
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E8F7ED] text-[#16A34A] font-bold text-[11px]">
            <span>“</span> Guest favorite <span>”</span>
          </span>
          <div className="flex -space-x-2">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
              alt="User"
              className="w-5 h-5 rounded-full border-2 border-white object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80"
              alt="User"
              className="w-5 h-5 rounded-full border-2 border-white object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
              alt="User"
              className="w-5 h-5 rounded-full border-2 border-white object-cover"
            />
          </div>
          <span className="text-[#0B1310] font-bold">200k+ Total user</span>
        </motion.div>

        {/* Display Headline */}
        <h1 className="gsap-hero-title text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.02] uppercase text-[#0B1310] max-w-5xl mx-auto">
          DRIVING BUSINESS
          <br />
          <span className="text-[#22C55E]">GROWTH &amp; SUCCESS</span>
        </h1>

        {/* Subtitle */}
        <p className="gsap-hero-sub mt-6 text-slate-600 text-base sm:text-lg max-w-xl mx-auto font-medium leading-relaxed">
          Smart consulting, web engineering, and digital marketing that actually helps your company grow with fresh ideas and solid strategies.
        </p>

        {/* Request Strategy Session Pill Button */}
        <div className="gsap-hero-sub mt-8 flex justify-center">
          <button
            onClick={() => handleOpenConsultation("Request a Strategy Session")}
            className="px-8 py-4 rounded-full bg-[#0B1310] hover:bg-[#22C55E] text-white font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            Request a Strategy Session
          </button>
        </div>

        {/* 5-Item Horizontal Thumbnail Gallery Row with Mouse Parallax & 3D Tilt */}
        <div
          ref={galleryRef}
          className="mt-16 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 gsap-mouse-parallax"
        >
          {heroGallery.map((img) => (
            <motion.div
              key={img.id}
              whileHover={{ y: -10, scale: 1.04, rotateX: 4, rotateY: -4 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="gsap-gallery-item relative h-64 sm:h-72 rounded-[2.2rem] overflow-hidden shadow-lg border border-[#E1E6DF] bg-white group cursor-pointer"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <span className="text-white text-xs font-bold">{img.title}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          2. PARTNERSHIPS & COLLABORATION LOGO MARQUEE
          ========================================================================= */}
      <section className="py-12 border-y border-[#E1E6DF] bg-[#EBF0E8]/60">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
            Trusted by Leading Enterprises, Startups &amp; Clinics Worldwide /
          </span>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-85">
            {partnerLogos.map((partner, idx) => (
              <span
                key={idx}
                className="text-lg sm:text-xl font-black font-mono tracking-widest uppercase text-slate-700 hover:text-[#22C55E] transition-colors cursor-pointer"
              >
                ✦ {partner.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. ABOUT SKORA & CORE METRICS SECTION
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Narrative */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-8 gsap-scroll-card"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F7ED] text-[#16A34A] text-xs font-bold font-mono uppercase border border-[#22C55E]/30">
              <span>✦ ABOUT SKORA DIGITAL ✦</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B1310] leading-tight uppercase">
              WE'VE GROWN INTO A GO-TO PARTNER FOR BUSINESS GROWTH AND SMART DIGITAL EXCELLENCE.
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-slate-600 text-sm font-medium leading-relaxed">
              <p>
                At Skora Digital, we specialize in delivering top-notch website development, mobile application engineering, and performance marketing solutions tailored to meet your business scale.
              </p>
              <p>
                From custom SaaS platforms and GMB Local SEO to high-converting video reels, we partner with startups and established enterprises to turn complex challenges into measurable market leadership.
              </p>
            </div>

            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-[#E1E6DF]">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#0B1310]">200k+</div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Verified leads generated</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#22C55E]">250+</div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Products &amp; apps built</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#0B1310]">99.4%</div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Client retention rate</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#22C55E]">15+</div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Global markets served</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Featured Image Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 gsap-scroll-card"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-[#E1E6DF] bg-white group cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                alt="Skora Strategy Session"
                className="w-full h-[460px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8">
                <div className="text-white space-y-1">
                  <span className="px-3 py-1 rounded-full bg-[#22C55E] text-[10px] font-bold uppercase tracking-wider">
                    ✦ FULL-STACK STUDIO &amp; LABS ✦
                  </span>
                  <h3 className="text-xl font-extrabold pt-2">Engineering &amp; Growth Marketing</h3>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          4. COMPLETE STUDIO SERVICES FOR STARTUPS & ESTABLISHED BUSINESSES
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E6DF]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#22C55E]">
            End-to-End Solutions /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#0B1310] uppercase tracking-tight">
            COMPLETE STUDIO SERVICES FOR STARTUPS &amp; ESTABLISHED BUSINESSES
          </h2>
          <p className="text-slate-600 text-sm sm:text-base font-medium">
            Whether launching your first MVP or scaling enterprise cloud infrastructure, our specialized engineering and marketing divisions deliver end-to-end execution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            whileHover={{ y: -8 }}
            className="p-8 rounded-[2.5rem] bg-white border border-[#E1E6DF] shadow-xl space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#E8F7ED] text-[#16A34A] flex items-center justify-center border border-[#22C55E]/30">
              <Rocket size={24} />
            </div>
            <h3 className="text-2xl font-extrabold text-[#0B1310]">For Early-Stage Startups</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Fast prototyping, high-converting landing pages, custom visual branding, and scalable Next.js MVPs built to secure early user traction and venture funding.
            </p>
            <ul className="space-y-2.5 text-xs font-bold text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#22C55E]" /> Sub-second Next.js MVP Launch</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#22C55E]" /> Brand Identity &amp; Logo System</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#22C55E]" /> Initial GMB Local SEO &amp; Meta Ads</li>
            </ul>
          </motion.div>

          <motion.div
            whileHover={{ y: -8 }}
            className="p-8 rounded-[2.5rem] bg-white border border-[#E1E6DF] shadow-xl space-y-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#0B1310] text-[#22C55E] flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <h3 className="text-2xl font-extrabold text-[#0B1310]">For Established Enterprises</h3>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              Multi-tenant SaaS architectures, complex CRM/PMS workflows, AWS cloud migrations, 99.99% uptime SLAs, and multi-channel performance marketing scale.
            </p>
            <ul className="space-y-2.5 text-xs font-bold text-slate-700">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#22C55E]" /> Multi-Tenant Cloud Architecture</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#22C55E]" /> Custom WhatsApp CRM Pipelines</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-[#22C55E]" /> High-Volume Video Reels Studio</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          5. LIGHT THEME CORE CAPABILITIES: "WHAT WE'RE UP TO"
          ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#EBF0E8]/70 rounded-[3rem] border border-[#E1E6DF] shadow-xl my-12">
        <div className="text-left mb-16 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#22C55E]">
            Complete Services Stack /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-[#0B1310]">
            WHAT WE'RE UP TO
          </h2>
        </div>

        {/* Services Grid (Light Theme Glass Cards with 3D Tilt) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {coreServices.map((service) => (
            <Link key={service.id} href={service.href}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="gsap-scroll-card group h-full p-6 rounded-[2.2rem] bg-white border border-[#E1E6DF] hover:border-[#22C55E] transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-md hover:shadow-2xl cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-inner">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[10px] font-mono font-bold text-[#16A34A] border border-[#E1E6DF] shadow-sm">
                        {service.badge}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-[#0B1310] group-hover:text-[#22C55E] transition-colors leading-snug">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {service.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E1E6DF] mt-4 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {service.features.map((feat, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#F4F6F1] text-[10px] font-bold text-slate-700 border border-[#E1E6DF]">
                        ✓ {feat}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-[#16A34A] group-hover:translate-x-1 transition-transform pt-1">
                    <span>Explore Service</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Specialisation Division Banner (Healthcare Portal Highlight) */}
        <div className="mt-20 gsap-scroll-card rounded-[2.5rem] bg-gradient-to-r from-[#E8F7ED] via-white to-[#E8F7ED] border border-[#22C55E]/40 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16A34A]/20 border border-[#22C55E]/30 text-xs font-mono font-bold text-[#16A34A]">
              <Stethoscope size={14} />
              <span>✦ HEALTHCARE &amp; CLINIC PRACTICE GROWTH ✦</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-[#0B1310] leading-tight uppercase">
              DEDICATED DOCTOR &amp; CLINIC IT PORTAL
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Specialized digital marketing, HIPAA-compliant websites, Google Maps #1 rankings, and automated WhatsApp patient recall systems built exclusively for doctors and medical centers.
            </p>
          </div>
          <Link
            href="/healthcare"
            className="shrink-0 px-8 py-4 rounded-full bg-[#0B1310] hover:bg-[#22C55E] text-white font-extrabold text-sm shadow-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Explore Healthcare Portal</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* =========================================================================
          6. OUR PRODUCTS SECTION (SKORA PROPRIETARY PRODUCTS FROM SKORASOFT)
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-left mb-16 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#22C55E]">
            Software Innovations /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B1310] uppercase">
            OUR PRODUCTS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skoraProducts.map((prod, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8, scale: 1.02 }}
              className="gsap-scroll-card p-6 rounded-[2.2rem] bg-white border border-[#E1E6DF] shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="relative h-44 w-full rounded-2xl overflow-hidden">
                  <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/95 text-[9px] font-bold text-[#16A34A] border border-[#E1E6DF]">
                      {prod.badge}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#16A34A] uppercase">{prod.category}</span>
                <h3 className="text-lg font-extrabold text-[#0B1310]">{prod.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{prod.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          7. WORK PROCESS (4-STEP ENGINE)
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E6DF]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#22C55E]">
            Execution Methodology /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B1310] uppercase">
            THE WORK PROCESS
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workProcess.map((proc, idx) => {
            const IconComp = proc.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="gsap-scroll-card p-8 rounded-[2.2rem] bg-white border border-[#E1E6DF] shadow-lg space-y-4 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F7ED] text-[#16A34A] flex items-center justify-center border border-[#22C55E]/30">
                    <IconComp size={20} />
                  </div>
                  <span className="text-2xl font-black font-mono text-[#16A34A]/40">{proc.step}</span>
                </div>
                <h3 className="text-base font-extrabold text-[#0B1310]">{proc.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{proc.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          8. WHY CHOOSE SKORA? (KEY DIFFERENTIATORS)
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E6DF]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#22C55E]">
            Our Advantage /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B1310] uppercase">
            WHY CHOOSE SKORA?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyChooseSkora.map((why, idx) => {
            const IconComp = why.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="gsap-scroll-card p-8 rounded-[2.2rem] bg-white border border-[#E1E6DF] shadow-lg space-y-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8F7ED] border border-[#22C55E]/40 flex items-center justify-center text-[#16A34A]">
                  <IconComp size={20} />
                </div>
                <h3 className="text-lg font-extrabold text-[#0B1310]">{why.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{why.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Technology Marquee Integration */}
      <div className="py-12 border-t border-[#E1E6DF] bg-[#EBF0E8]/40">
        <TechExpertiseSection />
      </div>

      {/* Horizontal Value Proposition Cards */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E6DF]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((vp, idx) => {
            const IconComp = vp.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="gsap-scroll-card p-6 rounded-2xl bg-white border border-[#E1E6DF] shadow-md space-y-3 hover:border-[#22C55E]/60 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8F7ED] border border-[#22C55E]/40 flex items-center justify-center text-[#16A34A]">
                  <IconComp size={20} />
                </div>
                <h4 className="text-sm font-black text-[#0B1310] uppercase tracking-wider">{vp.title}</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{vp.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          9. PRICING MATRIX — CONSULTIV DRIBBBLE WARM LIGHT SECTION
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E1E6DF]">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B1310] uppercase">
            PRICING THAT WORKS FOR YOU
          </h2>
          <p className="text-slate-600 text-sm font-medium">
            Growing teams and sales professionals. Simple transparent plans tailored to scale.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {pricingPackages.map((pkg, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 300 }}
              className={`gsap-scroll-card rounded-[2.2rem] p-8 flex flex-col justify-between transition-all duration-300 relative ${
                pkg.featured
                  ? "bg-gradient-to-br from-[#1E824C] to-[#27AE60] text-white shadow-2xl scale-105 border-0 z-10"
                  : "bg-white border border-[#E1E6DF] text-[#0B1310] hover:border-[#22C55E]/50 shadow-lg"
              }`}
            >
              <div className="space-y-6">
                <div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${pkg.featured ? "text-white/80" : "text-[#16A34A]"}`}>
                    {pkg.name}
                  </span>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-black">{pkg.price}</span>
                    <span className={`text-xs ${pkg.featured ? "text-white/80" : "text-slate-500"}`}>{pkg.period}</span>
                  </div>
                  <p className={`text-xs mt-2 font-medium ${pkg.featured ? "text-white/90" : "text-slate-500"}`}>
                    {pkg.sub}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/40 space-y-3">
                  <div className={`text-xs font-bold ${pkg.featured ? "text-white" : "text-slate-700"}`}>
                    Extra: <span className="font-normal">{pkg.extra}</span>
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2 text-xs font-medium">
                        <CheckCircle2 size={14} className={pkg.featured ? "text-white" : "text-[#16A34A]"} />
                        <span className={pkg.featured ? "text-white" : "text-slate-700"}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => handleOpenConsultation(pkg.name)}
                  className={`w-full py-3.5 rounded-full font-extrabold text-xs transition-all duration-300 cursor-pointer ${
                    pkg.featured
                      ? "bg-white text-[#0B1310] hover:bg-slate-100 shadow-lg"
                      : "bg-[#0B1310] hover:bg-[#22C55E] text-white shadow-md"
                  }`}
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          10. LIQUID EMERALD CTA BANNER ("READY TO TRANSFORM YOUR BUSINESS?")
          ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-r from-[#1E824C] via-[#27AE60] to-[#16A34A] p-10 sm:p-16 text-center text-white border border-[#22C55E]/30 shadow-2xl">
          {/* Floating Tilted Photo Cards Left & Right */}
          <motion.div
            animate={{ rotate: [-6, -2, -6], y: [-5, 5, -5] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 w-44 h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 rotate-[-8deg]"
          >
            <img
              src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=400&q=80"
              alt="Design Art"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            animate={{ rotate: [6, 2, 6], y: [5, -5, 5] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-44 h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 rotate-[8deg]"
          >
            <img
              src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80"
              alt="Creative Art"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="max-w-2xl mx-auto space-y-6 relative z-10">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight uppercase">
              READY TO TRANSFORM YOUR BUSINESS?
            </h2>
            <p className="text-white/90 text-sm sm:text-base font-medium">
              Let's discuss how our web engineering, branding, and performance marketing strategies can accelerate your revenue growth.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => handleOpenConsultation("Transformation Consultation")}
                className="px-10 py-4 rounded-full bg-white hover:bg-slate-100 text-[#0B1310] font-black text-sm shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          11. TESTIMONIALS SECTION ("PEOPLE REALLY DIG IT")
          ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="max-w-2xl mx-auto mb-16 space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#16A34A]">
            Client Reviews /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0B1310] uppercase">
            PEOPLE REALLY DIG IT
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="gsap-scroll-card p-8 rounded-[2rem] bg-white border border-[#E1E6DF] shadow-lg text-left space-y-6 flex flex-col justify-between hover:border-[#22C55E]/60 transition-colors"
            >
              <p className="text-slate-600 text-sm italic font-medium leading-relaxed">
                “{t.quote}”
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-[#E1E6DF]">
                <img
                  src={t.image}
                  alt={t.author}
                  className="w-12 h-12 rounded-full object-cover border border-[#22C55E]"
                />
                <div>
                  <div className="text-sm font-bold text-[#0B1310]">{t.author}</div>
                  <div className="text-xs text-[#16A34A] font-medium">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />

      {/* Consultation Modal */}
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultService={modalTopic}
      />
    </main>
  );
}
