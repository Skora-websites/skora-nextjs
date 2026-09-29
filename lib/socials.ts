/**
 * Social profiles shown in the footer.
 *
 * The URLs live in the database and are edited at /admin/seo (`seo.socials`).
 * This file is only the presentation layer: which networks the admin offers,
 * their icons, and how a stored entry becomes a footer link.
 */

import type { IconType } from "react-icons";
import {
  FaBehance,
  FaFacebookF,
  FaGlobe,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import type { SocialProfile } from "@/lib/blog";

export interface SocialPlatform {
  /** Value stored in `seo.socials[].platform`. */
  key: string;
  /** Display name used in the admin picker and (usually) as the link label. */
  label: string;
  icon: IconType;
}

/** Networks offered in the admin, listed in footer order. */
export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedinIn },
  { key: "instagram", label: "Instagram", icon: FaInstagram },
  { key: "facebook", label: "Facebook", icon: FaFacebookF },
  { key: "twitter", label: "X", icon: FaXTwitter },
  { key: "youtube", label: "YouTube", icon: FaYoutube },
  { key: "github", label: "GitHub", icon: FaGithub },
  { key: "tiktok", label: "TikTok", icon: FaTiktok },
  { key: "behance", label: "Behance", icon: FaBehance },
  { key: "other", label: "Other website", icon: FaGlobe },
];

export interface SocialLink {
  label: string;
  href: string;
  icon: IconType;
}

/**
 * Stored profiles → renderable links.
 *
 * Skips unknown platforms and empty URLs, and keeps only the first entry per
 * platform so the same icon can never appear twice in the row.
 */
export function resolveSocialLinks(profiles?: SocialProfile[]): SocialLink[] {
  if (!Array.isArray(profiles)) return [];

  const seen = new Set<string>();
  const links: SocialLink[] = [];

  for (const profile of profiles) {
    const platform = String(profile?.platform || "").toLowerCase();
    const href = String(profile?.url || "").trim();
    if (!platform || !href || seen.has(platform)) continue;

    const known = SOCIAL_PLATFORMS.find((p) => p.key === platform);
    if (!known) continue;
    seen.add(platform);

    const custom = String(profile.label || "").trim();
    links.push({
      label: custom || (platform === "other" ? "Website" : known.label),
      href,
      icon: known.icon,
    });
  }

  return links;
}
