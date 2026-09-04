export const dynamic = 'force-dynamic';
import { revalidatePath } from 'next/cache';
import { DollarSign, FileText, Play, CheckCircle2, Banknote } from 'lucide-react';
import { getPayrolls, runMonthlyPayroll, markPayrollPaid, getHRMSUser, approveTimesheetsByHR } from '@/lib/actions/hrms-actions';
import { connectDB } from '@/lib/db/db';
import { Timesheet } from '@/lib/db/models';
import { requireSession } from '@/lib/auth-server';

export default async function HRAdminPayrollPage() {
  const hrUser = await getHRMSUser();
  if (!hrUser) return null;
  const now = new Date();
  const rows = await getPayrolls(now.getMonth() + 1, now.getFullYear());
  const periodLabel = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Fetch locked timesheets awaiting HR approval. Uses tenant scope from the
  // session actor — same model as the rest of HRMS reads.
  const actor = await requireSession();
  await connectDB();
  const tf = actor.tenantId ? { tenantId: actor.tenantId } : {};
  const lockedAwaitingHR = await Timesheet.find({ ...tf, status: 'LOCKED_BY_MANAGER' })
    .populate('userId', 'name employeeCode')
    .populate('projectId', 'name')
    .populate('taskId', 'title')
    .sort({ date: -1 })
    .lean();

  async function handleRunPayrollAction() {
    'use server';
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    await runMonthlyPayroll({ month, year });
    revalidatePath('/hrms/hr-admin/payroll');
  }

  async function handleApproveTimesheetsAction(formData: FormData) {
    'use server';
    const ids = formData.getAll('timesheetId').map(String).filter(Boolean);
    if (ids.length > 0) await approveTimesheetsByHR(ids);
    revalidatePath('/hrms/hr-admin/payroll');
  }

  async function handleMarkPaidAction(formData: FormData) {
    'use server';
    const payrollId = String(formData.get('payrollId') || '');
    if (payrollId) await markPayrollPaid({ payrollId });
    revalidatePath('/hrms/hr-admin/payroll');
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Payroll & Payslips Master</h1>
          <p className="text-xs text-slate-400">Monthly payroll processing, locked timesheet verification, overtime payouts, and payslip generation</p>
        </div>
        <form action={handleRunPayrollAction}>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow flex items-center gap-2">
            <Play className="w-3.5 h-3.5" /> Run {periodLabel} Payroll
          </button>
        </form>
      </div>

      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
          <div>
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" /> Locked Timesheets Awaiting HR Approval
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              Managers have signed off. Approve to release the hours into payroll, or wait and they will be picked up automatically on the next run.
            </p>
          </div>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full font-mono">
            {lockedAwaitingHR.length} PENDING
          </span>
        </div>

        {lockedAwaitingHR.length === 0 ? (
          <p className="text-xs text-slate-500 italic p-3">No timesheets currently locked by a manager.</p>
        ) : (
          <form action={handleApproveTimesheetsAction}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-8"><CheckCircle2 className="w-3.5 h-3.5" /></th>
                    <th className="p-3">Employee</th>
                    <th className="p-3">Project / Task</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {lockedAwaitingHR.map((t: any) => {
                    const u = t.userId || {};
                    const proj = t.projectId || {};
                    const task = t.taskId || {};
                    return (
                      <tr key={t._id} className="hover:bg-slate-800/40">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            name="timesheetId"
                            value={String(t._id)}
                            defaultChecked
                            className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="p-3 font-sans">
                          <span className="text-white font-semibold">{u.name || 'Unknown'}</span>
                          {u.employeeCode && <span className="text-slate-400 ml-1">({u.employeeCode})</span>}
                        </td>
                        <td className="p-3">
                          <div className="text-white">{proj.name || '—'}</div>
                          <div className="text-[10px] text-slate-400">{task.title || '—'}</div>
                        </td>
                        <td className="p-3 font-mono text-[11px]">{t.date ? new Date(t.date).toLocaleDateString() : '—'}</td>
                        <td className="p-3 font-mono text-emerald-400 font-bold">{(t.hours || 0).toFixed(2)}h</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end pt-4">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve Selected for Payroll
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="font-bold text-white text-base">Processed Monthly Payslips ({periodLabel})</h2>
          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full font-mono">
            {rows.length > 0 ? `${rows.length} PAYSLIPS` : 'NOT RUN YET'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Base Salary</th>
                <th className="p-3">Approved Overtime</th>
                <th className="p-3">Deductions (PF + Tax)</th>
                <th className="p-3">Net Payout</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                    No payroll run for {periodLabel} yet. Click <strong>Run Payroll</strong> above to process.
                  </td>
                </tr>
              ) : (
                rows.map((p: any) => {
                  const u = p.userId || {};
                  const status = p.status || 'PROCESSED';
                  const isPaid = status === 'PAID';
                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-sans font-semibold text-white">
                        {u.name || 'Unknown'} <span className="text-slate-400">({u.employeeCode || '—'})</span>
                      </td>
                      <td className="p-3">${(p.baseSalary || 0).toLocaleString()}</td>
                      <td className="p-3 text-purple-400 font-bold">
                        +${(p.overtimePayout || 0).toLocaleString()} ({p.overtimeHours || 0}h)
                      </td>
                      <td className="p-3 text-rose-400">-${(p.deductions || 0).toLocaleString()}</td>
                      <td className="p-3 text-emerald-400 font-bold text-sm">${(p.netSalary || 0).toLocaleString()}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={isPaid
                            ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded text-[10px] font-bold'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold'}
                          >
                            {status}
                          </span>
                          {!isPaid && (
                            <form action={handleMarkPaidAction}>
                              <input type="hidden" name="payrollId" value={String(p._id)} />
                              <button
                                className="bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow flex items-center gap-1"
                                title="Mark this payroll as paid"
                              >
                                <Banknote className="w-3 h-3" /> Mark Paid
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
