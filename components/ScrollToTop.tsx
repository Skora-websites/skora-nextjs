"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Force manual scroll restoration across all browsers
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // 2. Instant scroll reset to top (0,0)
    const resetScroll = () => {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
    };

    resetScroll();

    // 3. RequestAnimationFrame scroll reset to catch post-render layout shifts
    const rafId = requestAnimationFrame(() => {
      resetScroll();
    });

    // 4. Re-run scroll reset & refresh GSAP triggers after DOM settles
    const timer1 = setTimeout(() => {
      resetScroll();
      if (typeof window !== "undefined") {
        ScrollTrigger.clearScrollMemory();
        ScrollTrigger.refresh();
      }
    }, 50);

    const timer2 = setTimeout(() => {
      resetScroll();
      if (typeof window !== "undefined") {
        ScrollTrigger.refresh();
      }
    }, 150);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname]);

  return null;
}
