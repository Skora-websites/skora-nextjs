/**
 * Single source of truth for the site's default content catalog.
 *
 * `lib/db.ts` (server fallback) and `context/SiteContentContext.tsx`
 * (client fallback) both seed from these values, so any change here updates
 * both sides at once instead of drifting between copies.
 */

export interface PackageItem {
  id: string;
  name: string;
  price: string;
  period: string;
  popular: boolean;
  subtitle: string;
  features: string[];
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  pricing: string;
  status: "Active" | "Inactive";
}

/** Contact block shown in the footer, contact modal and admin content editor. */
export const DEFAULT_SITE_CORE = {
  phone: "+44 07756083473",
  email: "info@skorainfotech.com",
  healthcareEmail: "info@skorainfotech.com",
  address: "5 Market Square, High Street, Uxbridge, UB8 1LH, London",
  responseGuarantee: "Rapid 4-Hour Response Guarantee",
};

export const DEFAULT_PACKAGES: PackageItem[] = [
  {
    id: "pkg-1",
    name: "Basic Growth Plan",
    price: "₹5,000",
    period: "+ GST / month",
    popular: false,
    subtitle: "Essential local visibility for solo doctors & clinics",
    features: [
      "Custom 5-Page Doctor Website",
      "Google My Business (GMB) Setup",
      "8 Social Media Posts / month",
      "Basic Local SEO Setup",
      "Monthly Growth Report",
    ],
  },
  {
    id: "pkg-2",
    name: "Standard Growth Plan",
    price: "₹15,000",
    period: "+ GST / month",
    popular: true,
    subtitle: "Our most popular package for growing medical practices",
    features: [
      "Custom 10-Page Medical Website + Booking",
      "GMB Profile Optimization & Map Rank",
      "14 Posts + 2 Reels / month",
      "High-Intent Local SEO Keywords",
      "Report Dispatched Every 15 Days",
      "Priority Clinical Support",
    ],
  },
  {
    id: "pkg-3",
    name: "Premium Growth Plan",
    price: "₹32,000",
    period: "+ GST / month",
    popular: false,
    subtitle: "Complete digital dominance for multi-specialty centers",
    features: [
      "Facebook, Instagram, LinkedIn & GMB",
      "18 Posts + 4 Reels / month",
      "Dedicated Medical Content Team",
      "Weekly Analytical Dispatches",
      "Advanced Local SEO & Maps Ads",
      "24/7 Dedicated Account Manager",
    ],
  },
];

export const DEFAULT_SERVICES: ServiceItem[] = [
  { id: "srv-1", title: "Website Design & Web Apps", category: "Core Development", pricing: "25K - 1.5L", status: "Active" },
  { id: "srv-2", title: "Digital Marketing & SEO", category: "Growth & PPC", pricing: "25K - 50K/mo", status: "Active" },
  { id: "srv-3", title: "Branding & Visual Identity", category: "Design Studio", pricing: "25K - 50K", status: "Active" },
  { id: "srv-4", title: "Video Production & Reels", category: "Media Studio", pricing: "50K - 1.5L", status: "Active" },
  { id: "srv-5", title: "Custom SaaS Development", category: "Software Engineering", pricing: ">1.5L", status: "Active" },
  { id: "srv-6", title: "Cloud Services & AWS", category: "DevOps & Cloud", pricing: "Custom Enterprise", status: "Active" },
  { id: "srv-7", title: "CRM Solutions", category: "Business Automation", pricing: "50K - 1.5L", status: "Active" },
  { id: "srv-8", title: "Project Management Systems", category: "Enterprise Systems", pricing: ">1.5L", status: "Active" },
  { id: "srv-9", title: "Mobile App Development", category: "iOS & Android", pricing: ">1.5L", status: "Active" },
];
