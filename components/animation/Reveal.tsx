"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion, CINEMA } from "@/lib/gsap";
import { usePreloaderGate } from "@/context/PreloaderContext";

// Layout effect that stays quiet during SSR — the hidden state must land
// before the browser ever paints the element at rest.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type RevealVariant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom"
  | "flip"
  | "blur"
  | "mask";

const VARIANTS: Record<RevealVariant, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
  "fade-up": { from: { opacity: 0, y: 56 }, to: { opacity: 1, y: 0 } },
  "fade-down": { from: { opacity: 0, y: -56 }, to: { opacity: 1, y: 0 } },
  "fade-left": { from: { opacity: 0, x: 64 }, to: { opacity: 1, x: 0 } },
  "fade-right": { from: { opacity: 0, x: -64 }, to: { opacity: 1, x: 0 } },
  zoom: { from: { opacity: 0, scale: 0.86 }, to: { opacity: 1, scale: 1 } },
  flip: {
    from: { opacity: 0, rotateX: -38, scale: 0.94, transformPerspective: 1200 },
    to: { opacity: 1, rotateX: 0, scale: 1 },
  },
  blur: {
    from: { opacity: 0, y: 40, filter: "blur(14px)" },
    to: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  mask: {
    from: { clipPath: "inset(100% 0% 0% 0%)", y: 40 },
    to: { clipPath: "inset(0% 0% 0% 0%)", y: 0 },
  },
};

interface RevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  /** Delay before the reveal fires, in seconds. */
  delay?: number;
  /** Animation duration, in seconds. */
  duration?: number;
  /** Stagger step between `staggerSelector` children, in seconds. */
  stagger?: number;
  className?: string;
  /**
   * CSS selector inside this wrapper whose matched children stagger in
   * individually. When set, the wrapper itself is left alone (no double
   * animation on grids/lists) and only the children animate.
   */
  staggerSelector?: string;
  /** Fire once (default) or replay on every re-entry. */
  once?: boolean;
}

/**
 * ScrollTrigger-backed reveal — the single entrance primitive for the site.
 *
 * Replaces both the old IntersectionObserver `ScrollReveal` wrapper and every
 * framer-motion `whileInView` block, so a section animates exactly once.
 *
 * - Holds until the preloader starts fading (nothing plays behind the overlay).
 * - Leaves content visible and static under `prefers-reduced-motion` — the
 *   hidden state is only ever applied when we know we will animate it back.
 * - Runs inside `gsap.context` so triggers are reverted on unmount.
 */
export default function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.9,
  stagger = 0.08,
  className = "",
  staggerSelector,
  once = true,
}: RevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { isPreloaderActive } = usePreloaderGate();

  // Hide before paint so nothing flashes at its resting position first.
  // Layout effect (not an effect): the hidden state must land before the
  // browser ever paints the element at rest.
  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    if (staggerSelector) {
      gsap.set(root.querySelectorAll(staggerSelector), VARIANTS[variant].from);
    } else {
      gsap.set(root, VARIANTS[variant].from);
    }
  }, [variant, staggerSelector]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      gsap.set([root, ...root.querySelectorAll(staggerSelector ?? "*")], {
        clearProps: "opacity,transform,filter,clipPath",
      });
      return;
    }
    if (isPreloaderActive) return;

    const { from, to } = VARIANTS[variant];
    const start = staggerSelector ? "top 86%" : "top 88%";

    const ctx = gsap.context(() => {
      if (staggerSelector) {
        const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll(staggerSelector));
        if (!items.length) return;
        gsap.fromTo(items, from, {
          ...to,
          duration,
          stagger,
          delay,
          ease: CINEMA.enter,
          clearProps: "filter,clipPath",
          scrollTrigger: { trigger: root, start, once },
        });
      } else {
        gsap.fromTo(root, from, {
          ...to,
          duration,
          delay,
          ease: CINEMA.reveal,
          clearProps: "filter,clipPath",
          scrollTrigger: { trigger: root, start, once },
        });
      }
    }, root);

    return () => ctx.revert();
  }, [isPreloaderActive, variant, delay, duration, stagger, staggerSelector, once]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}
