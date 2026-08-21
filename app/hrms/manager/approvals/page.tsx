"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  CalendarDays,
  Clock,
  FileText,
  AlertTriangle,
  Users,
  Filter,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

interface ApprovalItem {
  id: string;
  employeeName: string;
  employeeCode?: string;
  type: "leave" | "regularization" | "overtime";
  fromDate?: string;
  toDate?: string;
  totalDays?: number;
  isHalfDay?: boolean;
  halfDaySlot?: "first_half" | "second_half";
  reason: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  details?: string;
}

export default function ManagerApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "leave" | "regularization" | "overtime">("all");

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hrm/v2/leaves?status=pending&approver=manager");
      if (res.ok) setApprovals((await res.json()).data || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const filtered = filterType === "all" ? approvals : approvals.filter((a) => a.type === filterType);
  const pending = filtered.filter((a) => a.status === "pending");

  const handleApprove = (id: string) => {
    setApprovals((prev) => prev.map((a) => a.id === id ? { ...a, status: "approved" as const } : a));
  };

  const handleReject = (id: string) => {
    setApprovals((prev) => prev.map((a) => a.id === id ? { ...a, status: "rejected" as const } : a));
  };

  return (
    <AppShell title="Approval Center">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Approval Center</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage team leave, regularization & overtime requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          {(["all", "leave", "regularization", "overtime"] as const).map((t) => (
            <Button
              key={t}
              size="sm"
              variant={filterType === t ? "default" : "outline"}
              onClick={() => setFilterType(t)}
              className="text-xs font-bold capitalize"
            >
              {t === "all" ? "All" : t}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MiniStat icon={<CalendarDays className="h-5 w-5 text-orange-500" />} label="Leave" value={approvals.filter((a) => a.type === "leave").length} />
        <MiniStat icon={<FileText className="h-5 w-5 text-blue-500" />} label="Regularization" value={approvals.filter((a) => a.type === "regularization").length} />
        <MiniStat icon={<Clock className="h-5 w-5 text-yellow-500" />} label="Overtime" value={approvals.filter((a) => a.type === "overtime").length} />
        <MiniStat icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} label="Pending" value={pending.length} />
      </div>

      {/* Approval List */}
      {pending.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-emerald-300 dark:border-emerald-500/20 rounded-xl">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            All caught up — no pending approvals!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-black/30 text-xs"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900 dark:text-white">{item.employeeName}</span>
                  {item.employeeCode && (
                    <span className="text-primary font-mono font-bold text-[10px]">{item.employeeCode}</span>
                  )}
                  <TypeBadge type={item.type} />
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  {item.type === "leave" && `${item.totalDays} day(s)${item.isHalfDay ? ` (Half: ${item.halfDaySlot === "first_half" ? "1st Half" : "2nd Half"})` : ""} · ${item.fromDate} → ${item.toDate}`}
                  {item.type === "regularization" && `${item.fromDate || "N/A"} · Reason: ${item.reason}`}
                  {item.type === "overtime" && `${item.details || "Overtime hours"} · ${item.fromDate || "N/A"}`}
                </p>
                <p className="text-[10px] text-slate-400 mt-1">Submitted: {item.submittedAt}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleApprove(item.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold h-8 px-3 gap-1"
                >
                  <CheckCircle2 className="h-3 w-3" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleReject(item.id)}
                  className="text-[10px] font-bold h-8 px-3 gap-1"
                >
                  <XCircle className="h-3 w-3" /> Reject
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-4 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
      <div className="flex items-center justify-between mb-2">{icon}</div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    leave: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    regularization: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    overtime: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${map[type] || map.leave}`}>
      {type}
    </span>
  );
}
