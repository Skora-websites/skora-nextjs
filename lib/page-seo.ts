/**
 * Per-page SEO for the static marketing routes.
 *
 * Four jobs in one file, because splitting them is what creates drift:
 *   1. `PAGE_SEO_REGISTRY` — which routes are overridable, and what each one's
 *      code default is. There is no second copy of a default anywhere: the
 *      pages below import these entries instead of holding their own constants.
 *   2. `resolvePageSeo` — stored admin override laid over the code default,
 *      where a cleared field always means "use the default".
 *   3. `buildPageMetadata` — the one function that turns a resolved record into
 *      a `Metadata` object, so a page cannot forget a tag.
 *   4. `normalizePageSeoMap` / `parsePageSeoInput` — the read and write hygiene
 *      for whatever is in the database.
 *
 * No database access (AI_RULES.md: only `lib/db.ts` talks to MongoDB) and no
 * JSX, so `app/admin/seo/pages` can import `buildPageMetadata` and render the
 * exact metadata a page will emit. That is how the admin shows the *effective*
 * value rather than a re-implementation of it that can drift.
 *
 * Why the registry owns the defaults: with two sources of truth, a page that
 * forgets the override keeps rendering its hardcoded default and the admin sees
 * the database disagree with the page with nothing signalling it. With one, a
 * forgotten builder produces an obviously wrong title — a visible regression
 * instead of silence. `PageSeoPath` is derived from `PAGE_SEO`, so a typo at a
 * call site is a compile error.
 */

import type { Metadata } from "next";
import {
  absoluteUrl,
  applyTitleTemplate,
  defaultGlobalSeo,
  sanitizeSeoUrl,
  socialImageUrl,
  type GlobalSeo,
} from "./blog";
import { HEALTHCARE } from "./healthcare";
import { SERVICES } from "./services";

// ── Route keys ─────────────────────────────────────────────────────────────

/**
 * Every overridable route.
 *
 * Deliberately excludes `app/not-found.tsx` (a static `metadata` export — Next
 * throws if a segment has both) and `app/home/page.tsx` (a bare `redirect`).
 * `/services/[slug]` and `/[slug]` are out of scope: the nine service pages are
 * generated from `lib/services.ts`, and articles already have `PostSeo` and
 * their own editor at /admin/blog/[id].
 */
export const PAGE_SEO = {
  home: "/",
  insights: "/insights",
  about: "/about",
  healthcare: "/healthcare",
  contact: "/contact",
  services: "/services",
  privacy: "/privacy",
  terms: "/terms",
} as const;

export type PageSeoPath = (typeof PAGE_SEO)[keyof typeof PAGE_SEO];

export type PageSeoTwitterCard = "summary" | "summary_large_image";

/**
 * Open Graph `type`, not PostSeo's schema.org type: OG has no `BlogPosting`
 * value, and a static marketing page is never an article. This is what maps
 * onto `openGraph.type`.
 */
export type PageSeoSchemaType = "website" | "article";

// ── Stored shape ───────────────────────────────────────────────────────────

/**
 * One page's stored override — the literal contents of the admin form.
 *
 * The rules are the contract between the form, the resolver and the preview:
 *   - a string field of `""` means "cleared" → fall through to the code default;
 *   - `keywords: []` means "cleared" → fall through to the code default. There
 *     is deliberately no "emit no keywords tag" state: one control, one rule,
 *     and no marketing page wants a keyword-less head;
 *   - `noindex` is a plain boolean, not a tri-state. Every code default is
 *     `false`, so "unset" and "explicit false" are the same value and a `__set`
 *     marker would encode a distinction that cannot exist. Records save
 *     wholesale, so unticking the box writes an explicit `false` that would
 *     still win over a hypothetical `true` default. "Back to the code default"
 *     is an explicit action — the Reset button deletes the record.
 */
export interface PageSeoOverride {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  /** `""` = the route's own path. */
  canonicalUrl: string;
  /** Falls back to the resolved metaTitle. */
  ogTitle: string;
  /** Falls back to the resolved metaDescription. */
  ogDescription: string;
  /** `""` = the site default image, else the generated card. */
  ogImage: string;
  twitterCard: PageSeoTwitterCard;
  noindex: boolean;
  schemaType: PageSeoSchemaType;
}

/** Stored overrides, keyed by canonical route path. */
export type PageSeoOverrides = Record<string, PageSeoOverride>;

