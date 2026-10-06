import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import SiteChrome from "@/components/SiteChrome";
import SmoothScroll from "@/components/animation/SmoothScroll";
import PageWipe from "@/components/transition/PageWipe";
import AgentationMount from "@/components/AgentationMount";
import { SiteContentProvider } from "@/context/SiteContentContext";
import { PreloaderProvider } from "@/context/PreloaderContext";
import { ConsultationProvider } from "@/context/ConsultationContext";
import { getGlobalSeoSafe } from "@/lib/db";
import { defaultGlobalSeo, socialImageUrl } from "@/lib/blog";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export async function generateMetadata(): Promise<Metadata> {
  // Site-wide defaults come from the admin panel (/admin/seo). Falls back to
  // the built-in constants when the database is unreachable.
  const seo = await getGlobalSeoSafe();
  const base = seo.canonicalBase || defaultGlobalSeo.canonicalBase;

  return {
    metadataBase: new URL(base),
    title: {
      default: seo.defaultTitle,
      // Next's type requires a template containing "%s" — guard against a
      // malformed value saved in the admin panel.
      template: seo.titleTemplate.includes("%s") ? seo.titleTemplate : `%s | ${seo.siteName}`,
    },
    description: seo.defaultDescription,
    keywords: seo.defaultKeywords,
    icons: {
      icon: [
        { url: "/favicon.png", type: "image/png" },
        { url: "/logo.png", type: "image/png" },
      ],
      apple: [{ url: "/logo.png", type: "image/png" }],
    },
    authors: [{ name: `${seo.siteName} Team` }],
    openGraph: {
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      url: base,
      siteName: seo.siteName,
      locale: "en_US",
      type: "website",
      images: [{ url: socialImageUrl(seo.ogImage, base), alt: seo.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      site: seo.twitterHandle || undefined,
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      images: [socialImageUrl(seo.ogImage, base)],
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className={`${plusJakartaSans.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-main text-ink font-sans antialiased flex flex-col" suppressHydrationWarning>
        <PreloaderProvider>
          <SiteContentProvider>
            <ConsultationProvider>
              {/* Everything fixed lives outside the smoother wrapper: a
                  transformed #smooth-content would break position: fixed. */}
              <ScrollToTop />
              <PageWipe />
              {/* Static film-grain plate: fixed, pointer-events:none, never
                  repainted on scroll. Sits above the content layer so the
                  whole site shares one photographic texture. */}
              <div className="cinema-grain" aria-hidden="true" />
              <SmoothScroll>{children}</SmoothScroll>
              <SiteChrome />
              {/* Dev-only annotation toolbar; renders nothing in production. */}
              <AgentationMount />
            </ConsultationProvider>
          </SiteContentProvider>
        </PreloaderProvider>
      </body>
    </html>
  );
}
