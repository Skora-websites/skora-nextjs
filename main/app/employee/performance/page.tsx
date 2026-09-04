import { getHRMSUser, getMyTimesheets, getMyAttendance } from '@/lib/actions/hrms-actions';
import { BarChart3 } from 'lucide-react';

export default async function EmployeePerformancePage() {
  const user = await getHRMSUser();
  if (!user) return null;
  const [timesheets, attendance] = await Promise.all([getMyTimesheets(user.id), getMyAttendance(user.id)]);

  const totalHours = timesheets.reduce((acc: number, t: any) => acc + (t.hours || 0), 0);
  const lockedTimesheets = timesheets.filter((t: any) => t.status !== 'SUBMITTED').length;
  const completionRate = timesheets.length > 0 ? (lockedTimesheets / timesheets.length) * 100 : 0;
  const onTimeDays = attendance.filter((a: any) => a.punchIn && a.status !== 'LATE').length;
  const punctuality = attendance.length > 0 ? (onTimeDays / attendance.length) * 100 : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">My Performance & KPI Analytics</h1>
        <p className="text-xs text-slate-400">Real metrics from your attendance and timesheet history</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Hours Logged</span>
            <p className="text-xl font-black text-emerald-400">{totalHours.toFixed(1)} hrs</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Timesheet Lock Rate</span>
            <p className="text-xl font-black text-blue-400">{completionRate.toFixed(1)}%</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Punctuality (30d)</span>
            <p className="text-xl font-black text-purple-400">
              {punctuality === null ? 'N/A' : `${punctuality.toFixed(1)}%`}
            </p>
          </div>
        </div>
        {timesheets.length === 0 && attendance.length === 0 && (
          <p className="text-xs text-slate-500 italic">No data yet. Punch in and log timesheets to populate this dashboard.</p>
        )}
      </div>
    </div>
  );
}
