"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/animation/Reveal";
import SplitHeading from "@/components/animation/SplitHeading";
import { gsap, prefersReducedMotion, CINEMA } from "@/lib/gsap";
import { SERVICES } from "@/lib/services";
import { HEALTHCARE } from "@/lib/healthcare";

/** The sector page is not one of the nine services, so it gets its own constant. */
const HEALTHCARE_ROUTE = "/healthcare";

const services = [
  {
    index: "01",
    title: "Websites that sell",
    description: "Design and Next.js development with on-page SEO, analytics, and content you can edit.",
    tags: ["Next.js", "SEO", "CMS-ready"],
    link: "/services/website-design",
  },
  {
    index: "02",
    title: "Custom software and SaaS",
    description: "Multi-user platforms with roles, subscriptions, and reporting built around your operations.",
    tags: ["Multi-tenant", "Billing", "Roles"],
    link: "/services/saas-development",
  },
  {
    index: "03",
    title: "Mobile apps",
    description: "iOS and Android from one codebase — tested weekly, published to both stores.",
    tags: ["iOS", "Android", "OTA updates"],
    link: "/services/mobile-development",
  },
  {
    index: "04",
    title: "Cloud and DevOps",
    description: "AWS and Azure setup with pipelines, monitoring, backups, and cost reviews.",
    tags: ["AWS", "CI/CD", "99.9% uptime"],
    link: "/services/cloud-services",
  },
  {
    index: "05",
    title: "Marketing that reports revenue",
    description: "Local SEO, Google and Meta ads tied to leads — spend, leads, cost per lead.",
    tags: ["Local SEO", "Ads", "Attribution"],
    link: "/services/digital-marketing",
  },
  {
    index: "06",
    title: "Healthcare practice growth",
    description: "Clinic websites, appointment booking, and local search for patient enquiries.",
    tags: ["Clinics", "Booking", "Local SEO"],
    link: HEALTHCARE_ROUTE,
    sector: true,
  },
];

/**
 * Imagery is the destination page's own hero shot — one source, no new assets.
 * /healthcare is not one of the nine SERVICES, so its image comes from the
 * healthcare copy rather than the service list.
 */
const previewImage = (link: string): string => {
  if (link === HEALTHCARE_ROUTE) return HEALTHCARE.heroImage;
  const slug = link.replace("/services/", "");
  return SERVICES.find((s) => s.slug === slug)?.heroImage ?? "";
};

/**
 * Capabilities table. Each row wipes in on its own as the table scrolls —
 * one reveal layer, no wrapper animation on top of a row animation.
 */
