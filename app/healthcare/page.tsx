"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  ArrowLeft,
  Award,
  BarChart3,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  ExternalLink,
  Globe,
  Heart,
  Layers,
  MapPin,
  Megaphone,
  MessageSquare,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  Users,
  Video,
  Zap,
  X,
  Stethoscope,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Card3D from "@/components/Card3D";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import HealthcareNavbar from "@/components/HealthcareNavbar";
import HealthcareFooter from "@/components/HealthcareFooter";
import ContactModal from "@/components/ContactModal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Hero Right Card Auto-Sliding Doctor Images Component (2s Interval, Right-to-Left Transition)
const HeroRightDoctorSlider = () => {
  const doctorImages = [
    {
      url: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
      title: "Modern Specialist Clinic Portal",
    },
    {
      url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
      title: "Doctor Telehealth & Consultation Suite",
    },
    {
      url: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80",
      title: "Advanced Medical Diagnostics & Surgery",
    },
    {
      url: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1200&q=80",
      title: "Doctor Clinical Care & Patient Consultation",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % doctorImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [doctorImages.length]);

  return (
    <div className="relative h-[420px] sm:h-[500px] lg:h-[580px] w-full rounded-[2rem] overflow-hidden shadow-xl bg-[#E8F2EC]">
      {/* Prerender ALL images stacked; only show current — eliminates black flash entirely */}
      {doctorImages.map((img, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 w-full h-full"
          animate={{
            x: i === currentIndex ? "0%" : i < currentIndex ? "-100%" : "100%",
            opacity: i === currentIndex ? 1 : 0,
          }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <img
            src={img.url}
            alt={img.title}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11261D]/80 via-transparent to-transparent" />
        </motion.div>
      ))}

      {/* Slide indicator dots */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-xs font-bold text-white">
        <span className="drop-shadow-md">{doctorImages[currentIndex].title}</span>
        <div className="flex items-center gap-1.5">
          {doctorImages.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-6 bg-[#2A8C57]" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// GSAP Animated EKG Heartbeat Waveform Canvas (Oral Care Sage Palette)
const EkgHeartbeatWave = () => {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    const path = pathRef.current;
    const length = path.getTotalLength();

    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
    });

    const tl = gsap.timeline({ repeat: -1 });
    tl.to(path, {
      strokeDashoffset: 0,
      duration: 2.2,
      ease: "power1.inOut",
    }).to(path, {
      strokeDashoffset: -length,
      duration: 1.2,
      ease: "power2.in",
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#0C1F16] p-4 sm:p-6 border border-[#1F6B43]/40 shadow-[0_0_30px_rgba(31,107,67,0.25)]">
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 text-xs font-mono font-bold text-[#2A8C57]">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-red-500 animate-pulse fill-red-500" />
          <span>EKG CLINICAL TELEMETRY</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400">72 BPM • SINUS RHYTHM</span>
        </div>
      </div>

      <div className="relative h-20 sm:h-24 w-full flex items-center justify-center my-2">
        <svg
          viewBox="0 0 800 120"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 60 L 150 60 L 170 60 L 180 20 L 195 100 L 210 10 L 225 110 L 240 60 L 260 60 L 350 60 L 370 60 L 380 15 L 395 105 L 410 5 L 425 115 L 440 60 L 460 60 L 550 60 L 570 60 L 580 25 L 595 95 L 610 12 L 625 108 L 640 60 L 800 60"
            fill="none"
            stroke="rgba(31, 107, 67, 0.3)"
            strokeWidth="3"
          />
          <path
            ref={pathRef}
            d="M 0 60 L 150 60 L 170 60 L 180 20 L 195 100 L 210 10 L 225 110 L 240 60 L 260 60 L 350 60 L 370 60 L 380 15 L 395 105 L 410 5 L 425 115 L 440 60 L 460 60 L 550 60 L 570 60 L 580 25 L 595 95 L 610 12 L 625 108 L 640 60 L 800 60"
            fill="none"
            stroke="#2A8C57"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-2 border-t border-emerald-500/20">
        <span>SWEEP: 25 mm/s</span>
        <span>GAIN: 10 mm/mV</span>
        <span>ORAL CARE MONITOR v4.2</span>
      </div>
    </div>
  );
};

// PREMIUM LIGHT GSAP ANIMATED BACKGROUND — MORPHING BLOBS + FLOATING PARTICLES + GRID
const OralCareGsapBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (typeof window === "undefined") return;
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX / innerWidth - 0.5) * 40,
        y: (e.clientY / innerHeight - 0.5) * 40,
      });
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {

      // 1. Morphing blob orbs — gentle float
      gsap.to(".bg-blob-1", {
        y: -60, x: 40, scale: 1.08,
        duration: 9, repeat: -1, yoyo: true, ease: "sine.inOut",
      });
      gsap.to(".bg-blob-2", {
        y: 50, x: -30, scale: 1.12,
        duration: 11, repeat: -1, yoyo: true, ease: "sine.inOut",
      });
      gsap.to(".bg-blob-3", {
        y: -40, x: -50, scale: 1.06,
        duration: 13, repeat: -1, yoyo: true, ease: "sine.inOut",
      });
      gsap.to(".bg-blob-4", {
        y: 60, x: 35, scale: 1.09,
        duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut",
      });

      // 2. Floating dot particles — staggered rise
      gsap.to(".bg-particle", {
        y: "-=120",
        opacity: 0,
        duration: "random(5, 9)",
        repeat: -1,
        stagger: { amount: 6, from: "random" },
        ease: "power1.out",
      });

      // 3. Concentric pulse rings
      gsap.to(".bg-ring", {
        scale: 2.2,
        opacity: 0,
        duration: 4,
        repeat: -1,
        stagger: 1.3,
        ease: "power2.out",
      });

      // 4. Drifting EKG line
      gsap.to(".bg-ekg-drift", {
        strokeDashoffset: -1400,
        duration: 16,
        repeat: -1,
        ease: "linear",
      });

      // 5. Cross icons slow spin + float
      gsap.to(".bg-cross", {
        rotation: 180,
        y: "-=25",
        duration: "random(7, 14)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { amount: 4, from: "random" },
      });

    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">

      {/* ── LAYER 1: Parallax ambient light orbs ── */}
      <motion.div
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: "spring", stiffness: 40, damping: 30 }}
        className="absolute inset-0"
      >
        <div className="bg-blob-1 absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-br from-[#1F6B43]/18 via-emerald-100/30 to-transparent rounded-[60%] blur-[120px]" />
        <div className="bg-blob-2 absolute top-[30%] -right-40 w-[500px] h-[500px] bg-[#D4EDE0]/70 rounded-full blur-[130px]" />
        <div className="bg-blob-3 absolute top-[55%] -left-40 w-[600px] h-[500px] bg-[#E8F2EC]/80 rounded-full blur-[130px]" />
        <div className="bg-blob-4 absolute bottom-[-5%] right-1/3 w-[450px] h-[450px] bg-emerald-50 rounded-full blur-[120px]" />
      </motion.div>

      {/* ── LAYER 2: Clinical dot grid ── */}
      <div
        className="absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: "radial-gradient(circle, #1f6b43 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── LAYER 3: Drifting EKG waveform ── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.18]" preserveAspectRatio="none">
        <path
          className="bg-ekg-drift"
          d="M -80 320 L 180 320 L 210 280 L 230 200 L 255 380 L 275 150 L 300 380 L 325 300 L 360 320 L 520 320 L 550 280 L 570 200 L 595 380 L 615 150 L 640 380 L 665 300 L 700 320 L 900 320 L 930 280 L 950 200 L 975 380 L 995 150 L 1020 380 L 1045 300 L 1080 320 L 1400 320"
          fill="none" stroke="#1F6B43" strokeWidth="2" strokeDasharray="22 10"
        />
      </svg>

      {/* ── LAYER 4: Concentric pulse rings (bottom left anchor) ── */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`bg-ring absolute bottom-[12%] left-[8%] rounded-full border border-[#1F6B43]/25`}
          style={{ width: 60 + i * 50, height: 60 + i * 50, marginLeft: -(i * 25), marginBottom: -(i * 25) }}
        />
      ))}

      {/* ── LAYER 5: Floating ambient particles ── */}
      {[
        { top: "85%", left: "15%" }, { top: "78%", left: "35%" }, { top: "90%", left: "55%" },
        { top: "82%", left: "72%" }, { top: "88%", left: "88%" }, { top: "70%", left: "25%" },
        { top: "75%", left: "62%" }, { top: "92%", left: "42%" },
      ].map((p, i) => (
        <div
          key={i}
          className="bg-particle absolute w-2 h-2 rounded-full bg-[#1F6B43]/30"
          style={{ top: p.top, left: p.left }}
        />
      ))}

      {/* ── LAYER 6: Floating cross (+) medical icons ── */}
      {[
        { top: "18%", left: "6%", size: 22, opacity: "opacity-20" },
        { top: "35%", left: "92%", size: 18, opacity: "opacity-15" },
        { top: "58%", left: "4%", size: 26, opacity: "opacity-20" },
        { top: "72%", left: "88%", size: 20, opacity: "opacity-15" },
      ].map((c, i) => (
        <div
          key={i}
          className={`bg-cross absolute ${c.opacity} text-[#1F6B43]`}
          style={{ top: c.top, left: c.left }}
        >
          <svg width={c.size} height={c.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="4" x2="12" y2="20" />
            <line x1="4" y1="12" x2="20" y2="12" />
          </svg>
        </div>
      ))}

      {/* ── LAYER 7: Scroll-driven fade band — gets more opaque as user scrolls down ── */}
      <div
        className="absolute inset-x-0 bottom-0 h-64 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(253,251,247,0.9) 0%, transparent 100%)",
        }}
      />
    </div>
  );
};

