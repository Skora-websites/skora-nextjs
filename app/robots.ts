import type { MetadataRoute } from "next";
import { getGlobalSeoSafe } from "@/lib/db";

/** robots.txt follows the toggles configured at /admin/seo. */
export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getGlobalSeoSafe();
  const base = (seo.canonicalBase || "https://skora.digital").replace(/\/+$/, "");

  if (!seo.robotsEnabled) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: seo.robotsDisallow.length ? seo.robotsDisallow : ["/admin", "/api"],
      },
    ],
    sitemap: seo.sitemapEnabled ? `${base}/sitemap.xml` : undefined,
  };
}
