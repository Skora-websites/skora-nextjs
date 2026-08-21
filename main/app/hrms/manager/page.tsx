import { getHRMSUser, createTask, lockTimesheetsByManager, getEscalatedAttendance } from '@/lib/actions/hrms-actions';
import { GeofencedPunchWidget } from '@/components/hrms/geofenced-punch-widget';
import { FolderKanban, CheckSquare, Clock, BarChart3, Lock, CheckCircle2, UserCheck, Plus } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function ManagerDashboardPage() {
  const managerUser = await getHRMSUser();
  const teamAttendance = await getEscalatedAttendance('MANAGER', managerUser?._id);

  async function handleLockTimesheetsAction() {
    'use server';
    await lockTimesheetsByManager(['ts-101', 'ts-102']);
    revalidatePath('/hrms/manager');
  }

  return (
    <div className="space-y-8">
      {/* 1. HEADER BANNER: Personal Profile & Geofenced Punch In/Out */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Engineering Management Command</span>
            <h1 className="text-2xl font-extrabold text-white">Manager Team Operations</h1>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as <span className="text-white font-medium">{managerUser.name}</span> ({managerUser.employeeCode}) | Route: <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-400">/hrms/manager</code>
            </p>
          </div>

          <Link
            href="/hrms/manager/settings"
            className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl shadow"
          >
            Access Isolated Manager Settings
          </Link>
        </div>

        <GeofencedPunchWidget
          userId={managerUser._id}
          userName={managerUser.name}
          userRole={managerUser.role}
        />
      </div>

      {/* Grid Layout for Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. PMS Kanban & Task Delegation */}
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

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">To Do</span>
              <div className="bg-slate-900 border border-slate-800 p-2 rounded text-slate-200">
                <p className="font-semibold">Setup Geofencing Haversine</p>
                <p className="text-[10px] text-slate-400 mt-1">Assignee: Alex Mercer</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-blue-400">In Progress</span>
              <div className="bg-slate-900 border border-blue-500/30 p-2 rounded text-slate-200">
                <p className="font-semibold">48h Onboarding Timer</p>
                <p className="text-[10px] text-slate-400 mt-1">Assignee: Alex Mercer</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Done</span>
              <div className="bg-slate-900 border border-emerald-500/30 p-2 rounded text-slate-200">
                <p className="font-semibold font-mono text-[11px]">Strict 10AM-7PM Rules</p>
                <p className="text-[10px] text-slate-400 mt-1">Completed</p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Approval Center & Team Roster */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Team Roster & Approval Center</h2>
              <p className="text-xs text-slate-400">Approve Leave (Half-Day), Regularization, and Overtime requests</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div>
                <span className="font-semibold text-white">Alex Mercer</span>
                <span className="text-slate-400 ml-2 font-mono">(EMP-2026-0042)</span>
              </div>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                PENDING OVERTIME (1.5 hrs past 7PM)
              </span>
            </div>
            <p className="text-slate-400">Logged overtime working on PMS Timesheet locking module.</p>
            <div className="flex items-center space-x-2 pt-1">
              <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1.5 rounded">
                Approve Overtime
              </button>
              <button className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded font-semibold">
                Reject
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Timesheet Review & Lock for HR */}
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

          <form action={handleLockTimesheetsAction}>
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow flex items-center space-x-2 active:scale-95 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Lock Logged Team Hours for HR</span>
            </button>
          </form>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Team Logged Hours</span>
            <p className="text-base font-extrabold text-white">164.5 Hours</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Timesheet Status</span>
            <p className="text-base font-extrabold text-amber-400">Ready for Lock</p>
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
