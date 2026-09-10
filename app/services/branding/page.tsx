"use client";

import { PenTool } from "lucide-react";
import ServicePageTemplate from "@/components/landing/ServicePageTemplate";

export default function BrandingPage() {
  return (
    <ServicePageTemplate
      pillIcon={PenTool}
      pill="Branding and identity"
      title={<>A clear visual identity for your business</>}
      lead="Logo, colors, typography, and usage rules documented in a brand guide your designers and vendors can follow."
      primaryCta="Start a branding project"
      heroImage="https://images.unsplash.com/photo-1600508774634-4e11d34730e2?auto=format&fit=crop&w=1200&q=80"
      heroImageAlt="Brand identity materials"
      capabilitiesTitle="Branding scope"
      capabilities={[
        {
          title: "Logo and variations",
          description: "Primary logo, monochrome version, and favicon with spacing and minimum-size rules.",
          metric: "3 concepts",
        },
        {
          title: "Color and typography",
          description: "Palette with usage ratios and a type system for headings, body, and captions.",
          metric: "Usage guide",
        },
        {
          title: "Templates",
          description: "Letterhead, invoice header, social templates, and presentation cover you can edit.",
          metric: "Ready files",
        },
        {
          title: "Brand guide",
          description: "One PDF with do and do-not rules, file formats, and handover of source files.",
          metric: "1 PDF + sources",
        },
      ]}
      stack={["Figma", "Illustrator", "Photoshop", "Canva templates", "Google Fonts", "SVG", "PDF guide", "Notion handover"]}
      deliverablesTitle="Deliverables"
      deliverables={[
        "Logo concepts with two revision rounds",
        "Final logo pack in SVG, PNG, and PDF",
        "Color palette and typography sheet",
        "Social and document templates",
        "Brand usage guide",
        "Full source file handover",
      ]}
      ctaTitle="Need a consistent brand?"
      ctaDescription="Share your business name and references you like. We propose direction before final design."
      ctaButton="Request branding estimate"
      modalServiceName="Branding and visual identity"
    />
  );
}