// Viewport On-Scroll Section Animation Wrapper
const AnimatedSection = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div
      ref={ref}
      style={{
        transform: isInView ? "none" : "translateY(40px) scale(0.97)",
        opacity: isInView ? 1 : 0,
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={className}
    >
      {children}
    </div>
  );
};

// DOCTOR SERVICES DATA
const doctorServices = [
  {
    id: "website-design",
    badge: "✦ Web Architecture ✦",
    title: "Custom Medical Websites",
    shortDesc: "High-speed, HIPAA-compliant clinic websites optimized for appointment conversions and mobile speed.",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80",
    stats: "3.2x Patient Calls",
    features: ["HIPAA Compliant", "Mobile First", "Instant Booking"],
    fullStrategy: "We build medical websites specifically tailored to healthcare providers. Your site will feature online appointment booking, doctor bio highlights, patient review showcases, and mobile-first loading speeds under 1.2 seconds.",
    deliverables: ["Custom UI/UX Design", "Online Scheduling Integration", "SSL & HIPAA Compliance Check", "Speed Optimization (95+ Lighthouse score)"],
  },
  {
    id: "gmb-seo",
    badge: "✦ GMB Local SEO ✦",
    title: "Google My Business (GMB)",
    shortDesc: "Rank #1 on Google Maps for high-intent patient queries in your immediate local clinic radius.",
    image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=600&q=80",
    stats: "#1 Local Map Pack",
    features: ["Map Pack Boost", "Review Management", "Local Citations"],
    fullStrategy: "90% of patients search 'doctor near me' on Google Maps. We optimize your GMB profile, build local medical citations, automate review collections, and track call volume weekly.",
    deliverables: ["Profile Audit & Verification", "Review Generation System", "Local Medical Keyword Targeting", "15-Day Rankings Report"],
  },
  {
    id: "social-reels",
    badge: "✦ Social Branding ✦",
    title: "Social Media & Reels",
    shortDesc: "Engaging short-form video reels, medical graphics, and brand awareness across Instagram & Facebook.",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
    stats: "14 Posts + 2 Reels/mo",
    features: ["Video Scripting", "Reel Editing", "Patient Trust Building"],
    fullStrategy: "Build immense trust in your community through educational medical reels and aesthetic clinic posts. We handle scriptwriting, video editing, caption writing, and channel publishing.",
    deliverables: ["Monthly Content Calendar", "Professional Reel Editing", "Instagram & FB Page Management", "Engagement Analytics"],
  },
  {
    id: "meta-ppc",
    badge: "✦ Paid Lead Engine ✦",
    title: "Meta Ads & Google PPC",
    shortDesc: "Targeted lead generation campaigns driving instant patient inquiries for specific treatments.",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=600&q=80",
    stats: "₹180 / Verified Lead",
    features: ["High Intent Ads", "Conversion Tracking", "WhatsApp Leads"],
    fullStrategy: "Run hyper-targeted ad campaigns for specific procedures (e.g., Dental Implants, IVF, Hair Transplant, Orthopedics). Inquiries land directly on your clinic WhatsApp or CRM.",
    deliverables: ["Ad Creative & Copywriting", "WhatsApp & Call Tracking", "A/B Testing Campaigns", "Daily Lead Dashboard"],
  },
  {
    id: "maps-seo",
    badge: "✦ Local Dominance ✦",
    title: "Google Maps & Local SEO",
    shortDesc: "Dominating local search results so nearby patients find your practice before any competitor.",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80",
    stats: "+320% Traffic Growth",
    features: ["Schema Markup", "Geo-Targeted Content", "Local Backlinks"],
    fullStrategy: "We optimize your website's local schema markup, create localized condition treatment pages, and build authoritative backlinks from medical directories.",
    deliverables: ["Medical Schema Architecture", "Condition Page Copywriting", "Medical Directory Submissions", "Rank Tracking"],
  },
  {
    id: "patient-campaigns",
    badge: "✦ Retention Engine ✦",
    title: "Patient Engagement",
    shortDesc: "Automated SMS, WhatsApp & Email reminder campaigns for follow-up appointments and health checkups.",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
    stats: "88% Patient Recall",
    features: ["Automated Reminders", "WhatsApp Broadcasts", "Follow-up Sequences"],
    fullStrategy: "Never lose a patient to missed follow-ups. Our automated WhatsApp workflows send appointment reminders, annual checkup alerts, and post-treatment care instructions.",
    deliverables: ["WhatsApp API Integration", "Automated SMS Workflows", "Patient Recall Sequences", "No-Show Reduction Metrics"],
  },
  {
    id: "content-pr",
    badge: "✦ Authority & PR ✦",
    title: "Medical Content & PR",
    shortDesc: "Doctor-written medical blogs, press releases, and expert health articles to establish authority.",
    image: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=600&q=80",
    stats: "Top Medical Blogs",
    features: ["E-E-A-T Content", "Press Release", "Expert Doctor Articles"],
    fullStrategy: "Google demands E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) for healthcare. We produce clinically accurate, SEO-optimized articles published under your doctor byline.",
    deliverables: ["Clinically Reviewed Articles", "Press Release Submissions", "Patient Education Guides", "Google News Indexing"],
  },
  {
    id: "lead-generation",
    badge: "✦ Lead Pipeline ✦",
    title: "Appointment Lead Gen",
    shortDesc: "Guaranteed high-intent patient booking requests delivered straight to your clinic receptionist.",
    image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
    stats: "50+ Leads / Month",
    features: ["Pre-screened Leads", "Receptionist Alerts", "Real-time Lead Tracker"],
    fullStrategy: "A complete end-to-end patient funnel. From ad click to WhatsApp intake form to receptionist notification, every lead is qualified before reaching your desk.",
    deliverables: ["Dedicated Intake Funnel", "Instant SMS/WhatsApp Notification", "Receptionist Training Guide", "Weekly Lead Audit"],
  },
];

