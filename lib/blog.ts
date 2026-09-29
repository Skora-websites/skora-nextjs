/**
 * Blog domain helpers: types, slug generation and a dependency-free
 * HTML sanitizer for content coming out of the admin rich-text editor.
 *
 * NOTE: intentionally contains no database access — everything that talks
 * to MongoDB lives in `lib/db.ts` (see AI_RULES.md).
 */

// ── Types ────────────────────────────────────────────

export type PostStatus = "draft" | "published";

export interface PostSeo {
  /** SEO title tag. Falls back to `title` when empty. */
  metaTitle: string;
  /** Meta description, ~150-160 chars. Falls back to `excerpt`. */
  metaDescription: string;
  /** Comma separated keywords stored as an array. */
  keywords: string[];
  /** Absolute canonical URL. Auto-derived from the slug when empty. */
  canonicalUrl: string;
  /** Open Graph title (falls back to metaTitle). */
  ogTitle: string;
  /** Open Graph description (falls back to metaDescription). */
  ogDescription: string;
  /** Open Graph image URL (falls back to the cover image). */
  ogImage: string;
  twitterCard: "summary" | "summary_large_image";
  /** Hide the page from search engines. */
  noindex: boolean;
  schemaType: "BlogPosting" | "Article";
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Sanitized HTML produced by the admin WYSIWYG editor. */
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  status: PostStatus;
  /** ISO timestamp — null while the post is still a draft. */
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  seo: PostSeo;
}

/** SEO settings shared by every page of the site. */
/**
 * A public social profile, managed at /admin/seo and rendered as the footer's
 * icon row. `platform` is a key from SOCIAL_PLATFORMS (lib/socials.ts); "other"
 * uses `label` for its accessible name.
 */
export interface SocialProfile {
  platform: string;
  url: string;
  label?: string;
}

export interface GlobalSeo {
  /** Brand name used in the title template, e.g. "SKORA". */
  siteName: string;
  /** Title template, `%s` is replaced with the page title. */
  titleTemplate: string;
  /** Site-wide default title (homepage / fallback). */
  defaultTitle: string;
  /** Site-wide default meta description. */
  defaultDescription: string;
  /** Site-wide default keywords. */
  defaultKeywords: string[];
  /** Default Open Graph image (absolute URL). */
  ogImage: string;
  /** Absolute origin used for canonical URLs & OG urls. */
  canonicalBase: string;
  /** Twitter/X handle, e.g. "@skoradigital". */
  twitterHandle: string;
  /** Toggle to publish robots.txt. */
  robotsEnabled: boolean;
  /** Extra paths to disallow in robots.txt (e.g. "/admin"). */
  robotsDisallow: string[];
  /** Toggle to publish the XML sitemap. */
  sitemapEnabled: boolean;
  /** Google Analytics / GTM measurement ID. */
  analyticsId: string;
  /** Public social profile links shown in the footer. */
  socials: SocialProfile[];
}

export const defaultPostSeo: PostSeo = {
  metaTitle: "",
  metaDescription: "",
  keywords: [],
  canonicalUrl: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterCard: "summary_large_image",
  noindex: false,
  schemaType: "BlogPosting",
};

export const defaultGlobalSeo: GlobalSeo = {
  siteName: "SKORA",
  titleTemplate: "%s | SKORA — Digital Marketing & Tech Solutions",
  defaultTitle: "SKORA — Next-Gen Digital Marketing & Tech Solutions Enterprise",
  defaultDescription:
    "Enterprise Digital Marketing, Website Design, Mobile Apps, Cloud Services, SaaS Platforms, Project Management Systems & CRM Solutions.",
  defaultKeywords: [
    "Digital Marketing",
    "SEO",
    "Website Design",
    "Mobile Development",
    "Cloud Services",
    "SaaS Development",
    "Project Management System",
    "PMS",
    "CRM Solutions",
  ],
  ogImage: "/logo.png",
  canonicalBase: "https://skora.digital",
  twitterHandle: "",
  robotsEnabled: true,
  robotsDisallow: ["/admin", "/api"],
  sitemapEnabled: true,
  analyticsId: "",
  socials: [],
};

