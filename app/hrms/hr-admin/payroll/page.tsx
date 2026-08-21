"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import {
  DollarSign,
  Receipt,
  Download,
  Users,
  TrendingUp,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Calendar,
  FileText,
} from "lucide-react";

interface PayrollRun {
  id: string;
  payGroupId: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  processedBy: string;
  processedAt: string;
  createdAt: string;
}

export default function HrAdminPayrollPage() {
  const { user } = useAuth();
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showRunModal, setShowRunModal] = useState(false);
  const [periodStart, setPeriodStart] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]
  );
  const [periodEnd, setPeriodEnd] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split("T")[0]
  );

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hrm/v2/payroll?type=runs");
      if (res.ok) {
        const data = await res.json();
        setPayrollRuns(Array.isArray(data.data) ? data.data : []);
      }
    } catch { /* empty */ }
    setLoading(false);
  };

  const handleRunPayroll = async () => {
    setProcessing(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/hrm/v2/payroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "process",
          payGroupId: "default",
          periodStart,
          periodEnd,
          processedBy: user?.id || "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg("Payroll processed successfully!");
        setShowRunModal(false);
        loadPayroll();
        setTimeout(() => setSuccessMsg(null), 4000);
      } else {
        setErrorMsg(data.error || "Failed to process payroll");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to process payroll");
    }
    setProcessing(false);
  };

  const handleExport = (run: PayrollRun) => {
    const headers = ["Run ID", "Period Start", "Period End", "Gross", "Deductions", "Net Pay", "Status"];
    const row = [
      run.id,
      run.periodStart ? new Date(run.periodStart).toLocaleDateString() : "N/A",
      run.periodEnd ? new Date(run.periodEnd).toLocaleDateString() : "N/A",
      run.totalGross || 0,
      run.totalDeductions || 0,
      run.totalNet || 0,
      run.status,
    ].join(",");
    const csv = [headers.join(","), row].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payroll-" + run.id + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    if (payrollRuns.length === 0) return;
    const headers = ["Run ID", "Period Start", "Period End", "Status", "Employees", "Gross", "Deductions", "Net Pay", "Processed At"];
    const rows = payrollRuns.map((run) =>
      [
        run.id,
        run.periodStart ? new Date(run.periodStart).toLocaleDateString() : "N/A",
        run.periodEnd ? new Date(run.periodEnd).toLocaleDateString() : "N/A",
        run.status,
        run.totalEmployees || 0,
        run.totalGross || 0,
        run.totalDeductions || 0,
        run.totalNet || 0,
        run.processedAt ? new Date(run.processedAt).toLocaleDateString() : "N/A",
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payroll-all-" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalPayroll = payrollRuns.reduce((sum, r) => sum + (r.totalNet || 0), 0);
  const totalRuns = payrollRuns.length;
  const latestRun = payrollRuns[0];

  return (
    <AppShell title="Payroll Management">
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" /> {errorMsg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Payroll Management</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Run end-of-month payroll, process salary, and export payslips
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 text-xs font-bold border-gray-200 dark:border-white/10"
            onClick={handleExportAll}
            disabled={payrollRuns.length === 0}
          >
            <Download className="h-4 w-4" />Export All
          </Button>
          <Button
            className="bg-primary text-white gap-2 font-bold text-xs"
            onClick={() => setShowRunModal(true)}
          >
            <Receipt className="h-4 w-4" />Run Payroll
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Payroll Paid", value: "₹" + totalPayroll.toLocaleString(), icon: DollarSign, color: "text-primary" },
          { label: "Payroll Runs", value: String(totalRuns), icon: Receipt, color: "text-blue-500" },
          { label: "Latest Status", value: latestRun ? latestRun.status.replace(/_/g, " ").toUpperCase() : "—", icon: TrendingUp, color: "text-emerald-500" },
          { label: "Employees Processed", value: String(latestRun?.totalEmployees || 0), icon: Users, color: "text-yellow-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 text-slate-900 dark:text-white">
            <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 text-slate-900 dark:text-white">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />Payroll History
        </h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : payrollRuns.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
            <DollarSign className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold mb-1">No payroll runs yet</p>
            <p>Click &quot;Run Payroll&quot; to process your first payroll for the current month.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 dark:border-white/10 text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="pb-3 pr-4">Period</th>
                  <th className="pb-3 pr-4">Employees</th>
                  <th className="pb-3 pr-4">Gross</th>
                  <th className="pb-3 pr-4">Deductions</th>
                  <th className="pb-3 pr-4">Net Pay</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Processed</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {payrollRuns.map((run) => (
                  <tr key={run.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className="py-3 pr-4">
                      <span className="font-semibold">
                        {run.periodStart ? new Date(run.periodStart).toLocaleDateString() : "N/A"}
                      </span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="font-semibold">
                        {run.periodEnd ? new Date(run.periodEnd).toLocaleDateString() : "N/A"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-semibold">{run.totalEmployees || 0}</td>
                    <td className="py-3 pr-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                      ₹{(run.totalGross || 0).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 text-red-600 dark:text-red-400 font-semibold">
                      ₹{(run.totalDeductions || 0).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 font-bold text-primary">
                      ₹{(run.totalNet || 0).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        run.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : run.status === "processing"
                          ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
                          : "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
                      }`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-500">
                      {run.processedAt ? new Date(run.processedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => handleExport(run)}
                        className="text-primary text-[10px] font-bold hover:underline flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />Export
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showRunModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />Run Payroll
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This will calculate salary for all active employees for the selected period.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">
                  <Calendar className="h-3.5 w-3.5 inline mr-1" />Period Start
                </label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  <Calendar className="h-3.5 w-3.5 inline mr-1" />Period End
                </label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
              <button
                onClick={() => setShowRunModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={handleRunPayroll}
                disabled={processing}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {processing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Receipt className="h-3.5 w-3.5" />}
                {processing ? "Processing..." : "Run Payroll"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
