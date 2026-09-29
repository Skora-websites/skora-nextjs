"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion, CINEMA } from "@/lib/gsap";

/** Values every entrance settles at, so variants only describe the offset. */
const REST: gsap.TweenVars = { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 };

interface OverlayProps {
  open: boolean;
  /** Container classes (position, z-index, colours). */
  className?: string;
  /** Entry/exit vars for the container itself. */
  frame?: { enter: gsap.TweenVars; exit: gsap.TweenVars };
  /**
   * Optional dialog card, identified by `data-overlay-panel`, animated in the
   * same timeline so a scrim can fade while the card scales up.
   */
  panel?: { enter: gsap.TweenVars; exit: gsap.TweenVars };
  /** Selector inside the overlay whose matches stagger in on open. */
  itemSelector?: string;
  duration?: number;
  role?: string;
  "aria-label"?: string;
  children: React.ReactNode;
}

/**
 * Mount/animate/unmount overlay — the GSAP replacement for framer's
 * `AnimatePresence`.
 *
 * Stays out of the DOM until `open` flips, plays the entry, and on close plays
 * the exit before unmounting (so exit animations are real, not skipped). All
 * tweens run inside `gsap.context` and are reverted on unmount.
 *
 * Under `prefers-reduced-motion` it mounts and unmounts instantly with no
 * motion at all — content is never hidden waiting for an animation that will
 * not run.
 */
export default function Overlay({
  open,
  className = "",
  frame = { enter: { opacity: 0, y: -20 }, exit: { opacity: 0, y: -20 } },
  panel,
  itemSelector,
  duration = 0.4,
  role,
  children,
  ...rest
}: OverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);

  // The vars objects are usually written inline at the call site, so they get a
  // new identity every render — hold them in a ref (written in an effect, not
  // during render) so the timeline below only re-runs when `open`/`mounted`
  // actually change.
  const varsRef = useRef({ frame, panel, itemSelector, duration });
  useLayoutEffect(() => {
    varsRef.current = { frame, panel, itemSelector, duration };
  });

  // Render-phase mount adjustment: show in the same commit `open` flips (no
  // one-frame flash), and unmount immediately on close when there is no exit
  // animation to wait for.
  const reduced = prefersReducedMotion();
  if (open && !mounted) setMounted(true);
  else if (!open && mounted && reduced) setMounted(false);

  useLayoutEffect(() => {
    if (!mounted) return;
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const { frame: f, panel: p, itemSelector: sel, duration: d } = varsRef.current;
    const panelVars = p ?? { enter: {}, exit: {} };

    const ctx = gsap.context(() => {
      const panels = p
        ? gsap.utils.toArray<HTMLElement>(root.querySelectorAll("[data-overlay-panel]"))
        : [];
      const items = sel ? gsap.utils.toArray<HTMLElement>(root.querySelectorAll(sel)) : [];

      if (open) {
        const tl = gsap.timeline();
        tl.fromTo(root, f.enter, { ...REST, duration: d, ease: CINEMA.enter });
        if (panels.length) {
          tl.fromTo(panels, panelVars.enter, { ...REST, duration: d * 0.9, ease: CINEMA.enter }, 0.05);
        }
        if (items.length) {
          tl.fromTo(
            items,
            { opacity: 0, y: 26 },
            {
              opacity: 1,
              y: 0,
              duration: d * 1.1,
              stagger: 0.045,
              delay: 0.1,
              ease: CINEMA.enter,
            },
            0.08
          );
        }
      } else {
        // Stop listening immediately so a closing overlay can't be clicked into.
        gsap.set(root, { pointerEvents: "none" });
        const tl = gsap.timeline({ onComplete: () => setMounted(false) });
        tl.to(root, { ...f.exit, duration: d * 0.75, ease: CINEMA.exit });
        if (panels.length) {
          tl.to(panels, { ...panelVars.exit, duration: d * 0.6, ease: CINEMA.exit }, 0);
        }
      }
    }, root);

    return () => ctx.revert();
  }, [open, mounted]);

  if (!mounted) return null;

  return (
    <div ref={rootRef} className={className} role={role} {...rest}>
      {children}
    </div>
  );
}
