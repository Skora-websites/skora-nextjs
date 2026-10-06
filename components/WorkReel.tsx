"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { gsap, ScrollTrigger, prefersReducedMotion, CINEMA } from "@/lib/gsap";
import Reveal from "@/components/animation/Reveal";
import SplitHeading from "@/components/animation/SplitHeading";

// Layout effect that stays quiet during SSR — the resting frame must be
// settled before the browser ever paints the stack.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const AUTOPLAY_MS = 5200;

const works = [
  {
    id: "institution",
    title: "Institution management platform",
    description: "Multi-user system with roles, attendance, and reports.",
    tag: "Education ops",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
  },
  {
    id: "clinic",
    title: "Clinic website and patient enquiries",
    description: "Department pages, appointment booking, and enquiry capture.",
    tag: "Healthcare",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d",
  },
  {
    id: "review",
    title: "Product review portal",
    description: "Article publishing, search, and affiliate tracking.",
    tag: "Publishing",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113",
  },
  {
    id: "dashboard",
    title: "Business dashboard",
    description: "Orders, customers, and day-to-day operations in one view.",
    tag: "Operations",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f",
  },
  {
    id: "marketing",
    title: "Marketing website",
    description: "Fast pages with clear calls to action and analytics.",
    tag: "Growth",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  },
  {
    id: "library",
    title: "Video and content library",
    description: "Organized video content with thumbnails and search.",
    tag: "Media",
    image: "https://images.unsplash.com/photo-1616469829581-73993eb86b02",
  },
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1460925895917-afdab827c52f";

const pad = (n: number) => String(n).padStart(2, "0");
const frame = (base: string, width: number) =>
  `${base}?auto=format&fit=crop&q=75&w=${width}`;

/**
 * Selected work as a film reel.
 *
 * Replaces the 3D MacBook carousel, whose rig was taller than the band it
 * lived in (the screen clipped off the top edge) and which left no heading,
 * no index and no way to see more than one frame at a time.
 *
 * Frames are stacked absolutely and cross-dissolved by GSAP — the incoming
 * frame fades up over the outgoing one at a slow settle, so there is never a
 * gap where the dark stage shows through. React only re-renders on index
 * change; every frame's opacity and scale live on the DOM, never in state.
 */
export default function WorkReel() {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const slideTween = useRef<gsap.core.Tween | null>(null);
  const prevIndex = useRef(0);
  const reduced = useRef(false);

  const total = works.length;
  const active = works[index];

  const goTo = (next: number) => setIndex(((next % total) + total) % total);

  // Resting state for the stack is pure CSS (.reel-slide + data-active), so
  // the browser never paints all six layered — and so clearing inline styles
  // can never leave the whole stack switched on. This only records the
  // motion preference, which is needed before the first transition runs.
  useIsoLayoutEffect(() => {
    reduced.current = prefersReducedMotion();
  }, []);

  // Only autoplay while the reel is actually on screen.
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top 88%",
      end: "bottom 12%",
      onToggle: (self) => setIsInView(self.isActive),
    });
    return () => st.kill();
  }, []);

  // Cross-dissolve into the next frame, caption riding in behind it.
  useIsoLayoutEffect(() => {
    const slides = Array.from(
      stageRef.current?.querySelectorAll<HTMLElement>("[data-slide]") ?? []
    );
    const next = index;
    const prev = prevIndex.current;
    prevIndex.current = next;
    if (prev === next || !slides[next]) return;

    const to = slides[next];
    const from = slides[prev];
    slideTween.current?.kill();

    // Hand every frame back to its CSS resting state first — React has already
    // flipped data-active, so `to` is lit and `from` is dark with no inline
    // help. Doing it all in one synchronous block means an interrupted
    // dissolve can't leave a stale opacity or scale behind, and nothing here
    // is visible between the clear and the re-set.
    gsap.set(slides, { clearProps: "opacity,transform,zIndex" });
    if (reduced.current) return;

    // Two frames overlap for the length of the dissolve, so stack the incoming
    // one on top and hold the outgoing one lit underneath — otherwise the new
    // frame would dissolve into a hole in the stage.
    gsap.set(slides, { zIndex: 1 });
    gsap.set(from, { opacity: 1 });
    gsap.set(to, { zIndex: 2 });

    slideTween.current = gsap.fromTo(
      to,
      { opacity: 0, scale: 1.07 },
      {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: CINEMA.reveal,
        overwrite: true,
        onComplete: () => {
          // Back to CSS: only the frame carrying data-active="true" stays lit.
          gsap.set(slides, { clearProps: "opacity,transform,zIndex" });
        },
      }
    );

    const caption = captionRef.current;
    if (caption) {
      gsap.fromTo(
        caption,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.1, ease: CINEMA.enter, overwrite: true }
      );
    }
  }, [index]);

  // Autoplay only while on screen and unhurried; restarts on manual selection
  // so a click always buys the frame a full beat.
  useEffect(() => {
    if (reduced.current || !isInView || isHovered) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [isInView, isHovered, index, total]);

  // The progress hairline runs on the same clock as autoplay.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;
    if (reduced.current || !isInView || isHovered) {
      gsap.set(bar, { scaleX: 0 });
      return;
    }
    gsap.fromTo(
      bar,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration: AUTOPLAY_MS / 1000,
        ease: "none",
        overwrite: true,
      }
    );
    return () => {
      gsap.killTweensOf(bar);
    };
  }, [index, isInView, isHovered]);

  useEffect(
    () => () => {
      slideTween.current?.kill();
    },
    []
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-t border-line bg-ink py-20 text-white sm:py-28"
    >
      {/* One lamp sweeping the set — the only perpetual motion in the band. */}
      <span className="beam" aria-hidden="true" />
      <span
        className="pointer-events-none absolute left-1/2 top-[-15%] h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-blue-500/15 blur-[130px]"
        aria-hidden="true"
      />

      <div className="section-wrap relative">
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-6">
          <Reveal variant="fade-left" className="max-w-2xl">
            <span className="kicker !text-white/60">Selected work</span>
            <SplitHeading as="h2" className="display-hero mt-4 text-4xl text-white sm:text-6xl">
              Six builds, <span className="display-accent text-glow">one reel.</span>
            </SplitHeading>
          </Reveal>

          <Reveal variant="fade-right" delay={0.15} className="max-w-sm">
            <p className="text-sm font-medium leading-relaxed text-white/70">
              A running reel of what we have shipped — every frame is a live project
              with real users, not a concept board.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Previous project"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/70 transition-colors duration-300 hover:border-white/60 hover:text-white active:scale-95"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Next project"
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 text-white/70 transition-colors duration-300 hover:border-white/60 hover:text-white active:scale-95"
              >
                <ArrowRight size={16} />
              </button>
              <span className="scene-marker ml-2 !text-white/50">
                Frame {pad(index + 1)} of {pad(total)}
              </span>
            </div>
          </Reveal>
        </div>

        <Reveal variant="mask" duration={1} className="relative mt-10 sm:mt-12">
          <div
            ref={stageRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-ink-deep shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)] sm:h-[380px] lg:h-[440px]"
          >
            {works.map((w, i) => (
              <div
                key={w.id}
                data-slide
                data-active={i === index ? "true" : "false"}
                className="reel-slide absolute inset-0"
                aria-hidden={i !== index}
              >
                {/*
                  Deliberately still a plain <img>, and the only one left on the
                  site.

                  The onError fallback rewrites `e.target.src` in place. That
                  cannot survive next/image: the optimiser emits a `srcset`
                  alongside `src`, and for an <img> that carries a srcset the
                  browser re-runs candidate selection on the `src` attribute and
                  picks the srcset entry again — the original, failing URL. So
                  the swap would not land, onError would fire again, and the
                  frame would sit in an error loop rather than showing the
                  stand-in. Expressing it through next/image needs a `failed`
                  set in state that swaps the `src` *prop* (which does re-render
                  the srcset) — a change to this component's state model, not a
                  tag swap, and out of scope here.

                  Until that lands, the frames keep the hand-rolled srcset below
                  so the fallback is not silently broken. They are still
                  lazy-loaded, and they are the last thing on the homepage, so
                  they are not competing for the fold either way.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frame(w.image, 1600)}
                  srcSet={`${frame(w.image, 800)} 800w, ${frame(w.image, 1600)} 1600w`}
                  sizes="(min-width: 1024px) 1280px, 100vw"
                  alt={w.title}
                  // All lazy. This section sits below the fold and React 19's SSR
                  // hoists any eager <img> into a preload link, which would put
                  // six full-size photos in the critical path for a frame most
                  // visitors never reach. The first slide is selected by
                  // `data-active` (a CSS opacity switch), not by load order, so
                  // lazy costs nothing visually.
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = frame(FALLBACK_IMAGE, 1600);
                  }}
                  className="h-full w-full object-cover"
                />
                <span className="media-scrim" />
              </div>
            ))}

            {/* HUD — slate info sits over the frame like a title card. */}
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/85 backdrop-blur-sm">
                  {active.tag}
                </span>
                <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.28em] text-white/60 backdrop-blur-sm">
                  Reel {pad(index + 1)}
                </span>
              </div>

              <div ref={captionRef} className="max-w-2xl">
                <h3 className="display-hero text-2xl text-white sm:text-3xl lg:text-4xl">
                  {active.title}
                </h3>
                <p className="mt-2.5 text-sm font-medium leading-relaxed text-white/75 sm:text-base">
                  {active.description}
                </p>
              </div>
            </div>
          </div>

          {/* Progress hairline — same clock as the autoplay. */}
          <div className="relative mt-5 h-px w-full overflow-hidden bg-white/15">
            <span
              ref={barRef}
              className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-accent via-glow to-accent-light"
            />
          </div>

          {/* Index rail: the whole reel, readable at a glance. */}
          <div className="mt-5 grid grid-cols-3 gap-x-5 gap-y-5 sm:grid-cols-6">
            {works.map((w, i) => (
              <button
                key={w.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show ${w.title}`}
                aria-current={i === index}
                className="group text-left focus-visible:outline-none"
              >
                <span
                  className={`block text-[10px] font-extrabold tracking-[0.25em] transition-colors duration-300 ${
                    i === index ? "text-white" : "text-white/40 group-hover:text-white/75"
                  }`}
                >
                  {pad(i + 1)}
                </span>
                <span
                  className={`mt-2 block h-0.5 w-full rounded-full transition-colors duration-300 ${
                    i === index ? "bg-accent" : "bg-white/15 group-hover:bg-white/45"
                  }`}
                />
                <span
                  className={`mt-2 hidden truncate text-xs font-semibold transition-colors duration-300 md:block ${
                    i === index ? "text-white/85" : "text-white/45 group-hover:text-white/75"
                  }`}
                >
                  {w.tag}
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
