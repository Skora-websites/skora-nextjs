"use client";

import { useState, useEffect } from "react";
import { DollarSign, Download, Calendar } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

interface Payslip {
  _id: string;
  month: string;
  year: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  status: string;
  generatedAt: string;
}

export default function EmployeePayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hrm/v2/payroll/mypayslips");
      if (res.ok) setPayslips((await res.json()).data || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const totalEarnings = payslips.reduce((s, p) => s + p.grossPay, 0);
  const totalDeductions = payslips.reduce((s, p) => s + p.deductions, 0);
  const totalNet = payslips.reduce((s, p) => s + p.netPay, 0);

  return (
    <AppShell title="My Payslips">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Payslips</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          View and download your salary slips
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 text-center text-slate-900 dark:text-white">
          <DollarSign className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">₹{totalEarnings.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Total Earnings</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 text-center text-slate-900 dark:text-white">
          <DollarSign className="h-5 w-5 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">₹{totalDeductions.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Total Deductions</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 text-center text-slate-900 dark:text-white">
          <DollarSign className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-2xl font-extrabold text-primary">₹{totalNet.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">Total Net Pay</p>
        </div>
      </div>

      {/* Payslip List */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 text-slate-900 dark:text-white">
        <h3 className="font-bold text-base mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" /> Salary History ({payslips.length})
        </h3>
        {payslips.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
            No payslips generated yet. Payslips are generated at the end of each month after payroll processing.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Period</th>
                  <th className="pb-3 font-semibold">Gross Pay</th>
                  <th className="pb-3 font-semibold">Deductions</th>
                  <th className="pb-3 font-semibold">Net Pay</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {payslips.map((p) => (
                  <tr key={p._id}>
                    <td className="py-3 font-bold">{p.month} {p.year}</td>
                    <td className="py-3 font-mono">₹{p.grossPay.toLocaleString()}</td>
                    <td className="py-3 font-mono text-red-600 dark:text-red-400">-₹{p.deductions.toLocaleString()}</td>
                    <td className="py-3 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">₹{p.netPay.toLocaleString()}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="outline" className="text-[10px] font-bold gap-1 border-primary/30 text-primary">
                        <Download className="h-3 w-3" /> Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
