export const dynamic = 'force-dynamic';
import { DollarSign, FileText } from 'lucide-react';

export default function HRAdminPayrollPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Payroll & Payslips Master</h1>
        <p className="text-xs text-slate-400">Monthly payroll processing, locked timesheet verification, overtime payouts, and payslip generation</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="font-bold text-white text-base">Processed Monthly Payslips (August 2026)</h2>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full font-mono">
            PAYROLL LOCKED & PROCESSED
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Base Salary</th>
                <th className="p-3">Approved Overtime</th>
                <th className="p-3">Deductions (12% PF / Tax)</th>
                <th className="p-3">Net Payout</th>
                <th className="p-3">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              <tr>
                <td className="p-3 font-sans font-semibold text-white">Alex Mercer (EMP-2026-0042)</td>
                <td className="p-3">$6,250 / mo</td>
                <td className="p-3 text-purple-400 font-bold">+$225.00 (1.5h OT)</td>
                <td className="p-3 text-rose-400">-$750.00</td>
                <td className="p-3 text-emerald-400 font-bold text-sm">$5,725.00</td>
                <td className="p-3">
                  <button className="bg-slate-800 hover:bg-slate-700 text-blue-400 px-3 py-1 rounded font-sans text-[11px] font-semibold flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="p-3 font-sans font-semibold text-white">Marcus Brody (MGR-0001)</td>
                <td className="p-3">$9,166 / mo</td>
                <td className="p-3 text-slate-500">$0.00</td>
                <td className="p-3 text-rose-400">-$1,100.00</td>
                <td className="p-3 text-emerald-400 font-bold text-sm">$8,066.00</td>
                <td className="p-3">
                  <button className="bg-slate-800 hover:bg-slate-700 text-blue-400 px-3 py-1 rounded font-sans text-[11px] font-semibold flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