/** Returns a copy so callers can never mutate the shared default object. */
export function makeDefaultSeo(): PostSeo {
  return { ...defaultPostSeo, keywords: [] };
}

// ── Slug ─────────────────────────────────────────────

export function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .trim()
    .replace(/['’`"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    // Only trim hyphens left dangling by the slice above.
    .replace(/^-+|-+$/g, "");
}

// ── Text helpers ─────────────────────────────────────

/** Removes all markup, leaving plain text (used for excerpts & previews). */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Rough reading time in whole minutes (min 1). */
export function readingTime(html: string): number {
  const words = stripHtml(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** "26 September 2026" for display; empty string for missing or invalid dates. */
export function formatPostDate(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// ── URL safety ───────────────────────────────────────

function decodeEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);?/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);?/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&colon;/gi, ":")
    .replace(/&tab;/gi, "\t")
    .replace(/&newline;/gi, "\n");
}

/** Blocks javascript:, data: (unless allowed), vbscript: and other schemes. */
export function isSafeUrl(raw: string, allowDataImage = false): boolean {
  if (!raw) return false;
  const decoded = decodeEntities(raw)
    .replace(/[\u0000-\u0020\u007f\s]/g, "")
    .toLowerCase();

  if (decoded.startsWith("#") || decoded.startsWith("/") || decoded.startsWith("./")) return true;

  const schemeMatch = decoded.match(/^([a-z][a-z0-9+.-]*):/);
  if (!schemeMatch) return true; // relative URL ("image.png", "page.html")

  const scheme = schemeMatch[1];
  if (scheme === "http" || scheme === "https" || scheme === "mailto" || scheme === "tel") return true;
  if (allowDataImage && scheme === "data" && /^data:image\/(png|jpe?g|gif|webp|avif);base64,/.test(decoded)) {
    return true;
  }
  return false;
}

// ── HTML sanitizer ───────────────────────────────────

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "strike", "mark", "sub", "sup", "small",
  "h2", "h3", "h4", "h5",
  "ul", "ol", "li",
  "a", "blockquote", "img", "hr",
  "code", "pre",
  "table", "thead", "tbody", "tr", "th", "td",
  "figure", "figcaption",
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);

/** Tags whose entire block (including children) is discarded. */
const DROP_BLOCK = "script|style|iframe|object|embed|link|meta|base|form|input|button|textarea|select|svg|math|noscript|template";

