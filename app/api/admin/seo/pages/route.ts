import { revalidatePath } from "next/cache";
import { badRequest, ok, unauthorized, withErrorHandler } from "@/lib/api-handler";
import { readJson } from "@/lib/api-utils";
import { isSubmittedAdminAuthenticated } from "@/lib/auth";
import { getSiteContent, updateSiteContent } from "@/lib/db";
import {
  getPageSeoEntry,
  normalizePageSeoKey,
  normalizePageSeoMap,
  parsePageSeoInput,
  PAGE_SEO_REGISTRY,
} from "@/lib/page-seo";

/**
 * /api/admin/seo/pages — per-page SEO overrides for the static marketing routes,
 * edited at /admin/seo/pages.
 *
 *  GET — the registry (path/label/group), every stored override, and the global
 *         settings the admin preview needs. Admin session required: unlike
 *         /api/admin/seo's GET this exposes editing state, not public metadata.
 *  PUT — save or reset one page's record. Admin session required.
 */
export const GET = withErrorHandler(
  async () => {
    if (!(await isSubmittedAdminAuthenticated())) {
      return unauthorized("Admin session required");
    }

    const content = await getSiteContent();
    return ok({
      global: content.seo,
      overrides: normalizePageSeoMap(content.pageSeo),
      registry: PAGE_SEO_REGISTRY.map((entry) => ({
        path: entry.path,
        label: entry.label,
        group: entry.group,
      })),
    });
  },
  { label: "Page SEO" }
);

/** The request body: one path plus either a record or an explicit reset. */
interface PageSeoRequest {
  path?: unknown;
  seo?: unknown;
  reset?: unknown;
}

export const PUT = withErrorHandler(
  async (request) => {
    if (!(await isSubmittedAdminAuthenticated())) {
      return unauthorized("Admin session required");
    }

    const body = await readJson<PageSeoRequest>(request, {});

    const path = normalizePageSeoKey(typeof body.path === "string" ? body.path : "");
    const entry = getPageSeoEntry(path);
    if (!entry) {
      // Rejecting an unknown path is the point: storing an override for a route
      // that is not in the registry would be a record nothing ever reads.
      return badRequest(
        `"${path}" is not an editable page. Editable pages: ${PAGE_SEO_REGISTRY.map((e) => e.path).join(", ")}`
      );
    }

    // Reset deletes the record, which is what "fall back to the code default"
    // means. Deliberately not expressible as an empty object — see
    // `hasPageSeoOverride`, which treats those as equivalent anyway.
    const isReset = body.reset === true;
    const parsed = isReset ? null : parsePageSeoInput(body.seo);
    if (!isReset && !parsed) {
      return badRequest("The SEO payload must be an object.");
    }

    // `ogImage` and `canonicalUrl` are sanitised inside parsePageSeoInput, but
    // surface the failure here rather than storing a silently-emptied value: a
    // `javascript:` URL should read as an error, not as "cleared".
    const rawSeo = body.seo && typeof body.seo === "object" ? (body.seo as Record<string, unknown>) : null;
    if (rawSeo && typeof rawSeo.ogImage === "string" && rawSeo.ogImage.trim() && !parsed?.ogImage) {
      return badRequest("The social image must be a valid http(s) URL.");
    }
    if (rawSeo && typeof rawSeo.canonicalUrl === "string" && rawSeo.canonicalUrl.trim() && !parsed?.canonicalUrl) {
      return badRequest("The canonical URL must be a valid http(s) or root-relative path.");
    }

    const content = await updateSiteContent({ pageSeo: { [path]: parsed } });

    // Same three calls as /api/admin/seo. The root-layout call covers every page
    // beneath `app/` — including all eight of these — so no per-path loop is
    // needed; robots.txt and sitemap.xml are route handlers at the root segment
    // and sit outside that, which is why they are listed separately. The
    // sitemap matters here because a noindex change moves a URL in or out of it.
    revalidatePath("/robots.txt");
    revalidatePath("/sitemap.xml");
    revalidatePath("/", "layout");

    return ok({ path, overrides: normalizePageSeoMap(content.pageSeo), reset: isReset });
  },
  { label: "Page SEO" }
);