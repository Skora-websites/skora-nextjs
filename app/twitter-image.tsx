import { ImageResponse } from "next/og";
import { SkoraOgCard } from "./opengraph-image";

/**
 * Twitter/X card, identical to the Open Graph one.
 *
 * Worth its own file: X does not reuse `og:image` when a `twitter:image` is
 * absent, it just renders the card with no image at all. Both routes render the
 * same component, so there is only one design to keep correct.
 */

export const alt = "SKORA — digital marketing and technology studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(<SkoraOgCard />, { ...size });
}