"use client";

import React from "react";

interface ParallaxProps {
  children: React.ReactNode;
  /** ScrollSmoother speed factor. 1 = normal, >1 trails, <1 leads. */
  speed?: number;
  /** Extra lag in seconds that eases the element behind the scroll. */
  lag?: number;
  className?: string;
  as?: "div" | "section" | "figure" | "span" | "aside";
}

/**
 * ScrollSmoother parallax marker.
 *
 * Adds `data-speed` / `data-lag` which ScrollSmoother's `effects: true`
 * turns into scrubbed parallax. Purely declarative — no JS cost per frame,
 * and inert when ScrollSmoother is disabled (reduced motion, touch, or an
 * excluded route), so layout never depends on it.
 */
export default function Parallax({
  children,
  speed = 1.15,
  lag = 0,
  className = "",
  as: Tag = "div",
}: ParallaxProps) {
  return (
    <Tag
      className={className}
      data-speed={speed}
      {...(lag ? { "data-lag": lag } : {})}
    >
      {children}
    </Tag>
  );
}
