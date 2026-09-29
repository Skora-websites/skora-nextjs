"use client";

import React, { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap, prefersReducedMotion, CINEMA } from "@/lib/gsap";

type Phase = "idle" | "covering" | "covering-done" | "revealing";

/**
 * Cinematic route transition — a branded shutter that closes over the page
 * just before navigation and opens onto the new one.
 *
 * Behaviour:
 * - Intercepts same-origin internal link clicks (not modifier/new-tab clicks,
 *   not in-page `#hash` links, not downloads), closes the shutter, then pushes.
 * - Reveals when the pathname actually changes.
 * - Failsafe: if navigation doesn't happen (or the browser handles it
 *   elsewhere), the shutter re-opens after ~900ms so it can never get stuck.
 * - Fully inert under `prefers-reduced-motion`, and on /admin, which does its
 *   own routing.
 *
 * Lives in the root layout *outside* the smoother wrapper — a transformed
 * ancestor would break its `position: fixed`.
 */
export default function PageWipe() {
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const phase = useRef<Phase>("idle");
  const pendingHref = useRef<string | null>(null);
  const failsafe = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFailsafe = () => {
    if (failsafe.current) {
      clearTimeout(failsafe.current);
      failsafe.current = null;
    }
  };

  const reveal = () => {
    const panel = panelRef.current;
    if (!panel) {
      phase.current = "idle";
      return;
    }
    phase.current = "revealing";
    gsap
      .timeline({ onComplete: () => (phase.current = "idle") })
      .to(panel, {
        scaleY: 0,
        duration: 0.62,
        ease: CINEMA.reveal,
        transformOrigin: "50% 0%",
      })
      .to(labelRef.current, { opacity: 0, duration: 0.2 }, 0);
  };

  // 1. Capture internal link clicks.
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || href.startsWith("//")) return;
      if (href.includes("#")) return; // let in-page anchors behave natively
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;
      if (href === pathname) return;
      if (pathname.startsWith("/admin")) return;

      const panel = panelRef.current;
      if (!panel || phase.current === "covering") return;

      event.preventDefault();
      pendingHref.current = href;
      phase.current = "covering";

      gsap.set(panel, { scaleY: 0, transformOrigin: "50% 100%" });
      gsap.set(labelRef.current, { opacity: 0 });

      gsap
        .timeline({
          onComplete: () => {
            phase.current = "covering-done";
            const next = pendingHref.current;
            pendingHref.current = null;
            if (next) router.push(next);
            // Failsafe: if the route never changes, open again.
            clearFailsafe();
            failsafe.current = setTimeout(() => {
              if (phase.current === "covering-done") reveal();
            }, 900);
          },
        })
        .to(panel, { scaleY: 1, duration: 0.44, ease: CINEMA.exit })
        .to(labelRef.current, { opacity: 1, duration: 0.26 }, 0.14);
    };

    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      clearFailsafe();
    };
  }, [pathname, router]);

  // 2. Reveal once the new route has committed.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (phase.current === "covering-done" || phase.current === "covering") {
      clearFailsafe();
      // Let the new page paint behind the shutter first.
      const t = setTimeout(reveal, 120);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  // 3. Reset on mount / when motion preference is on: never trap the page.
  useEffect(() => {
    const panel = panelRef.current;
    if (panel && prefersReducedMotion()) {
      gsap.set(panel, { scaleY: 0 });
    }
  }, []);

  if (typeof window !== "undefined" && prefersReducedMotion()) return null;

  return (
    <div
      ref={panelRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9000] origin-bottom bg-ink-deep"
      style={{ transform: "scaleY(0)" }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-accent/70" />
      <div className="flex h-full items-center justify-center">
        <span
          ref={labelRef}
          className="text-3xl font-extrabold tracking-[0.35em] text-white opacity-0"
        >
          SKORA
        </span>
      </div>
    </div>
  );
}
