const fs = require("fs");

const content = `"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  Users, UserCheck, Clock, CalendarDays, DollarSign, ClipboardList,
  Shield, CheckCircle2, XCircle, AlertTriangle, MapPin, TrendingUp,
  Briefcase, Activity, LayoutDashboard, Loader2, ArrowUpRight, ArrowDownRight,
  Building2, Crown, Eye, Settings, FileText, Send,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { AttendancePunchCard } from "@/components/hr/attendance-punch-card";

interface Employee { id: string; name: string; email: string; department: string; designation: string; role: string; status: string; employeeCode?: string; reportingManager?: string; }
interface AttendanceRecord { _id: string; userId?: { name?: string; role?: string }; date: string; status?: string; punchIn?: string; punchOut?: string; }
interface LeaveRequest { id: string; employeeName: string; type: string; totalDays: number; reason: string; status: string; }
interface Project { id: string; name: string; status: string; progress?: number; }

export default function SuperadminOverviewPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [hrAdmins, setHrAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/hrm/v2/employees").then(async r => r.ok ? await r.json() : null),
      fetch("/api/hrm/v2/attendance").then(async r => r.ok ? await r.json() : null),
      fetch("/api/hrm/v2/leaves").then(async r => r.ok ? await r.json() : null),
      fetch("/api/hrm/v2/projects").then(async r => r.ok ? await r.json() : null),
      fetch("/api/hrm/v2/users?action=list&role=hr_admin").then(async r => r.ok ? await r.json() : null),
    ]).then(([e, a, l, p, u]) => {
      if (e.status === "fulfilled" && e.value) { const d = e.value.data; setEmployees(Array.isArray(d) ? d : []); }
      if (a.status === "fulfilled" && a.value) { const d = a.value.data; setAttendance(Array.isArray(d) ? d : []); }
      if (l.status === "fulfilled" && l.value) { const d = l.value.data; setLeaveRequests(Array.isArray(d) ? d : []); }
      if (p.status === "fulfilled" && p.value) { const d = p.value.data || p.value.projects; setProjects(Array.isArray(d) ? d : []); }
      if (u.status === "fulfilled" && u.value) { const d = u.value.data; setHrAdmins(Array.isArray(d) ? d : []); }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split("T")[0];
  const todayAttendance = attendance.filter(a => a.date === today);
  const presentCount = todayAttendance.filter(a => a.status === "PRESENT" || a.status === "LATE").length;
  const absentCount = employees.length - presentCount;
  const lateCount = todayAttendance.filter(a => a.status === "LATE").length;
  const pendingLeaves = leaveRequests.filter(l => l.status === "pending");
  const activeProjects = projects.filter(p => p.status === "active" || p.status === "PLANNING");

  // Department breakdown
  const deptMap: Record<string, number> = {};
  employees.forEach(e => { const d = e.department || "Unassigned"; deptMap[d] = (deptMap[d] || 0) + 1; });
  const departments = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);

  // Role breakdown
  const roleMap: Record<string, number> = {};
  employees.forEach(e => { const r = e.role || "employee"; roleMap[r] = (roleMap[r] || 0) + 1; });

  return (
    <AppShell title="CEO Dashboard">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" /> Welcome back, {user?.name || "CEO"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Company Command Center — {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/hrms/superadmin/settings"><Button variant="outline" className="gap-2 font-bold text-xs border-gray-200 dark:border-white/10"><Settings className="h-4 w-4 text-primary" /> Settings</Button></Link>
        </div>
      </div>

      {/* CEO's Personal Punch */}
      <div className="mb-6"><AttendancePunchCard /></div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KPICard icon={<Users className="h-5 w-5 text-primary" />} label="Total Employees" value={employees.length} />
        <KPICard icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} label="Present Today" value={presentCount} accent="text-emerald-600 dark:text-emerald-400" />
        <KPICard icon={<XCircle className="h-5 w-5 text-red-500" />} label="Absent Today" value={absentCount} accent="text-red-600 dark:text-red-400" />
        <KPICard icon={<AlertTriangle className="h-5 w-5 text-amber-500" />} label="Late Today" value={lateCount} accent="text-amber-600 dark:text-amber-400" />
        <KPICard icon={<CalendarDays className="h-5 w-5 text-orange-500" />} label="Pending Leaves" value={pendingLeaves.length} accent="text-orange-600 dark:text-orange-400" />
        <KPICard icon={<Briefcase className="h-5 w-5 text-blue-500" />} label="Active Projects" value={activeProjects.length} accent="text-blue-600 dark:text-blue-400" />
      </div>

      {/* Today's Attendance Grid */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 text-slate-900 dark:text-white mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20"><MapPin className="h-5 w-5" /></div>
            <div>
              <h3 className="font-bold text-base">Today&apos;s Attendance</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time attendance status of all employees</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-bold">{presentCount}/{employees.length} present</span>
        </div>
        {employees.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
            {loading ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</span> : "No employees found."}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {employees.map(emp => {
              const rec = todayAttendance.find(a => a.userId?.name === emp.name);
              const status = rec?.status || "ABSENT";
              const colors = status === "PRESENT" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400" : status === "LATE" ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400" : status === "HALF_DAY" ? "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400" : "bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-400";
              return (
                <div key={emp.id} className={`p-3 rounded-xl border ${colors} text-center`}>
                  <div className="w-8 h-8 rounded-full bg-white dark:bg-black/30 flex items-center justify-c
