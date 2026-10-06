import { revalidatePath } from "next/cache";
import { badRequest, created, ok, unauthorized, withErrorHandler } from "@/lib/api-handler";
import { readJson } from "@/lib/api-utils";
import { isSubmittedAdminAuthenticated } from "@/lib/auth";
import { createPost, getPosts, type PostDraftInput } from "@/lib/db";
import { parseSeoInput } from "@/lib/blog";

/**
 * /api/posts
 *
 *  GET  — list posts. Published posts are public; `?all=1` also returns
 *         drafts, but only for an authenticated admin session.
 *  POST — create a post (admin session required).
 */
export const GET = withErrorHandler(
  async (request) => {
    const wantDrafts = request.nextUrl.searchParams.get("all") === "1";
    const isAdmin = await isSubmittedAdminAuthenticated();
    const posts = await getPosts({ includeDrafts: wantDrafts && isAdmin });
    return ok({ posts });
  },
  { label: "Posts" }
);

export const POST = withErrorHandler(
  async (request) => {
    if (!(await isSubmittedAdminAuthenticated())) {
      return unauthorized("Admin session required");
    }

    const body = await readJson<Partial<PostDraftInput>>(request, {});

    const title = String(body.title || "").trim();
    if (!title) return badRequest("A post title is required.");

    const post = await createPost({
      title,
      slug: typeof body.slug === "string" ? body.slug.trim() : undefined,
      excerpt: typeof body.excerpt === "string" ? body.excerpt : "",
      content: typeof body.content === "string" ? body.content : "",
      coverImage: typeof body.coverImage === "string" ? body.coverImage : "",
      author: typeof body.author === "string" ? body.author : "",
      category: typeof body.category === "string" ? body.category : "",
      tags: Array.isArray(body.tags) ? body.tags.map((t) => String(t)) : [],
      status: body.status === "published" ? "published" : "draft",
      // Validated, not passed through raw. PATCH has always gone through
      // parseSeoInput; POST did not, so a create request could persist a
      // `javascript:` og:image or a 500-keyword array that normalizeSeo's shallow
      // spread would happily store.
      seo: parseSeoInput(body.seo),
    });

    // The insights index, the new post page and the sitemap are ISR-cached —
    // drop the cached copies so a newly published post is live on the next
    // request. Paths must match where the pages actually render: the index at
    // /insights, each post at the site root.
    revalidatePath("/insights");
    revalidatePath(`/${post.slug}`);
    revalidatePath("/sitemap.xml");

    return created({ post });
  },
  { label: "Posts" }
);
