"use client";

import React from "react";
import Card3D from "@/components/Card3D";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  /** Enables the blue-glow hover lift. */
  hover?: boolean;
}

/** Glass card wrapper around the shared Card3D — the one card style. */
export default function GlassCard({ children, className = "", maxTilt = 10, hover = true }: GlassCardProps) {
  return (
    <Card3D
      maxTilt={maxTilt}
      className={`glass-card ${hover ? "glass-card-hover" : ""} rounded-3xl ${className}`}
    >
      {children}
    </Card3D>
  );
}
