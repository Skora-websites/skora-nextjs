import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://sudoc.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/login",
    "/register",
    "/dashboard",
    "/analytics",
    "/leads",
    "/contacts",
    "/customers",
    "/pipeline",
    "/employees",
    "/attendance",
    "/leaves",
    "/payroll",
    "/organization",
    "/assets",
    "/documents",
    "/engage",
    "/onboarding",
    "/exit",
    "/holidays",
    "/probation",
    "/settings",
  ];

  return routes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/dashboard" ? "daily" : "weekly",
    priority: route === "" ? 1 : route === "/dashboard" ? 0.9 : 0.7,
  }));
}
