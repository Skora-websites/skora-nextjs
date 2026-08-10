import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "SKORA.digital — Next-Gen Digital Marketing & Tech Solutions Enterprise",
  description: "Enterprise Digital Marketing, Website Design, Mobile Apps, Cloud Services, SaaS Platforms, Project Management Systems & CRM Solutions powered by AI strategy.",
  keywords: [
    "Digital Marketing",
    "SEO",
    "AI SEO",
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
    <html lang="en" className={`${plusJakartaSans.variable} dark scroll-smooth`}>
      <body className="min-h-screen bg-[#05070E] text-[#F8FAFC] font-sans antialiased selection:bg-blue-600 selection:text-white flex flex-col">
        {children}
      </body>
    </html>
  );
}
