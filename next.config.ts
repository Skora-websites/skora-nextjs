import type { NextConfig } from "next";
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
const localDevHosts = [
  "127.0.0.1",
  "::1",
  ...Object.values(networkInterfaces())
    .flatMap((addrs) => addrs ?? [])
    .filter((addr) => !addr.internal)
    .map((addr) => addr.address),
  ...(process.env.NEXT_ALLOWED_DEV_ORIGINS?.split(",") ?? []),
]
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: [...new Set(localDevHosts)],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [];
  },
};

export default nextConfig;

