"use client";

import { Video } from "lucide-react";
import ServicePageTemplate from "@/components/landing/ServicePageTemplate";

export default function VideoProductionPage() {
  return (
    <ServicePageTemplate
      pillIcon={Video}
      pill="Video production"
      title={<>Videos that explain your work clearly</>}
      lead="Short product explainers, testimonials, and social videos with scripting, shooting guidance, and editing handled end to end."
      primaryCta="Plan a video project"
      heroImage="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=80"
      heroImageAlt="Video production setup"
      capabilitiesTitle="Video services"
      capabilities={[
        {
          title: "Explainer and product videos",
          description: "Script, storyboard, and edit for 60 to 120 second videos that show process and pricing.",
          metric: "Script included",
        },
        {
          title: "Testimonials",
          description: "Interview questions, remote or on-site direction, subtitles, and short cut-downs.",
          metric: "Subtitles included",
        },
        {
          title: "Short-form social videos",
          description: "Vertical videos for Instagram and YouTube Shorts with hooks, captions, and covers.",
          metric: "Monthly packs",
        },
        {
          title: "Editing and delivery",
          description: "Color correction, sound leveling, and exports sized for each platform.",
          metric: "Platform exports",
        },
      ]}
      stack={["Premiere Pro", "After Effects", "DaVinci Resolve", "Audition", "YouTube", "Instagram Reels", "SRT captions", "Drive delivery"]}
      deliverablesTitle="Deliverables"
      deliverables={[
        "Script and shot list approved before filming",
        "Edited master video plus platform cut-downs",
        "Subtitles and thumbnail images",
        "Raw footage archive link",
        "Publishing checklist",
        "Two revision rounds per video",
      ]}
      ctaTitle="Have a video in mind?"
      ctaDescription="Describe the topic and where it will be used. We send script outline and pricing."
      ctaButton="Request video estimate"
      modalServiceName="Video production"
    />
  );
}
