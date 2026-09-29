import { revalidatePath } from "next/cache";
import { badRequest, ok, unauthorized, withErrorHandler } from "@/lib/api-handler";
import { readJson } from "@/lib/api-utils";
import { isSubmittedAdminAuthenticated } from "@/lib/auth";
import { getSiteContent, updateSiteContent } from "@/lib/db";
import { parseGlobalSeoInput, sanitizeAbsoluteUrl, sanitizeSeoUrl } from "@/lib/blog";

/**
 * /api/admin/seo — site-wide SEO settings shown at /admin/seo.
 *
 *  GET — public read (the values are rendered into every page's metadata).
 *  PUT — update (admin session required).
 */
export const GET = withErrorHandler(
  async () => {
    const content = await getSiteContent();
    return ok({ seo: content.seo });
  },
  { label: "SEO" }
);

export const PUT = withErrorHandler(
  async (request) => {
    if (!(await isSubmittedAdminAuthenticated())) {
      return unauthorized("Admin session required");
    }

    const body = await readJson<{ seo?: unknown }>(request, {});
    const patch = parseGlobalSeoInput(body.seo);

    if (patch.ogImage) {
      const safe = sanitizeSeoUrl(patch.ogImage);
      if (!safe) return badRequest("The default social image must be a valid http(s) URL.");
      patch.ogImage = safe;
    }
    if (patch.canonicalBase && !/^https?:\/\//i.test(patch.canonicalBase)) {
      return badRequest("The site URL must start with https:// or http://.");
    }

    // Social links are validated before parseGlobalSeoInput drops invalid ones,
    // so the admin sees *which* field is wrong instead of it vanishing on save.
    const rawSeo = body.seo && typeof body.seo === "object"
      ? (body.seo as Record<string, unknown>)
      : null;
    if (rawSeo && Array.isArray(rawSeo.socials)) {
      for (const entry of rawSeo.socials as unknown[]) {
        const url = entry && typeof entry === "object" ? (entry as Record<string, unknown>).url : null;
        if (typeof url === "string" && url.trim() && !sanitizeAbsoluteUrl(url)) {
          return badRequest("Social profile links must be valid http(s) URLs.");
        }
      }
    }

    const content = await updateSiteContent({ seo: patch });

    // robots.txt / sitemap.xml are ISR-cached for 5 minutes, and most pages
    // are prerendered with the root layout's metadata — invalidate the whole
    // tree so a settings change is live on the next visit, not after a rebuild.
    revalidatePath("/robots.txt");
    revalidatePath("/sitemap.xml");
    revalidatePath("/", "layout");

    return ok({ seo: content.seo });
  },
  { label: "SEO" }
);