const packages = [
  {
    name: "Basic Growth Plan",
    price: "₹5,000",
    period: "+ GST / month",
    popular: false,
    subtitle: "Essential local visibility for solo doctors & clinics",
    features: [
      "Custom 5-Page Doctor Website",
      "Google My Business (GMB) Setup",
      "8 Social Media Posts / month",
      "Basic Local SEO Setup",
      "Monthly Growth Report",
    ],
  },
  {
    name: "Standard Growth Plan",
    price: "₹15,000",
    period: "+ GST / month",
    popular: true,
    subtitle: "Our most popular package for growing medical practices",
    features: [
      "Custom 10-Page Medical Website + Booking",
      "GMB Profile Optimization & Map Rank",
      "14 Posts + 2 Reels / month",
      "High-Intent Local SEO Keywords",
      "Report Dispatched Every 15 Days",
      "Priority Clinical Support",
    ],
  },
  {
    name: "Premium Growth Plan",
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
    city: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "Working with a team that strictly focuses on healthcare made all the difference. They manage our website, reels, and patient leads effortlessly.",
    doctor: "Dr. Ananya Patel",
    specialty: "Dermatology Specialist",
    city: "Delhi NCR",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "Our orthopedic surgical leads increased by 340% within 3 months of launching our Meta PPC campaigns with SKORA.",
    doctor: "Dr. Vikramaditya Rao",
    specialty: "Orthopedic Surgeon & Director",
    city: "Bengaluru",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "The patient recall sequences on WhatsApp cut our no-shows down to almost zero. Best healthcare digital agency in India.",
    doctor: "Dr. Meera Nambiar",
    specialty: "IVF & Gynecology Specialist",
    city: "Kochi",
    avatar: "https://images.unsplash.com/photo-1594824813566-88855ce78961?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "Our dental clinic ranks #1 on Google Maps for all high-intent dental implant keywords in South Mumbai.",
    doctor: "Dr. Sidharth Roy",
    specialty: "Dental Surgeon & Clinic Owner",
    city: "Mumbai",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80",
  },
  {
    quote: "Professional, HIPAA-conscious, and extremely prompt with 15-day reporting dispatches. Highly recommended for clinicians.",
    doctor: "Dr. Priya Malhotra",
    specialty: "Pediatric Specialist",
    city: "Hyderabad",
    avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=300&q=80",
  },
];

