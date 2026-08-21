"use client";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Edit3 } from "lucide-react";

const leaveTypes = [
  { name: "Casual Leave (CL)", code: "CL", maxBalance: 12, accrual: "1.5/month", paid: true, color: "emerald" },
  { name: "Sick Leave (SL)", code: "SL", maxBalance: 12, accrual: "1/month", paid: true, color: "blue" },
  { name: "Annual Leave (AL)", code: "AL", maxBalance: 24, accrual: "2/month", paid: true, color: "purple" },
  { name: "Maternity Leave", code: "ML", maxBalance: 180, accrual: "N/A", paid: true, color: "pink" },
  { name: "Paternity Leave", code: "PL", maxBalance: 5, accrual: "N/A", paid: true, color: "cyan" },
];

export default function HrAdminLeavePoliciesPage() {
  return (
    <AppShell title="Leave Policies">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leave Policies</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Configure leave types, accrual rules, carry-forward and encashment policies</p>
        </div>
        <Button className="bg-primary text-white gap-2 font-bold text-xs">
          <Plus className="h-4 w-4" /> Add Leave Type
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leaveTypes.map((lt) => (
          <div key={lt.code} className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">{lt.name}</h3>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0"><Edit3 className="h-3.5 w-3.5" /></Button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Max Balance</span><span className="font-bold">{lt.maxBalance} days</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Accrual</span><span className="font-bold">{lt.accrual}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Paid</span><span className="font-bold text-emerald-600 dark:text-emerald-400">{lt.paid ? "Yes" : "No"}</span></div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
