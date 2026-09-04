"use client";

import React, { useEffect, useRef } from "react";

/**
 * Scroll progress bar. Zero React re-renders: the scroll handler is
 * rAF-throttled and writes scaleX directly to the DOM node.
 */
export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;
    let ticking = false;

    const update = () => {
      ticking = false;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${Math.min(progress, 1)})`;
      }
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[100] bg-transparent pointer-events-none">
      <div
        ref={barRef}
        className="progress-bar-fill h-full w-full origin-left bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-300 shadow-[0_0_12px_rgba(59,130,246,0.8)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
