"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { ClipboardList, PenTool, Code2, Rocket } from "lucide-react";
import Reveal from "@/components/animation/Reveal";
import SplitHeading from "@/components/animation/SplitHeading";
import { gsap, prefersReducedMotion, CINEMA } from "@/lib/gsap";
import { usePreloaderGate } from "@/context/PreloaderContext";

// The drawn line must be empty before the browser ever paints the section.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const steps = [
  {
    index: "01",
    Icon: ClipboardList,
    title: "Scope in writing",
    description: "You get a fixed scope, timeline, and price before anything starts. No open-ended billing.",
    detail: "Signed statement of work",
  },
  {
    index: "02",
    Icon: PenTool,
    title: "Design you approve",
    description: "Wireframes first, then final layouts. Two structured revision rounds — no endless loops.",
    detail: "Two revision rounds",
  },
  {
    index: "03",
    Icon: Code2,
    title: "Build in the open",
    description: "Weekly staging demos, shared task board, and a group chat with the people doing the work.",
    detail: "Weekly staging demo",
  },
  {
    index: "04",
    Icon: Rocket,
    title: "Launch and handover",
    description: "Deployment, analytics, documentation, and a training session so your team owns it after.",
    detail: "Docs and training",
  },
];

/**
 * Process as a drawn line rather than a row of equal cards: a full-width
 * premise on top, and a rail beneath it that the scroll literally draws as the
 * visitor moves through the four beats.
 *
 * The premise is deliberately NOT `position: sticky` — ScrollSmoother pins
 * `#smooth-wrapper` (position:fixed; overflow:hidden), which becomes the
 * sticky element's scrollport. That port never scrolls, so a sticky descendant
 * just travels with the page and leaves an empty column behind it. Header on
 * top, rail below, no void.
 */
export default function ProcessSection() {
  const listRef = useRef<HTMLOListElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const { isPreloaderActive } = usePreloaderGate();

  useIsoLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return;
    gsap.set(track, { scaleY: 0, transformOrigin: "50% 0%" });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const list = listRef.current;
    if (!track || !list || isPreloaderActive) return;
    if (prefersReducedMotion()) {
      gsap.set(track, { clearProps: "transform" });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        track,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: list,
            start: "top 72%",
            end: "bottom 78%",
            scrub: 0.6,
          },
        }
      );

      // Each marker ignites as the drawn line reaches it.
      gsap.utils.toArray<HTMLElement>(list.querySelectorAll("[data-node]")).forEach((node) => {
        gsap.fromTo(
          node,
          { scale: 0.4, opacity: 0.25 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: CINEMA.enter,
            scrollTrigger: { trigger: node, start: "top 82%", once: true },
          }
        );
      });
    }, list);

    return () => ctx.revert();
  }, [isPreloaderActive]);

  return (
    <section className="border-t border-line bg-main py-20 sm:py-28">
      <div className="section-wrap">
        {/* Premise — sits above the rail, so the tall timeline never leaves an
            empty column beside it. Sticky is unavailable here: ScrollSmoother
            pins #smooth-wrapper (position:fixed; overflow:hidden), which becomes
            the scrollport sticky would have to stick to, and it never scrolls. */}
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-7">
          <Reveal variant="fade-left" className="max-w-2xl">
            <span className="kicker">How we work</span>
            <SplitHeading as="h2" className="display-hero mt-4 text-4xl sm:text-6xl">
              No black box, <span className="display-accent text-accent">ever.</span>
            </SplitHeading>
          </Reveal>

          <Reveal variant="fade-right" delay={0.15} className="max-w-md">
            <p className="text-sm font-medium leading-relaxed text-sub sm:text-base">
              Four beats, in order, with something to look at at the end of each one.
              You always know what is being worked on and what it will cost.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-line pt-4">
              <span className="scene-marker">Fixed scope</span>
              <span className="scene-marker">Weekly demos</span>
            </div>
          </Reveal>
        </div>

        {/* Rail — the line draws itself as the page scrolls. */}
        <Reveal
          variant="fade-up"
          duration={0.75}
          staggerSelector="[data-step]"
          stagger={0.12}
          className="mt-14 sm:mt-16"
        >
          <ol ref={listRef} className="relative pl-14 sm:pl-16">
            <span
              className="absolute bottom-2 left-[15px] top-2 w-0.5 rounded-full bg-line"
              aria-hidden="true"
            />
            <span
              ref={trackRef}
              className="absolute bottom-2 left-[15px] top-2 w-0.5 rounded-full bg-gradient-to-b from-accent via-glow to-accent-light"
              aria-hidden="true"
            />

            {steps.map((s) => (
              <li key={s.index} data-step className="group relative pb-12 last:pb-0">
                <span
                  data-node
                  className="absolute -left-14 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-surface text-[11px] font-extrabold tabular-nums text-accent transition-colors duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white sm:-left-16"
                >
                  {s.index}
                </span>

                <div className="rounded-2xl border border-transparent bg-surface p-6 transition-all duration-300 hover:border-line hover:shadow-[0_24px_48px_-28px_rgba(11,18,32,0.35)] sm:p-7">
                  <div className="flex items-start gap-5">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                      <s.Icon size={20} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1">
                        <h3 className="text-xl font-extrabold tracking-tight sm:text-2xl">
                          {s.title}
                        </h3>
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-faint">
                          {s.detail}
                        </span>
                      </div>
                      <p className="mt-2 max-w-3xl text-sm font-medium leading-relaxed text-sub sm:text-base">
                        {s.description}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
