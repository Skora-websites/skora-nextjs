import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";

/**
 * Single GSAP registration point for the whole site.
 *
 * Every animation module imports from here so the premium plugins
 * (SplitText, ScrollSmoother, ScrambleText) are registered exactly once
 * and each component gets the same gsap / ScrollTrigger instances.
 *
 * Registration is guarded because this module is evaluated during SSR too —
 * `registerPlugin` is a no-op on the server, and the plugins themselves only
 * touch `window` when used from a client component's effect.
 */
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText, ScrambleTextPlugin);

// Mobile address-bar resizes would otherwise re-run every trigger mid-scroll.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, ScrollSmoother, SplitText, ScrambleTextPlugin };

/** True when the visitor asked the OS for reduced motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Signature easing used across the cinematic layer — a long, weighted
 * deceleration so entrances feel like a camera coming to rest.
 */
export const CINEMA = {
  enter: "power4.out",
  exit: "power3.in",
  reveal: "expo.out",
  scrub: "none",
} as const;
