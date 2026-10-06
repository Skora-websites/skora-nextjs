/**
 * Single source of truth for the site's default content catalog.
 *
 * `lib/db.ts` (server fallback) and `context/SiteContentContext.tsx`
 * (client fallback) both seed from these values, so any change here updates
 * both sides at once instead of drifting between copies.
 */

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  pricing: string;
  status: "Active" | "Inactive";
}

/**
 * Contact block shown in the footer, contact page and admin editors.
 *
 * Skora is registered in India (Noida, Uttar Pradesh), so the default phone is
 * an Indian mobile and the postal address is the Noida office.
 */
export const DEFAULT_SITE_CORE = {
  phone: process.env.NEXT_PUBLIC_SITE_CONTACT_PHONE || "",
  email: process.env.NEXT_PUBLIC_SITE_CONTACT_EMAIL || "",
  address: process.env.NEXT_PUBLIC_SITE_CONTACT_ADDRESS || "",
  responseGuarantee: process.env.NEXT_PUBLIC_SITE_RESPONSE_GUARANTEE || "",
};

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
