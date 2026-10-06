import { revalidatePath } from "next/cache";
import { badRequest, notFound, ok, unauthorized, withErrorHandler } from "@/lib/api-handler";
import { readJson } from "@/lib/api-utils";
import { isSubmittedAdminAuthenticated } from "@/lib/auth";
import { deletePost, getPostById, updatePost, type PostDraftInput } from "@/lib/db";
import { parseSeoInput, slugify } from "@/lib/blog";

/**
 * Drops the ISR copies of everything a post mutation can affect.
 *
 * The paths mirror where the pages actually render: the index at /insights,
 * each post at the site root (`app/[slug]`). Revalidating a path that no
 * longer exists is a silent no-op, which is how a moved route keeps serving a
 * stale copy after an edit.
 */
function revalidatePostViews(...slugs: string[]): void {
  revalidatePath("/insights");
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/${slug}`);
  }
  revalidatePath("/sitemap.xml");
}

/**
 * /api/posts/[id]
 *
 *  GET    — fetch a post for editing (admin session required, drafts included).
 *  PATCH  — update a post (admin session required).
 *  DELETE — remove a post (admin session required).
 */
export const GET = withErrorHandler(
  async (_request, context) => {
    if (!(await isSubmittedAdminAuthenticated())) {
      return unauthorized("Admin session required");
    }
    const { id } = await context.params;
    const post = await getPostById(id);
    if (!post) return notFound("Post not found");
    return ok({ post });
  },
  { label: "Post" }
);

export const PATCH = withErrorHandler(
  async (request, context) => {
    if (!(await isSubmittedAdminAuthenticated())) {
      return unauthorized("Admin session required");
    }

    const { id } = await context.params;
    const existing = await getPostById(id);
    if (!existing) return notFound("Post not found");

    const body = await readJson<Partial<PostDraftInput>>(request, {});

    const patch: Partial<PostDraftInput> = {};
    if (typeof body.title === "string") {
      const title = body.title.trim();
      if (!title) return badRequest("A post title cannot be empty.");
      patch.title = title;
    }
    if (typeof body.excerpt === "string") patch.excerpt = body.excerpt;
    if (typeof body.content === "string") patch.content = body.content;
    if (typeof body.coverImage === "string") patch.coverImage = body.coverImage;
    if (typeof body.author === "string") patch.author = body.author;
    if (typeof body.category === "string") patch.category = body.category;
    if (Array.isArray(body.tags)) patch.tags = body.tags.map((t) => String(t));

    if (typeof body.slug === "string" && body.slug.trim()) {
      const slug = slugify(body.slug);
      if (!slug) return badRequest("The slug must contain letters or numbers.");
      patch.slug = slug;
    }

    if (body.status) {
      if (body.status !== "draft" && body.status !== "published") {
        return badRequest("Status must be draft or published.");
      }
      patch.status = body.status;
    }

    if (body.seo) {
      const seo = parseSeoInput(body.seo);
      patch.seo = { ...existing.seo, ...seo };
    }

    const post = await updatePost(id, patch);
    if (!post) return notFound("Post not found");

    // `existing.slug` may differ from `post.slug` when the URL changed.
    revalidatePostViews(existing.slug, post.slug);
    return ok({ post });
  },
  { label: "Post" }
);

export const DELETE = withErrorHandler(
  async (_request, context) => {
    if (!(await isSubmittedAdminAuthenticated())) {
      return unauthorized("Admin session required");
    }
    const { id } = await context.params;
    const existing = await getPostById(id);
    const deleted = await deletePost(id);
    if (!deleted) return notFound("Post not found");

    revalidatePostViews(existing?.slug || "");
    return ok({ deleted: true });
  },
  { label: "Post" }
);
