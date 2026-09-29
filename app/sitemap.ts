import type { MetadataRoute } from "next";
import { getGlobalSeoSafe, getPosts } from "@/lib/db";
import { SERVICES } from "@/lib/services";

/**
 * XML sitemap: static marketing routes + every service page + every published
 * blog post. Refreshes every 5 minutes so newly published posts are picked up
 * without waiting for a redeploy.
 */
export const revalidate = 300;

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/blog", priority: 0.9, changeFrequency: "daily" },
  { path: "/services", priority: 0.9, changeFrequency: "weekly" },
  { path: "/healthcare", priority: 0.8, changeFrequency: "weekly" },
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
  const seo = await getGlobalSeoSafe();
  if (!seo.sitemapEnabled) return [];

  const base = (seo.canonicalBase || "https://skora.digital").replace(/\/+$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPosts({ includeDrafts: false });
    postEntries = posts
      .filter((post) => !post.seo?.noindex)
      .map((post) => ({
        url: `${base}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt || post.createdAt || now),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }));
  } catch (e) {
    console.error("Sitemap: failed to load posts:", e);
  }

  return [...staticEntries, ...postEntries];
}