const ALLOWED_ATTRS: Record<string, string[]> = {
  a: ["href", "title", "target"],
  img: ["src", "alt", "title", "width", "height"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan", "scope"],
  ol: ["start"],
  code: ["class"],
  pre: ["class"],
};

function safeAttrValue(tag: string, name: string, value: string): string | null {
  const lower = name.toLowerCase();
  if (lower === "href" || lower === "src") {
    const allowDataImage = lower === "src";
    if (!isSafeUrl(value, allowDataImage)) return null;
    return value.replace(/"/g, "&quot;");
  }
  if (lower === "target") {
    return value === "_blank" || value === "_self" ? value : null;
  }
  if (lower === "width" || lower === "height" || lower === "colspan" || lower === "rowspan" || lower === "start") {
    return /^\d{1,4}$/.test(value.trim()) ? value.trim() : null;
  }
  if (lower === "class") {
    // Keep simple utility classes, never anything that could be mistaken for markup.
    const cleaned = value.split(/\s+/).filter((c) => /^[a-z0-9_-]{1,40}$/i.test(c)).join(" ");
    return cleaned || null;
  }
  // alt / title
  return value.replace(/[<>]/g, "");
}

function sanitizeTag(tag: string): string {
  const trimmed = tag.trim();

  // Closing tag
  if (trimmed.startsWith("</")) {
    const name = trimmed.slice(2).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!name || !ALLOWED_TAGS.has(name)) return "";
    return `</${name}>`;
  }

  // Opening / void tag
  const match = trimmed.match(/^<([a-zA-Z0-9]+)((?:[^>"']|"[^"]*"|'[^']*')*)>$/);
  if (!match) return "";
  const name = match[1].toLowerCase();
  const rawAttrs = match[2] || "";

  if (!ALLOWED_TAGS.has(name)) return "";

  const allowed = ALLOWED_ATTRS[name] || [];
  const parts: string[] = [];
  const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'>]+))?/g;
  let attrMatch: RegExpExecArray | null;
  const seen: string[] = [];

  while ((attrMatch = attrRe.exec(rawAttrs)) !== null) {
    const attrName = attrMatch[1].toLowerCase();
    if (seen.includes(attrName)) continue;
    if (!allowed.includes(attrName)) continue;
    let value = (attrMatch[2] || "").replace(/^["']|["']$/g, "");
    value = value.replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const safe = safeAttrValue(name, attrName, value);
    if (safe === null) continue;
    seen.push(attrName);
    parts.push(`${attrName}="${safe}"`);
  }

  // Hardening: links opening a new tab must not leak the opener.
  if (name === "a" && seen.includes("target") && !seen.includes("rel")) {
    parts.push('rel="noopener noreferrer"');
  }

  const attrs = parts.length ? " " + parts.join(" ") : "";
  if (VOID_TAGS.has(name)) return `<${name}${attrs} />`;
  return `<${name}${attrs}>`;
}

/**
 * Sanitizes editor HTML against an allow-list of tags/attributes.
 * Removes scripts, event handlers, dangerous URL schemes and comments.
 * Safe to render with dangerouslySetInnerHTML.
 */
export function sanitizeHtml(input: string): string {
  if (!input) return "";
  let html = String(input);

  // Comments (may hide conditional code)
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  // Whole dangerous blocks incl. their content
  html = html.replace(new RegExp(`<(${DROP_BLOCK})\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>`, "gi"), "");
  // Stray opening/closing dangerous tags
  html = html.replace(new RegExp(`<\\/?(?:${DROP_BLOCK})\\b[^>]*>`, "gi"), "");
  // <svg>-style foreign content leftovers
  html = html.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "");

  // Rewrite every remaining tag through the allow-list
  html = html.replace(/<[^>]*>/g, (tag) => sanitizeTag(tag));

  // Belt & braces: strip any surviving executable scheme in text/attrs
  html = html.replace(/(href|src)\s*=\s*"([^"]*)"/gi, (full, attr: string, value: string) =>
    isSafeUrl(value, attr.toLowerCase() === "src") ? full : ""
  );

  return html.trim();
}

/** Trims plain text to `max` characters without cutting a word in half. */
export function truncateWords(text: string, max: number): string {
  const clean = stripHtml(text);
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max + 1);
  return cut.slice(0, cut.lastIndexOf(" ")).trim() + "…";
}

// ── Request body coercion ─────────────────────────────

const asString = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
const asBool = (value: unknown, fallback = false): boolean =>
  typeof value === "boolean" ? value : fallback;

/** Whitelists + type-checks a `PostSeo` patch coming from the admin form. */
export function parseSeoInput(raw: unknown): Partial<PostSeo> {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const out: Partial<PostSeo> = {};

  if (typeof r.metaTitle === "string") out.metaTitle = r.metaTitle.trim();
  if (typeof r.metaDescription === "string") out.metaDescription = r.metaDescription.trim();
  if (Array.isArray(r.keywords)) {
    out.keywords = r.keywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 20);
  }
  if (typeof r.canonicalUrl === "string") out.canonicalUrl = r.canonicalUrl.trim();
  if (typeof r.ogTitle === "string") out.ogTitle = r.ogTitle.trim();
  if (typeof r.ogDescription === "string") out.ogDescription = r.ogDescription.trim();
  if (typeof r.ogImage === "string") out.ogImage = r.ogImage.trim();
  if (r.twitterCard === "summary" || r.twitterCard === "summary_large_image") out.twitterCard = r.twitterCard;
  if (typeof r.noindex === "boolean") out.noindex = r.noindex;
  if (r.schemaType === "BlogPosting" || r.schemaType === "Article") out.schemaType = r.schemaType;

  return out;
}

/** Whitelists + type-checks the global SEO settings payload. */
export function parseGlobalSeoInput(raw: unknown): Partial<GlobalSeo> {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;
  const out: Partial<GlobalSeo> = {};

  if (typeof r.siteName === "string") out.siteName = r.siteName.trim();
  if (typeof r.titleTemplate === "string") out.titleTemplate = r.titleTemplate.trim();
  if (typeof r.defaultTitle === "string") out.defaultTitle = r.defaultTitle.trim();
  if (typeof r.defaultDescription === "string") out.defaultDescription = r.defaultDescription.trim();
  if (Array.isArray(r.defaultKeywords)) {
    out.defaultKeywords = r.defaultKeywords.map((k) => String(k).trim()).filter(Boolean).slice(0, 30);
  }
  if (typeof r.ogImage === "string") out.ogImage = r.ogImage.trim();
  if (typeof r.canonicalBase === "string") out.canonicalBase = r.canonicalBase.trim().replace(/\/+$/, "");
  if (typeof r.twitterHandle === "string") out.twitterHandle = r.twitterHandle.trim();
  if (typeof r.robotsEnabled === "boolean") out.robotsEnabled = r.robotsEnabled;
  if (Array.isArray(r.robotsDisallow)) {
    out.robotsDisallow = r.robotsDisallow
      .map((p) => String(p).trim())
      .filter(Boolean)
      .map((p) => (p.startsWith("/") ? p : `/${p}`))
      .slice(0, 50);
  }
  if (typeof r.sitemapEnabled === "boolean") out.sitemapEnabled = r.sitemapEnabled;
  if (typeof r.analyticsId === "string") out.analyticsId = r.analyticsId.trim();
  if (Array.isArray(r.socials)) {
    // Drop entries with no platform or an unusable URL instead of storing dead
    // links the footer would render as empty buttons.
    const socials: SocialProfile[] = [];
    for (const entry of r.socials as unknown[]) {
      if (!entry || typeof entry !== "object") continue;
      const p = entry as Record<string, unknown>;
      const platform = typeof p.platform === "string" ? p.platform.trim().toLowerCase() : "";
      const url = typeof p.url === "string" ? sanitizeAbsoluteUrl(p.url) : "";
      const label = typeof p.label === "string" ? p.label.trim().slice(0, 40) : "";
      if (!platform || !url) continue;
      socials.push(label ? { platform, url, label } : { platform, url });
      if (socials.length >= 8) break;
    }
    out.socials = socials;
  }

  return out;
}

/** Applies the `%s` title template (or the site default when empty). */
export function applyTitleTemplate(template: string, title: string, fallback: string): string {
  const base = title || fallback;
  if (!template || !template.includes("%s")) return base || fallback;
  return template.replace("%s", base);
}

/** Resolves a possibly relative URL against the canonical base origin. */
export function absoluteUrl(url: string, canonicalBase: string): string {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = canonicalBase || defaultGlobalSeo.canonicalBase;
  if (url.startsWith("/")) return `${base.replace(/\/+$/, "")}${url}`;
  return `${base.replace(/\/+$/, "")}/${url}`;
}

/** Keeps only plain http(s) URLs — used for canonical/OG images. */
export function sanitizeSeoUrl(value: string): string {
  const url = asString(value);
  if (!url) return "";
  if (isSafeUrl(url)) return url;
  return "";
}

/**
 * Like sanitizeSeoUrl, but also rejects relative paths — for links that leave
 * the site (social profiles), where "linkedin.com/x" would silently render as
 * a dead in-page link.
 */
export function sanitizeAbsoluteUrl(value: string): string {
  const url = sanitizeSeoUrl(value);
  return /^https?:\/\//i.test(url) ? url : "";
}

/** Boolean helper shared by form parsing. */
export function toBool(value: unknown, fallback = false): boolean {
  return asBool(value, fallback);
}

