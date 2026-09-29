"use client";

import React, { useEffect, useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion, CINEMA } from "@/lib/gsap";
import { usePreloaderGate } from "@/context/PreloaderContext";

// Layout effect that stays quiet during SSR — the count must reset to zero
// before the browser ever paints the stat at its final value.
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface CounterProps {
  /** Value with an optional prefix/suffix, e.g. "120+", "4 hrs", "99.9%". */
  value: string;
  className?: string;
}

/** Splits "120+" into number 120 and suffix "+"; "4 hrs" into 4 and " hrs". */
function parse(value: string): { target: number; decimals: number; prefix: string; suffix: string } {
  const match = value.match(/^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/);
  if (!match) return { target: NaN, decimals: 0, prefix: "", suffix: value };
  return {
    prefix: match[1],
    target: parseFloat(match[2]),
    decimals: match[2].includes(".") ? match[2].split(".")[1].length : 0,
    suffix: match[3],
  };
}

/**
 * Scroll-triggered count-up for stat bands.
 *
 * Keeps the original string as the SSR/initial content, so the number is
 * always readable — animation only re-plays it from zero once it scrolls in.
 * Under reduced motion the value is simply left alone.
 */
export default function Counter({ value, className = "" }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { isPreloaderActive } = usePreloaderGate();
  const parsed = parse(value);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    if (Number.isNaN(parsed.target)) return;
    if (isPreloaderActive) return;

    const ctx = gsap.context(() => {
      const state = { n: 0 };
      el.textContent = `${parsed.prefix}${(0).toFixed(parsed.decimals)}${parsed.suffix}`;
      gsap.to(state, {
        n: parsed.target,
        duration: 1.8,
        ease: CINEMA.reveal,
        scrollTrigger: { trigger: el, start: "top 92%", once: true },
        onUpdate: () => {
          el.textContent = `${parsed.prefix}${state.n.toFixed(parsed.decimals)}${parsed.suffix}`;
        },
        onComplete: () => {
          el.textContent = value;
        },
      });
    }, el);

    return () => {
      ctx.revert();
      el.textContent = value;
    };
  }, [isPreloaderActive, value, parsed.target, parsed.decimals, parsed.prefix, parsed.suffix]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
