"use client";

import React, { createContext, useContext, useMemo } from "react";

interface PreloaderGate {
  /**
   * Was true while the preloader overlay was (or might be) covering the page,
   * which held mount-time entrance animations back. The overlay is gone, so
   * this is now permanently `false` — kept so every consumer's existing guard
   * still compiles and still short-circuits correctly.
   */
  isPreloaderActive: boolean;
  /** Retained for call-site compatibility; now a no-op. */
  markPreloaderDone: () => void;
}

/** Stable no-op so the context value never changes identity across renders. */
const noop = () => {};

const PreloaderContext = createContext<PreloaderGate>({
  isPreloaderActive: false,
  markPreloaderDone: noop,
});

/**
 * @deprecated The preloader is deleted, so nothing waits on a gate any more.
 * Exported only so a stale import cannot hard-fail the build.
 */
export const PRELOADER_GATE_SAFETY_MS = 0;

/**
 * Gate for entrance animations.
 *
 * There is no preloader overlay any more. It covered the page for ~3s on the
 * first visit of a session and locked body scroll, which pushed LCP past 3s and
 * meant a visitor with JS disabled never saw the page at all. Entrance
 * animations now run as soon as the component mounts.
 *
 * The context is kept — deliberately — so the consumers
 * (`Reveal`, `SplitHeading`, `Counter`, `SmoothScroll`, `EnterpriseHero`,
 * `ProcessSection`) keep their existing `usePreloaderGate()` shape and their
 * reduced-motion branches. `isPreloaderActive` is a constant `false`, so each
 * of those guards simply never fires.
 *
 * If animations ever need holding again, this is the one place to reintroduce
 * real state — but do not re-add a full-screen blocking overlay.
 */
export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({ isPreloaderActive: false, markPreloaderDone: noop }), []);

  return <PreloaderContext.Provider value={value}>{children}</PreloaderContext.Provider>;
}

export function usePreloaderGate() {
  return useContext(PreloaderContext);
}