/** A record with every field blank — what an untouched override looks like. */
export function emptyPageSeoOverride(): PageSeoOverride {
  return {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    noindex: false,
    schemaType: "website",
  };
}

// ── Code defaults ──────────────────────────────────────────────────────────

/** A record with every field resolved. */
export interface ResolvedPageSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: PageSeoTwitterCard;
  noindex: boolean;
  schemaType: PageSeoSchemaType;
  /**
   * Renders `title: { absolute }`, which ignores the root layout's `%s`
   * template. Only the homepage sets it — its title is a complete sentence
   * rather than a page name. Never "unify" this across entries: doing so would
   * silently drop `" | SKORA — …"` from the other seven live titles.
   */
  absoluteTitle: boolean;
  /**
   * Suffix appended to the title for `og:title` / `twitter:title` when the
   * admin has not set `ogTitle`. `%s` is replaced with the *live* site name so
   * renaming the brand in /admin/seo does not require editing eight entries.
   *
   * These pages each hand-built their share title by string interpolation
   * before this file existed (`"About | ${seo.siteName}"`). Without this field a
   * plain `ogTitle → metaTitle` fallback would silently shorten five live share
   * cards — invisible in review, visible on LinkedIn. Absent on the homepage,
   * which uses its title verbatim.
   */
  shareTitleSuffix?: string;
}

export type PageSeoGroup = "Core" | "Sections" | "Trust" | "Legal";

export interface PageSeoEntry {
  /** Canonical route path, no trailing slash. `"/"` for the homepage. */
  path: PageSeoPath;
  /** Label in the /admin/seo/pages list. */
  label: string;
  group: PageSeoGroup;
  /** The one place this route's code default lives. */
  defaults: (global: GlobalSeo) => ResolvedPageSeo;
}

/**
 * Narrow literal → full record, so an entry only spells out what differs from
 * the neutral baseline.
 */
function pageSeoDefaults(input: Partial<ResolvedPageSeo> = {}): ResolvedPageSeo {
  return {
    metaTitle: "",
    metaDescription: "",
    keywords: [],
    canonicalUrl: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    noindex: false,
    schemaType: "website",
    absoluteTitle: false,
    ...input,
  };
}

