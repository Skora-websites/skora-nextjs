import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import Reveal from "@/components/animation/Reveal";
import CtaBand from "@/components/landing/CtaBand";
import BlogGrid from "@/components/blog/BlogGrid";
import { getGlobalSeoSafe, getPosts } from "@/lib/db";
import { absoluteUrl } from "@/lib/blog";

/** Blog index is re-rendered at most once a minute so edits go live fast. */
export const revalidate = 60;

const PAGE_TITLE = "Blog & Insights";
const DESCRIPTION =
  "Actionable perspectives from the SKORA team on digital marketing, SEO, AI search, web design, cloud platforms and product engineering.";
const SHARE_DESCRIPTION =
  "Actionable perspectives on digital marketing, SEO, AI search, web design and product engineering.";

/**
 * Built at request time so the index inherits the site-wide settings from
 * /admin/seo (default image, site name, Twitter handle) — a static `metadata`
 * object would replace the root layout's openGraph block entirely and drop
 * og:image from this page.
 */
export async function generateMetadata(): Promise<Metadata> {
  const seo = await getGlobalSeoSafe();
  const shareUrl = absoluteUrl("/blog", seo.canonicalBase);
  const image = seo.ogImage ? absoluteUrl(seo.ogImage, seo.canonicalBase) : undefined;
  const shareTitle = `${PAGE_TITLE} — ${seo.siteName}`;

  return {
    title: PAGE_TITLE,
    description: DESCRIPTION,
    keywords: seo.defaultKeywords.length ? seo.defaultKeywords : undefined,
    alternates: { canonical: "/blog" },
    openGraph: {
      title: shareTitle,
      description: SHARE_DESCRIPTION,
      url: shareUrl,
      siteName: seo.siteName,
      locale: "en_US",
      type: "website",
      images: image ? [{ url: image, alt: seo.siteName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description: SHARE_DESCRIPTION,
      site: seo.twitterHandle || undefined,
      images: image ? [image] : undefined,
    },
  };
}

export default async function BlogIndexPage() {
  const posts = await getPosts({ includeDrafts: false });
  const seo = await getGlobalSeoSafe();

  const jsonLd =
    posts.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Latest articles | ${seo.siteName}`,
          itemListElement: posts.map((post, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: post.title,
            url: absoluteUrl(`/blog/${post.slug}`, seo.canonicalBase),
          })),
        }
      : null;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-main font-sans text-ink">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      )}

      {/* Hero */}
      <section className="relative overflow-hidden bg-main pb-12 pt-32">
        <div className="section-wrap">
          <Reveal variant="blur" className="max-w-3xl space-y-6">
            <span className="kicker">Insights &amp; perspective</span>
            <h1 className="display-hero text-4xl sm:text-6xl">
              Ideas that <span className="display-accent text-accent">compound.</span>
            </h1>
            <p className="max-w-2xl text-sm font-medium leading-relaxed text-sub sm:text-base">
              Playbooks, research and teardown articles from the SKORA team — covering growth, search
              visibility, AI-driven acquisition and the engineering behind modern digital products.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Featured + grid + category filter */}
      <section className="pb-16 sm:pb-20">
        <div className="section-wrap">
          {posts.length === 0 ? (
            <Reveal
              variant="fade-up"
              className="space-y-4 rounded-[2rem] border border-line bg-surface px-6 py-16 text-center"
            >
              <h2 className="text-xl font-extrabold text-ink">No articles published yet</h2>
              <p className="mx-auto max-w-md text-sm font-medium text-sub">
                New insights are on the way. In the meantime, explore our services or talk to the team
                about your growth roadmap.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link href="/services" className="btn-primary">
                  Explore services
                </Link>
                <Link href="/contact" className="btn-secondary">
                  Talk to us
                </Link>
              </div>
            </Reveal>
          ) : (
            <BlogGrid posts={posts} />
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="pb-16 pt-4 sm:pb-20">
        <div className="section-wrap">
          <CtaBand
            title={
              <>
                Want this level of execution <span className="display-accent">for your brand?</span>
              </>
            }
            description="Tell us what you are trying to grow. We reply with scope, timeline and a fixed price within 4 business hours."
            primaryLabel="Start a project"
            primaryHref="/contact"
            secondaryLabel="See our services"
            secondaryHref="/services"
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}
