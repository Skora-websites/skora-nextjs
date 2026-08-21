export const dynamic = 'force-dynamic';
import { DollarSign, FileText } from 'lucide-react';

export default function EmployeePayslipsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">My Salary & Monthly Payslips</h1>
        <p className="text-xs text-slate-400">View and download your monthly salary statements, approved overtime payouts, and tax/PF breakdown</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs font-mono">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-sm font-sans">August 2026 Monthly Payslip</p>
            <p className="text-slate-400 mt-1">Base Salary: $6,250 | Approved Overtime: +$225.00 | Deductions: -$750.00</p>
            <p className="text-emerald-400 font-extrabold text-base mt-1 font-sans">Net Disbursed: $5,725.00</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-sans font-semibold text-xs flex items-center space-x-1.5 shadow">
            <FileText className="w-4 h-4" />
            <span>Download PDF Payslip</span>
          </button>
        </div>
      </div>
    </div>
  );
}
