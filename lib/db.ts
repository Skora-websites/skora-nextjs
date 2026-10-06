import fs from "fs";
import path from "path";
import { cache } from "react";
import { ObjectId, type Db, type Filter, type OptionalId } from "mongodb";
import { getMongoClient, hasMongoConfig } from "./mongodb";
import {
  DEFAULT_SERVICES,
  DEFAULT_SITE_CORE,
  type ServiceItem,
} from "./site-defaults";
import {
  defaultGlobalSeo,
  makeDefaultSeo,
  sanitizeHtml,
  slugify,
  type BlogPost,
  type GlobalSeo,
  type PostSeo,
} from "./blog";
import {
  normalizePageSeoKey,
  normalizePageSeoMap,
  type PageSeoContext,
  type PageSeoOverride,
  type PageSeoOverrides,
} from "./page-seo";

const DB_NAME = process.env.MONGODB_DB?.trim() || undefined;

export type { Lead, LeadStatus } from "./lead";
import type { Lead } from "./lead";

/**
 * The editable site content document.
 *
 * The old `/healthcare` division took a `packages` array and a separate
 * `healthcareEmail`; both are gone. Records written before that removal may
 * still carry them, so `stripRetiredFields` drops them on every read/write and
 * they can never resurface through the API or the admin editors.
 */
export interface SiteContent {
  phone: string;
  email: string;
  address: string;
  responseGuarantee: string;
  services: ServiceItem[];
  textOverrides: Record<string, string>;
  /** Site-wide SEO defaults managed from /admin/seo. */
  seo: GlobalSeo;
  /**
   * Per-page SEO overrides for the static marketing routes, keyed by canonical
   * route path (`"/"`, `"/about"`, …). Managed from /admin/seo/pages.
   *
   * Only ever contains keys present in `PAGE_SEO_REGISTRY` — `normalizePageSeoMap`
   * enforces that on every read and write, so a route deleted from the registry
   * cannot leave an orphan record behind.
   */
  pageSeo: PageSeoOverrides;
  updatedAt: string;
}

/** Fields removed when the healthcare division was dropped. */
const RETIRED_CONTENT_KEYS = ["packages", "healthcareEmail"] as const;

/** Partial update payload — the `seo` block may be supplied piecemeal. */
export type { ServiceItem };

export type SiteContentPatch = Omit<Partial<SiteContent>, "seo" | "pageSeo"> & {
  seo?: Partial<GlobalSeo>;
  /**
   * Overrides keyed by route path. A `null` value deletes that page's record —
   * that is the Reset action, and the reason this is not a plain Partial.
   */
  pageSeo?: Record<string, PageSeoOverride | null>;
};

/** Copies only the live fields, so stale stored keys never survive a write. */
function stripRetiredFields<T extends object>(content: T): T {
  const clean = { ...content } as Record<string, unknown>;
  for (const key of RETIRED_CONTENT_KEYS) delete clean[key];
  return clean as T;
}

/**
 * Merges a pageSeo patch onto the stored map.
 *
 * Entries merge (so a save for `/about` cannot clobber `/privacy`) but the record
 * for a path is REPLACED, never field-patched — matching the wholesale save the
 * admin form performs, and removing the stale-key class of bug entirely. A `null`
 * value deletes that page's record; that is the Reset action.
 */
function mergePageSeoOverrides(
  current: PageSeoOverrides | undefined,
  patch: Record<string, PageSeoOverride | null> | undefined
): PageSeoOverrides {
  const next: PageSeoOverrides = { ...(current || {}) };
  for (const [key, value] of Object.entries(patch || {})) {
    const path = normalizePageSeoKey(key);
    if (!value) {
      delete next[path];
      continue;
    }
    next[path] = value;
  }
  return normalizePageSeoMap(next);
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "hrms.json");

