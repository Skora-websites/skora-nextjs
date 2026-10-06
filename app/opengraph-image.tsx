import React from "react";
import { ImageResponse } from "next/og";

/**
 * Site-wide social card (og:image), generated at build time.
 *
 * Why this file exists: the fallback `ogImage` configured at /admin/seo pointed
 * at `https://skora.digital/og-default.jpg`, a file that does not exist on a
 * dead host — every share of the site rendered a broken card. A generated image
 * is a real route at `/opengraph-image`, so there is nothing to deploy and
 * nothing to 404.
 *
 * The card uses the same tokens as `app/globals.css` (accent #2563eb, ink
 * #0b1220, main #f7f9fc, line #e5eaf2). Note the constraint that applies here
 * and only here: `ImageResponse` renders with satori, which supports flexbox and
 * a subset of CSS — no grid, no `gap` shorthand, no webfonts unless they are
 * loaded below. That is why every style below is inline (AI_RULES.md's "Tailwind
 * only" rule is about the app's UI, not this generated raster).
 *
 * Pages that set their own `openGraph.images` (all of them, via the /admin/seo
 * `ogImage` setting) override this card; it is the floor that keeps the site
 * shareable when that setting is empty.
 */

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "";
const SITE_HOST = new URL(process.env.NEXT_PUBLIC_SITE_URL || "").hostname;

export const alt = `${SITE_NAME} — digital marketing and technology studio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#2563eb";
const INK = "#0b1220";
const SUB = "#4b5768";
const FAINT = "#8a94a6";
const MAIN = "#f7f9fc";
const LINE = "#e5eaf2";

/**
 * The card body, shared with `twitter-image.tsx` (X will not fall back to
 * og:image when a twitter:image route exists but is missing).
 */
export function SkoraOgCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: MAIN,
        padding: "72px",
        // The blueprint wash the site uses behind its heroes.
        backgroundImage: `radial-gradient(circle at 50% 0%, rgba(37,99,235,0.10) 0%, rgba(247,249,252,0) 70%)`,
      }}
    >
      {/* Wordmark */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            borderRadius: 18,
            backgroundColor: ACCENT,
            color: "#ffffff",
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          S
        </div>
        <div
          style={{
            marginLeft: 20,
            fontSize: 34,
            fontWeight: 800,
            letterSpacing: "0.28em",
            color: INK,
          }}
        >
          {SITE_NAME}
        </div>
      </div>

      {/* Positioning line */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: SUB,
          }}
        >
          <div
            style={{
              width: 32,
              height: 2,
              marginRight: 16,
              backgroundColor: ACCENT,
            }}
          />
          Digital growth &amp; technology
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.02,
            letterSpacing: "-0.035em",
            color: INK,
          }}
        >
          Marketing, engineering, one team.
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 30,
            fontWeight: 500,
            lineHeight: 1.35,
            color: SUB,
          }}
        >
          Websites, SEO, cloud, SaaS, CRM and project management systems.
        </div>
      </div>

      {/* Footer rule + canonical host */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `1px solid ${LINE}`,
          paddingTop: 28,
          fontSize: 24,
          fontWeight: 700,
          color: FAINT,
        }}
      >
        <span>Web · Growth · Product engineering</span>
        <span style={{ color: ACCENT }}>{SITE_HOST}</span>
      </div>
    </div>
  );
}

export default async function Image() {
  return new ImageResponse(<SkoraOgCard />, { ...size });
}