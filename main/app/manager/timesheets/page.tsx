import { getHRMSUser, getTeamTimesheets, lockTimesheetsByManager } from '@/lib/actions/hrms-actions';
import { Lock } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function ManagerTimesheetsPage() {
  const user = await getHRMSUser();
  if (!user) return null;
  const rows = await getTeamTimesheets(user.id);

  const pending = rows.filter((r: any) => r.status === 'SUBMITTED');
  const locked = rows.filter((r: any) => r.status === 'LOCKED_BY_MANAGER');

  async function lockAll() {
    'use server';
    const ids = pending.map((r: any) => r._id);
    if (ids.length > 0) await lockTimesheetsByManager(ids);
    revalidatePath('/hrms/manager/timesheets');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Timesheet Review & Locking</h1>
          <p className="text-xs text-slate-400">{pending.length} pending, {locked.length} locked</p>
        </div>
        <form action={lockAll}>
          <button type="submit" disabled={pending.length === 0} className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow flex items-center space-x-2">
            <Lock className="w-4 h-4" />
            <span>Lock All Pending</span>
          </button>
        </form>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        {rows.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No timesheets yet. Team members must log hours from the task tracker first.</p>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Project & Task</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Hours</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rows.map((r: any) => (
                  <tr key={r._id}>
                    <td className="p-3 font-sans font-semibold text-white">{r.userId?.name ?? '—'}</td>
                    <td className="p-3 font-sans text-slate-300">
                      {r.projectId?.name ?? '—'} {r.taskId?.title ? `· ${r.taskId.title}` : ''}
                    </td>
                    <td className="p-3 font-mono text-slate-400">{r.date}</td>
                    <td className="p-3 font-bold text-emerald-400">{r.hours.toFixed(1)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-sans text-[10px] font-bold ${
                        r.status === 'LOCKED_BY_MANAGER' ? 'bg-emerald-500/20 text-emerald-300' :
                        r.status === 'APPROVED_BY_HR' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-amber-500/20 text-amber-300'
                      }`}>
                        {r.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