export const PAGE_SEO_REGISTRY: readonly PageSeoEntry[] = [
  {
    path: PAGE_SEO.home,
    label: "Homepage",
    group: "Core",
    defaults: (global) =>
      pageSeoDefaults({
        // The homepage's default IS the site-wide default owned by /admin/seo,
        // not a page constant, so it reads `global` instead of hardcoding. A
        // saved per-page override wins over it; clearing it falls back here.
        metaTitle:
          global.defaultTitle || `${global.siteName} — Digital Growth Partner` ||
          defaultGlobalSeo.defaultTitle,
        metaDescription:
          global.defaultDescription ||
          "Skora is a full-service studio for websites, custom software, mobile apps and marketing — planned in the open, shipped on schedule, reported honestly.",
        keywords: global.defaultKeywords,
        canonicalUrl: "/",
        absoluteTitle: true,
      }),
  },
  {
    path: PAGE_SEO.insights,
    label: "Insights",
    group: "Sections",
    defaults: (global) =>
      pageSeoDefaults({
        metaTitle: "Insights",
        metaDescription:
          "Actionable perspectives from the SKORA team on digital marketing, SEO, AI search, web design, cloud platforms and product engineering.",
        // Distinct from the meta description on purpose: the share card is
        // shorter than the snippet.
        ogDescription:
          "Actionable perspectives on digital marketing, SEO, AI search, web design and product engineering.",
        keywords: global.defaultKeywords,
        canonicalUrl: "/insights",
        shareTitleSuffix: " — %s",
      }),
  },
  {
    path: PAGE_SEO.about,
    label: "About",
    group: "Core",
    defaults: () =>
      pageSeoDefaults({
        metaTitle: "About",
        metaDescription:
          "SKORA is a digital marketing and technology studio in Noida, India — nine service lines covering websites, growth, cloud, SaaS, CRM and project management systems.",
        keywords: [
          "about SKORA",
          "digital marketing agency Noida",
          "web development studio India",
          "SaaS development company",
        ],
        canonicalUrl: "/about",
        shareTitleSuffix: " | %s",
      }),
  },
  {
    path: PAGE_SEO.healthcare,
    label: "Healthcare",
    group: "Sections",
    defaults: () =>
      pageSeoDefaults({
        // Referenced, never copied — the copy lives in lib/healthcare.ts and the
        // page body imports the same object.
        metaTitle: HEALTHCARE.metaTitle,
        metaDescription: HEALTHCARE.metaDescription,
        keywords: [
          "clinic website India",
          "hospital website design",
          "doctor appointment booking website",
          "healthcare SEO India",
          "medical practice website",
        ],
        canonicalUrl: "/healthcare",
        shareTitleSuffix: " | %s",
      }),
  },
  {
    path: PAGE_SEO.contact,
    label: "Contact",
    group: "Trust",
    defaults: () =>
      pageSeoDefaults({
        metaTitle: "Contact Us",
        metaDescription:
          "Tell us about your project — goals, timeline and budget. We reply within 4 business hours with next steps and a fixed estimate.",
        keywords: ["contact", "hire a web agency", "project enquiry", "SKORA"],
        canonicalUrl: "/contact",
        shareTitleSuffix: " | %s",
      }),
  },
  {
    path: PAGE_SEO.services,
    label: "Services",
    group: "Sections",
    defaults: () =>
      pageSeoDefaults({
        metaTitle: "Services",
        metaDescription:
          "Nine services from SKORA — website design, digital marketing, branding, video, mobile apps, cloud, SaaS, CRM and project management systems.",
        // Derived from the one service list the page already renders.
        keywords: SERVICES.map((service) => service.pill),
        canonicalUrl: "/services",
        shareTitleSuffix: " | %s",
      }),
  },
  {
    path: PAGE_SEO.privacy,
    label: "Privacy Policy",
    group: "Legal",
    defaults: () =>
      pageSeoDefaults({
        metaTitle: "Privacy Policy",
        metaDescription:
          "How SKORA collects, uses and protects your personal data, and how to exercise your access, correction, erasure and grievance rights under India's Digital Personal Data Protection Act, 2023.",
        keywords: ["privacy policy", "DPDP Act 2023", "data protection", "SKORA"],
        canonicalUrl: "/privacy",
        shareTitleSuffix: " | %s",
      }),
  },
  {
    path: PAGE_SEO.terms,
    label: "Terms & Conditions",
    group: "Legal",
    defaults: () =>
      pageSeoDefaults({
        metaTitle: "Terms and Conditions",
        metaDescription:
          "The terms that govern SKORA's web, mobile, cloud and marketing engagements — scope, IP ownership, payment milestones, SLAs and liability.",
        keywords: ["terms and conditions", "service agreement", "SOW", "SKORA"],
        canonicalUrl: "/terms",
        shareTitleSuffix: " | %s",
      }),
  },
];

const PAGE_SEO_BY_PATH = new Map<string, PageSeoEntry>(
  PAGE_SEO_REGISTRY.map((entry) => [entry.path, entry])
);

/** The registry entry for a route, or `undefined` if the route is not listed. */
export function getPageSeoEntry(path: string): PageSeoEntry | undefined {
  return PAGE_SEO_BY_PATH.get(normalizePageSeoKey(path));
}

/** Every overridable path — what the admin list renders, in order. */
export const PAGE_SEO_PATHS: readonly PageSeoPath[] = PAGE_SEO_REGISTRY.map(
  (entry) => entry.path
);

// ── Key hygiene ────────────────────────────────────────────────────────────

/**
 * Canonical form of a route key: leading slash, no trailing slash, no query or
 * hash, and `"/"` stays `"/"`.
 *
 * `/about` and `/about/` must never become two records — and therefore two rows
 * in the admin list. This is the single string used as the database key, the
 * `alternates.canonical` value, the `revalidatePath` argument and the admin
 * label, so normalising it here is what keeps those four in agreement.
 */
export function normalizePageSeoKey(raw: string): string {
  const trimmed = (raw || "").trim().split("#")[0].split("?")[0];
  if (!trimmed || trimmed === "/") return "/";
  const absolute = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return absolute.replace(/\/+$/, "");
}

// ── Parse / normalize ──────────────────────────────────────────────────────

/**
 * Whitelists + type-checks one override, mirroring `parseSeoInput` in
 * lib/blog.ts. Unknown keys are dropped rather than stored.
 */
