import { AppShell } from "@/components/layout/app-shell";
import { getProjects } from "@/lib/db/projects";
import { getTasks } from "@/lib/db/tasks";
import { getTimesheets } from "@/lib/db/timesheets";
import { Users, Clock, ClipboardList, CalendarDays, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { approveTimesheetAction, rejectTimesheetAction } from "@/lib/actions/pms-actions";

export default async function ManagerDashboardPage() {
  const projects = await getProjects();
  const tasks = await getTasks();
  const pendingTimesheets = await getTimesheets({ status: "PENDING" });

  const activeProjectsCount = projects.filter((p) => p.status === "ACTIVE").length;
  const inProgressTasksCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;

  return (
    <AppShell title="Departmental Manager Command Center">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manager Command Center</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Departmental Overview · Team Execution & Timesheet Approvals</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/hrms/manager/projects">
            <Button className="bg-primary text-white hover:bg-primary/90 gap-2 font-bold shadow-md">
              <ClipboardList className="h-4 w-4" /> Team Projects
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active Projects</span>
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{activeProjectsCount}</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">Under management</span>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tasks In Progress</span>
            <Clock className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{inProgressTasksCount}</p>
          <span className="text-[11px] text-yellow-600 dark:text-yellow-400 mt-1 block">Active development</span>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Timesheets Pending</span>
            <CalendarDays className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{pendingTimesheets.length}</p>
          <span className="text-[11px] text-orange-600 dark:text-orange-400 mt-1 block">Awaiting manager review</span>
        </div>

        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Direct Reports</span>
            <Users className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">8</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block">Team roster</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timesheet Approvals */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Pending Timesheet Approvals</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">{pendingTimesheets.length} items</span>
            </div>

            {pendingTimesheets.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
                ✓ All team timesheets are reviewed and approved!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTimesheets.map((t) => (
                  <div
                    key={t._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-100 dark:border-white/10 bg-slate-50 dark:bg-black/30 p-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">{t.userName || "Employee"}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-primary font-medium">{t.projectName || "Project"}</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 font-medium">{t.taskTitle || "Task Work"}</p>
                      {t.notes && <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-1 italic">"{t.notes}"</p>}
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">{t.hours} hrs</span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400">{t.date}</span>
                      </div>

                      <form
                        action={async () => {
                          "use server";
                          await approveTimesheetAction(t._id || "", "manager");
                        }}
                      >
                        <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </Button>
                      </form>

                      <form
                        action={async () => {
                          "use server";
                          await rejectTimesheetAction(t._id || "", "manager", "Needs detail");
                        }}
                      >
                        <Button type="submit" size="sm" variant="outline" className="border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10 gap-1 text-xs font-bold">
                          <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Active Projects */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Active Team Projects</h3>
              <Link href="/hrms/manager/projects" className="text-xs text-primary hover:underline flex items-center gap-1 font-semibold">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {projects.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
                No active projects assigned yet.
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 4).map((p) => (
                  <div key={p._id} className="rounded-xl border border-gray-100 dark:border-white/5 bg-slate-50 dark:bg-black/20 p-3 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900 dark:text-white">{p.name}</span>
                      <span className="text-[10px] text-primary font-mono font-bold">{p.status}</span>
                    </div>
                    {p.clientName && <p className="text-slate-500 dark:text-slate-400 text-[11px]">Client: {p.clientName}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
