"use client";

import { Smartphone } from "lucide-react";
import ServicePageTemplate from "@/components/landing/ServicePageTemplate";

export default function MobileDevelopmentPage() {
  return (
    <ServicePageTemplate
      pillIcon={Smartphone}
      pill="Mobile app development"
      title={<>iOS and Android apps your team can maintain</>}
      lead="Cross-platform apps with login, data sync, and push notifications, tested on real devices and published to both stores."
      primaryCta="Discuss an app idea"
      heroImage="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80"
      heroImageAlt="Mobile app on a phone"
      capabilitiesTitle="App development scope"
      capabilities={[
        {
          title: "Product scope and screens",
          description: "User flows, screen list, and API needs agreed before coding starts.",
          metric: "Fixed scope doc",
        },
        {
          title: "Cross-platform build",
          description: "One codebase for iOS and Android with native performance for common flows.",
          metric: "React Native",
        },
        {
          title: "Backend and sync",
          description: "Authentication, database, file uploads, and offline handling where needed.",
          metric: "API + database",
        },
        {
          title: "Testing and release",
          description: "Test builds every sprint, store listings, and rollout plan with rollback steps.",
          metric: "Store release",
        },
      ]}
      stack={["React Native", "TypeScript", "Node.js", "MongoDB", "Firebase", "Push notifications", "TestFlight", "Play Console"]}
      deliverablesTitle="Deliverables"
      deliverables={[
        "Screen flows and API contract",
        "iOS and Android test builds each sprint",
        "Admin panel for content and users",
        "Store listings with screenshots",
        "Crash reporting and analytics setup",
        "90 days of post-launch bug fixes",
      ]}
      ctaTitle="Have an app idea?"
      ctaDescription="Share the main screens and users. We reply with build phases and cost."
      ctaButton="Request app estimate"
      modalServiceName="Mobile app development"
    />
  );
}
