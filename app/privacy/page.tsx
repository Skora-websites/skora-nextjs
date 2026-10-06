import React from "react";
import type { Metadata } from "next";
import PrivacyView from "@/components/landing/PrivacyView";
import { PAGE_SEO, buildPageMetadata } from "@/lib/page-seo";
import { getPageSeoContext } from "@/lib/db";

/**
 * Server page: the policy markup lives in `components/landing/PrivacyView`
 * (it needs the consultation modal), while the route stays server-side so it
 * can export metadata.
 *
 * SEO settings come from the database, so regenerate on a five-minute window as
 * well as on demand when /admin/seo saves.
 */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  // Owned by lib/page-seo.ts: this route's code default, overlaid with
  // whatever an admin saved at /admin/seo/pages. Clearing a field there
  // falls back to the code default.
  return buildPageMetadata(PAGE_SEO.privacy, await getPageSeoContext());
}

export default function PrivacyPage() {
  return <PrivacyView />;
}
