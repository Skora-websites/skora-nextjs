/**
 * Single source of truth for the nine service pages.
 *
 * Consumed by: the navbar mega-menu, the /services hub, the /services/[slug]
 * route, ServicePageTemplate (breadcrumbs + related services), the footer link
 * columns and the contact form's service picker. Add a service here and it
 * appears everywhere — no route, nav or footer edit required.
 *
 * NOTE: intentionally contains no database access (see AI_RULES.md) and no
 * JSX, so server and client components can both import it cheaply.
 */

import {
  Cloud,
  Code,
  KanbanSquare,
  Layout,
  Megaphone,
  PenTool,
  Smartphone,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

export interface ServiceCapability {
  title: string;
  description: string;
  metric: string;
}

/** Everything a single service page needs to render itself. */
export interface ServicePageData {
  /** URL segment: /services/{slug} */
  slug: string;
  /** Canonical service name — reused by the footer, contact select and modal. */
  pill: string;
  /** Marketing name used by the nav mega-menu and hub cards. */
  navName: string;
  /** One-line teaser for the nav mega-menu and hub cards. */
  navDesc: string;
  /** Lucide icon. Resolved on the client by slug (icons are not serialisable). */
  icon: LucideIcon;
  title: string;
  lead: string;
  primaryCta: string;
  heroImage: string;
  heroImageAlt: string;
  capabilitiesTitle: string;
  capabilitiesIntro?: string;
  capabilities: ServiceCapability[];
  stack: string[];
  stackTitle?: string;
  deliverablesTitle: string;
  deliverables: string[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButton: string;
  /** Pre-selects an option in the consultation modal. */
  modalServiceName: string;
  /** <title> text for /services/{slug} — the site name is appended by the template. */
  metaTitle: string;
  /** Meta description for /services/{slug}. */
  metaDescription: string;
}

export const SERVICES: ServicePageData[] = [
  {
    slug: "website-design",
    pill: "Website design and development",
    navName: "Website Design & Engineering",
    navDesc: "Bespoke Next.js, sub-second page speed & high-conversion UI.",
    icon: Layout,
    title: "Websites that load fast and turn visits into enquiries",
    lead: "We design and build Next.js websites with clear structure, on-page SEO, and content your team can update without developer help.",
    primaryCta: "Start a website project",
    heroImage:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    heroImageAlt: "Website design project on a laptop",
    capabilitiesTitle: "What is included in a website project",
    capabilitiesIntro:
      "Design, development, and launch handled as one scope with staging links you can review.",
    capabilities: [
      {
        title: "Design based on your content",
        description:
          "Wireframes and final layouts built around your services, pricing, and contact flow — not filler sections.",
        metric: "2 design rounds",
      },
      {
        title: "Next.js development",
        description:
          "React and TypeScript codebase with reusable components, forms, and schema markup for search.",
        metric: "95+ Lighthouse target",
      },
      {
        title: "Speed and SEO setup",
        description:
          "Image optimization, caching, sitemap, metadata, and analytics so you can measure enquiries.",
        metric: "Core Web Vitals",
      },
      {
        title: "Launch and handover",
        description:
          "Domain, SSL, deployment, and a walkthrough video so your team can publish updates.",
        metric: "Training included",
      },
    ],
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS v4",
      "Framer Motion",
      "GSAP",
      "Vercel",
      "GA4",
    ],
    deliverablesTitle: "Deliverables",
    deliverables: [
      "Sitemap and wireframes approved before design",
      "Responsive website with CMS-ready content areas",
      "Contact forms with email and WhatsApp notifications",
      "On-page SEO: titles, descriptions, and schema",
      "Speed optimization and launch checklist",
      "Handover video and 30 days of launch support",
    ],
    ctaTitle: "Need a new website or a rebuild?",
    ctaDescription:
      "Share your current site and goals. We reply with scope, timeline, and fixed pricing.",
    ctaButton: "Request website estimate",
    modalServiceName: "Website design and development",
    metaTitle: "Website Design & Development Services",
    metaDescription:
      "Bespoke Next.js websites with clear structure, on-page SEO and fast load times — designed to turn visitors into enquiries, with fixed scope and pricing.",
  },
  {
    slug: "digital-marketing",
    pill: "Digital marketing and SEO",
    navName: "Digital Marketing & Local SEO",
    navDesc: "Local SEO, Meta and Google ads, and content that brings enquiries.",
    icon: Megaphone,
    title: "Marketing focused on enquiries, calls, and sales",
    lead: "Local SEO, Google and Meta ads, and content reporting tied to leads — not vanity metrics. You see spend, leads, and cost per lead.",
    primaryCta: "Plan a marketing engagement",
    heroImage:
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?auto=format&fit=crop&w=1200&q=80",
    heroImageAlt: "Marketing reports and planning",
    capabilitiesTitle: "How we run marketing",
    capabilitiesIntro: "Monthly plan, execution, and a report you can read in five minutes.",
    capabilities: [
      {
        title: "Local SEO and Google profile",
        description:
          "Profile setup, categories, reviews process, and location pages for searches near you.",
        metric: "Monthly local report",
      },
      {
        title: "Google and Meta ads",
        description:
          "Campaign structure, negatives, and landing pages with conversion tracking from day one.",
        metric: "ROAS tracking",
      },
      {
        title: "Content and social",
        description:
          "Practical posts and short videos explaining your services, published on a shared calendar.",
        metric: "Shared calendar",
      },
      {
        title: "Lead tracking",
        description:
          "GA4, pixels, and call/WhatsApp tracking so every enquiry is attributed to a channel.",
        metric: "Full attribution",
      },
    ],
    stack: [
      "Google Ads",
      "Meta Ads",
      "Google Business Profile",
      "GA4",
      "Search Console",
      "Tag Manager",
      "WhatsApp API",
      "Looker Studio",
    ],
    deliverablesTitle: "Deliverables",
    deliverables: [
      "Account audit and measurement setup",
      "Keyword and audience plan",
      "Ad campaigns with budgets and negatives",
      "Content calendar with designs and captions",
      "Monthly report: spend, leads, cost per lead",
      "Lead alerts on email and WhatsApp",
    ],
    ctaTitle: "Want steadier enquiries?",
    ctaDescription:
      "Tell us your services and monthly budget. We suggest channels and expected lead volume.",
    ctaButton: "Request marketing plan",
    modalServiceName: "Digital marketing and SEO",
    metaTitle: "Digital Marketing & Local SEO Services",
    metaDescription:
      "Local SEO, Google and Meta ads, and content reporting tied to real leads — so you see spend, leads and cost per lead every month, not vanity metrics.",
  },
  {
    slug: "branding",
    pill: "Branding and identity",
    navName: "Branding & Visual Identity",
    navDesc: "Logo design, positioning & corporate visual style guides.",
    icon: PenTool,
    title: "A clear visual identity for your business",
    lead: "Logo, colors, typography, and usage rules documented in a brand guide your designers and vendors can follow.",
    primaryCta: "Start a branding project",
    heroImage:
      "https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1200&q=80",
    heroImageAlt: "Brand identity materials",
    capabilitiesTitle: "Branding scope",
    capabilities: [
      {
        title: "Logo and variations",
        description:
          "Primary logo, monochrome version, and favicon with spacing and minimum-size rules.",
        metric: "3 concepts",
      },
      {
        title: "Color and typography",
        description:
          "Palette with usage ratios and a type system for headings, body, and captions.",
        metric: "Usage guide",
      },
      {
        title: "Templates",
        description:
          "Letterhead, invoice header, social templates, and presentation cover you can edit.",
        metric: "Ready files",
      },
      {
        title: "Brand guide",
        description:
          "One PDF with do and do-not rules, file formats, and handover of source files.",
        metric: "1 PDF + sources",
      },
    ],
    stack: [
      "Figma",
      "Illustrator",
      "Photoshop",
      "Canva templates",
      "Google Fonts",
      "SVG",
      "PDF guide",
      "Notion handover",
    ],
    deliverablesTitle: "Deliverables",
    deliverables: [
      "Logo concepts with two revision rounds",
      "Final logo pack in SVG, PNG, and PDF",
      "Color palette and typography sheet",
      "Social and document templates",
      "Brand usage guide",
      "Full source file handover",
    ],
    ctaTitle: "Need a consistent brand?",
    ctaDescription:
      "Share your business name and references you like. We propose direction before final design.",
    ctaButton: "Request branding estimate",
    modalServiceName: "Branding and visual identity",
    metaTitle: "Branding & Visual Identity Design",
    metaDescription:
      "Logo, colours, typography and usage rules documented in a brand guide your designers and vendors can follow — with source files handed over.",
  },
  {
    slug: "video-production",
    pill: "Video production",
    navName: "Video Production & Reels",
    navDesc: "Commercial product videos, Instagram reels & executive intros.",
    icon: Video,
    title: "Videos that explain your work clearly",
    lead: "Short product explainers, testimonials, and social videos with scripting, shooting guidance, and editing handled end to end.",
    primaryCta: "Plan a video project",
    heroImage:
      "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80",
    heroImageAlt: "Video production setup",
    capabilitiesTitle: "Video services",
    capabilities: [
      {
        title: "Explainer and product videos",
        description:
          "Script, storyboard, and edit for 60 to 120 second videos that show process and pricing.",
        metric: "Script included",
      },
      {
        title: "Testimonials",
        description:
          "Interview questions, remote or on-site direction, subtitles, and short cut-downs.",
        metric: "Subtitles included",
      },
      {
        title: "Short-form social videos",
        description:
          "Vertical videos for Instagram and YouTube Shorts with hooks, captions, and covers.",
        metric: "Monthly packs",
      },
      {
        title: "Editing and delivery",
        description: "Color correction, sound leveling, and exports sized for each platform.",
        metric: "Platform exports",
      },
    ],
    stack: [
      "Premiere Pro",
      "After Effects",
      "DaVinci Resolve",
      "Audition",
      "YouTube",
      "Instagram Reels",
      "SRT captions",
      "Drive delivery",
    ],
    deliverablesTitle: "Deliverables",
    deliverables: [
      "Script and shot list approved before filming",
      "Edited master video plus platform cut-downs",
      "Subtitles and thumbnail images",
      "Raw footage archive link",
      "Publishing checklist",
      "Two revision rounds per video",
    ],
    ctaTitle: "Have a video in mind?",
    ctaDescription:
      "Describe the topic and where it will be used. We send script outline and pricing.",
    ctaButton: "Request video estimate",
    modalServiceName: "Video production",
    metaTitle: "Video Production & Reels for Brands",
    metaDescription:
      "Explainer videos, testimonials and short social videos with scripting, shooting guidance and editing handled end to end — delivered platform-ready.",
  },
  {
    slug: "mobile-development",
    pill: "Mobile app development",
    navName: "Mobile App Development",
    navDesc: "Native iOS & Android applications built for scale.",
    icon: Smartphone,
    title: "iOS and Android apps your team can maintain",
    lead: "Cross-platform apps with login, data sync, and push notifications, tested on real devices and published to both stores.",
    primaryCta: "Discuss an app idea",
    heroImage:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80",
    heroImageAlt: "Mobile app on a phone",
    capabilitiesTitle: "App development scope",
    capabilities: [
      {
        title: "Product scope and screens",
        description: "User flows, screen list, and API needs agreed before coding starts.",
        metric: "Fixed scope doc",
      },
      {
        title: "Cross-platform build",
        description:
          "One codebase for iOS and Android with native performance for common flows.",
        metric: "React Native",
      },
      {
        title: "Backend and sync",
        description: "Authentication, database, file uploads, and offline handling where needed.",
        metric: "API + database",
      },
      {
        title: "Testing and release",
        description:
          "Test builds every sprint, store listings, and rollout plan with rollback steps.",
        metric: "Store release",
      },
    ],
    stack: [
      "React Native",
      "TypeScript",
      "Node.js",
      "MongoDB",
      "Firebase",
      "Push notifications",
      "TestFlight",
      "Play Console",
    ],
    deliverablesTitle: "Deliverables",
    deliverables: [
      "Screen flows and API contract",
      "iOS and Android test builds each sprint",
      "Admin panel for content and users",
      "Store listings with screenshots",
      "Crash reporting and analytics setup",
      "90 days of post-launch bug fixes",
    ],
    ctaTitle: "Have an app idea?",
    ctaDescription:
      "Share the main screens and users. We reply with build phases and cost.",
    ctaButton: "Request app estimate",
    modalServiceName: "Mobile app development",
    metaTitle: "iOS & Android App Development",
    metaDescription:
      "Cross-platform iOS and Android apps with login, data sync and push notifications — tested on real devices and published to both stores.",
  },
  {
    slug: "cloud-services",
    pill: "Cloud and DevOps",
    navName: "Cloud Services & DevOps",
    navDesc: "AWS/Azure migrations, 99.99% uptime & CI/CD pipelines.",
    icon: Cloud,
    title: "Reliable cloud setup with monitoring and backups",
    lead: "AWS and Azure configuration, deployments, and documentation with alerts, backups, and cost notes your team can follow.",
    primaryCta: "Review my infrastructure",
    heroImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    heroImageAlt: "Cloud infrastructure diagram",
    capabilitiesTitle: "Cloud and DevOps scope",
    capabilities: [
      {
        title: "Setup and migration",
        description:
          "Accounts, networks, databases, and cutover plan with downtime window agreed in advance.",
        metric: "Cutover plan",
      },
      {
        title: "CI/CD pipelines",
        description: "Preview, staging, and production deploys with checks before release.",
        metric: "3 environments",
      },
      {
        title: "Monitoring and alerts",
        description: "Uptime checks, error alerts, and log retention with on-call routing.",
        metric: "Alert runbook",
      },
      {
        title: "Backups and costs",
        description:
          "Scheduled backups with restore test, plus monthly cost review and cleanup.",
        metric: "Restore tested",
      },
    ],
    stack: ["AWS", "Azure", "Docker", "GitHub Actions", "Nginx", "MongoDB", "Redis", "Grafana"],
    deliverablesTitle: "Deliverables",
    deliverables: [
      "Architecture diagram and access list",
      "Staging and production environments",
      "Deployment pipeline with checks",
      "Monitoring dashboard and alert rules",
      "Backup schedule with restore test",
      "Handover document and cost notes",
    ],
    ctaTitle: "Is your setup hard to maintain?",
    ctaDescription:
      "Share your current stack. We audit it and suggest fixes in priority order.",
    ctaButton: "Request infrastructure audit",
    modalServiceName: "Cloud and DevOps",
    metaTitle: "Cloud Services & DevOps Consulting",
    metaDescription:
      "AWS and Azure configuration, deployments and documentation with monitoring, tested backups and cost notes your team can follow.",
  },
  {
    slug: "saas-development",
    pill: "SaaS development",
    navName: "SaaS Platform Development",
    navDesc: "Multi-tenant cloud SaaS & automated recurring billing.",
    icon: Code,
    title: "Multi-user software with billing and roles",
    lead: "Tenants, subscriptions, and team permissions built as one system with admin controls and data exports from the start.",
    primaryCta: "Scope a SaaS build",
    heroImage:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    heroImageAlt: "SaaS analytics dashboard",
    capabilitiesTitle: "SaaS build scope",
    capabilities: [
      {
        title: "Tenants and roles",
        description:
          "Organizations, invites, and role-based access with audit logs for sensitive actions.",
        metric: "RBAC + audit",
      },
      {
        title: "Billing and plans",
        description:
          "Subscription plans, invoices, trials, and dunning emails connected to your gateway.",
        metric: "Stripe/Razorpay",
      },
      {
        title: "Core workflows",
        description:
          "Your main entities, lists, filters, and approvals designed around daily use.",
        metric: "Weekly demos",
      },
      {
        title: "Admin and data",
        description:
          "Support tooling, feature flags, exports, and usage metrics for your team.",
        metric: "Admin panel",
      },
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "Node.js",
      "MongoDB",
      "Stripe",
      "Razorpay",
      "Redis",
      "Docker",
    ],
    deliverablesTitle: "Deliverables",
    deliverables: [
      "Product scope with user stories",
      "Working staging build every sprint",
      "Billing with invoices and trials",
      "Roles, invites, and audit logs",
      "Admin panel and data exports",
      "Launch checklist and documentation",
    ],
    ctaTitle: "Building a SaaS product?",
    ctaDescription:
      "Share your users and pricing model. We map build phases and what can wait.",
    ctaButton: "Request SaaS estimate",
    modalServiceName: "SaaS development",
    metaTitle: "Custom SaaS Product Development",
    metaDescription:
      "Multi-tenant SaaS platforms with subscriptions, roles and admin controls built as one system — with billing, exports and launch docs from the start.",
  },
  {
    slug: "crm",
    pill: "CRM development",
    navName: "Custom CRM & Automations",
    navDesc: "Lead pipeline sync & automated WhatsApp triggers.",
    icon: Users,
    title: "A CRM that matches how your team sells",
    lead: "Leads, follow-ups, and WhatsApp updates organized around your pipeline, with imports from spreadsheets and old tools.",
    primaryCta: "Map my sales process",
    heroImage:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    heroImageAlt: "Sales team reviewing pipeline",
    capabilitiesTitle: "CRM scope",
    capabilities: [
      {
        title: "Pipeline and stages",
        description:
          "Custom stages, lost reasons, and assignment rules based on your current process.",
        metric: "Process mapped",
      },
      {
        title: "Follow-ups and reminders",
        description:
          "Tasks, overdue alerts, and daily lists so no lead waits more than a day.",
        metric: "Daily lists",
      },
      {
        title: "WhatsApp and email updates",
        description:
          "Templates and triggers for new leads, follow-ups, and payment reminders.",
        metric: "Templates included",
      },
      {
        title: "Reports",
        description:
          "Source-wise leads, stage conversion, and team activity in one weekly view.",
        metric: "Weekly report",
      },
    ],
    stack: [
      "Next.js",
      "Node.js",
      "MongoDB",
      "WhatsApp API",
      "Email SMTP",
      "CSV import",
      "Role access",
      "Exports",
    ],
    deliverablesTitle: "Deliverables",
    deliverables: [
      "Pipeline mapped to your stages",
      "Lead import from sheets or old CRM",
      "Follow-up tasks and reminders",
      "WhatsApp and email templates",
      "Team activity and conversion reports",
      "Training session and user guide",
    ],
    ctaTitle: "Losing track of follow-ups?",
    ctaDescription:
      "Describe your lead sources and team size. We suggest pipeline and automation.",
    ctaButton: "Request CRM estimate",
    modalServiceName: "CRM development",
    metaTitle: "Custom CRM Development & Automation",
    metaDescription:
      "A CRM built around how your team sells — leads, follow-ups and WhatsApp updates, with imports from spreadsheets and old tools.",
  },
  {
    slug: "pms",
    pill: "Project management systems",
    navName: "Project Management Systems",
    navDesc: "Agile task workflows, Gantt charts & client approval portals.",
    icon: KanbanSquare,
    title: "Track work, deadlines, and approvals in one place",
    lead: "Tasks, milestones, timesheets, and client approvals configured for your delivery process, with roles for managers and clients.",
    primaryCta: "Improve project tracking",
    heroImage:
      "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1200&q=80",
    heroImageAlt: "Project planning board",
    capabilitiesTitle: "PMS scope",
    capabilities: [
      {
        title: "Projects and tasks",
        description:
          "Templates, priorities, dependencies, and file attachments your team will actually use.",
        metric: "Templates included",
      },
      {
        title: "Timelines",
        description: "Milestones and Gantt-style views with baseline dates and delay highlights.",
        metric: "Milestone view",
      },
      {
        title: "Timesheets and workload",
        description:
          "Simple time entries tied to tasks with weekly capacity views for managers.",
        metric: "Weekly capacity",
      },
      {
        title: "Client approvals",
        description:
          "Share links for deliverables with approve-or-request-changes flow and history.",
        metric: "Approval log",
      },
    ],
    stack: [
      "Next.js",
      "Node.js",
      "MongoDB",
      "Gantt charts",
      "File storage",
      "Email alerts",
      "Role access",
      "Exports",
    ],
    deliverablesTitle: "Deliverables",
    deliverables: [
      "Project and task templates",
      "Milestone timeline with dependencies",
      "Timesheet and workload views",
      "Client approval portal",
      "Notification rules for deadlines",
      "Training and admin guide",
    ],
    ctaTitle: "Projects slipping on dates?",
    ctaDescription: "Tell us how you track work today. We configure a system around it.",
    ctaButton: "Request PMS estimate",
    modalServiceName: "Project management systems",
    metaTitle: "Project Management System Development",
    metaDescription:
      "Tasks, milestones, timesheets and client approvals configured for your delivery process — with roles for managers and clients.",
  },
];

/** Slugs used by `generateStaticParams` and the sitemap. */
export const serviceSlugs: string[] = SERVICES.map((s) => s.slug);

export function getServiceBySlug(slug: string): ServicePageData | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

/**
 * Three related services for cross-linking — the neighbours in the list,
 * wrapped around so the current service is never repeated.
 */
export function getRelatedServices(slug: string, count = 3): ServicePageData[] {
  const index = SERVICES.findIndex((s) => s.slug === slug);
  if (index === -1) return SERVICES.slice(0, count);
  const related: ServicePageData[] = [];
  for (let offset = 1; related.length < count && offset < SERVICES.length; offset += 1) {
    related.push(SERVICES[(index + offset) % SERVICES.length]);
  }
  return related;
}

/** Short affordance shown on hub cards linking to a service detail page. */
export const HUB_CTA_LABEL = "View service";
