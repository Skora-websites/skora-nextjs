"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Clock, UserRound } from "lucide-react";
import Reveal from "@/components/animation/Reveal";
import { formatPostDate, readingTime, stripHtml, type BlogPost } from "@/lib/blog";

interface BlogGridProps {
  /** Published posts, newest first — passed down from the server page. */
  posts: BlogPost[];
}

/**
 * Featured article + category chips + article grid, all client-side so /blog
 * can stay a server page (metadata, database read) while filtering happens
 * without a round trip.
 *
 * The first article is featured whenever two or more match the active filter.
 * Cards are wrapped by Reveal here rather than on the page, so filtering never
 * leaves a card stuck at its pre-animation state: freshly mounted cards are
 * never touched by the original stagger and simply render visible.
 */
export default function BlogGrid({ posts }: BlogGridProps) {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))],
    [posts]
  );
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? posts : posts.filter((p) => p.category === active);
  const featured = filtered.length >= 2 ? filtered[0] : null;
  const gridPosts = featured ? filtered.slice(1) : filtered;

  return (
    <div className="space-y-10">
      {featured && (
        <Reveal variant="fade-up" className="space-y-4">
          <span className="kicker">Featured</span>
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid grid-cols-1 overflow-hidden rounded-[2rem] border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lg lg:grid-cols-2"
          >
            {/* Cover */}
            <div className="relative aspect-[16/10] overflow-hidden bg-elevated lg:aspect-auto lg:min-h-[300px]">
              {featured.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/12 via-elevated to-main">
                  <span className="font-display italic text-5xl text-accent/60">skora</span>
                </div>
              )}
              {featured.category && (
                <span className="absolute left-4 top-4 rounded-full border border-accent/20 bg-surface/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-accent backdrop-blur">
                  {featured.category}
                </span>
              )}
            </div>

            {/* Body */}
            <div className="flex flex-col gap-4 p-7 sm:p-9">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold uppercase tracking-wider text-faint">
                {featured.publishedAt && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} className="text-accent" />
                    {formatPostDate(featured.publishedAt)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={13} className="text-accent" />
                  {readingTime(featured.content)} min read
                </span>
                {featured.author && (
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound size={13} className="text-accent" />
                    {featured.author}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-ink transition-colors group-hover:text-accent sm:text-3xl">
                {featured.title}
              </h2>

              <p className="text-sm font-medium leading-relaxed text-sub sm:text-base">
                {featured.excerpt || stripHtml(featured.content).slice(0, 220) + "…"}
              </p>

              <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[11px] font-black uppercase tracking-widest text-accent">
                Read article
                <ArrowUpRight
                  size={14}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </span>
            </div>
          </Link>
        </Reveal>
      )}

      {/* Category chips + count */}
      {categories.length > 2 && (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActive(category)}
              aria-pressed={active === category}
              className={`rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all ${
                active === category
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-surface text-sub hover:border-accent/40 hover:text-accent"
              }`}
            >
              {category}
            </button>
          ))}
          <span className="ml-auto text-[11px] font-bold uppercase tracking-widest text-faint">
            {filtered.length} {filtered.length === 1 ? "article" : "articles"}
          </span>
        </div>
      )}

      {gridPosts.length === 0 ? (
        <p className="rounded-[1.75rem] border border-line bg-surface px-6 py-12 text-center text-sm font-medium text-sub">
          No articles in this category yet — new ones publish every week.
        </p>
      ) : (
        <Reveal
          variant="fade-up"
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          staggerSelector="[data-post-card]"
          stagger={0.08}
        >
          {gridPosts.map((post) => (
            <Link
              key={post.id}
              data-post-card
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-[1.75rem] border border-line bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-card-lg"
            >
              {/* Cover */}
              <div className="relative aspect-[16/9] overflow-hidden bg-elevated">
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/12 via-elevated to-main">
                    <span className="font-display italic text-4xl text-accent/60">skora</span>
                  </div>
                )}
                {post.category && (
                  <span className="absolute left-4 top-4 rounded-full border border-accent/20 bg-surface/95 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-accent backdrop-blur">
                    {post.category}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold uppercase tracking-wider text-faint">
                  {post.publishedAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-accent" />
                      {formatPostDate(post.publishedAt)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={13} className="text-accent" />
                    {readingTime(post.content)} min read
                  </span>
                  {post.author && (
                    <span className="inline-flex items-center gap-1.5">
                      <UserRound size={13} className="text-accent" />
                      {post.author}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-extrabold leading-snug tracking-tight text-ink transition-colors group-hover:text-accent">
                  {post.title}
                </h3>

                <p className="text-sm font-medium leading-relaxed text-sub">
                  {post.excerpt || stripHtml(post.content).slice(0, 150) + "…"}
                </p>

                <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[11px] font-black uppercase tracking-widest text-accent">
                  Read article
                  <ArrowUpRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </span>
              </div>
            </Link>
          ))}
        </Reveal>
      )}
    </div>
  );
}
