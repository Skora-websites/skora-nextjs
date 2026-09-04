"use client";

import React, { useCallback, useRef } from "react";

interface Card3DProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum tilt angle in degrees (default 12)
  glareOpacity?: number;
  neonEdge?: boolean; // Adds the dark-neon animated edge glow (marketing dark theme)
}

/**
 * 3D tilt card. Zero re-renders while tracking the pointer: transforms and
 * the glare gradient are written straight to the DOM via refs (rAF-throttled),
 * so hovering never triggers React work.
 */
export default function Card3D({
  children,
  className = "",
  maxTilt = 12,
  glareOpacity = 0.25,
  neonEdge = false,
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const coordsRef = useRef({ x: 0, y: 0 });

  const applyTransform = useCallback(() => {
    frameRef.current = null;
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = coordsRef.current.x - rect.left;
    const y = coordsRef.current.y - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
    if (glare) {
      glare.style.background = `radial-gradient(circle at ${((x / rect.width) * 100).toFixed(1)}% ${((y / rect.height) * 100).toFixed(1)}%, rgba(255, 255, 255, 0.35) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 80%)`;
      glare.style.opacity = String(glareOpacity);
    }
  }, [maxTilt, glareOpacity]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    coordsRef.current = { x: e.clientX, y: e.clientY };
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(applyTransform);
    }
  }, [applyTransform]);

  const handleMouseEnter = useCallback(() => {
    const card = cardRef.current;
    if (card) card.style.transition = "transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)";
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    const card = cardRef.current;
    if (card) {
      card.style.transition = "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)";
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    }
    const glare = glareRef.current;
    if (glare) glare.style.opacity = "0";
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
        transition: "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
        transformStyle: "preserve-3d",
      }}
      className={`relative overflow-hidden rounded-2xl cursor-pointer will-change-transform ${neonEdge ? "neon-border" : ""} ${className}`}
    >
      {/* Dynamic 3D Glare Light Reflection Spot */}
      <div
        ref={glareRef}
        className="card3d-glare pointer-events-none absolute inset-0 z-30"
        style={{ opacity: 0 }}
      />
      <div className="relative z-10 [transform-style:preserve-3d]">{children}</div>
    </div>
  );
}
