"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import gsap from "gsap";

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
    description: "Clinic websites, appointment flows, and patient systems for doctors and hospitals.",
    tags: ["Clinics", "Appointments", "EHR-ready"],
    link: "/healthcare",
    healthcare: true,
  },
];

export default function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".gsap-cap-row",
        { opacity: 0, y: 36 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: undefined,
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="capabilities" className="bg-main py-20 sm:py-28">
      <div className="section-wrap">
        <div className="flex flex-wrap items-end justify-between gap-6 pb-10">
          <div className="max-w-2xl">
            <span className="kicker">What we do</span>
            <h2 className="display-hero mt-4 text-4xl sm:text-6xl">
              Six practices, <span className="display-accent text-accent">one team.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm font-medium leading-relaxed text-sub">
            Every engagement has a named owner, a fixed timeline, and weekly demos.
            Pick a practice to see scope and pricing.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-line bg-surface">
          {services.map((s) => (
            <Link
              key={s.index}
              href={s.link}
              className="gsap-cap-row group grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-line px-5 py-6 transition-colors last:border-0 hover:bg-elevated sm:grid-cols-[80px_1fr_1fr_auto] sm:gap-8 sm:px-8"
            >
              <span className="ghost-numeral text-3xl sm:text-5xl">{s.index}</span>
              <span>
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-extrabold tracking-tight sm:text-2xl">{s.title}</span>
                  {s.healthcare && (
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-emerald-700">
                      Healthcare
                    </span>
                  )}
                </span>
                <span className="mt-1 block max-w-xl text-sm font-medium leading-relaxed text-sub">
                  {s.description}
                </span>
              </span>
              <span className="hidden flex-wrap gap-1.5 sm:flex">
                {s.tags.map((t) => (
                  <span key={t} className="rounded-lg border border-line bg-main px-2.5 py-1 text-[11px] font-bold text-sub">
                    {t}
                  </span>
                ))}
              </span>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-line text-ink transition-all group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                <ArrowUpRight size={18} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
