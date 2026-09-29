import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight, CalendarDays, Clock, UserRound } from "lucide-react";
import Footer from "@/components/Footer";
import Reveal from "@/components/animation/Reveal";
import { getGlobalSeoSafe, getPostBySlug, getPosts } from "@/lib/db";
import { absoluteUrl, formatPostDate, readingTime, stripHtml, truncateWords } from "@/lib/blog";
import { CTA, CTA_TRUST_LINE } from "@/lib/cta";

/** A published post must reflect admin edits quickly — one minute max. */
export const revalidate = 60;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const seo = await getGlobalSeoSafe();
  const title = post.seo.metaTitle?.trim() || post.title;
  const description =
    post.seo.metaDescription?.trim() ||
    post.excerpt ||
    truncateWords(post.content, 155) ||
    seo.defaultDescription;

  const canonical = post.seo.canonicalUrl?.trim() || `/blog/${post.slug}`;
  const image = post.seo.ogImage || post.coverImage || seo.ogImage;
  const imageUrl = image ? absoluteUrl(image, seo.canonicalBase) : undefined;
  const shareTitle = post.seo.ogTitle?.trim() || title;
  const shareDescription = post.seo.ogDescription?.trim() || description;

  return {
    // Absolute: the author controls the exact string in the SERP.
    title: { absolute: title },
    description,
    keywords: post.seo.keywords.length ? post.seo.keywords : undefined,
    alternates: { canonical },
    authors: post.author ? [{ name: post.author }] : undefined,
    robots: post.seo.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: shareTitle,
      description: shareDescription,
      url: absoluteUrl(canonical, seo.canonicalBase),
      siteName: seo.siteName,
      locale: "en_US",
      type: "article",
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author] : undefined,
      section: post.category || undefined,
      tags: post.tags.length ? post.tags : undefined,
      images: imageUrl ? [{ url: imageUrl, alt: post.title }] : undefined,
    },
    twitter: {
      card: post.seo.twitterCard,
      title: shareTitle,
      description: shareDescription,
      site: seo.twitterHandle || undefined,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [seo, allPosts] = await Promise.all([getGlobalSeoSafe(), getPosts()]);

  const canonical = post.seo.canonicalUrl?.trim() || `/blog/${post.slug}`;
  const description =
    post.seo.metaDescription?.trim() ||
    post.excerpt ||
    truncateWords(post.content, 155) ||
    seo.defaultDescription;
  const image = post.seo.ogImage || post.coverImage || seo.ogImage;
  const minutes = readingTime(post.content);
  const words = stripHtml(post.content).split(/\s+/).filter(Boolean).length;

  const related = allPosts
    .filter(
      (p) =>
        p.id !== post.id &&
        (p.category === post.category || p.tags.some((tag) => post.tags.includes(tag)))
    )
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": post.seo.schemaType || "BlogPosting",
    headline: post.title,
    description,
    image: image ? [absoluteUrl(image, seo.canonicalBase)] : undefined,
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    inLanguage: "en",
    keywords: post.tags.length ? post.tags.join(", ") : post.seo.keywords.join(", "),
    articleSection: post.category || undefined,
    wordCount: words,
    timeRequired: `PT${minutes}M`,
    mainEntityOfPage: absoluteUrl(canonical, seo.canonicalBase),
    author: {
      "@type": "Organization",
      name: post.author || seo.siteName,
      url: seo.canonicalBase,
    },
    publisher: {
      "@type": "Organization",
      name: seo.siteName,
      url: seo.canonicalBase,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(seo.ogImage || "/logo.png", seo.canonicalBase),
      },
    },
  };

  return (
    <main className="min-h-screen bg-main text-ink font-sans relative overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Article header */}
      <article className="pt-32 pb-16">
        <header className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
          <Reveal variant="blur" className="space-y-6">
            {/* Breadcrumb */}
            <nav className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-faint">
              <Link href="/" className="hover:text-accent transition-colors">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/blog" className="hover:text-accent transition-colors">
                Blog
              </Link>
              {post.category && (
                <>
                  <span aria-hidden="true">/</span>
                  <span className="text-accent">{post.category}</span>
                </>
              )}
            </nav>

            <h1 className="display-hero text-3xl sm:text-5xl lg:text-6xl text-ink">{post.title}</h1>

            {post.excerpt && (
              <p className="text-sm sm:text-lg text-sub font-medium leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold uppercase tracking-wider text-faint">
              {post.author && (
                <span className="inline-flex items-center gap-1.5 text-ink">
                  <UserRound size={14} className="text-accent" />
                  {post.author}
                </span>
              )}
              {post.publishedAt && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={14} className="text-accent" />
                  {formatPostDate(post.publishedAt)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock size={14} className="text-accent" />
                {minutes} min read
              </span>
            </div>
          </Reveal>
        </header>

        {/* Cover */}
        {post.coverImage && (
          <Reveal
            variant="fade-up"
            className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto mt-10"
          >
            <div className="overflow-hidden rounded-[2rem] border border-line bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.coverImage}
                alt={post.seo.ogTitle || post.title}
                className="w-full h-auto max-h-[32rem] object-cover"
              />
            </div>
          </Reveal>
        )}

        {/* Body */}
        <Reveal variant="fade-up" className="px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto mt-12">
          {post.content ? (
            <div
              className="article-body text-[15px] sm:text-base text-sub"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-sm text-faint italic">This article has no content yet.</p>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-line flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-faint mr-1">
                Tagged
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full border border-line bg-surface text-[11px] font-bold text-sub"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </Reveal>
      </article>

      {/* Related */}
      {related.length > 0 && (
        <section className="pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Reveal variant="fade-up" className="space-y-6">
            <div className="flex items-end justify-between gap-4 border-t border-line pt-10">
              <div className="space-y-2">
                <span className="kicker">Keep reading</span>
                <h2 className="display-hero text-2xl sm:text-4xl text-ink">
                  Related <span className="display-accent text-accent">articles.</span>
                </h2>
              </div>
              <Link
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-accent hover:underline"
              >
                All articles <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog/${item.slug}`}
                  className="group flex flex-col gap-3 rounded-[1.75rem] border border-line bg-surface p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lg"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-accent">
                    {item.category || "Insight"}
                  </span>
                  <h3 className="text-base font-extrabold leading-snug text-ink transition-colors group-hover:text-accent">
                    {item.title}
                  </h3>
                  <p className="text-sm text-sub font-medium leading-relaxed">
                    {item.excerpt || stripHtml(item.content).slice(0, 120) + "…"}
                  </p>
                  <span className="mt-auto pt-1 text-[11px] font-bold uppercase tracking-wider text-faint inline-flex items-center gap-1.5">
                    {formatPostDate(item.publishedAt)} · {readingTime(item.content)} min read
                  </span>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {/* CTA — same anatomy as every other conversion band (lib/cta.ts) */}
      <section className="px-4 pb-24 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Reveal variant="zoom" className={CTA.band}>
          <div className={CTA.texture} aria-hidden="true" style={CTA.textureStyle} />
          <div className="relative mx-auto max-w-2xl space-y-5">
            <span className={CTA.kicker}>Put the ideas to work</span>
            <h2 className={CTA.heading}>
              Want this level of execution <span className={CTA.accent}>for your brand?</span>
            </h2>
            <div className="pt-2">
              <div className={CTA.actions}>
                <Link href="/contact" className={CTA.primary}>
                  <span>Book a consultation</span>
                  <ArrowRight size={16} />
                </Link>
                <Link href="/blog" className={CTA.secondary}>
                  <span>More articles</span>
                </Link>
              </div>
              <p className={CTA.trust}>{CTA_TRUST_LINE}</p>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  );
}
