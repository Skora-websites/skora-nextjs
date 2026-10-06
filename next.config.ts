import type { NextConfig } from "next";
// NOTE: `Redirect` is deliberately NOT imported from "next". The type exported
// from that entry point is the Pages-Router one (`{ statusCode, destination }`)
// and has no `source` field at all, so it cannot type an App-Router redirects()
// entry. The correct shape lives in next/dist/lib/load-custom-routes, which is
// what `next.config.ts` actually expects.
import type { Redirect } from "next/dist/lib/load-custom-routes";
import { networkInterfaces } from "node:os";

const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/**
 * Hosts allowed to request dev-only assets (JS chunks, HMR) in `next dev`.
 * Next 16 403s every other host, and when that fires the page gets no JS at
 * all: React never hydrates, so the server-rendered preloader is frozen at 1%
 * and forms fall back to native GET submits.
 *
 * - `127.0.0.1`, `::1` — opened by loopback address
 * - every non-internal interface address — opened from another device on the
 *   LAN as `http://<lan-ip>:3001` (phone, tablet, second machine)
 * - `NEXT_ALLOWED_DEV_ORIGINS` — extra comma-separated hosts (tunnel, vhost)
 *
 * Re-run `npm run dev` after an interface address changes (new DHCP lease).
 */
const parseCommaList = (value?: string) =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
if (!configuredSiteUrl) {
  throw new Error("NEXT_PUBLIC_SITE_URL must be set in .env.");
}

let siteUrl: URL;
try {
  siteUrl = new URL(configuredSiteUrl);
} catch {
  throw new Error("NEXT_PUBLIC_SITE_URL must be a valid absolute URL.");
}

if (!["http:", "https:"].includes(siteUrl.protocol) || siteUrl.pathname !== "/" || siteUrl.search || siteUrl.hash) {
  throw new Error("NEXT_PUBLIC_SITE_URL must contain only an http(s) origin, without a path or query.");
}

const buildRemotePattern = (host: string, protocol: "http" | "https") => ({
  protocol,
  hostname: host,
  pathname: "/**",
} as const);

const localDevHosts = [
  "127.0.0.1",
  "::1",
  ...Object.values(networkInterfaces())
    .flatMap((addrs) => addrs ?? [])
    .filter((addr) => !addr.internal)
    .map((addr) => addr.address),
  ...parseCommaList(process.env.NEXT_ALLOWED_DEV_ORIGINS),
]
  .map((host) => host.trim())
  .filter(Boolean);

/**
 * The one canonical origin. Everything else 308s here — a single origin is what
 * stops the same article being indexed under three different URLs.
 */
const CANONICAL_HOST = siteUrl.hostname;
const CANONICAL_ORIGIN = siteUrl.origin;

/** Hosts that are not the canonical origin and must collapse onto it. */
const LEGACY_HOSTS = parseCommaList(process.env.NEXT_PUBLIC_LEGACY_HOSTS);

/**
 * Prepares a hostname for use as `has[].value`.
 *
 * That field is compiled into a RegExp (`^<value>$`), not compared as a string
 * (next/dist/shared/lib/router/utils/prepare-destination.js → matchHas), so an
 * an unescaped `example.com` would also match `exampleXcom`.
 */
const hostMatch = (host: string) => host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const nextConfig: NextConfig = {
  allowedDevOrigins: [...new Set(localDevHosts)],

  images: {
    /**
     * Allow-list for the Next image optimizer.
     *
     * Every marketing image is an Unsplash URL (`auto=format&fit=crop&w=…`), and
     * blog cover images are typed by hand in /admin and stored in MongoDB — so
     * the DB can hold any host an editor pasted. `remotePatterns` is what lets
     * `next/image` fetch and re-encode those at the edge (WebP/AVIF, resized)
     * instead of shipping the full-size original.
     *
     * `pathname` is deliberately wide (`/**`): the optimiser rewrites the query
     * string, not the path, and restricting by pathname here would break the
     * `?w=` variants. Cost control comes from `qualities`/`formats` below and
     * from the fact that only allow-listed hosts reach this at all.
     */
    remotePatterns: [
      ...parseCommaList(process.env.NEXT_PUBLIC_ALLOWED_IMAGE_HOSTS).map((host) =>
        buildRemotePattern(host, "https")
      ),
      buildRemotePattern(siteUrl.hostname, siteUrl.protocol === "http:" ? "http" : "https"),
    ],
    // Only request formats the optimiser is allowed to emit. Without this,
    // next/image asks for any quality the caller names (75 by default) and the
    // AVIF/WebP negotiation is left to the browser.
    formats: ["image/avif", "image/webp"],
    // Keep the LCP image sharp on retina without letting an editor's URL
    // request a 4K variant.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  /**
   * Typed as `Redirect[]` rather than left to inference: an inline array literal
   * widens `type: "host"` to plain `string`, which is not assignable to
   * `RouteHas["type"]` and fails `tsc`. The annotation pins the literal types.
   */
  async redirects(): Promise<Redirect[]> {
    return [
      // Articles moved from /blog/[slug] up to the site root. This has to come
      // first: it is the rule that preserves the existing rankings, and a 308
      // hands the full link equity of the old URL to the new one.
      { source: "/blog/:slug", destination: "/:slug", permanent: true },
      // The section page became /insights. Listed after the post rule so
      // /blog/:slug never gets swallowed by it.
      { source: "/blog", destination: "/insights", permanent: true },

      // ── Host & protocol consolidation ───────────────────────────────
      // `has: [{ type: "host" }]` matches the request's host header with the
      // port stripped, and `source` stays path-only (path-to-regexp has no
      // notion of a scheme). So one rule per host covers both protocols: the
      // destination is absolute and https, which upgrades http in the same hop.

      // www → apex.
      ...(process.env.NEXT_PUBLIC_REDIRECT_WWW === "true"
        ? [
            {
              source: "/:path*",
              has: [{ type: "host" as const, value: hostMatch(`www.${CANONICAL_HOST}`) }],
              destination: `${CANONICAL_ORIGIN}/:path*`,
              permanent: true,
            },
          ]
        : []),
      ...(siteUrl.protocol === "https:"
        ? [
            {
              source: "/:path*",
              has: [{ type: "host" as const, value: hostMatch(CANONICAL_HOST) }],
              missing: [{ type: "header" as const, key: "x-forwarded-proto", value: "https" }],
              destination: `${CANONICAL_ORIGIN}/:path*`,
              permanent: true,
            },
          ]
        : []),
      ...LEGACY_HOSTS.filter((host) => host !== `www.${CANONICAL_HOST}`).map(
        (host): Redirect => ({
          source: "/:path*",
          has: [{ type: "host", value: hostMatch(host) }],
          destination: `${CANONICAL_ORIGIN}/:path*`,
          permanent: true,
        })
      ),
    ];
  },
};

export default nextConfig;
