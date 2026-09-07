"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface CtaButtonsProps {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  secondaryHref?: string;
  className?: string;
}

/** The two-button CTA row used everywhere: btn-primary + btn-secondary. */
export default function CtaButtons({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  secondaryHref,
  className = "",
}: CtaButtonsProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 sm:flex-row ${className}`}>
      <button type="button" onClick={onPrimary} className="btn-primary group text-base">
        <span>{primaryLabel}</span>
        <ArrowRight size={17} className="transition-transform group-hover:translate-x-1.5" />
      </button>
      {secondaryLabel && secondaryHref && (
        <a href={secondaryHref} className="btn-secondary text-base">
          {secondaryLabel}
        </a>
      )}
    </div>
  );
}
