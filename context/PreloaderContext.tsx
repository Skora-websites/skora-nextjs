"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface PreloaderGate {
  /**
   * True while the preloader overlay is (or may be) covering the page.
   * Starts true so mount-time entrance animations wait; the Preloader
   * opens the gate as soon as it decides to skip or starts fading out.
   */
  isPreloaderActive: boolean;
  /** Called by the Preloader when it is skipped, errors, or fades out. */
  markPreloaderDone: () => void;
}

const PreloaderContext = createContext<PreloaderGate>({
  isPreloaderActive: false,
  markPreloaderDone: () => {},
});

/**
 * Ceiling on how long the gate may stay closed — must be longer than the
 * Preloader's HARD_CAP_MS (components/Preloader.tsx), which is itself well
 * above the normal count (a ~2.6s 1→100% run plus its fade). This timer only
 * exists so content can never be stuck un-animated if the Preloader fails
 * to mount or report.
 */
export const PRELOADER_GATE_SAFETY_MS = 13000;

/**
 * Gate for entrance animations.
 *
 * The preloader overlay covers the page for ~3s on the first visit of a
 * session, while mount-time animations (GSAP / Framer) would otherwise play
 * hidden behind it and be over by the time the overlay fades.
 *
 * The gate starts CLOSED (active) so consumers hold their entrance
 * animations. The Preloader opens it pre-paint when it skips (already seen,
 * reduced motion, /admin) and at the moment the fade-out begins when it
 * plays — so animations run just as the overlay fades away. A safety timer
 * force-opens the gate so content can never be stuck un-animated if the
 * Preloader is ever removed or fails to report.
 */
export function PreloaderProvider({ children }: { children: React.ReactNode }) {
  const [isPreloaderActive, setIsPreloaderActive] = useState(true);

  const markPreloaderDone = useCallback(() => setIsPreloaderActive(false), []);

  // Safety net: never keep animations locked beyond PRELOADER_GATE_SAFETY_MS,
  // even if the Preloader fails to report done.
  useEffect(() => {
    const fallback = setTimeout(
      () => setIsPreloaderActive(false),
      PRELOADER_GATE_SAFETY_MS
    );
    return () => clearTimeout(fallback);
  }, []);

  const value = useMemo(
    () => ({ isPreloaderActive, markPreloaderDone }),
    [isPreloaderActive, markPreloaderDone]
  );

  return (
    <PreloaderContext.Provider value={value}>
      {children}
    </PreloaderContext.Provider>
  );
}

export function usePreloaderGate() {
  return useContext(PreloaderContext);
}
