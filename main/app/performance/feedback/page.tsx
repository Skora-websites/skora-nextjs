"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Search,
  ThumbsUp,
  Lightbulb,
  Heart,
  Users,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { motion } from "framer-motion";

// ── Mock Data ───────────────────────────────────────────

const MOCK_FEEDBACK = [
  { id: "1", fromUser: "Alice Johnson", toUser: "Bob Smith", type: "praise", message: "Great work on the Q2 performance report! Very thorough analysis.", context: "Q2 Report Review", isAnonymous: false, status: "acknowledged", createdAt: "2026-05-18" },
  { id: "2", fromUser: "Carol Williams", toUser: "Alice Johnson", type: "recognition", message: "Alice went above and beyond helping the new team members settle in this quarter.", context: "Onboarding Support", isAnonymous: false, status: "pending", createdAt: "2026-05-16" },
  { id: "3", fromUser: "David Brown", toUser: "Sarah Manager", type: "constructive", message: "I think we could improve our standup meetings by keeping them more focused on blockers.", context: "Team Efficiency", isAnonymous: true, status: "acknowledged", createdAt: "2026-05-15" },
  { id: "4", fromUser: "Bob Smith", toUser: "Carol Williams", type: "suggestion", message: "Consider using automated testing for the deployment pipeline to reduce manual effort.", context: "DevOps Improvement", isAnonymous: false, status: "pending", createdAt: "2026-05-14" },
  { id: "5", fromUser: "Anonymous", toUser: "Team Lead", type: "praise", message: "The team lead has been doing an excellent job communicating project updates clearly.", context: "Team Communication", isAnonymous: true, status: "archived", createdAt: "2026-05-10" },
  { id: "6", fromUser: "Eve Davis", toUser: "Alice Johnson", type: "recognition", message: "Alice's presentation skills have improved tremendously. Great job at the all-hands!", context: "All-Hands Meeting", isAnonymous: false, status: "pending", createdAt: "2026-05-08" },
];

const feedbackTypeStyles: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  praise: { label: "Praise", icon: <ThumbsUp className="h-3.5 w-3.5" />, color: "bg-success/10 text-success border-success/20" },
  constructive: { label: "Constructive", icon: <Lightbulb className="h-3.5 w-3.5" />, color: "bg-warning/10 text-warning border-warning/20" },
  suggestion: { label: "Suggestion", icon: <Lightbulb className="h-3.5 w-3.5" />, color: "bg-primary/10 text-primary border-primary/20" },
  recognition: { label: "Recognition", icon: <Heart className="h-3.5 w-3.5" />, color: "bg-danger/10 text-danger border-danger/20" },
};

const statusColors: Record<string, "success" | "warning" | "danger" | "info" | "primary"> = {
  pending: "warning",
  acknowledged: "primary",
  archived: "info",
};

export default function FeedbackPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_FEEDBACK.filter((f) => {
    const q = search.toLowerCase();
    return !search || f.message.toLowerCase().includes(q) || f.fromUser.toLowerCase().includes(q) || f.context.toLowerCase().includes(q);
  });

  return (
    <AppShell title="Feedback">
      <PageHeader title="Employee Feedback" description="View praise, recognition, and constructive feedback from peers and managers." />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input placeholder="Search feedback..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted mx-auto mb-4" />
          <p className="text-dark dark:text-white font-semibold text-lg">No feedback found</p>
          <p className="text-sm text-muted mt-1">Try adjusting your search.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((item, idx) => {
            const typeStyle = feedbackTypeStyles[item.type] || feedbackTypeStyles.praise;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="bg-card rounded-xl border border-border shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                      {item.fromUser.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-dark dark:text-white">{item.fromUser}</h3>
                        {item.isAnonymous && (
                          <span className="text-xs text-muted italic">(anonymous)</span>
                        )}
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${typeStyle.color}`}>
                          <span className="flex items-center gap-1">
                            {typeStyle.icon}
                            {typeStyle.label}
                          </span>
                        </span>
                      </div>
                      <p className="text-sm text-dark dark:text-white mt-2">{item.message}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Users className="h-3 w-3" />To: {item.toUser}
                        </span>
                        {item.context && (
                          <span className="text-xs text-muted flex items-center gap-1">
                            <Calendar className="h-3 w-3" />{item.context}
                          </span>
                        )}
                        <span className="text-xs text-muted flex items-center gap-1">
                          <Clock className="h-3 w-3" />{item.createdAt}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={statusColors[item.status]} size="sm">
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
