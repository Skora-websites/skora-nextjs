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
    // Disable auto scroll restoration by browser
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Force instant scroll to top on route change
    window.scrollTo(0, 0);

    // Refresh GSAP ScrollTrigger to recalculate accurate positions from top
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
      if (typeof window !== "undefined") {
        ScrollTrigger.refresh();
      }
    }, 80);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
