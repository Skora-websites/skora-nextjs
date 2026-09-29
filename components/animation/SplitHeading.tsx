"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, SplitText, prefersReducedMotion, CINEMA } from "@/lib/gsap";
import { usePreloaderGate } from "@/context/PreloaderContext";

// useLayoutEffect that stays quiet during SSR so the split can happen before
// first paint (no flash of the un-split headline).
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface SplitHeadingProps {
  children: React.ReactNode;
  /** Split granularity. "lines" gives the masked camera-pan reveal. */
  type?: "lines" | "words" | "chars" | "lines,words";
  /** Seconds each unit trails the previous one. */
  stagger?: number;
  duration?: number;
  delay?: number;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Play immediately on mount (hero) instead of waiting for scroll. */
  playOnMount?: boolean;
}

/**
 * Cinematic SplitText headline.
 *
 * Splits into masked lines/words/chars and pans them up from behind the mask —
 * the signature "camera settle" used on every display headline. Under
 * `prefers-reduced-motion` SplitText never runs, so the heading stays as plain
 * readable text.
 *
 * `autoSplit` re-splits on font load and resize so line breaks stay correct
 * after Fraunces/Jakarta finish loading.
 */
export default function SplitHeading({
  children,
  type = "lines",
  stagger = 0.09,
  duration = 1.1,
  delay = 0,
  className = "",
  as: Tag = "h2",
  playOnMount = false,
}: SplitHeadingProps) {
  const ref = useRef<HTMLElement>(null);
  const { isPreloaderActive } = usePreloaderGate();

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    // Hold until the preloader starts fading so the reveal is seen.
    if (isPreloaderActive) return;

    let split: SplitText | null = null;
    const ctx = gsap.context(() => {
      split = SplitText.create(el, {
        type,
        mask: type.includes("lines") ? "lines" : undefined,
        linesClass: "split-line",
        wordsClass: "split-word",
        charsClass: "split-char",
        aria: "auto",
        autoSplit: true,
        onSplit: (instance: SplitText) => {
          const targets = type.includes("lines")
            ? instance.lines
            : type.includes("words")
              ? instance.words
              : instance.chars;
          return gsap.fromTo(
            targets,
            { yPercent: 112, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration,
              stagger,
              delay,
              ease: CINEMA.enter,
              scrollTrigger: playOnMount
                ? undefined
                : { trigger: el, start: "top 88%", once: true },
            }
          );
        },
      });
    }, ref);

    return () => {
      ctx.revert();
      split?.revert();
    };
  }, [isPreloaderActive, playOnMount, type, stagger, duration, delay]);

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}
