"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import { useConsultation } from "@/context/ConsultationContext";

/**
 * The site's fixed chrome — navbar and scroll progress bar — hoisted out of
 * the page tree into the root layout.
 *
 * Two reasons:
 * 1. ScrollSmoother transforms `#smooth-content`, which would break
 *    `position: fixed` for anything rendered inside a page.
 * 2. One instance survives navigation, so the header never re-mounts and its
 *    scroll state, mega-menu and mobile drawer stay continuous between routes.
 *
 * /admin renders its own chrome, so this stays out of the way there.
 */
export default function SiteChrome() {
  const pathname = usePathname();
  const { openConsultation } = useConsultation();

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <ScrollProgressBar />
      <Navbar onOpenConsultation={openConsultation} />
    </>
  );
}
