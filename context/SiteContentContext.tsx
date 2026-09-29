"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { GlobalSeo } from "@/lib/blog";
import {
  DEFAULT_PACKAGES,
  DEFAULT_SERVICES,
  DEFAULT_SITE_CORE,
  type PackageItem,
  type ServiceItem,
} from "@/lib/site-defaults";

export type { PackageItem, ServiceItem };

export interface SiteContent {
  phone: string;
  email: string;
  healthcareEmail: string;
  address: string;
  responseGuarantee: string;
  packages: PackageItem[];
  services: ServiceItem[];
  /**
   * Site-wide SEO settings as served by /api/content (the whole document is
   * returned, not just these fields). The footer reads `seo.socials`.
   */
  seo?: GlobalSeo;
}

const defaultContent: SiteContent = {
  ...DEFAULT_SITE_CORE,
  packages: DEFAULT_PACKAGES,
  services: DEFAULT_SERVICES,
};

const SiteContentContext = createContext<SiteContent>(defaultContent);

export function SiteContentProvider({ children }: { children: React.ReactNode }) {
  const [content, setContent] = useState<SiteContent>(defaultContent);

  useEffect(() => {
    fetch("/api/content", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setContent((prev) => ({
            ...prev,
            ...data.content,
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  return useContext(SiteContentContext);
}
