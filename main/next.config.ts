import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "img-src 'self' data: blob: https:",
      // SECURITY: removed 'unsafe-eval' (was previously allowed). Next.js dev
      // mode needs it; prod build does not. We keep it only when explicitly
      // opted into via NEXT_PUBLIC_ALLOW_UNSAFE_EVAL=1.
      `script-src 'self' 'unsafe-inline' ${process.env.NEXT_PUBLIC_ALLOW_UNSAFE_EVAL === "1" ? "'unsafe-eval' " : ""}https://*.firebaseio.com https://*.googleapis.com`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com wss://*.firebaseio.com",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // Upgrade insecure requests in production; harmless in dev.
      process.env.NODE_ENV === "production" ? "upgrade-insecure-requests" : "",
    ]
      .filter(Boolean)
      .join("; "),
  },
];

const nextConfig: NextConfig = {
  // Pin Turbopack workspace root to this package to avoid "multiple lockfiles
  // inferred workspace root" warnings when a parent package-lock.json exists.
  turbopack: { root: __dirname },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