const defaultSiteContent: SiteContent = {
  ...DEFAULT_SITE_CORE,
  services: DEFAULT_SERVICES,
  textOverrides: {},
  seo: defaultGlobalSeo,
  pageSeo: {},
  updatedAt: new Date().toISOString(),
};

interface DatabaseSchema {
  leads: Lead[];
  content: SiteContent;
  posts: BlogPost[];
}

// ----------------------------------------------------
// LOCAL FILE STORAGE ENGINE (FALLBACK / LOCAL DEV)
// ----------------------------------------------------
function normalizeLocalContent(parsed: SiteContent): SiteContent {
  const merged: SiteContent = {
    ...defaultSiteContent,
    ...stripRetiredFields(parsed || {}),
    textOverrides: parsed?.textOverrides || {},
    seo: { ...defaultGlobalSeo, ...(parsed?.seo || {}) },
    pageSeo: normalizePageSeoMap(parsed?.pageSeo),
  };
  if (!merged.services || merged.services.length === 0) merged.services = DEFAULT_SERVICES;
  return merged;
}

function ensureLocalDbFile(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialData: DatabaseSchema = {
      leads: [],
      content: defaultSiteContent,
      posts: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const contentChanged =
      !parsed.content ||
      !parsed.content.textOverrides ||
      !parsed.content.seo ||
      // `pageSeo` may legitimately be an empty object (no page overridden yet),
      // so an absent key is the migration trigger, not emptiness — same as the
      // `seo` check above it.
      parsed.content.pageSeo === undefined ||
      !parsed.content.services ||
      RETIRED_CONTENT_KEYS.some((key) => key in parsed.content);
    if (!parsed.posts) parsed.posts = [];
    if (contentChanged) {
      parsed.content = normalizeLocalContent(parsed.content);
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf-8");
    }
    return parsed;
  } catch {
    const initialData: DatabaseSchema = {
      leads: [],
      content: defaultSiteContent,
      posts: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
}

function writeLocalDb(data: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ----------------------------------------------------
// DUAL-ENGINE METHOD IMPLEMENTATIONS
// ----------------------------------------------------

export async function getLeads(): Promise<Lead[]> {
  if (hasMongoConfig()) {
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db(DB_NAME);
        const collection = db.collection<Lead>("leads");
        const leads = await collection.find({}).sort({ createdAt: -1 }).toArray();
        if (leads.length > 0) {
          return leads.map((lead) => {
            const clean = { ...(lead as Lead & { _id?: unknown }) };
            const rawId = clean._id;
            delete clean._id;
            // Rows written before the shape was unified may have no `id`.
            if (!clean.id && rawId !== undefined && rawId !== null) clean.id = String(rawId);
            return clean;
          });
        }
        // Auto-seed MongoDB with initial leads if collection is empty
        const localDb = ensureLocalDbFile();
        if (localDb.leads && localDb.leads.length > 0) {
          await collection.insertMany(localDb.leads as unknown as OptionalId<Lead>[]);
          return localDb.leads;
        }
      }
    } catch (e) {
      console.error("MongoDB error, falling back to local storage:", e);
    }
  }

  const db = ensureLocalDbFile();
  return db.leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createLead(leadData: Omit<Lead, "id" | "createdAt" | "status">): Promise<Lead> {
  const newLead: Lead = {
    ...leadData,
    id: `lead-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    status: "New",
    createdAt: new Date().toISOString(),
  };

  if (hasMongoConfig()) {
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db(DB_NAME);
        const collection = db.collection<Lead>("leads");
        await collection.insertOne(newLead);
        return newLead;
      }
    } catch (e) {
      console.error("MongoDB Atlas error, saving locally:", e);
    }
  }

  const db = ensureLocalDbFile();
  db.leads.unshift(newLead);
  writeLocalDb(db);
  return newLead;
}

/**
 * Match a lead by its generated string `id`, falling back to Mongo's `_id` so
 * rows written before the lead shape was unified can still be updated.
 */
function leadIdFilters(id: string): Filter<Lead>[] {
  const filters: Filter<Lead>[] = [{ id }];
  if (ObjectId.isValid(id)) {
    filters.push({ _id: new ObjectId(id) } as unknown as Filter<Lead>);
  }
  return filters;
}

export async function updateLeadStatus(id: string, status: Lead["status"]): Promise<Lead | null> {
  if (hasMongoConfig()) {
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db(DB_NAME);
        const collection = db.collection<Lead>("leads");
        let result: (Lead & { _id?: unknown }) | null = null;
        for (const filter of leadIdFilters(id)) {
          result = (await collection.findOneAndUpdate(filter, { $set: { status } }, {
            returnDocument: "after",
          })) as (Lead & { _id?: unknown }) | null;
          if (result) break;
        }
        if (result) {
          const updatedLead = { ...result };
          delete updatedLead._id;
          return updatedLead;
        }
      }
    } catch (e) {
      console.error("MongoDB Atlas error, updating locally:", e);
    }
  }

  const db = ensureLocalDbFile();
  const index = db.leads.findIndex((l) => l.id === id);
  if (index === -1) return null;

  db.leads[index].status = status;
  writeLocalDb(db);
  return db.leads[index];
}

export async function deleteLead(id: string): Promise<boolean> {
  if (hasMongoConfig()) {
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db(DB_NAME);
        const collection = db.collection<Lead>("leads");
        for (const filter of leadIdFilters(id)) {
          const res = await collection.deleteOne(filter);
          if (res.deletedCount > 0) return true;
        }
        return false;
      }
    } catch (e) {
      console.error("MongoDB Atlas error, deleting locally:", e);
    }
  }

  const db = ensureLocalDbFile();
  const initialLen = db.leads.length;
  db.leads = db.leads.filter((l) => l.id !== id);
  if (db.leads.length === initialLen) return false;
  writeLocalDb(db);
  return true;
}

/**
 * The whole site-content document.
 *
 * Wrapped in React's `cache()` so a single render that needs it more than once
 * issues one query. The static marketing pages are why this matters: each one
 * reads the document twice — once through `getPageSeoContext` in
 * `generateMetadata`, once through `getGlobalSeoSafe` in its body for the
 * JSON-LD. Without this that is two `findOne`s per page, every regeneration.
 *
 * `cache` is scoped to the React request, so it cannot serve a stale document
 * across requests, and outside a React scope it degrades to a plain call. The
 * one thing to keep in mind: `updateSiteContent` reads through this same
 * function and then writes. Nothing reads after a write in the same request
 * today, and `updateSiteContent` returns its own computed object rather than
 * re-reading, so there is no stale-after-write path.
 */
export const getSiteContent = cache(async (): Promise<SiteContent> => {
  if (hasMongoConfig()) {
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db(DB_NAME);
        const collection = db.collection<SiteContent>("content");
        const content = await collection.findOne({ key: "global_site_content" });
        if (content) {
          const stored = { ...(content as SiteContent & { _id?: unknown }) };
          delete stored._id;
          // Older documents may still hold the retired healthcare keys — drop
          // them so the merged result matches the current shape.
          const cleanContent = stripRetiredFields(stored);
          return {
            ...defaultSiteContent,
            ...cleanContent,
            seo: { ...defaultGlobalSeo, ...(cleanContent.seo || {}) },
            pageSeo: normalizePageSeoMap(cleanContent.pageSeo),
            textOverrides: cleanContent.textOverrides || {},
          };
        }
        // Auto-seed MongoDB with initial site content if collection is empty
        const localDb = ensureLocalDbFile();
        const seedContent = normalizeLocalContent(localDb.content || defaultSiteContent);
        await collection.updateOne(
          { key: "global_site_content" },
          { $set: { key: "global_site_content", ...seedContent } },
          { upsert: true }
        );
        return seedContent;
      }
    } catch (e) {
      console.error("MongoDB error, loading local content:", e);
    }
  }

  const db = ensureLocalDbFile();
  db.content = normalizeLocalContent(db.content);
  return db.content;
});

export async function updateSiteContent(partialContent: SiteContentPatch): Promise<SiteContent> {
  const current = await getSiteContent();
  const patch = stripRetiredFields(partialContent);
  const updatedContent: SiteContent = {
    ...current,
    ...patch,
    textOverrides: {
      ...(current.textOverrides || {}),
      ...(patch.textOverrides || {}),
    },
    seo: {
      ...(current.seo || defaultGlobalSeo),
      ...(patch.seo || {}),
    },
    pageSeo: mergePageSeoOverrides(current.pageSeo, patch.pageSeo),
    updatedAt: new Date().toISOString(),
  };

  if (hasMongoConfig()) {
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db(DB_NAME);
        const collection = db.collection("content");
        await collection.updateOne(
          { key: "global_site_content" },
          // `$set` only touches the live fields; the retired healthcare keys are
          // unset explicitly so a stale document cannot hand them back later.
          {
            $set: { key: "global_site_content", ...updatedContent },
            $unset: Object.fromEntries(RETIRED_CONTENT_KEYS.map((key) => [key, ""])),
          },
          { upsert: true }
        );
      }
    } catch (e) {
      console.error("MongoDB Atlas error, updating local content:", e);
    }
  }

  // Always sync and write to local codebase JSON file (data/hrms.json)
  const localDb = ensureLocalDbFile();
  localDb.content = updatedContent;
  writeLocalDb(localDb);
  return updatedContent;
}

// ====================================================
// BLOG POSTS (MongoDB "posts" collection + local fallback)
// ====================================================

const POSTS_COLLECTION = "posts";
let postsIndexesEnsured = false;

export interface PostDraftInput {
  slug?: string;
  title: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  author?: string;
  category?: string;
  tags?: string[];
  status?: BlogPost["status"];
  seo?: Partial<PostSeo>;
}

export interface PostQueryOptions {
  /** Include drafts (admin views only). */
  includeDrafts?: boolean;
}

function normalizeSeo(seo?: Partial<PostSeo>): PostSeo {
  return { ...makeDefaultSeo(), ...(seo || {}) };
}

function cleanPost(doc: (BlogPost & { _id?: unknown }) | null): BlogPost | null {
  if (!doc) return null;
  const clean = { ...doc } as BlogPost & { _id?: unknown };
  delete clean._id;
  return {
    ...clean,
    tags: Array.isArray(clean.tags) ? clean.tags.filter(Boolean) : [],
    seo: normalizeSeo(clean.seo),
    content: sanitizeHtml(clean.content || ""),
  };
}

function sortPosts(posts: BlogPost[]): BlogPost[] {
  return posts.sort((a, b) => {
    const aTime = a.publishedAt || a.updatedAt || a.createdAt;
    const bTime = b.publishedAt || b.updatedAt || b.createdAt;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}

/** Builds a unique, URL-safe slug (appends -2, -3… on collision). */
async function buildUniqueSlug(
  desired: string,
  exists: (slug: string) => Promise<boolean>
): Promise<string> {
  const base = slugify(desired) || `post-${Date.now().toString(36)}`;

  let candidate = base;
  let counter = 2;
  // Bounded loop: 500 attempts is more than enough for real usage.
  while (counter <= 500 && (await exists(candidate))) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }
  return candidate;
}

/** Creates the posts collection indexes once per process (slug is unique). */
async function ensurePostIndexes(db: Db): Promise<void> {
  if (postsIndexesEnsured) return;
  try {
    await db.collection(POSTS_COLLECTION).createIndex({ slug: 1 }, { unique: true });
    await db.collection(POSTS_COLLECTION).createIndex({ status: 1, publishedAt: -1 });
    postsIndexesEnsured = true;
  } catch (e) {
    console.error("Failed to ensure posts indexes:", e);
  }
}

export async function getPosts(options: PostQueryOptions = {}): Promise<BlogPost[]> {
  const filter: Filter<BlogPost> = options.includeDrafts ? {} : { status: "published" };

  if (hasMongoConfig()) {
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db(DB_NAME);
        await ensurePostIndexes(db);
        const docs = await db
          .collection<BlogPost>(POSTS_COLLECTION)
          .find(filter)
          .sort({ publishedAt: -1, updatedAt: -1 })
          .toArray();
        return sortPosts(docs.map((d) => cleanPost(d)).filter((d): d is BlogPost => Boolean(d)));
      }
    } catch (e) {
      console.error("MongoDB error loading posts, falling back to local storage:", e);
    }
  }

  const local = ensureLocalDbFile();
  const posts = (local.posts || []).map((p) => cleanPost(p)).filter((p): p is BlogPost => Boolean(p));
  return sortPosts(options.includeDrafts ? posts : posts.filter((p) => p.status === "published"));
}

export async function getPostBySlug(slug: string, options: PostQueryOptions = {}): Promise<BlogPost | null> {
  if (hasMongoConfig()) {
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db(DB_NAME);
        await ensurePostIndexes(db);
        const doc = await db.collection<BlogPost>(POSTS_COLLECTION).findOne({ slug });
        const post = cleanPost(doc);
        if (!post) return null;
        return options.includeDrafts || post.status === "published" ? post : null;
      }
    } catch (e) {
      console.error("MongoDB error loading post, falling back to local storage:", e);
    }
  }

  const local = ensureLocalDbFile();
  const post = cleanPost((local.posts || []).find((p) => p.slug === slug) || null);
  if (!post) return null;
  return options.includeDrafts || post.status === "published" ? post : null;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  if (hasMongoConfig()) {
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db(DB_NAME);
        await ensurePostIndexes(db);
        return cleanPost(await db.collection<BlogPost>(POSTS_COLLECTION).findOne({ id }));
      }
    } catch (e) {
      console.error("MongoDB error loading post, falling back to local storage:", e);
    }
  }

  const local = ensureLocalDbFile();
  return cleanPost((local.posts || []).find((p) => p.id === id) || null);
}

export async function createPost(input: PostDraftInput): Promise<BlogPost> {
  const now = new Date().toISOString();
  const status: BlogPost["status"] = input.status === "published" ? "published" : "draft";

  if (hasMongoConfig()) {
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db(DB_NAME);
        await ensurePostIndexes(db);
        const collection = db.collection<BlogPost>(POSTS_COLLECTION);

        const slug = await buildUniqueSlug(input.slug || input.title, async (candidate) =>
          Boolean(await collection.findOne({ slug: candidate }))
        );

        const post: BlogPost = {
          id: `post-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          slug,
          title: (input.title || "").trim(),
          excerpt: (input.excerpt || "").trim(),
          content: sanitizeHtml(input.content || ""),
          coverImage: (input.coverImage || "").trim(),
          author: (input.author || "").trim(),
          category: (input.category || "").trim(),
          tags: (input.tags || []).map((t) => String(t).trim()).filter(Boolean),
          status,
          publishedAt: status === "published" ? now : null,
          createdAt: now,
          updatedAt: now,
          seo: normalizeSeo(input.seo),
        };

        await collection.insertOne(post as unknown as OptionalId<BlogPost>);
        return post;
      }
    } catch (e) {
      console.error("MongoDB Atlas error creating post, saving locally:", e);
      if (e && typeof e === "object" && "code" in e && (e as { code: number }).code === 11000) {
        throw e; // duplicate slug — let the API layer answer 409
      }
    }
  }

  const local = ensureLocalDbFile();
  const existingSlugs = new Set((local.posts || []).map((p) => p.slug));
  const slug = await buildUniqueSlug(input.slug || input.title, async (candidate) =>
    existingSlugs.has(candidate)
  );

  const post: BlogPost = {
    id: `post-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    slug,
    title: (input.title || "").trim(),
    excerpt: (input.excerpt || "").trim(),
    content: sanitizeHtml(input.content || ""),
    coverImage: (input.coverImage || "").trim(),
    author: (input.author || "").trim(),
    category: (input.category || "").trim(),
    tags: (input.tags || []).map((t) => String(t).trim()).filter(Boolean),
    status,
    publishedAt: status === "published" ? now : null,
    createdAt: now,
    updatedAt: now,
    seo: normalizeSeo(input.seo),
  };

  local.posts = [post, ...(local.posts || [])];
  writeLocalDb(local);
  return post;
}

export async function updatePost(id: string, input: Partial<PostDraftInput>): Promise<BlogPost | null> {
  if (hasMongoConfig()) {
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db(DB_NAME);
        await ensurePostIndexes(db);
        const collection = db.collection<BlogPost>(POSTS_COLLECTION);

        const current = await collection.findOne({ id });
        if (!current) return null;

        const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };

        if (typeof input.title === "string") patch.title = input.title.trim();
        if (typeof input.excerpt === "string") patch.excerpt = input.excerpt.trim();
        if (typeof input.content === "string") patch.content = sanitizeHtml(input.content);
        if (typeof input.coverImage === "string") patch.coverImage = input.coverImage.trim();
        if (typeof input.author === "string") patch.author = input.author.trim();
        if (typeof input.category === "string") patch.category = input.category.trim();
        if (Array.isArray(input.tags)) patch.tags = input.tags.map((t) => String(t).trim()).filter(Boolean);
        if (input.seo) patch.seo = normalizeSeo({ ...(current.seo || {}), ...input.seo });

        // Slug: an explicit request always wins. The slug only keeps following
        // the title while the post has never been published and still matches
        // its title — once a URL is live, changing it would break inbound links.
        const autoFollowsTitle =
          current.slug === slugify(current.title) ||
          current.slug.startsWith(`${slugify(current.title)}-`);
        const wantsNewSlug =
          (typeof input.slug === "string" && slugify(input.slug) !== current.slug) ||
          (typeof input.title === "string" &&
            !input.slug &&
            autoFollowsTitle &&
            !current.publishedAt);
        if (wantsNewSlug) {
          const desired = input.slug || input.title || "";
          patch.slug = await buildUniqueSlug(desired, async (candidate) =>
            Boolean(await collection.findOne({ slug: candidate, id: { $ne: id } }))
          );
        }

        if (input.status && input.status !== current.status) {
          patch.status = input.status;
          patch.publishedAt =
            input.status === "published"
              ? current.publishedAt || new Date().toISOString()
              : null;
        }

        const result = await collection.findOneAndUpdate(
          { id },
          { $set: patch as Partial<BlogPost> },
          { returnDocument: "after" }
        );
        return cleanPost(result as (BlogPost & { _id?: unknown }) | null);
      }
    } catch (e) {
      console.error("MongoDB Atlas error updating post, updating locally:", e);
      if (e && typeof e === "object" && "code" in e && (e as { code: number }).code === 11000) {
        throw e;
      }
    }
  }

  const local = ensureLocalDbFile();
  const index = (local.posts || []).findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = local.posts[index];
  const updated: BlogPost = { ...current, updatedAt: new Date().toISOString() };

  if (typeof input.title === "string") updated.title = input.title.trim();
  if (typeof input.excerpt === "string") updated.excerpt = input.excerpt.trim();
  if (typeof input.content === "string") updated.content = sanitizeHtml(input.content);
  if (typeof input.coverImage === "string") updated.coverImage = input.coverImage.trim();
  if (typeof input.author === "string") updated.author = input.author.trim();
  if (typeof input.category === "string") updated.category = input.category.trim();
  if (Array.isArray(input.tags)) updated.tags = input.tags.map((t) => String(t).trim()).filter(Boolean);
  if (input.seo) updated.seo = normalizeSeo({ ...current.seo, ...input.seo });

  const autoFollowsTitle =
    current.slug === slugify(current.title) ||
    current.slug.startsWith(`${slugify(current.title)}-`);
  const wantsNewSlug =
    (typeof input.slug === "string" && slugify(input.slug) !== current.slug) ||
    (typeof input.title === "string" && !input.slug && autoFollowsTitle && !current.publishedAt);
  if (wantsNewSlug) {
    const desired = input.slug || input.title || "";
    const taken = new Set((local.posts || []).filter((p) => p.id !== id).map((p) => p.slug));
    updated.slug = await buildUniqueSlug(desired, async (candidate) => taken.has(candidate));
  }

  if (input.status && input.status !== current.status) {
    updated.status = input.status;
    updated.publishedAt = input.status === "published" ? current.publishedAt || new Date().toISOString() : null;
  }

  local.posts[index] = updated;
  writeLocalDb(local);
  return updated;
}

export async function deletePost(id: string): Promise<boolean> {
  if (hasMongoConfig()) {
    try {
      const client = await getMongoClient();
      if (client) {
        const db = client.db(DB_NAME);
        const res = await db.collection(POSTS_COLLECTION).deleteOne({ id });
        return res.deletedCount > 0;
      }
    } catch (e) {
      console.error("MongoDB Atlas error deleting post, removing locally:", e);
    }
  }

  const local = ensureLocalDbFile();
  const before = (local.posts || []).length;
  local.posts = (local.posts || []).filter((p) => p.id !== id);
  if (local.posts.length === before) return false;
  writeLocalDb(local);
  return true;
}

/**
 * Site-wide SEO with its fallbacks applied, so both `getGlobalSeoSafe` and
 * `getPageSeoContext` normalise identically.
 *
 * An explicitly saved empty value must never win over the fallback:
 * canonicalBase is concatenated into canonical/OG/sitemap URLs and is
 * used verbatim as author/publisher `url` in the BlogPosting JSON-LD.
 */
function globalSeoFrom(content: SiteContent): GlobalSeo {
  const seo: GlobalSeo = { ...defaultGlobalSeo, ...(content.seo || {}) };
  seo.canonicalBase = (seo.canonicalBase || defaultGlobalSeo.canonicalBase).replace(/\/+$/, "");
  seo.siteName = seo.siteName || defaultGlobalSeo.siteName;
  seo.titleTemplate = seo.titleTemplate || defaultGlobalSeo.titleTemplate;
  return seo;
}

/**
 * Global SEO settings for metadata generation.
 * Never throws: `generateMetadata` must keep working even when the
 * database is unreachable (e.g. during a cold build).
 */
export async function getGlobalSeoSafe(): Promise<GlobalSeo> {
  try {
    return globalSeoFrom(await getSiteContent());
  } catch (e) {
    console.error("Failed to load global SEO settings, using defaults:", e);
    return { ...defaultGlobalSeo };
  }
}

/**
 * Everything a static marketing page needs: the site-wide SEO settings plus the
 * per-page override map, from ONE document read.
 *
 * The pages call `getGlobalSeoSafe()` again in their bodies (for JSON-LD), which
 * is why `getSiteContent` is wrapped in React `cache()` — see that comment.
 * Never takes a path: the map is a single field, so a per-path accessor would
 * only tempt a caller into looping the registry and issuing one `findOne` per
 * route inside a single `generateMetadata`.
 */
export async function getPageSeoContext(): Promise<PageSeoContext> {
  try {
    const content = await getSiteContent();
    return { global: globalSeoFrom(content), overrides: content.pageSeo };
  } catch (e) {
    console.error("Failed to load per-page SEO settings, using defaults:", e);
    return { global: { ...defaultGlobalSeo }, overrides: {} };
  }
}
