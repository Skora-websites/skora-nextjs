import { getHRMSUser, getMyPayrolls } from '@/lib/actions/hrms-actions';
import { FileText } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default async function EmployeePayslipsPage() {
  const user = await getHRMSUser();
  if (!user) return null;
  const rows = await getMyPayrolls(user.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">My Salary & Monthly Payslips</h1>
        <p className="text-xs text-slate-400">{rows.length} payslip(s) on file</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs font-mono">
        {rows.length === 0 ? (
          <p className="text-slate-500 italic">No payslips yet. HR Admin must run monthly payroll before they appear here.</p>
        ) : (
          rows.map((p: any) => (
            <div key={p._id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm font-sans">
                  {MONTHS[(p.month - 1) % 12]} {p.year} Payslip
                </p>
                <p className="text-slate-400 mt-1">
                  Base: ${p.baseSalary?.toLocaleString() ?? 0} |
                  OT: {p.overtimeHours?.toFixed(1) ?? 0}h (+${p.overtimePayout?.toLocaleString() ?? 0}) |
                  Deductions: -${p.deductions?.toLocaleString() ?? 0}
                </p>
                <p className="text-emerald-400 font-extrabold text-base mt-1 font-sans">
                  Net: ${p.netSalary?.toLocaleString() ?? 0}
                </p>
              </div>
              <span className="text-[10px] text-slate-500">{p.status ?? 'PROCESSED'}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
