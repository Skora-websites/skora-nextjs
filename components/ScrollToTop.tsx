"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger, ScrollSmoother } from "@/lib/gsap";

/**
 * On every route change: force manual history scroll restoration, snap back to
 * the top, and re-measure all ScrollTriggers against the new page.
 *
 * With ScrollSmoother active the body height is synthetic, so the smoother's
 * own `scrollTop(0)` is what actually repositions the transformed content —
 * plain `window.scrollTo` is kept as well for native-scroll routes
 * (/admin, reduced motion).
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      ScrollSmoother.get()?.scrollTop(0);
    };

    resetScroll();

    const rafId = requestAnimationFrame(resetScroll);
    const t1 = setTimeout(() => {
      resetScroll();
      ScrollTrigger.clearScrollMemory();
      ScrollTrigger.refresh();
    }, 60);
    const t2 = setTimeout(() => {
      resetScroll();
      ScrollTrigger.refresh();
    }, 220);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}
