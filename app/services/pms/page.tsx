"use client";

import { KanbanSquare } from "lucide-react";
import ServicePageTemplate from "@/components/landing/ServicePageTemplate";

export default function PmsPage() {
  return (
    <ServicePageTemplate
      pillIcon={KanbanSquare}
      pill="Project management systems"
      title={<>Track work, deadlines, and approvals in one place</>}
      lead="Tasks, milestones, timesheets, and client approvals configured for your delivery process, with roles for managers and clients."
      primaryCta="Improve project tracking"
      heroImage="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1200&q=80"
      heroImageAlt="Project planning board"
      capabilitiesTitle="PMS scope"
      capabilities={[
        {
          title: "Projects and tasks",
          description: "Templates, priorities, dependencies, and file attachments your team will actually use.",
          metric: "Templates included",
        },
        {
          title: "Timelines",
          description: "Milestones and Gantt-style views with baseline dates and delay highlights.",
          metric: "Milestone view",
        },
        {
          title: "Timesheets and workload",
          description: "Simple time entries tied to tasks with weekly capacity views for managers.",
          metric: "Weekly capacity",
        },
        {
          title: "Client approvals",
          description: "Share links for deliverables with approve-or-request-changes flow and history.",
          metric: "Approval log",
        },
      ]}
      stack={["Next.js", "Node.js", "MongoDB", "Gantt charts", "File storage", "Email alerts", "Role access", "Exports"]}
      deliverablesTitle="Deliverables"
      deliverables={[
        "Project and task templates",
        "Milestone timeline with dependencies",
        "Timesheet and workload views",
        "Client approval portal",
        "Notification rules for deadlines",
        "Training and admin guide",
      ]}
      ctaTitle="Projects slipping on dates?"
      ctaDescription="Tell us how you track work today. We configure a system around it."
      ctaButton="Request PMS estimate"
      modalServiceName="Project management systems"
    />
  );
}
