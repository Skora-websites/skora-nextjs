"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Asterisk } from "lucide-react";
import { gsap, prefersReducedMotion, CINEMA } from "@/lib/gsap";
import { usePreloaderGate } from "@/context/PreloaderContext";

// Layout effect that stays quiet during SSR — the entrance timeline must be
// armed before the first frame the preloader fade reveals.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
import SplitHeading from "@/components/animation/SplitHeading";
import Counter from "@/components/animation/Counter";
import Marquee from "@/components/animation/Marquee";
import Parallax from "@/components/animation/Parallax";

const marqueeItems = [
  "Website design",
  "SaaS development",
  "Mobile apps",
  "Cloud and DevOps",
  "SEO and ads",
  "Branding",
  "CRM systems",
  "Video production",
];

const workStrip = [
  {
    title: "Clinic growth platform",
    tag: "Healthcare",
    img: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80",
    link: "/healthcare",
  },
  {
    title: "SaaS billing suite",
    tag: "Software",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    link: "/services/saas-development",
  },
  {
    title: "Cloud migration",
    tag: "Infrastructure",
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    link: "/services/cloud-services",
  },
  {
    title: "Marketing site",
    tag: "Web",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    link: "/services/website-design",
  },
];

const stats = [
  { value: "120+", label: "Projects shipped" },
  { value: "9", label: "Service practices" },
  { value: "15+", label: "Industries served" },
  { value: "4 hrs", label: "Response time" },
];

interface EnterpriseHeroProps {
  onOpenConsultation: (topic?: string) => void;
}

/**
 * Homepage hero.
 *
 * The headline is a masked SplitText reveal; everything below rides in after
 * it on one timeline that waits for the preloader. The work strip and the
 * closing rail carry ScrollSmoother parallax so the fold has real depth.
 */
export default function EnterpriseHero({ onOpenConsultation }: EnterpriseHeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const { isPreloaderActive } = usePreloaderGate();

  // Supporting copy, CTAs and the stats band enter as one staggered beat right
  // after the headline lines have cleared their masks.
  useIsoLayoutEffect(() => {
    if (isPreloaderActive || !heroRef.current) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-hero-fade",
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.95,
          stagger: 0.09,
          delay: 0.55,
          ease: CINEMA.enter,
        }
      );
      gsap.fromTo(
        ".gsap-work-card",
        { opacity: 0, y: 46, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          stagger: 0.08,
          delay: 0.95,
          ease: CINEMA.enter,
        }
      );
    }, heroRef);

    return () => ctx.revert();
  }, [isPreloaderActive]);

  return (
    <section ref={heroRef} className="relative overflow-hidden bg-paper pb-0 pt-28 sm:pt-36">
      <div
        className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,black,transparent_78%)]"
        aria-hidden="true"
      />
      <div
        className="absolute -top-32 left-1/2 h-96 w-[60rem] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-3xl"
        aria-hidden="true"
      />

      <div className="section-wrap relative">
        {/* Top meta row */}
        <div className="gsap-hero-fade flex flex-wrap items-center justify-between gap-3 pb-8">
          <span className="kicker">Digital partner — India . UK</span>
          <span className="hidden items-center gap-2 text-xs font-bold text-faint sm:inline-flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="h-2 w-2 rounded-full bg-accent" />
            </span>
            Booking new projects
          </span>
        </div>

        {/* Oversized headline — masked line reveal */}
        <SplitHeading
          as="h1"
          playOnMount
          type="lines"
          duration={1.15}
          stagger={0.11}
          className="display-hero text-[13.5vw] sm:text-[11vw] lg:text-[7.5rem]"
        >
          We design, build
          <br />
          <span className="display-accent text-accent">and grow</span> digital
          <br />
          businesses<span className="text-accent">.</span>
        </SplitHeading>

        {/* Sub + CTAs */}
        <div className="mt-8 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <p className="gsap-hero-fade max-w-xl text-base font-medium leading-relaxed text-sub sm:text-lg lg:col-span-6">
            Skora is a full-service studio for websites, custom software, mobile apps,
            and marketing — planned in the open, shipped on schedule, reported honestly.
          </p>
          <div className="gsap-hero-fade flex flex-wrap items-center gap-3 lg:col-span-6 lg:justify-end">
            <button
              type="button"
              onClick={() => onOpenConsultation()}
              className="btn-primary group px-7 py-4 text-sm"
            >
              <span>Start a project</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <a href="#work" className="btn-secondary group px-7 py-4 text-sm">
              <span>See the work</span>
              <ArrowUpRight
                size={16}
                className="text-accent transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </div>
        </div>

        {/* Stats band — values count up as they settle */}
        <div className="gsap-hero-fade mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface px-6 py-5">
              <p className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                <Counter value={s.value} />
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-widest text-faint">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Work strip — trailing parallax on the images */}
      <div id="work" className="gsap-hero-fade relative mt-12">
        <div className="section-wrap flex items-end justify-between pb-5">
          <p className="rule-label flex-1">Selected work</p>
          <Link
            href="/services/website-design"
            className="link-fill ml-4 shrink-0 text-xs font-extrabold uppercase tracking-widest text-ink"
          >
            All services
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {workStrip.map((w, i) => (
            <Link
              key={w.title}
              href={w.link}
              className="gsap-work-card group relative overflow-hidden rounded-2xl"
              style={{ willChange: "transform" }}
            >
              <Parallax speed={1 + (i % 2 === 0 ? 0.06 : 0.12)}>
                <img
                  src={w.img}
                  alt={w.title}
                  loading="eager"
                  className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105 sm:aspect-[3/3.4]"
                />
              </Parallax>
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-deep/85 via-ink-deep/10 to-transparent" />
              <span className="sticker absolute left-3 top-3 !py-1.5 !text-[10px]">{w.tag}</span>
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4">
                <span className="text-sm font-extrabold text-white sm:text-base">{w.title}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink transition group-hover:bg-accent group-hover:text-white">
                  <ArrowUpRight size={16} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Marquee — speed reacts to scroll velocity */}
      <div className="mt-12 overflow-hidden border-y border-ink bg-ink-deep py-4 text-white">
        <Marquee duration={30} laneClassName="gap-8 pr-8">
          {marqueeItems.map((item) => (
            <span
              key={item}
              className="flex shrink-0 items-center gap-8 pr-8 text-sm font-extrabold uppercase tracking-[0.2em]"
            >
              {item}
              <Asterisk size={18} className="text-accent" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
