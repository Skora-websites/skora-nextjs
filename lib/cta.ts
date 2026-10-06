/**
 * One CTA anatomy, applied to every navy conversion band on the site, plus the
 * one name the whole site calls its main ask.
 *
 * The bands keep their own markup (services, blog index and blog posts each
 * render their own block), but they all pull their classes from here so the
 * hierarchy — kicker → display headline → body → primary/secondary → trust
 * line — never drifts again.
 *
 * `primaryLabel` lives here for the same reason. The navbar had grown a second,
 * parallel CTA ("Free audit") whose inline form never persisted anything — it
 * only fired an `alert()` — so every conversion is now one button with one
 * label. Single-sourcing it means the desktop bar, the mobile menu and any
 * future surface cannot quietly start offering two different asks again.
 *
 * Plain class strings and literals: safe to import from server and client
 * components.
 */

import type { CSSProperties } from "react";

export const CTA = {
  /**
   * The one primary CTA label used across the site — pair with the button that
   * opens the shared consultation modal (`onOpenConsultation`), which is the
   * only lead-capturing path in the marketing chrome.
   */
  primaryLabel: "Book a consultation",
  /** Wrapper: navy band with the dotted texture, one per page maximum. */
  band: "navy-band relative overflow-hidden rounded-[2rem] px-6 py-12 text-center text-white sm:px-12 sm:py-14",
  /** The dotted radial texture behind the band content. */
  texture:
    "absolute inset-0 opacity-20 pointer-events-none",
  textureStyle: {
    backgroundImage: "radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)",
    backgroundSize: "26px 26px",
    maskImage: "radial-gradient(ellipse 60% 80% at 50% 50%, black, transparent 75%)",
    WebkitMaskImage: "radial-gradient(ellipse 60% 80% at 50% 50%, black, transparent 75%)",
  } as CSSProperties,
  /** Kicker above the headline. */
  kicker: "kicker justify-center text-white/70",
  /** Headline — pair with an inline `CTA.accent` span. */
  heading: "display-hero mx-auto max-w-2xl text-2xl sm:text-4xl text-white",
  /** Serif italic accent word inside the headline. */
  accent: "display-accent",
  /** Optional supporting sentence. */
  body: "mx-auto max-w-xl text-sm font-medium leading-relaxed text-white/75 sm:text-base",
  /** Primary action: white pill on navy. */
  primary:
    "group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-extrabold text-[#1D4ED8] shadow-xl transition-all hover:-translate-y-0.5 hover:bg-blue-50",
  /** Secondary action: ghost pill on navy. */
  secondary:
    "inline-flex items-center gap-2 rounded-xl border border-white/30 px-7 py-3.5 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10",
  /** Buttons row. */
  actions: "flex flex-wrap items-center justify-center gap-3 pt-1",
  /** Reassurance under the buttons. */
  trust: "pt-2 text-xs font-medium text-white/60",
} as const;

/** The reassurance line shared by every CTA band. */
export const CTA_TRUST_LINE = "Response within 4 business hours. NDA available on request.";

/** Trust signals repeated under heroes and in the hub. */
export const TRUST_SIGNALS = ["Fixed pricing", "NDA on request", "4 business hour response"];