export function parsePageSeoInput(raw: unknown): PageSeoOverride | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const out = emptyPageSeoOverride();

  /** Only the string fields — keywords/twitterCard/noindex/schemaType are parsed below. */
  type TextKey = "metaTitle" | "metaDescription" | "canonicalUrl" | "ogTitle" | "ogDescription" | "ogImage";
  const text = (key: TextKey, max: number) => {
    if (typeof r[key] === "string") out[key] = (r[key] as string).trim().slice(0, max);
  };

  text("metaTitle", 120);
  text("metaDescription", 320);
  text("canonicalUrl", 300);
  text("ogTitle", 120);
  text("ogDescription", 320);
  text("ogImage", 500);

  if (Array.isArray(r.keywords)) {
    out.keywords = r.keywords
      .map((keyword) => String(keyword).trim())
      .filter(Boolean)
      .slice(0, 30);
  }
  if (r.twitterCard === "summary" || r.twitterCard === "summary_large_image") {
    out.twitterCard = r.twitterCard;
  }
  if (typeof r.noindex === "boolean") out.noindex = r.noindex;
  if (r.schemaType === "website" || r.schemaType === "article") {
    out.schemaType = r.schemaType;
  }

  // Both of these end up as URLs inside <meta>/<link> tags, so a `javascript:`
  // or `data:` value is rejected here rather than sanitised at render time.
  if (out.ogImage) out.ogImage = sanitizeSeoUrl(out.ogImage);
  if (out.canonicalUrl) out.canonicalUrl = sanitizeSeoUrl(out.canonicalUrl);

  return out;
}

/**
 * Allow-list version of `stripRetiredFields` in lib/db.ts.
 *
 * That one deletes a known list of dead keys; this is the inverse — keep only
 * keys that exist in `PAGE_SEO_REGISTRY`, so a route removed from the registry
 * (or a hand-edited Mongo document) cannot leave an orphan record the admin
 * would still offer to edit. Runs on every read and every write.
 */
export function normalizePageSeoMap(raw: unknown): PageSeoOverrides {
  const out: PageSeoOverrides = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const path = normalizePageSeoKey(key);
    if (!PAGE_SEO_BY_PATH.has(path)) continue;
    const parsed = parsePageSeoInput(value);
    if (parsed) out[path] = parsed;
  }
  return out;
}

// ── Resolve ────────────────────────────────────────────────────────────────

/**
 * Stored override laid over the code default, field by field.
 *
 * "Cleared" is always `""` or `[]` and always means "use the code default" —
 * see `PageSeoOverride` for why `noindex` needs no tri-state.
 */
export function resolvePageSeo(
  entry: PageSeoEntry,
  stored: PageSeoOverride | undefined,
  global: GlobalSeo
): ResolvedPageSeo {
  const fallback = entry.defaults(global);
  const pick = (override: string, value: string) => override.trim() || value;

  return {
    metaTitle: pick(stored?.metaTitle ?? "", fallback.metaTitle),
    metaDescription: pick(stored?.metaDescription ?? "", fallback.metaDescription),
    // `[]` — cleared, or never filled — falls through to the code default.
    keywords: stored?.keywords?.length ? stored.keywords : fallback.keywords,
    canonicalUrl: pick(stored?.canonicalUrl ?? "", fallback.canonicalUrl),
    ogTitle: pick(stored?.ogTitle ?? "", fallback.ogTitle),
    ogDescription: pick(stored?.ogDescription ?? "", fallback.ogDescription),
    ogImage: pick(stored?.ogImage ?? "", fallback.ogImage),
    twitterCard: stored?.twitterCard ?? fallback.twitterCard,
    noindex: typeof stored?.noindex === "boolean" ? stored.noindex : fallback.noindex,
    schemaType: stored?.schemaType ?? fallback.schemaType,
    // Behavioural flags are never admin-overridable: `absoluteTitle` decides
    // whether the brand template applies, and the suffix is what the share card
    // looked like before this mechanism existed. Overriding either would change
    // output the admin never asked to change.
    absoluteTitle: fallback.absoluteTitle,
    shareTitleSuffix: fallback.shareTitleSuffix,
  };
}

// ── Build ──────────────────────────────────────────────────────────────────

/** What `getPageSeoContext` returns: one document read, both halves of it. */
export interface PageSeoContext {
  global: GlobalSeo;
  overrides: PageSeoOverrides;
}

/**
 * The single place a static marketing page's `<head>` is assembled.
 *
 * Pure — no database, no I/O. `app/admin/seo/pages` calls it with the record it
 * is about to save and renders the same object the live page will, so the
 * admin's preview cannot drift from what is served because it *is* the same
 * code.
 */
