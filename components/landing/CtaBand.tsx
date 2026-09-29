"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "@/components/animation/Reveal";
import SplitHeading from "@/components/animation/SplitHeading";
import { CTA, CTA_TRUST_LINE } from "@/lib/cta";

interface CtaBandProps {
  title: React.ReactNode;
  description?: string;
  primaryLabel: string;
  /** Opens the consultation modal… */
  onPrimary?: () => void;
  /** …or navigates — whichever the caller has available. */
  primaryHref?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  secondaryHref?: string;
  /** Reassurance under the buttons. Defaults to the shared trust line. */
  trustNote?: string;
}

/**
 * Navy enterprise CTA band — one per page max.
 *
 * Classes come from `lib/cta.ts` so this band, the blog index band and the
 * blog post band always share the same hierarchy.
 */
export default function CtaBand({
  title,
  description,
  primaryLabel,
  onPrimary,
  primaryHref,
  secondaryLabel,
  onSecondary,
  secondaryHref,
  trustNote = CTA_TRUST_LINE,
}: CtaBandProps) {
  const primary = primaryHref ? (
    <Link href={primaryHref} className={CTA.primary}>
      <span>{primaryLabel}</span>
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    </Link>
  ) : (
    <button type="button" onClick={onPrimary} className={CTA.primary}>
      <span>{primaryLabel}</span>
      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
    </button>
  );

  const secondary = !secondaryLabel ? null : secondaryHref ? (
    <Link href={secondaryHref} className={CTA.secondary}>
      <span>{secondaryLabel}</span>
    </Link>
  ) : (
    <button type="button" onClick={onSecondary} className={CTA.secondary}>
      <span>{secondaryLabel}</span>
    </button>
  );

  return (
    <Reveal variant="zoom" className={CTA.band}>
      <div className={CTA.texture} aria-hidden="true" style={CTA.textureStyle} />
      <div className="relative mx-auto max-w-2xl space-y-5">
        <SplitHeading as="h2" className={CTA.heading}>
          {title}
        </SplitHeading>
        {description && <p className={CTA.body}>{description}</p>}
        <div className="pt-2">
          <div className={CTA.actions}>
            {primary}
            {secondary}
          </div>
          {trustNote && <p className={CTA.trust}>{trustNote}</p>}
        </div>
      </div>
    </Reveal>
  );
}
