"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Users,
  Clock,
  Target,
  Award,
  Activity,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";

interface TeamMetric {
  userId: string;
  userName: string;
  department: string;
  tasksCompleted: number;
  tasksInProgress: number;
  hoursLogged: number;
  attendanceRate: number;
  onTimeRate: number;
  overallScore: number;
}

interface TeamOverview {
  totalTasks: number;
  completedTasks: number;
  totalHoursLogged: number;
  avgAttendanceRate: number;
  avgOnTimeRate: number;
}

export default function ManagerAnalyticsPage() {
  const [metrics, setMetrics] = useState<TeamMetric[]>([]);
  const [overview, setOverview] = useState<TeamOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hrm/v2/analytics/team");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || []);
        setOverview(data.overview || null);
      }
    } catch { /* empty */ }
    setLoading(false);
  };

  const topPerformers = [...metrics].sort((a, b) => b.overallScore - a.overallScore).slice(0, 5);

  return (
    <AppShell title="KPI Analytics">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">KPI Analytics</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Team performance metrics and individual employee KPI tracking
        </p>
      </div>

      {/* Team Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<Target className="h-5 w-5 text-primary" />}
          label="Task Completion"
          value={overview ? `${Math.round((overview.completedTasks / Math.max(overview.totalTasks, 1)) * 100)}%` : "—"}
          sub={`${overview?.completedTasks || 0} / ${overview?.totalTasks || 0} tasks`}
        />
        <KpiCard
          icon={<Clock className="h-5 w-5 text-yellow-500" />}
          label="Hours Logged"
          value={overview?.totalHoursLogged?.toString() || "—"}
          sub="Total team hours"
          accent="text-yellow-600 dark:text-yellow-400"
        />
        <KpiCard
          icon={<Activity className="h-5 w-5 text-emerald-500" />}
          label="Attendance Rate"
          value={overview ? `${Math.round(overview.avgAttendanceRate)}%` : "—"}
          sub="Team average"
          accent="text-emerald-600 dark:text-emerald-400"
        />
        <KpiCard
          icon={<Award className="h-5 w-5 text-blue-500" />}
          label="On-Time Rate"
          value={overview ? `${Math.round(overview.avgOnTimeRate)}%` : "—"}
          sub="Punch in before 10:30 AM"
          accent="text-blue-600 dark:text-blue-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Individual Metrics Table */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Individual Employee Metrics
          </h3>
          {metrics.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
              No team metrics available yet. Metrics will populate as employees log activity.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-gray-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                  <tr>
                    <th className="pb-3 font-semibold">Employee</th>
                    <th className="pb-3 font-semibold">Tasks Done</th>
                    <th className="pb-3 font-semibold">Hours</th>
                    <th className="pb-3 font-semibold">Attendance</th>
                    <th className="pb-3 font-semibold">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {metrics.map((m) => (
                    <tr key={m.userId}>
                      <td className="py-3 font-bold text-slate-900 dark:text-white">
                        {m.userName}
                        <span className="block text-[10px] text-slate-500 font-normal">{m.department}</span>
                      </td>
                      <td className="py-3 font-mono">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{m.tasksCompleted}</span>
                        <span className="text-slate-400"> / {m.tasksCompleted + m.tasksInProgress}</span>
                      </td>
                      <td className="py-3 font-mono font-bold">{m.hoursLogged}h</td>
                      <td className="py-3">
                        <ScoreBar value={m.attendanceRate} />
                      </td>
                      <td className="py-3">
                        <span className={`font-mono font-extrabold ${m.overallScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : m.overallScore >= 50 ? "text-yellow-600 dark:text-yellow-400" : "text-red-600 dark:text-red-400"}`}>
                          {m.overallScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" /> Top Performers
          </h3>
          {topPerformers.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
              No performance data available yet.
            </div>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((m, i) => (
                <div key={m.userId} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-black/30 border border-gray-100 dark:border-white/5 text-xs">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-sm ${i === 0 ? "bg-yellow-500/10 text-yellow-600" : i === 1 ? "bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300" : i === 2 ? "bg-orange-500/10 text-orange-600" : "bg-slate-100 dark:bg-black/30 text-slate-500"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <span className="font-bold text-slate-900 dark:text-white block">{m.userName}</span>
                    <span className="text-[10px] text-slate-500">{m.department}</span>
                  </div>
                  <span className={`font-mono font-extrabold ${m.overallScore >= 80 ? "text-emerald-600" : "text-yellow-600"}`}>
                    {m.overallScore}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function KpiCard({ icon, label, value, sub, accent }: { icon: React.ReactNode; label: string; value: string; sub: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-5 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
      <div className="flex items-center justify-between mb-2">{icon}</div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
      <p className={`text-[10px] mt-0.5 font-semibold ${accent || "text-slate-500"}`}>{sub}</p>
    </div>
  );
}

function ScoreBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
      <span className="font-mono text-[10px] font-bold">{Math.round(value)}%</span>
    </div>
  );
}