export function buildPageMetadata(path: PageSeoPath, ctx: PageSeoContext): Metadata {
  const entry = getPageSeoEntry(path);
  // A compile error at the call site covers the type; this catches the runtime
  // case (a hand-built ctx from a test or a future caller) rather than silently
  // serving the wrong page's metadata.
  if (!entry) throw new Error(`buildPageMetadata: "${path}" is not in PAGE_SEO_REGISTRY`);

  const { global } = ctx;
  const base = (global.canonicalBase || defaultGlobalSeo.canonicalBase).replace(/\/+$/, "");
  const seo = resolvePageSeo(entry, ctx.overrides[path], global);

  const description = seo.metaDescription || global.defaultDescription;
  // `""` never reaches socialImageUrl — it substitutes /opengraph-image, which
  // is what stopped og:image disappearing when a page set `images: undefined`.
  const image = socialImageUrl(seo.ogImage || global.ogImage, base);

  const shareTitle = seo.ogTitle
    ? seo.ogTitle
    : seo.shareTitleSuffix
      ? `${seo.metaTitle}${seo.shareTitleSuffix.replace("%s", global.siteName)}`
      : seo.metaTitle;
  const shareDescription = seo.ogDescription || description;

  const canonical = seo.canonicalUrl || entry.path;
  // metadataBase resolves "/" to the bare origin, so keep the homepage's og:url
  // byte-identical to what it is today rather than gaining a trailing slash.
  const canonicalAbsolute = canonical === "/" ? base : absoluteUrl(canonical, base);

  return {
    // A plain string augments the root layout's `title.template`; `absolute`
    // ignores it. Per-entry — see ResolvedPageSeo.absoluteTitle.
    ...(seo.absoluteTitle
      ? { title: { absolute: seo.metaTitle } }
      : { title: seo.metaTitle }),
    description,
    keywords: seo.keywords.length ? seo.keywords : undefined,
    alternates: { canonical },
    // Emitted only when set: none of these pages render a robots tag today, and
    // adding `index, follow` to eight live pages would be an unrequested change.
    ...(seo.noindex ? { robots: { index: false, follow: false } } : {}),
    // ⚠️ `openGraph` and `twitter` REPLACE the root layout's blocks outright —
    // Next does not deep-merge metadata (see generate-metadata.md → "Merging").
    // Every key must be present here; omitting `url`, `images` or `alt` drops
    // the tag silently, which is exactly how this repo lost og:image once.
    openGraph: {
      title: shareTitle,
      description: shareDescription,
      url: canonicalAbsolute,
      siteName: global.siteName,
      locale: "en_US",
      type: seo.schemaType,
      images: [{ url: image, alt: global.siteName }],
    },
    twitter: {
      card: seo.twitterCard,
      title: shareTitle,
      description: shareDescription,
      site: global.twitterHandle || undefined,
      images: [image],
    },
  };
}

/**
 * The `<title>` a browser will actually show for the built metadata.
 *
 * Next applies the root layout's template *after* `generateMetadata` returns, so
 * an admin who types 60 characters into `metaTitle` sees those 60 characters
 * plus " | SKORA — …" on the live page. Without this the admin preview would
 * lie about the one field they care about most.
 */
export function renderedTitle(metadata: Metadata, global: GlobalSeo): string {
  const title = metadata.title;
  if (!title) return "";
  if (typeof title === "string") {
    return applyTitleTemplate(global.titleTemplate, title, global.siteName);
  }
  // `Metadata["title"]` is a union that also admits Next's template types, which
  // never reach here — `buildPageMetadata` only ever emits `{ absolute }` or a
  // plain string — so narrow on the two shapes that matter and read defensively
  // rather than asserting a cast.
  if ("absolute" in title && typeof title.absolute === "string") return title.absolute;
  if ("default" in title && typeof title.default === "string") {
    return applyTitleTemplate(global.titleTemplate, title.default, global.siteName);
  }
  return "";
}

/** True when the stored record differs from a blank one — drives the "edited" badge. */
export function hasPageSeoOverride(stored: PageSeoOverride | undefined): boolean {
  if (!stored) return false;
  const blank = emptyPageSeoOverride();
  return (
    stored.metaTitle !== blank.metaTitle ||
    stored.metaDescription !== blank.metaDescription ||
    stored.keywords.length > 0 ||
    stored.canonicalUrl !== blank.canonicalUrl ||
    stored.ogTitle !== blank.ogTitle ||
    stored.ogDescription !== blank.ogDescription ||
    stored.ogImage !== blank.ogImage ||
    stored.twitterCard !== blank.twitterCard ||
    stored.noindex !== blank.noindex ||
    stored.schemaType !== blank.schemaType
  );
}