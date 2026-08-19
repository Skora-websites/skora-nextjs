"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, CheckCircle2, Clock, ShieldCheck, UserCheck, Send } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";

export default function LeavesPage() {
  const { user } = useAuth();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate instant submit & approval request creation
    setTimeout(() => {
      setSubmitting(false);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setShowApplyModal(false);
        setReason("");
      }, 1800);
    }, 800);
  };

  return (
    <AppShell title="Leave Management & Time Off">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Application & Balances</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit time-off requests directly to your Reporting Manager & HR Admin
          </p>
        </div>

        <Button
          onClick={() => setShowApplyModal(true)}
          className="bg-primary text-white hover:bg-primary/90 gap-2 font-bold shadow-md"
        >
          <Plus className="h-4 w-4" /> Apply for Leave
        </Button>
      </div>

      {/* Leave Balances Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Casual Leave (CL)</span>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">8 Days</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Available balance</span>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Sick Leave (SL)</span>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">5 Days</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Available balance</span>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Earned / Annual Leave (AL)</span>
          <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">12 Days</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Available balance</span>
        </div>
      </div>

      {/* Recent Leave Requests */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
        <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" /> Submitted Leave Requests
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-gray-100 dark:border-white/5">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white block">Casual Leave (1 Day)</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Reason: Personal Work</span>
            </div>
            <div className="text-right">
              <span className="font-mono text-slate-700 dark:text-slate-300 block">2026-08-25</span>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="h-3 w-3" /> Approved by Reporting Manager
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Apply Leave Modal with 100% functional Date Pickers */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19] p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> Apply for Time Off
            </h3>

            {/* Submission Recipient Note */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
              <UserCheck className="h-4 w-4 shrink-0 text-primary" />
              <span>
                <strong>Submission Target:</strong> Sent directly to your <strong>Reporting Manager</strong> &amp; <strong>HR Admin</strong> for approval.
              </span>
            </div>

            {successMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4" />
                <span>Leave application submitted to Reporting Manager &amp; HR for approval!</span>
              </div>
            )}

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                >
                  <option value="Casual Leave" className="bg-white dark:bg-slate-900">Casual Leave (CL)</option>
                  <option value="Sick Leave" className="bg-white dark:bg-slate-900">Sick Leave (SL)</option>
                  <option value="Annual Leave" className="bg-white dark:bg-slate-900">Annual Leave (AL)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none [color-scheme:light_dark]"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none [color-scheme:light_dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Brief reason for your time-off request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-sm text-slate-900 dark:text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-white/10">
                <Button type="button" variant="outline" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="bg-primary text-white font-bold gap-2">
                  <Send className="h-3.5 w-3.5" />
                  {submitting ? "Submitting..." : "Submit to Manager & HR"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