export default function CapabilitiesSection() {
  const hostRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);
  const previewTitleRef = useRef<HTMLSpanElement>(null);

  // Hover preview: the panel is written to directly with quickTo tweens, so
  // tracking the cursor never touches React state or re-renders the table.
  useEffect(() => {
    const host = hostRef.current;
    const preview = previewRef.current;
    const img = previewImgRef.current;
    const title = previewTitleRef.current;
    if (!host || !preview || !img || !title) return;
    if (prefersReducedMotion()) return;
    // Touch and narrow viewports never hover a row — keep the panel out.
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;

    let activeIndex = -1;

    gsap.set(preview, {
      xPercent: -50,
      yPercent: -50,
      x: 0,
      y: 0,
      autoAlpha: 0,
      scale: 0.94,
      rotate: -3,
    });
    const xTo = gsap.quickTo(preview, "x", { duration: 0.55, ease: "power3" });
    const yTo = gsap.quickTo(preview, "y", { duration: 0.55, ease: "power3" });

    const onMove = (event: MouseEvent) => {
      const rect = host.getBoundingClientRect();
      xTo(event.clientX - rect.left);
      yTo(event.clientY - rect.top);
    };

    const hide = () => {
      if (activeIndex === -1) return;
      activeIndex = -1;
      gsap.to(preview, {
        autoAlpha: 0,
        scale: 0.94,
        rotate: -3,
        duration: 0.28,
        ease: CINEMA.exit,
        overwrite: true,
      });
    };

    const onOver = (event: MouseEvent) => {
      const row = (event.target as HTMLElement | null)?.closest?.(
        "[data-cap-row]"
      ) as HTMLElement | null;
      if (!row || !host.contains(row)) return;
      const index = Number(row.getAttribute("data-cap-row"));
      if (index === activeIndex) return;
      activeIndex = index;

      const service = services[index];
      const src = previewImage(service.link);
      if (src && img.getAttribute("src") !== src) img.src = src;
      title.textContent = service.title;

      gsap.fromTo(
        img,
        { scale: 1.14, filter: "blur(6px)" },
        { scale: 1, filter: "blur(0px)", duration: 0.7, ease: CINEMA.enter, overwrite: true }
      );
      gsap.to(preview, {
        autoAlpha: 1,
        scale: 1,
        rotate: 0,
        duration: 0.42,
        ease: CINEMA.enter,
        overwrite: true,
      });
    };

    host.addEventListener("mousemove", onMove);
    host.addEventListener("mouseover", onOver);
    host.addEventListener("mouseleave", hide);

    return () => {
      host.removeEventListener("mousemove", onMove);
      host.removeEventListener("mouseover", onOver);
      host.removeEventListener("mouseleave", hide);
      gsap.killTweensOf([preview, img]);
      gsap.set([preview, img], { clearProps: "all" });
    };
  }, []);

  return (
    <section id="capabilities" className="bg-main py-20 sm:py-28">
      <div ref={hostRef} className="section-wrap relative">
        <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
          <Reveal variant="fade-left" className="max-w-2xl">
            <span className="kicker">What we do</span>
            <SplitHeading as="h2" className="display-hero mt-4 text-4xl sm:text-6xl">
              Six practices, <span className="display-accent text-accent">one team.</span>
            </SplitHeading>
          </Reveal>
          <Reveal variant="fade-right" delay={0.15} className="max-w-sm">
            <p className="text-sm font-medium leading-relaxed text-sub">
              Every engagement has a named owner, a fixed timeline, and weekly demos.
              Pick a practice to see scope and pricing.
            </p>
          </Reveal>
        </div>

        <Reveal
          variant="fade-up"
          duration={0.8}
          className="overflow-hidden rounded-3xl border border-line bg-surface"
          staggerSelector="[data-cap-row]"
          stagger={0.08}
        >
          {services.map((s, i) => (
            <Link
              key={s.index}
              href={s.link}
              data-cap-row={i}
              className="group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line px-5 py-6 transition-colors last:border-0 hover:bg-elevated sm:grid-cols-[80px_1fr_1fr_auto] sm:gap-8 sm:px-8"
            >
              <span
                className="pointer-events-none absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-accent transition-transform duration-500 ease-out group-hover:scale-y-100"
                aria-hidden="true"
              />
              <span className="ghost-numeral text-3xl transition-all duration-300 group-hover:[-webkit-text-stroke-color:var(--accent-primary)] sm:text-5xl">
                {s.index}
              </span>
              <span>
                <span className="text-lg font-extrabold tracking-tight sm:text-2xl">{s.title}</span>
                <span className="mt-1 block max-w-xl text-sm font-medium leading-relaxed text-sub">
                  {s.description}
                </span>
              </span>
              <span className="hidden flex-wrap gap-1.5 sm:flex">
                {s.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-lg border border-line bg-main px-2.5 py-1 text-[11px] font-bold text-sub transition-colors group-hover:border-accent/30 group-hover:text-ink"
                  >
                    {t}
                  </span>
                ))}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-all duration-300 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                <ArrowUpRight size={18} />
              </span>
            </Link>
          ))}
        </Reveal>

        {/* Cursor-tracked frame for the hovered practice. */}
        <div
          ref={previewRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-30 hidden w-[21rem] overflow-hidden rounded-2xl border border-white/15 bg-ink-deep opacity-0 shadow-[0_36px_70px_-28px_rgba(6,11,24,0.7)] lg:block"
        >
          <div className="relative h-[13.5rem] w-full overflow-hidden">
            {/*
              Plain <img> by necessity: the hover handler assigns
              `previewImgRef.current.src` directly on every row change. Under
              next/image the optimiser emits a `srcset`, and the browser
              re-resolves from that set whenever the `src` attribute changes —
              so the imperative swap would resolve back to the original URL and
              the frame would never update. It is also `aria-hidden` and purely
              decorative, so it carries no SEO weight either way.
            */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={previewImgRef}
              src={previewImage(services[0].link)}
              alt=""
              width={672}
              height={432}
              className="h-full w-full object-cover"
            />
            <span className="media-scrim" />
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink">
              Practice
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-3">
            <span ref={previewTitleRef} className="text-sm font-extrabold text-white">
              {services[0].title}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-accent">
              Open
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
