import { getHRMSUser, getTeamTimesheets, getAllHRMSUsers } from '@/lib/actions/hrms-actions';
import { BarChart3 } from 'lucide-react';

export default async function ManagerAnalyticsPage() {
  const user = await getHRMSUser();
  if (!user) return null;
  const [rows, allUsers] = await Promise.all([getTeamTimesheets(user.id), getAllHRMSUsers()]);
  const teamSize = allUsers.filter((u: any) => u.reportingManagerId === user.id || u.id === user.id).length || 1;

  const totalHours = rows.reduce((acc: number, r: any) => acc + (r.hours || 0), 0);
  const doneTasks = rows.filter((r: any) => r.status === 'APPROVED_BY_HR').length;
  const completionRate = rows.length > 0 ? (doneTasks / rows.length) * 100 : 0;
  // Estimation accuracy: only consider rows with task estimatedHours set
  const estRows = rows.filter((r: any) => r.taskId?.estimatedHours);
  const estimationAccuracy = estRows.length === 0 ? null :
    estRows.reduce((acc: number, r: any) => {
      const est = r.taskId.estimatedHours || 0;
      if (est === 0) return acc;
      const diff = Math.abs(est - r.hours) / est;
      return acc + Math.max(0, 1 - diff);
    }, 0) / estRows.length * 100;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">KPI Analytics & Team Performance</h1>
        <p className="text-xs text-slate-400">Team size: {teamSize}</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Team Total Hours Logged</span>
            <p className="text-xl font-black text-blue-400">{totalHours.toFixed(1)} hrs</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Timesheet Completion</span>
            <p className="text-xl font-black text-emerald-400">{completionRate.toFixed(1)}%</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Estimation Accuracy</span>
            <p className="text-xl font-black text-purple-400">
              {estimationAccuracy === null ? 'N/A' : `${estimationAccuracy.toFixed(1)}%`}
            </p>
          </div>
        </div>
        {rows.length === 0 && (
          <p className="text-xs text-slate-500 italic">No data yet. Analytics will populate once the team logs timesheets.</p>
        )}
      </div>
    </div>
  );
}
