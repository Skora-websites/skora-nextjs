import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import ScrollToTop from "@/components/ScrollToTop";
import { AdminEditProvider } from "@/context/AdminEditContext";
import AdminEditBar from "@/components/AdminEditBar";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SKORA.digital — Next-Gen Digital Marketing & Tech Solutions Enterprise",
  description: "Enterprise Digital Marketing, Website Design, Mobile Apps, Cloud Services, SaaS Platforms, Project Management Systems & CRM Solutions.",
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
  authors: [{ name: "SKORA Digital Team" }],
  openGraph: {
    title: "SKORA.digital — Digital Marketing & Tech Solutions",
    description: "Rank higher, scale infrastructure, build custom SaaS, Mobile & CRM applications.",
    url: "https://skora.digital",
    siteName: "SKORA Digital",
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
    <html lang="en" className={`${plusJakartaSans.variable}`}>
      <body className="min-h-screen bg-[#F4F6F1] text-[#0B1310] font-sans antialiased selection:bg-[#2563EB] selection:text-white flex flex-col">
        <AdminEditProvider>
          <ScrollToTop />
          <AdminEditBar />
          {children}
        </AdminEditProvider>
      </body>
    </html>
  );
}
