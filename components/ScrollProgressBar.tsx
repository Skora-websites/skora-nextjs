"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Fixed page-progress bar at the very top of the viewport.
 *
 * Lives in the root layout, outside ScrollSmoother's wrapper. Progress is
 * written straight to the DOM through a GSAP setter instead of React state, so
 * scrolling never triggers a re-render — one write per frame, no diffing.
 */
export default function ScrollProgressBar() {
  const fillRef = useRef<HTMLDivElement>(null);
  // Re-arms the measurement after every navigation (the effect below depends
  // on it) so the bar starts a fresh page from zero.
  const pathname = usePathname();

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;

    // scaleX (not width) keeps it on the compositor — no layout per frame.
    gsap.set(el, { transformOrigin: "0% 50%", scaleX: 0 });
    const setter = gsap.quickSetter(el, "scaleX");

    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setter(total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    // ScrollSmoother rewrites the document height continuously and ScrollTrigger
    // re-measures after every navigation/refresh — recompute alongside it so
    // the bar never points at a stale page length.
    ScrollTrigger.addEventListener("refresh", update);

    // Layout settles after route changes, images and font swaps.
    const t1 = setTimeout(update, 200);
    const t2 = setTimeout(update, 800);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ScrollTrigger.removeEventListener("refresh", update);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] bg-transparent pointer-events-none">
      <div
        ref={fillRef}
        className="h-full w-full bg-gradient-to-r from-accent via-glow to-accent-light shadow-[0_0_12px_rgba(59,130,246,0.8)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