const doctorNews = [
  {
    title: "How AI Search (GEO) Is Redefining Patient Acquisition in 2026",
    date: "August 2026",
    summary: "Patients are using ChatGPT & AI Overviews to find doctors. Discover how to optimize your clinic website for AI search engines.",
    fullContent: "Generative Engine Optimization (GEO) is replacing traditional Google SEO for healthcare. Patients now ask AI assistants questions like 'Who is the best orthopedic surgeon for knee replacement near me with high reviews?' We break down the 5 steps to ensure your clinic is indexed by AI engines.",
  },
  {
    title: "5 Medical Website Mistakes Costing You 40% of Appointments",
    date: "July 2026",
    summary: "Slow mobile loading, lack of online booking, and missing GMB integration are driving patients to competitors.",
    fullContent: "Studies show 74% of patients leave a doctor website if it takes longer than 3 seconds to load. In this deep dive, we showcase how adding instant WhatsApp booking and doctor video intros increases appointment conversions by 40%.",
  },
  {
    title: "Meta Ads vs. Google Search PPC: Which Yields Higher Doctor ROI?",
    date: "June 2026",
    summary: "A comparative ROI breakdown of Meta social ads versus Google PPC search ads for specialized medical treatments.",
    fullContent: "For urgent care and specialized surgeries, Google PPC captures immediate high-intent searchers. For elective procedures like cosmetic dentistry or dermatology, Meta Ads generate higher overall volume. We analyze how combining both yields optimal CPL.",
  },
];

