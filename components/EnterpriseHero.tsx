"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Asterisk } from "lucide-react";
import { gsap, prefersReducedMotion, CINEMA } from "@/lib/gsap";
import { CTA } from "@/lib/cta";
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

/**
 * Hero work strip — four service-led tiles, each linking to the /services page
 * it belongs to. (The old clinic tile went with the healthcare division; the
 * imagery is reused from components/WorkReel.tsx so nothing new is invented.)
 *
 * The `w=`/`q=` params are gone from these URLs on purpose. They existed for a
 * raw `<img>`, which had to be told how large to ask for; `next/image` now owns
 * that decision. Leaving `w=800` in place would cap what Unsplash is willing to
 * hand the optimiser at 800px, and the biggest variant this strip ever needs
 * (a quarter of a 2048px viewport = 512 CSS px, 1024px on a retina panel) would
 * then be an upscale of an 800px original. `auto=format&fit=crop` stays: format
 * negotiation is the optimiser's job and `fit` is a no-op without dimensions.
 */
const workStrip = [
  {
    title: "Video and content library",
    tag: "Media",
    img: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop",
    link: "/services/video-production",
  },
  {
    title: "SaaS billing suite",
    tag: "Software",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop",
    link: "/services/saas-development",
  },
  {
    title: "Cloud migration",
    tag: "Infrastructure",
    img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop",
    link: "/services/cloud-services",
  },
  {
    title: "Marketing site",
    tag: "Web",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop",
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
      // Curtain reveal: each tile rises out from behind its own mask, so the
      // strip looks like frames being pulled up into the light.
      gsap.fromTo(
        ".gsap-work-card",
        { opacity: 0, yPercent: 10, clipPath: "inset(100% 0% 0% 0%)" },
        {
          opacity: 1,
          yPercent: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.15,
          stagger: 0.09,
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
      {/* Ambient key light — drifts against the scroll so the fold has depth. */}
      <Parallax
        speed={1.25}
        className="pointer-events-none absolute -top-40 left-0 right-0 h-[34rem]"
      >
        <div className="mx-auto h-full w-full max-w-[62rem] rounded-full bg-accent/[0.09] blur-3xl" />
      </Parallax>

      <div className="section-wrap relative">
        {/* Margin annotation — reads bottom-to-top like a film slate. */}
        <div
          className="absolute -left-14 top-[34%] hidden flex-col items-center gap-3 2xl:flex"
          aria-hidden="true"
        >
          <span className="rotate-180 text-[10px] font-extrabold uppercase tracking-[0.34em] text-faint [writing-mode:vertical-rl]">
            Scroll
          </span>
          <span className="scroll-cue__rail" />
        </div>

        {/* Top meta row */}
        <div className="gsap-hero-fade flex flex-wrap items-center justify-between gap-3 pb-8">
          <span className="kicker">Digital partner — India</span>
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
              className="btn-primary sheen group px-7 py-4 text-sm"
            >
              <span>{CTA.primaryLabel}</span>
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
        <div className="gsap-hero-fade relative mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
          <span
            className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] bg-gradient-to-r from-accent via-glow to-transparent"
            aria-hidden="true"
          />
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
              {/* The aspect box lives on the Parallax wrapper rather than the
                  image: `fill` takes the image out of flow and stretches it to
                  the nearest positioned ancestor, so the wrapper is what has to
                  carry the ratio. Same rendered box as before, but the space is
                  now reserved before the bytes arrive (no CLS), and `sizes`
                  tells the optimiser how wide the tile really is. */}
              <Parallax
                speed={1 + (i % 2 === 0 ? 0.06 : 0.12)}
                className="relative aspect-[4/5] sm:aspect-[3/3.4]"
              >
                <Image
                  src={w.img}
                  alt={w.title}
                  fill
                  // Two columns up to Tailwind's `lg` (64rem), four above it, and
                  // the strip is full-bleed (`px-4 sm:px-6 lg:px-8`) rather than
                  // inside `.section-wrap`, so each tile is a clean half (or a
                  // quarter) of the viewport minus its gutter.
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  // Deliberately not `priority`: the strip lands well below the
                  // fold and this page's LCP element is the 13.5vw headline above
                  // it, not a photograph — the Navbar logo already owns the one
                  // preload the homepage should spend.
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </Parallax>
              <span className="media-scrim" />
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
      <div className="relative mt-12 overflow-hidden border-y border-ink bg-ink-deep py-4 text-white">
        <span className="beam" aria-hidden="true" />
        <Marquee duration={30} className="relative z-10" laneClassName="gap-8 pr-8">
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
