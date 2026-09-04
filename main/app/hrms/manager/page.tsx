import { getHRMSUser, getEscalatedAttendance, getTodayAttendance, getPendingTeamApprovals, getTeamTimesheets, lockTimesheetsByManager } from '@/lib/actions/hrms-actions';
import { GeofencedPunchWidget } from '@/components/hrms/geofenced-punch-widget';
import { FolderKanban, CheckSquare, Lock } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function ManagerDashboardPage() {
  const managerUser = await getHRMSUser();
  if (!managerUser) return null;
  const todayAttendance = await getTodayAttendance(managerUser.id);
  const pendingApprovals = await getPendingTeamApprovals(managerUser.id);
  const teamTimesheets = await getTeamTimesheets(managerUser.id);

  const totalLoggedHours = teamTimesheets.reduce((acc: number, t: any) => acc + (t.hours || 0), 0);
  const lockedCount = teamTimesheets.filter((t: any) => t.status === 'LOCKED_BY_MANAGER').length;
  const pendingTimesheets = teamTimesheets.filter((t: any) => t.status === 'SUBMITTED').length;

  async function handleLockAllPending() {
    'use server';
    const pendingIds = teamTimesheets.filter((t: any) => t.status === 'SUBMITTED').map((t: any) => t._id);
    if (pendingIds.length > 0) {
      await lockTimesheetsByManager(pendingIds);
    }
    revalidatePath('/hrms/manager');
    revalidatePath('/hrms/manager/timesheets');
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Engineering Management Command</span>
            <h1 className="text-2xl font-extrabold text-white">Manager Team Operations</h1>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as <span className="text-white font-medium">{managerUser.name}</span> ({managerUser.employeeCode}) | Route: <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-400">/hrms/manager</code>
            </p>
          </div>
          <Link href="/hrms/manager/settings" className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl shadow">
            Access Isolated Manager Settings
          </Link>
        </div>
        <GeofencedPunchWidget userId={managerUser.id} userName={managerUser.name} userRole={managerUser.role} todayAttendance={todayAttendance} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">PMS Kanban & Task Delegation</h2>
                <p className="text-xs text-slate-400">Monitor active projects, delegate tasks to team members</p>
              </div>
            </div>
            <Link href="/hrms/manager/pms" className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg shadow">
              Open Full Kanban
            </Link>
          </div>
          <div className="text-xs text-slate-400">
            {teamTimesheets.length === 0 ? (
              <p className="text-slate-500 italic">No active tasks yet. Delegate from the full Kanban board.</p>
            ) : (
              <p>{teamTimesheets.length} task timesheets logged across your team.</p>
            )}
          </div>
        </section>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Team Roster & Approval Center</h2>
              <p className="text-xs text-slate-400">
                {pendingApprovals.leaves.length} pending leave(s), {pendingApprovals.attendance.length} pending OT/reg
              </p>
            </div>
          </div>
          {pendingApprovals.leaves.length === 0 && pendingApprovals.attendance.length === 0 ? (
            <p className="text-xs text-slate-500 italic bg-slate-950 border border-slate-800 rounded-xl p-4">No pending approvals. Good job keeping the queue clear.</p>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
              {pendingApprovals.leaves.slice(0, 1).map((lr: any) => (
                <div key={lr._id} className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <div>
                    <span className="font-semibold text-white">{lr.userId?.name ?? 'Employee'}</span>
                    <span className="text-slate-400 ml-2 font-mono">{lr.type}</span>
                  </div>
                  <Link href="/hrms/manager/approvals" className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    PENDING LEAVE
                  </Link>
                </div>
              ))}
              {pendingApprovals.attendance.slice(0, 1).map((r: any) => (
                <div key={r._id} className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white">{r.userId?.name ?? 'Employee'}</span>
                    <span className="text-slate-400 ml-2 font-mono">{r.overtimeHours ? `${r.overtimeHours} hrs OT` : 'Reg'}</span>
                  </div>
                  <Link href="/hrms/manager/approvals" className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                    PENDING OT/REG
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-600/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Timesheet Review & Payroll Locking</h2>
              <p className="text-xs text-slate-400">Review logged team task hours, lock timesheets and route to HR for final payroll run</p>
            </div>
          </div>
          <form action={handleLockAllPending}>
            <button type="submit" disabled={pendingTimesheets === 0} className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow flex items-center space-x-2 active:scale-95 transition-all">
              <Lock className="w-4 h-4" />
              <span>Lock Pending ({pendingTimesheets})</span>
            </button>
          </form>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Team Logged Hours</span>
            <p className="text-base font-extrabold text-white">{totalLoggedHours.toFixed(1)} Hours</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Timesheet Status</span>
            <p className="text-base font-extrabold text-amber-400">{pendingTimesheets} pending, {lockedCount} locked</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">HR Destination</span>
            <p className="text-base font-extrabold text-emerald-400">Payroll Master</p>
          </div>
        </div>
      </section>
    </div>
  );
}
