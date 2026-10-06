"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { GlobalSeo } from "@/lib/blog";
import {
  DEFAULT_SERVICES,
  DEFAULT_SITE_CORE,
  type ServiceItem,
} from "@/lib/site-defaults";

export type { ServiceItem };

export interface SiteContent {
  phone: string;
  email: string;
  address: string;
  responseGuarantee: string;
  services: ServiceItem[];
  textOverrides?: Record<string, string>;
  /**
   * Site-wide SEO settings as served by /api/content (the whole document is
   * returned, not just these fields). The footer reads `seo.socials`.
   */
  seo?: GlobalSeo;
}

const defaultContent: SiteContent = {
  ...DEFAULT_SITE_CORE,
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
          setContent((prev) => {
            // Merge field by field rather than spreading the payload, so a
            // server document still carrying the retired healthcare keys can
            // never leak `packages` / `healthcareEmail` into the tree.
            const incoming = data.content as Partial<SiteContent>;
            return {
              ...prev,
              phone: incoming.phone || prev.phone,
              email: incoming.email || prev.email,
              address: incoming.address || prev.address,
              responseGuarantee: incoming.responseGuarantee || prev.responseGuarantee,
              services: incoming.services?.length ? incoming.services : prev.services,
              textOverrides: incoming.textOverrides || prev.textOverrides,
              // /api/content already returns a fully merged SEO document, so it
              // replaces the default wholesale instead of being spread in.
              seo: incoming.seo || prev.seo,
            };
          });
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
