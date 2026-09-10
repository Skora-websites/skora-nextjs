import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import { SiteContentProvider } from "@/context/SiteContentContext";

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

export const metadata: Metadata = {
  title: "SKORA — Next-Gen Digital Marketing & Tech Solutions Enterprise",
  description: "Enterprise Digital Marketing, Website Design, Mobile Apps, Cloud Services, SaaS Platforms, Project Management Systems & CRM Solutions.",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  keywords: [
    "Digital Marketing",
    "SEO",
    "Website Design",
    "Mobile Development",
    "Cloud Services",
    "SaaS Development",
    "Project Management System",
    "PMS",
    "CRM Solutions",
  ],
  authors: [{ name: "SKORA Team" }],
  openGraph: {
    title: "SKORA — Digital Marketing & Tech Solutions",
    description: "Rank higher, scale infrastructure, build custom SaaS, Mobile & CRM applications.",
    url: "https://skora.digital",
    siteName: "SKORA",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <html lang="en" className={`${plusJakartaSans.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-main text-ink font-sans antialiased flex flex-col" suppressHydrationWarning>
        <SiteContentProvider>
          <ScrollToTop />
          {children}
        </SiteContentProvider>
      </body>
    </html>
  );
}
