import { AppShell } from "@/components/layout/app-shell";
import { getTasks } from "@/lib/db/tasks";
import { getTimesheets } from "@/lib/db/timesheets";
import { getPayslips } from "@/lib/db/payroll";
import { Clock, CalendarDays, ClipboardList, DollarSign, CheckCircle2, Play, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AttendancePunchCard } from "@/components/hr/attendance-punch-card";

export default async function EmployeeDashboardPage() {
  const tasks = await getTasks();
  const timesheets = await getTimesheets();
  const payslips = await getPayslips();

  return (
    <AppShell title="Employee Self-Service Portal">
      {/* Welcome Banner */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Employee Self-Service Dashboard</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Daily Punch In/Out · My Tasks · Time Tracking · Payslips</p>
      </div>

      {/* Top Grid: Punch In/Out + Leave Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Col 1 & 2: Punch Widget */}
        <div className="lg:col-span-2">
          <AttendancePunchCard />
        </div>

        {/* Col 3: Leave Balances */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" /> Leave Balances
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-gray-100 dark:border-white/5">
                <span className="text-slate-700 dark:text-slate-300">Casual Leave</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">8 days left</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-gray-100 dark:border-white/5">
                <span className="text-slate-700 dark:text-slate-300">Sick Leave</span>
                <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">5 days left</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-gray-100 dark:border-white/5">
                <span className="text-slate-700 dark:text-slate-300">Annual Leave</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">12 days left</span>
              </div>
            </div>
          </div>

          <Link href="/hrms/leaves" className="mt-4">
            <Button variant="outline" className="w-full text-xs gap-2 border-primary/30 text-primary hover:bg-primary/10 font-bold">
              Apply for Time Off
            </Button>
          </Link>
        </div>
      </div>

      {/* Bottom Grid: My Tasks & Recent Timesheets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Assigned Tasks */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-yellow-500" /> My Assigned Tasks
            </h3>
            <Link href="/hrms/employee/my-tasks" className="text-xs text-primary hover:underline font-semibold">
              Kanban Board →
            </Link>
          </div>

          {tasks.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
              No active tasks assigned today.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 4).map((task) => (
                <div key={task._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-gray-100 dark:border-white/5 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">{task.title}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{task.projectName || "PMS Project"}</span>
                  </div>
                  <Link href="/hrms/employee/timesheet">
                    <Button size="sm" className="bg-primary/10 text-primary hover:bg-primary/20 text-[11px] gap-1 font-bold">
                      <Play className="h-3 w-3" /> Log Time
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Timesheet History */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-500" /> Recent Timesheets
            </h3>
            <Link href="/hrms/employee/timesheet" className="text-xs text-primary hover:underline font-semibold">
              Log Hours →
            </Link>
          </div>

          {timesheets.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
              No timesheet entries logged yet.
            </div>
          ) : (
            <div className="space-y-3">
              {timesheets.slice(0, 4).map((ts) => (
                <div key={ts._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-gray-100 dark:border-white/5 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">{ts.taskTitle || "Task Work"}</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{ts.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm block">{ts.hours}h</span>
                    {ts.status === "APPROVED" ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Approved</span>
                    ) : ts.status === "REJECTED" ? (
                      <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold">Rejected</span>
                    ) : (
                      <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-semibold">Pending Approval</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
