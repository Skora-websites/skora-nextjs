"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileCheck,
  Search,
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

// ── Mock Data ───────────────────────────────────────────

const MOCK_APPLICATIONS = [
  { id: "1", candidate: "Alice Johnson", position: "Senior Frontend Developer", stage: "technical_interview", status: "in_progress", updatedAt: "2026-05-18" },
  { id: "2", candidate: "Bob Smith", position: "Backend Engineer", stage: "resume_review", status: "in_progress", updatedAt: "2026-05-17" },
  { id: "3", candidate: "Carol Williams", position: "HR Manager", stage: "hr_interview", status: "in_progress", updatedAt: "2026-05-16" },
  { id: "4", candidate: "David Brown", position: "Product Designer", stage: "portfolio_review", status: "pending", updatedAt: "2026-05-15" },
  { id: "5", candidate: "Eve Davis", position: "Senior Frontend Developer", stage: "offer", status: "accepted", updatedAt: "2026-05-14" },
  { id: "6", candidate: "Frank Wilson", position: "DevOps Engineer", stage: "offer", status: "rejected", updatedAt: "2026-05-12" },
];

const stageLabels: Record<string, string> = {
  new: "New Application",
  resume_review: "Resume Review",
  phone_screen: "Phone Screen",
  technical_interview: "Technical Interview",
  hr_interview: "HR Interview",
  portfolio_review: "Portfolio Review",
  reference_check: "Reference Check",
  offer: "Offer Stage",
  hired: "Hired",
};

const statusColors: Record<string, "success" | "warning" | "danger" | "info" | "primary"> = {
  pending: "warning",
  in_progress: "primary",
  accepted: "success",
  rejected: "danger",
  withdrawn: "danger",
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  in_progress: <Calendar className="h-4 w-4" />,
  accepted: <CheckCircle2 className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_APPLICATIONS.filter((a) => {
    const q = search.toLowerCase();
    return !search || a.candidate.toLowerCase().includes(q) || a.position.toLowerCase().includes(q);
  });

  return (
    <AppShell title="Applications">
      <PageHeader title="Applications" description="Track the progress of all job applications through the hiring pipeline." />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input placeholder="Search by candidate or position..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <FileCheck className="h-12 w-12 text-muted mx-auto mb-4" />
          <p className="text-dark dark:text-white font-semibold text-lg">No applications found</p>
          <p className="text-sm text-muted mt-1">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((app, idx) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="bg-card rounded-xl border border-border shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                    {app.candidate.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-dark dark:text-white">{app.candidate}</h3>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span className="text-xs text-muted flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />{app.position}
                      </span>
                      <span className="text-xs text-muted flex items-center gap-1">
                        <FileCheck className="h-3 w-3" />{stageLabels[app.stage] || app.stage}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={statusColors[app.status] || "info"} size="sm">
                    <span className="flex items-center gap-1">
                      {statusIcons[app.status]}
                      {app.status.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  </Badge>
                  <span className="text-xs text-muted">Updated {app.updatedAt}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
