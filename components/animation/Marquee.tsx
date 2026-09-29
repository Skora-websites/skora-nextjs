"use client";

import React, { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

interface MarqueeProps {
  /** Content rendered once; it is duplicated to fill and loop seamlessly. */
  children: React.ReactNode;
  /** Seconds for one full cycle. */
  duration?: number;
  /** Direction of travel. */
  direction?: "left" | "right";
  /** Extra class for the moving lane (spacing, sizing). */
  laneClassName?: string;
  className?: string;
}

/**
 * Infinite GSAP marquee that speeds up with scroll velocity.
 *
 * The lane is duplicated so the loop is a pure `-50%` wrap — no gap, no seam.
 * Instead of a CSS keyframe (which can only run at one speed), a single
 * ScrollTrigger reads scroll velocity and eases the timeline's `timeScale`
 * toward a boosted rate, so the rail feels attached to the page's momentum.
 *
 * Under reduced motion the lane simply sits still.
 */
export default function Marquee({
  children,
  duration = 32,
  direction = "left",
  laneClassName = "",
  className = "",
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const laneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lane = laneRef.current;
    if (!lane || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Two identical copies, so one full `-50%` cycle is a perfect wrap.
      if (direction === "right") gsap.set(lane, { xPercent: -50 });

      const loop = gsap.to(lane, {
        xPercent: direction === "left" ? -50 : 0,
        duration,
        ease: "none",
        repeat: -1,
      });

      const boost = { v: 1 };
      const trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          const velocity = gsap.utils.clamp(-1, 1, self.getVelocity() / 900);
          const target = 1 + Math.abs(velocity) * 2.6;
          gsap.to(boost, {
            v: target,
            duration: 0.35,
            ease: "power2.out",
            overwrite: true,
            onUpdate: () => loop.timeScale(boost.v),
          });
        },
      });

      return () => {
        trigger.kill();
        loop.kill();
      };
    }, trackRef);

    return () => ctx.revert();
  }, [duration, direction]);

  return (
    <div ref={trackRef} className={className} aria-hidden="true">
      <div ref={laneRef} className={`flex w-max items-center ${laneClassName}`}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
