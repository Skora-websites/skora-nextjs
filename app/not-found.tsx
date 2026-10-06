import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, PenLine, PhoneCall } from "lucide-react";
import Footer from "@/components/Footer";
import Reveal from "@/components/animation/Reveal";
import { CTA, CTA_TRUST_LINE } from "@/lib/cta";

/**
 * Global 404.
 *
 * Served for any unmatched path, including the root `[slug]` route when a post
 * has moved or been unpublished. Two things matter on this page:
 *
 * - It is `noindex`. A 404 that gets indexed is a soft-404 in Google's eyes and
 *   drags the whole domain's quality down, so the directive is not optional.
 * - Every path out of here is a real destination. A dead end on a 404 means the
 *   visitor bounces; the three links below cover the three reasons somebody
 *   lands on a URL that no longer exists (wrong URL, moved article, typo).
 *
 * Server component: the root layout already owns the site chrome, so this only
 * renders the page body.
 */
export const metadata: Metadata = {
  title: "Page not found",
  description:
    "That page has moved or never existed. Browse SKORA's services, read our insights, or tell us what you were looking for.",
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
      noimageindex: true,
    },
  },
};

/** The three exits, in the order most visitors need them. */
const ROUTES = [
  {
    icon: Compass,
    label: "Services",
    body: "Websites, growth, cloud, SaaS, CRM and project management systems.",
    href: "/services",
  },
  {
    icon: PenLine,
    label: "Insights",
    body: "Playbooks and teardown write-ups on search, acquisition and engineering.",
    href: "/insights",
  },
  {
    icon: PhoneCall,
    label: "Contact",
    body: "Tell us what you were after and we will point you at the right place.",
    href: "/contact",
  },
];

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-main font-sans text-ink">
      <section className="relative overflow-hidden bg-paper pb-16 pt-32 sm:pt-40">
        <div
          className="bg-blueprint absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_75%)]"
          aria-hidden="true"
        />
        <div className="section-wrap relative">
          <Reveal variant="blur" className="max-w-3xl space-y-6">
            <span className="kicker">Error 404</span>
            <h1 className="display-hero text-6xl sm:text-8xl">
              <span className="ghost-numeral">404</span> — page <span className="display-accent text-accent">not found.</span>
            </h1>
            <p className="max-w-2xl text-base font-medium leading-relaxed text-sub sm:text-lg">
              The link is broken, the page was renamed, or the address has a typo in it. Articles
              used to live under <span className="text-ink">/blog/</span> and now sit at the site
              root, so old links still land — this is what an address that no longer resolves looks
              like.
            </p>
            <div className="flex flex-wrap gap-4 pt-1">
              <Link href="/" className="btn-primary group">
                <span>Back to the homepage</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/contact" className="btn-secondary">
                Report a broken link
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The three ways out — every link here is a live route. */}
      <section className="border-t border-line py-16 sm:py-20">
        <div className="section-wrap">
          <Reveal
            variant="fade-up"
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
            staggerSelector="[data-route]"
            stagger={0.08}
          >
            {ROUTES.map((route) => (
              <Link
                key={route.href}
                data-route
                href={route.href}
                className="group flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-card"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                  <route.icon size={24} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="mb-1 text-base font-extrabold tracking-tight text-ink">
                    {route.label}
                  </h2>
                  <p className="text-sm font-medium leading-relaxed text-sub">{route.body}</p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[11px] font-black uppercase tracking-widest text-accent">
                  Go there
                  <ArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CTA band — same anatomy as every other conversion band (lib/cta.ts) */}
      <section className="bg-main px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal variant="zoom" className={CTA.band}>
            <div className={CTA.texture} aria-hidden="true" style={CTA.textureStyle} />
            <div className="relative mx-auto max-w-2xl space-y-5">
              <span className={CTA.kicker}>Found a broken link?</span>
              <h2 className={CTA.heading}>
                We will fix it, or <span className={CTA.accent}>find what you needed.</span>
              </h2>
              <div className="pt-2">
                <div className={CTA.actions}>
                  <Link href="/contact" className={CTA.primary}>
                    <span>Tell us what you were looking for</span>
                    <ArrowRight size={16} />
                  </Link>
                  <Link href="/insights" className={CTA.secondary}>
                    <span>Browse all insights</span>
                  </Link>
                </div>
                <p className={CTA.trust}>{CTA_TRUST_LINE}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}