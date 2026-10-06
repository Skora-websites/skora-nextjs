"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger, ScrollSmoother, prefersReducedMotion } from "@/lib/gsap";
import { usePreloaderGate } from "@/context/PreloaderContext";

/**
 * Routes that opt out of the smooth scroller.
 *
 * /admin has its own fixed sidebar layout, which a transformed smoother wrapper
 * would turn into a content-relative box that scrolls away — it keeps native
 * scrolling.
 *
 * The wrapper/content divs are always rendered (inert plain divs when no
 * instance exists) so children never remount on navigation.
 */
function isSmootherExcluded(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

/** Bindings whose scroller is the smoother's proxy rather than the window. */
function killProxyScrollerTriggers() {
  ScrollTrigger.getAll().forEach((st) => {
    if (st.scroller && st.scroller !== window) st.kill();
  });
}

/**
 * ScrollSmoother drives the page: the body becomes the native scroll surface
 * and `#smooth-content` is transformed from it, which adds the weighted,
 * inertial feel. Everything fixed (navbar, progress bar, modals, preloader,
 * route wipe) lives outside the wrapper — a transformed ancestor would turn
 * `position: fixed` into a content-relative box that scrolls away.
 *
 * The instance is created once and survives navigation (killed only when the
 * route opts out or the visitor prefers reduced motion). Each route change
 * re-scans `[data-speed]` / `[data-lag]` markers and re-measures every trigger.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isPreloaderActive } = usePreloaderGate();
  const smootherRef = useRef<ReturnType<typeof ScrollSmoother.create> | null>(null);
  const optedOut = isSmootherExcluded(pathname) || prefersReducedMotion();

  // Lifecycle: only tied to whether the page should be smoothed at all.
  useEffect(() => {
    const html = document.documentElement;

    if (optedOut) {
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
        // Triggers bound to the smoother's proxy scroller are now dead — they
        // would compute progress against a detached scroller. Anything owned by
        // the incoming page uses the window (restored by kill()).
        killProxyScrollerTriggers();
        ScrollTrigger.refresh();
      }
      html.classList.remove("has-smoother");
      return;
    }

    if (!smootherRef.current) {
      smootherRef.current = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.05,
        smoothTouch: false, // native scrolling on touch devices
        effects: true, // picks up [data-speed] / [data-lag] markers
        autoResize: true,
      });
      // Turns off `scroll-behavior: smooth` (see globals.css) — GSAP requires
      // it, otherwise every programmatic scroll gets eased twice.
      html.classList.add("has-smoother");
      ScrollTrigger.refresh();
    }

    const smoother = smootherRef.current;

    // In-page anchors (#work, #capabilities) live inside #smooth-content, so
    // the browser would try to scroll the fixed wrapper instead of the window
    // and desync the two. Route them through the smoother instead.
    const onAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href") || "";
      if (!href.startsWith("#") || href.length < 2) return;
      const target = document.getElementById(href.slice(1));
      if (!target) return;
      e.preventDefault();
      smoother.scrollTo(target, true, "top top+=80");
    };
    document.addEventListener("click", onAnchorClick);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      smootherRef.current?.kill();
      smootherRef.current = null;
      killProxyScrollerTriggers();
      html.classList.remove("has-smoother");
    };
  }, [optedOut]);

  // On navigation: re-scan parallax markers in the new page, then recompute
  // every start/end position against the finished layout.
  useEffect(() => {
    if (optedOut) return;
    smootherRef.current?.effects("[data-speed], [data-lag]");
    ScrollTrigger.refresh();
  }, [pathname, optedOut]);

  // Recalculate once the preloader starts fading and again after fonts/images
  // settle, so trigger positions match the real layout rather than the
  // pre-overlay measurement.
  useEffect(() => {
    if (isPreloaderActive) return;

    const refresh = () => ScrollTrigger.refresh();
    const raf = requestAnimationFrame(refresh);
    const t1 = window.setTimeout(refresh, 120);
    const t2 = window.setTimeout(refresh, 500);

    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("load", refresh);
    };
  }, [isPreloaderActive, pathname]);

  return (
    <div id="smooth-wrapper">
      <div id="smooth-content">{children}</div>
    </div>
  );
}