export default function HealthcarePortal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [activeCardModal, setActiveCardModal] = useState<typeof doctorServices[0] | null>(null);
  const [activeNewsModal, setActiveNewsModal] = useState<typeof doctorNews[0] | null>(null);
  const [packageModalOpen, setPackageModalOpen] = useState<typeof packages[0] | null>(null);

  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-word-inner",
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.07,
        }
      );
      gsap.fromTo(
        ".hero-fade-up",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          stagger: 0.1,
          delay: 0.55,
        }
      );
      gsap.fromTo(
        ".hero-image-card",
        { opacity: 0, x: 80, scale: 0.88, clipPath: "inset(0 100% 0 0 round 2.5rem)" },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          clipPath: "inset(0 0% 0 0 round 2.5rem)",
          duration: 1.2,
          ease: "power4.out",
          delay: 0.3,
        }
      );
      gsap.fromTo(
        ".hero-pill",
        { opacity: 0, scale: 0.78, y: 14 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.65,
          ease: "back.out(1.5)",
          stagger: 0.1,
          delay: 0.9,
        }
      );
      gsap.fromTo(
        ".hero-ekg-section",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 1.0 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const SplitHeadline = ({ text, accent }: { text: string; accent?: boolean }) => (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i} className="hero-word inline-block overflow-hidden align-bottom mr-[0.25em] last:mr-0">
          <span
            className={`hero-word-inner inline-block${
              accent ? " text-transparent bg-clip-text bg-gradient-to-r from-[#1F6B43] via-[#2A8C57] to-emerald-600" : ""
            }`}
          >
            {word}
          </span>
        </span>
      ))}
    </>
  );

  const handleOpenConsultation = (topic?: string) => {
    setSelectedService(topic || "Doctor Healthcare Digital Growth");
    setModalOpen(true);
  };

  const trustPills = [
    { icon: "🏆", label: "350+ Clinics Partnered" },
    { icon: "📍", label: "#1 Google Maps Ranking" },
    { icon: "⚡", label: "₹180 / Verified Lead" },
    { icon: "🔒", label: "HIPAA Compliant" },
  ];

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-[#11261D] selection:bg-[#1F6B43] selection:text-white font-sans flex flex-col relative">
      <ScrollProgressBar />
      <OralCareGsapBackground />
      <HealthcareNavbar onOpenConsultation={handleOpenConsultation} />

      {/* ═══════════════════════════════════════════════════════════
           FRAMER ORAL CARE STYLE HERO — FULL VIEWPORT LINEN
          ═══════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative z-10 min-h-[100svh] flex flex-col justify-center pt-28 pb-16 px-6 sm:px-10 lg:px-16 overflow-hidden"
      >
        <div className="max-w-[1400px] mx-auto w-full">

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_560px] gap-12 lg:gap-20 items-center">

            {/* LEFT: Eyebrow + Headline + Body + CTA + Stats + Pills */}
            <div className="space-y-8">

              {/* Eyebrow pill */}
              <div className="hero-pill inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E8F2EC] border border-[#B8D9C6] text-[11px] font-mono font-bold text-[#1F6B43] shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#2A8C57] animate-pulse" />
                Premier Healthcare Digital Growth Agency · India
              </div>

              {/* OVERSIZED SPLIT-WORD HEADLINE — each word clips upward */}
              <h1 className="text-[clamp(2.8rem,7.5vw,6.5rem)] font-black tracking-[-0.025em] leading-[1.0] text-[#11261D]">
                <SplitHeadline text="Elevate Your" />
                <br />
                <SplitHeadline text="Clinical Practice" />
                <br />
                <span className="hero-word inline-block overflow-hidden align-bottom">
                  <span className="hero-word-inner inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#1F6B43] via-[#2A8C57] to-emerald-600">
                    With SKORA
                  </span>
                </span>
              </h1>

              {/* Subheading */}
              <p className="hero-fade-up text-[#4A6358] text-lg sm:text-xl font-medium leading-relaxed max-w-xl">
                We help doctors, clinics &amp; multi-specialty centers dominate Google Maps,
                get more patient appointments, and build a high-converting digital presence.
              </p>

              {/* CTA buttons */}
              <div className="hero-fade-up flex flex-wrap items-center gap-4">
                <button
                  onClick={() => handleOpenConsultation("Doctor Growth Blueprint")}
                  className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-[#11261D] hover:bg-[#1F6B43] text-white font-extrabold text-sm shadow-xl shadow-[#11261D]/20 hover:shadow-[#1F6B43]/30 transition-all duration-300 cursor-pointer"
                >
                  Book Free Clinic Audit
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a
                  href="#services"
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl border-2 border-[#11261D]/15 hover:border-[#1F6B43]/40 text-[#11261D] font-bold text-sm hover:text-[#1F6B43] transition-all duration-300"
                >
                  Explore Services
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              </div>

              {/* Stats strip */}
              <div className="hero-fade-up flex flex-wrap items-center gap-x-10 gap-y-4 pt-4 border-t border-[#DCE8E0]">
                {[
                  { val: "+320%", label: "Avg. Patient Lead Growth" },
                  { val: "350+", label: "Clinics Partnered", green: true },
                  { val: "99.4%", label: "Client Retention Rate" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className={`text-3xl font-black ${s.green ? "text-[#1F6B43]" : "text-[#11261D]"}`}>{s.val}</div>
                    <div className="text-xs text-[#6B8C7D] font-semibold mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Trust pills */}
              <div className="flex flex-wrap gap-3">
                {trustPills.map((p, i) => (
                  <span
                    key={i}
                    className="hero-pill inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#DCE8E0] text-[12px] font-semibold text-[#11261D] shadow-sm"
                  >
                    <span>{p.icon}</span> {p.label}
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT: Doctor image slider — scale-in from right */}
            <div className="relative space-y-5">
              <div className="hero-image-card relative rounded-[2.5rem] overflow-hidden shadow-[0_32px_80px_rgba(17,38,29,0.18)] border border-[#DCE8E0]">
                <HeroRightDoctorSlider />
              </div>
              <div className="hero-ekg-section">
                <EkgHeartbeatWave />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* WHAT WE DO FOR DOCTORS */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#1F6B43] block mb-2">
            Complete Digital Stack For Clinicians /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#11261D] tracking-tight uppercase">
            WHAT WE DO FOR DOCTORS
          </h2>
          <p className="mt-4 text-slate-600 text-base font-medium">
            Everything your medical practice needs to acquire patients, boost reputation, and automate bookings. Click any card to inspect full strategy & deliverables.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctorServices.map((service) => (
            <AnimatedSection key={service.id}>
              <div
                onClick={() => setActiveCardModal(service)}
                className="cursor-pointer group h-full"
              >
                <Card3D maxTilt={10} className="h-full p-6 rounded-[2.2rem] bg-white border border-[#DCE8E0] shadow-xl hover:shadow-2xl hover:border-[#1F6B43] transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
                  <div className="space-y-4">
                    <div className="relative h-44 w-full rounded-2xl overflow-hidden shadow-inner">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#11261D]/80 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-mono font-bold text-[#1F6B43] border border-[#DCE8E0] shadow-md">
                          {service.badge}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#1F6B43] text-[11px] font-bold text-white shadow-md">
                          {service.stats}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xl font-extrabold text-[#11261D] group-hover:text-[#1F6B43] transition-colors leading-snug">
                      {service.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {service.shortDesc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {service.features.map((feat, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-[#E8F2EC] text-[10px] font-bold text-[#11261D] border border-[#DCE8E0]">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold text-[#1F6B43] group-hover:translate-x-1 transition-transform pt-1">
                      <span>View Strategy & Deliverables</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </Card3D>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* WHY DOCTORS CHOOSE SKORA */}
      <section id="why-us" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10 bg-white rounded-[3rem] border border-[#DCE8E0] my-8 shadow-sm">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#1F6B43] block mb-2">
            Why Doctors Trust SKORA /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#11261D] tracking-tight uppercase">
            BUILT EXCLUSIVELY FOR CLINICIANS
          </h2>
          <p className="mt-4 text-slate-600 text-base font-medium">
            Unlike generic agencies, we specialize strictly in medical marketing, HIPAA standards, and patient lead generation workflows.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Stethoscope,
              title: "100% Medical Focus",
              desc: "We understand doctor specialties, medical terminologies, ethical advertising guidelines, and patient decision triggers.",
            },
            {
              icon: ShieldCheck,
              title: "HIPAA & Data Privacy",
              desc: "All patient contact forms, lead databases, and appointment workflows adhere to clinical privacy regulations.",
            },
            {
              icon: BarChart3,
              title: "15-Day Reporting Dispatches",
              desc: "Transparent analytical reports sent every 15 days showing total appointment calls, GMB views, and cost per lead.",
            },
            {
              icon: UserCheck,
              title: "No Doctor Time Wasted",
              desc: "Our team handles scriptwriting, video editing, GMB management, and lead notifications so you focus solely on treating patients.",
            },
          ].map((item, idx) => (
            <AnimatedSection key={idx}>
              <Card3D maxTilt={6} className="h-full p-8 rounded-[2rem] bg-white border border-[#DCE8E0] shadow-md hover:shadow-xl transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#1F6B43] to-emerald-700 flex items-center justify-center text-white shadow-md">
                  <item.icon size={24} />
                </div>
                <h3 className="text-lg font-extrabold text-[#11261D]">{item.title}</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{item.desc}</p>
              </Card3D>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* PACKAGES FOR DOCTORS */}
      <section id="packages" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#1F6B43] block mb-2">
            Transparent Pricing Packages /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#11261D] tracking-tight uppercase">
            DOCTOR GROWTH PACKAGES
          </h2>
          <p className="mt-4 text-slate-600 text-base font-medium">
            Select the growth tier that fits your practice scale—no hidden fees or long-term lock-in.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg, idx) => (
            <AnimatedSection key={idx}>
              <Card3D maxTilt={8} className={`relative p-8 sm:p-10 rounded-[2.5rem] h-full transition-all duration-300 flex flex-col justify-between border ${
                pkg.popular
                  ? "bg-[#11261D] text-white border-[#1F6B43] shadow-2xl scale-105"
                  : "bg-white text-[#11261D] border-[#DCE8E0] shadow-xl hover:shadow-2xl"
              }`}>
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-black">{pkg.name}</h3>
                      <p className={`text-xs mt-1 font-medium ${pkg.popular ? "text-slate-300" : "text-slate-500"}`}>
                        {pkg.subtitle}
                      </p>
                    </div>

                    {pkg.popular && (
                      <span className="shrink-0 px-3 py-1 rounded-full bg-[#1F6B43] text-white text-[10px] font-mono font-bold uppercase tracking-wider shadow-md">
                        ★ POPULAR ★
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight">{pkg.price}</span>
                    <span className={`text-xs font-semibold ${pkg.popular ? "text-slate-400" : "text-slate-500"}`}>
                      {pkg.period}
                    </span>
                  </div>

                  <ul className="space-y-3 pt-4 border-t border-slate-200/30 text-xs font-semibold">
                    {pkg.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2.5">
                        <CheckCircle2 size={16} className={pkg.popular ? "text-[#2A8C57]" : "text-emerald-600"} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => setPackageModalOpen(pkg)}
                    className={`w-full py-4 rounded-2xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                      pkg.popular
                        ? "bg-[#1F6B43] hover:bg-emerald-700 text-white shadow-[#1F6B43]/30"
                        : "bg-[#11261D] hover:bg-slate-900 text-white"
                    }`}
                  >
                    <span>BOOK GROWTH PLAN NOW</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </Card3D>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* FRAMER ORAL CARE STYLE LIGHT DOCTOR REVIEWS MARQUEE CAROUSEL */}
      <section id="testimonials" className="py-20 bg-[#F5F2EA] text-[#11261D] border-y border-[#DCE8E0] my-8 overflow-hidden w-full relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-14 px-4">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#1F6B43] block mb-2">
            Verified Doctor Testimonials /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight uppercase text-[#11261D]">
            WHAT DOCTORS SAY ABOUT US
          </h2>
          <p className="mt-4 text-slate-600 text-base font-medium">
            Hear from clinic directors and specialists across India who scaled their practices with SKORA.
          </p>
        </AnimatedSection>

        {/* Edge-to-Edge Continuous Infinite Sliding Marquee */}
        <div className="relative w-full overflow-hidden group">
          <div className="animate-marquee gap-6">
            {[...doctorReviews, ...doctorReviews].map((rev, idx) => (
              <div
                key={idx}
                className="w-[360px] sm:w-[420px] p-8 rounded-[2rem] bg-white border border-[#DCE8E0] shadow-xl flex flex-col justify-between shrink-0 space-y-6 hover:shadow-2xl hover:border-[#1F6B43] transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm font-medium leading-relaxed italic">
                    "{rev.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                  <img
                    src={rev.avatar}
                    alt={rev.doctor}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80";
                    }}
                    className="w-12 h-12 rounded-full object-cover border-2 border-[#1F6B43] shadow-sm"
                  />
                  <div>
                    <h4 className="text-base font-extrabold text-[#11261D]">{rev.doctor}</h4>
                    <p className="text-xs text-[#1F6B43] font-semibold">{rev.specialty} • {rev.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HEALTHCARE NEWS & INSIGHTS */}
      <section id="news" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#1F6B43] block mb-2">
            Healthcare Digital News /
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-[#11261D] tracking-tight uppercase">
            LATEST HEALTHCARE INSIGHTS
          </h2>
          <p className="mt-4 text-slate-600 text-base font-medium">
            Stay updated with medical digital trends, SEO strategies, and patient acquisition blueprints.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {doctorNews.map((news, idx) => (
            <AnimatedSection key={idx}>
              <div
                onClick={() => setActiveNewsModal(news)}
                className="cursor-pointer group h-full"
              >
                <Card3D maxTilt={8} className="p-6 rounded-[2rem] bg-white border border-[#DCE8E0] shadow-lg hover:shadow-xl transition-all space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[11px] font-mono text-slate-400">{news.date}</span>
                    <h3 className="text-lg font-extrabold text-[#11261D] group-hover:text-[#1F6B43] transition-colors leading-snug">
                      {news.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {news.summary}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-[#1F6B43] group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight size={14} />
                  </div>
                </Card3D>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* HEALTHCARE LIGHT TRIONN FOOTER */}
      <HealthcareFooter onOpenConsultation={handleOpenConsultation} />

      {/* INTERACTIVE DOCTOR CARD EXPANSION MODAL */}
      <AnimatePresence>
        {activeCardModal && (
          <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#11261D]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 my-auto w-full max-w-2xl rounded-3xl bg-white border border-[#DCE8E0] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#11261D]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <button
                  onClick={() => setActiveCardModal(null)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all border border-slate-200 cursor-pointer"
                >
                  <ArrowLeft size={16} className="text-[#1F6B43]" />
                  <span>Return to Previous Page</span>
                </button>
                <button
                  onClick={() => setActiveCardModal(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#E8F2EC] text-[11px] font-mono font-bold text-[#1F6B43] border border-[#DCE8E0]">
                    {activeCardModal.badge}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#1F6B43] text-[11px] font-bold text-white">
                    {activeCardModal.stats}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#11261D]">
                  {activeCardModal.title}
                </h2>

                <div className="p-4 rounded-2xl bg-[#F5F2EA] border border-[#DCE8E0]">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1F6B43] mb-2">
                    Clinical Strategy Overview
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {activeCardModal.fullStrategy}
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#11261D]">
                    Key Deliverables Included
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeCardModal.deliverables.map((del, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-bold text-slate-800 p-2.5 rounded-xl bg-[#FDFBF7] border border-[#DCE8E0]">
                        <CheckCircle2 size={16} className="text-[#1F6B43] shrink-0" />
                        <span>{del}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => {
                      const topic = activeCardModal.title;
                      setActiveCardModal(null);
                      handleOpenConsultation(topic);
                    }}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1F6B43] to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>REQUEST THIS SERVICE FOR MY CLINIC</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE DOCTOR PACKAGE BOOKING MODAL */}
      <AnimatePresence>
        {packageModalOpen && (
          <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#11261D]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 my-auto w-full max-w-xl rounded-3xl bg-white border border-[#DCE8E0] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#11261D]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <button
                  onClick={() => setPackageModalOpen(null)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all border border-slate-200 cursor-pointer"
                >
                  <ArrowLeft size={16} className="text-[#1F6B43]" />
                  <span>Return to Previous Page</span>
                </button>
                <button
                  onClick={() => setPackageModalOpen(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F2EC] text-[11px] font-mono font-bold text-[#1F6B43] border border-[#DCE8E0]">
                  <Stethoscope size={14} />
                  <span>SELECTED PACKAGE: {packageModalOpen.name}</span>
                </div>

                <h2 className="text-2xl font-black text-[#11261D]">
                  Book {packageModalOpen.name} ({packageModalOpen.price}/mo)
                </h2>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  Our doctor onboarding manager will set up your clinic dashboard and initiate your GMB & website audit within 24 hours.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert(`Package ${packageModalOpen.name} booked successfully. Our team will contact you shortly.`);
                    setPackageModalOpen(null);
                  }}
                  className="space-y-4 pt-2"
                >
                  <div>
                    <label className="text-xs font-mono font-bold uppercase text-slate-700">Doctor / Practice Name *</label>
                    <input type="text" required placeholder="Dr. John Smith / Smith Dental Clinic" className="w-full mt-1.5 bg-[#FDFBF7] border border-[#DCE8E0] rounded-xl px-3.5 py-2.5 text-xs text-[#11261D] focus:outline-none focus:border-[#1F6B43]" />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold uppercase text-slate-700">Work Email *</label>
                    <input type="email" required placeholder="doctor@clinic.com" className="w-full mt-1.5 bg-[#FDFBF7] border border-[#DCE8E0] rounded-xl px-3.5 py-2.5 text-xs text-[#11261D] focus:outline-none focus:border-[#1F6B43]" />
                  </div>
                  <div>
                    <label className="text-xs font-mono font-bold uppercase text-slate-700">WhatsApp / Phone *</label>
                    <input type="tel" required placeholder="+91 98765 43210" className="w-full mt-1.5 bg-[#FDFBF7] border border-[#DCE8E0] rounded-xl px-3.5 py-2.5 text-xs text-[#11261D] focus:outline-none focus:border-[#1F6B43]" />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1F6B43] to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>CONFIRM PACKAGE REGISTRATION</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INTERACTIVE NEWS ARTICLE SLIDER MODAL */}
      <AnimatePresence>
        {activeNewsModal && (
          <div className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto bg-[#11261D]/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative z-10 my-auto w-full max-w-2xl rounded-3xl bg-white border border-[#DCE8E0] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-[#11261D]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
                <button
                  onClick={() => setActiveNewsModal(null)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-all border border-slate-200 cursor-pointer"
                >
                  <ArrowLeft size={16} className="text-[#1F6B43]" />
                  <span>Return to Previous Page</span>
                </button>
                <button
                  onClick={() => setActiveNewsModal(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1F6B43]">
                  <BookOpen size={14} />
                  <span>HEALTHCARE INSIGHTS DISPATCH • {activeNewsModal.date}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#11261D]">
                  {activeNewsModal.title}
                </h2>

                <div className="p-5 rounded-2xl bg-[#F5F2EA] border border-[#DCE8E0] space-y-3">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1F6B43]">
                    Article Analysis & Action Plan
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                    {activeNewsModal.fullContent}
                  </p>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => setActiveNewsModal(null)}
                    className="px-6 py-2.5 rounded-xl bg-[#11261D] hover:bg-slate-900 text-white font-extrabold text-xs shadow-md cursor-pointer"
                  >
                    Close Article
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONSULTATION MODAL */}
      <ContactModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialService={selectedService}
      />
    </main>
  );
}
