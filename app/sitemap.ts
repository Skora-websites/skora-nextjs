import type { MetadataRoute } from "next";
import { getPageSeoContext, getPosts } from "@/lib/db";
import { SERVICES } from "@/lib/services";
import { isReservedSlug, defaultGlobalSeo } from "@/lib/blog";
import { getPageSeoEntry, resolvePageSeo } from "@/lib/page-seo";

/**
 * XML sitemap: static marketing routes + every service page + every published
 * article. Refreshes every 5 minutes so newly published posts are picked up
 * without waiting for a redeploy.
 *
 * Articles are listed at the root (`/${slug}`) because that is where they now
 * render; the old `/blog/:slug` URLs are permanent redirects, and a redirect in
 * a sitemap is worse than no entry at all.
 */
export const revalidate = 300;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/insights", priority: 0.9, changeFrequency: "daily" },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  // Sector page. Indexed: it is a real destination with copy written for
  // clinics and practices, and it links out to /services/[slug] rather than
  // restating them, so it distributes rather than competes for those terms.
  { path: "/healthcare", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  // Every service page, from the shared list — no route can be missed.
  ...SERVICES.map((service) => ({
    path: `/services/${service.slug}`,
    priority: 0.7,
    changeFrequency: "weekly" as const,
  })),
  { path: "/privacy", priority: 0.3, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.3, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pageSeo = await getPageSeoContext();
  const seo = pageSeo.global;
  if (!seo.sitemapEnabled) return [];

  const base = (seo.canonicalBase || defaultGlobalSeo.canonicalBase).replace(/\/+$/, "");
  const now = new Date();

  // A page an admin has marked noindex must leave the sitemap as well as gain a
  // robots meta tag. Leaving it listed would hand Google contradictory
  // instructions — "do not index this" in the head and "here it is" in the
  // sitemap — which is worse than having no control at all.
  const isNoindex = (path: string) => {
    const entry = getPageSeoEntry(path);
    return entry ? resolvePageSeo(entry, pageSeo.overrides[path], seo).noindex : false;
  };

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.filter(
    (route) => !isNoindex(route.path)
  ).map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPosts({ includeDrafts: false });
    postEntries = posts
      // A post on a reserved slug is outranked by the real route at that path,
      // so submitting it would advertise a URL that never shows the article.
      .filter((post) => !post.seo?.noindex && !isReservedSlug(post.slug))
      .map((post) => ({
        url: `${base}/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.createdAt || now),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch (e) {
    console.error("Sitemap: failed to load posts:", e);
  }

  return [...staticEntries, ...postEntries];
}
