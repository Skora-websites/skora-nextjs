"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { usePreloaderGate } from "@/context/PreloaderContext";

/**
 * Cinematic percentage preloader (no video).
 *
 * - Runs ONE continuous 1 → 100% count on a single requestAnimationFrame
 *   timeline, eased so it reads as a real process: a slow deliberate start,
 *   a fast middle, a settle on 100.
 * - Fades out when it reaches 100; a hard-cap timer is the safety net if the
 *   animation never runs (background tab, throttled rAF, crash).
 * - When it plays it notifies PreloaderContext so mount-time entrance
 *   animations (GSAP / Framer) wait for the fade instead of playing behind
 *   the overlay.
 * - Plays once per browser session (sessionStorage).
 * - Skips instantly (pre-paint) on /admin and under prefers-reduced-motion,
 *   so the overlay can never trap the user.
 */

const DURATION_MS = 2600; // the count itself
// Hard ceiling if the rAF loop never ticks. Must stay BELOW
// PRELOADER_GATE_SAFETY_MS in context/PreloaderContext.tsx.
const HARD_CAP_MS = 6000;
const FADE_MS = 600;
const SESSION_KEY = "skora-preloader-seen";

const BG = "#0B1310"; // site ink — no video frame to match any more
const ACCENT = "#2563EB";

type Phase = "visible" | "fading" | "hidden";

/**
 * easeInOutCubic: eases in, accelerates through the middle, lands softly.
 * One function drives the whole run — the number, the rail and the finish all
 * read from the same timeline, so there is exactly one process.
 */
function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function percentFrom(t: number): number {
  if (t >= 1) return 100;
  return Math.min(100, Math.max(1, Math.round(ease(t) * 100)));
}

// useLayoutEffect that doesn't warn during SSR — lets us hide the overlay
// pre-paint when it should be skipped.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Preloader() {
  const pathname = usePathname();
  const { markPreloaderDone } = usePreloaderGate();
  const rafRef = useRef<number | null>(null);
  const hardCapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("visible");
  const [percent, setPercent] = useState(1);

  const clearTimer = (slot: React.RefObject<ReturnType<typeof setTimeout> | null>) => {
    if (slot.current) {
      clearTimeout(slot.current);
      slot.current = null;
    }
  };

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* storage unavailable (private mode) — preloader just runs every load */
    }
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    clearTimer(hardCapTimer);
    setPercent(100);
    setPhase("fading");
    unmountTimer.current = setTimeout(() => {
      setPhase("hidden");
    }, FADE_MS);
    // Tell the rest of the app the overlay is leaving — this is what
    // releases the entrance-animation gate.
    markPreloaderDone();
  }, [markPreloaderDone]);

  // Hide instantly (pre-paint) if already seen this session, reduced motion
  // is requested, or we're in the admin area.
  useIsoLayoutEffect(() => {
    const adminArea = pathname?.startsWith("/admin") ?? false;
    let seen = false;
    let reducedMotion = false;
    try {
      seen = sessionStorage.getItem(SESSION_KEY) === "1";
      reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    } catch {
      /* ignore */
    }
    if (adminArea || seen || reducedMotion) {
      finishedRef.current = true;
      setPhase("hidden");
      // Overlay will never be shown — open the animation gate immediately
      // (pre-paint) so entrance animations run right away.
      markPreloaderDone();
      return;
    }
    // Lock page scroll while the preloader is up.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [pathname, markPreloaderDone]);

  // The single run: one rAF timeline from 1% to 100%.
  useEffect(() => {
    if (phase !== "visible") return;

    const start = performance.now();

    const tick = (now: number) => {
      // Absolute elapsed time, not accumulated frames: if the tab is
      // backgrounded mid-run it simply completes when the user returns.
      const t = Math.min(1, (now - start) / DURATION_MS);
      setPercent(percentFrom(t));
      if (t >= 1) {
        rafRef.current = null;
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    hardCapTimer.current = setTimeout(finish, HARD_CAP_MS);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      clearTimer(hardCapTimer);
    };
  }, [phase, finish]);

  // Always restore scroll and clear pending timers on unmount.
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      clearTimer(hardCapTimer);
      clearTimer(unmountTimer);
      document.body.style.overflow = "";
    };
  }, []);

  if (pathname?.startsWith("/admin")) return null;
  if (phase === "hidden") return null;

  return (
    <div
      role="status"
      aria-label="Loading SKORA"
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-opacity ease-out ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundColor: BG,
        transitionDuration: `${FADE_MS}ms`,
        pointerEvents: phase === "fading" ? "none" : "auto",
      }}
    >
      {/* Ambient light + film grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/2 top-1/2 h-[75vmin] w-[75vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]"
          style={{
            background: `radial-gradient(circle, ${ACCENT}66 0%, ${ACCENT}00 65%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.75) 0.5px, transparent 0.5px)",
            backgroundSize: "3px 3px",
          }}
        />
      </div>

      {/* Count */}
      <div className="relative flex w-full max-w-5xl flex-col items-center px-6 text-center">
        <span
          className="text-[11px] font-extrabold uppercase text-white/55"
          style={{ letterSpacing: "0.42em" }}
        >
          Skora
        </span>

        <div
          aria-hidden
          className="mt-5 flex items-baseline justify-center text-white"
        >
          <span
            className="display-hero tabular-nums"
            style={{ fontSize: "clamp(4.5rem, 19vw, 14rem)", lineHeight: 1 }}
          >
            {percent}
          </span>
          <span
            className="display-accent"
            style={{
              fontSize: "clamp(1.5rem, 5vw, 3.25rem)",
              color: ACCENT,
            }}
          >
            %
          </span>
        </div>

        <p
          className="mt-6 font-mono text-[10px] uppercase text-white/45"
          style={{ letterSpacing: "0.5em" }}
        >
          Preparing your experience
        </p>
      </div>

      {/* Progress rail — same timeline as the number */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
        <div
          className="h-full transition-[width] duration-150 ease-linear"
          style={{
            width: `${percent}%`,
            backgroundColor: ACCENT,
            boxShadow: "0 0 16px rgba(37,99,235,0.85)",
          }}
        />
      </div>

      {phase === "visible" && (
        <button
          type="button"
          onClick={finish}
          className="absolute bottom-8 right-6 rounded-full border border-white/25 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-white/60 transition-colors hover:border-white/50 hover:text-white"
        >
          Skip
        </button>
      )}
    </div>
  );
}
