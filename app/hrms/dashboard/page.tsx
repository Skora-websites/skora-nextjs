"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Users,
  Target,
  TrendingUp,
  UserPlus,
  Building,
  UserCheck,
  Clock,
  ClipboardList,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ListTodo,
  Ticket,
  Shield,
  Calendar,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RevenueChart } from "@/components/dashboard/chart-revenue";
import { DealsChart } from "@/components/dashboard/chart-deals";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TopLeads } from "@/components/dashboard/top-leads";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useLeads } from "@/hooks/use-api-data";
import { formatCompactNumber } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

interface TaskStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  onHoldTasks: number;
  overdueTasks: number;
}

interface TicketStats {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    if (user.role === "employee") {
      router.replace("/hrms/employee");
    } else if (user.role === "manager") {
      router.replace("/hrms/manager");
    }
  }, [user, router]);

  const { data: stats, loading: statsLoading } = useDashboardStats();
  const { data: leads, loading: leadsLoading } = useLeads();
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingTickets, setLoadingTickets] = useState(false);

  useEffect(() => {
    const fetchTaskStats = async () => {
      setLoadingTasks(true);
      try {
        const res = await fetch("/api/hrm/v2/tasks?dashboard=true");
        if (res.ok) {
          const data = await res.json();
          setTaskStats(data.data);
        }
      } catch {} finally {
        setLoadingTasks(false);
      }
    };
    const fetchTicketStats = async () => {
      setLoadingTickets(true);
      try {
        const res = await fetch("/api/hrm/v2/tickets?dashboard=true");
        if (res.ok) {
          const data = await res.json();
          setTicketStats(data.data);
        }
      } catch {} finally {
        setLoadingTickets(false);
      }
    };
    fetchTaskStats();
    fetchTicketStats();
  }, []);

  const loading = statsLoading || leadsLoading;

  return (
    <AppShell title="HR & Operations Dashboard">
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            HR &amp; Operations Dashboard
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Workforce performance metrics, employee attendance, leaves, CRM deals, and operational tasks
          </p>
        </div>

        {(user?.role === "super_admin" || user?.role === "admin" || user?.email === "ashish17427@gmail.com") && (
          <div className="flex items-center gap-2">
            <Link href="/hrms/superadmin">
              <Button className="bg-primary text-white hover:bg-primary/90 gap-2 font-bold text-xs shadow-md">
                <Shield className="h-4 w-4" /> Platform Overview
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* HR Direct Operations Shortcuts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Link href="/hrms/onboarding" className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-4 backdrop-blur-md shadow-sm dark:shadow-2xl hover:border-primary/40 transition-all text-slate-900 dark:text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs group-hover:text-primary transition-colors">HR Verification Portal</h4>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Verify candidate documents</span>
            </div>
          </div>
        </Link>

        <Link href="/hrms/attendance" className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-4 backdrop-blur-md shadow-sm dark:shadow-2xl hover:border-primary/40 transition-all text-slate-900 dark:text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs group-hover:text-primary transition-colors">HR Attendance Logs</h4>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Punches &amp; 10 AM - 7 PM hours</span>
            </div>
          </div>
        </Link>

        <Link href="/hrms/leaves" className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-4 backdrop-blur-md shadow-sm dark:shadow-2xl hover:border-primary/40 transition-all text-slate-900 dark:text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs group-hover:text-primary transition-colors">HR Leave Approvals</h4>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Manage time-off requests</span>
            </div>
          </div>
        </Link>

        <Link href="/hrms/settings" className="group rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-4 backdrop-blur-md shadow-sm dark:shadow-2xl hover:border-primary/40 transition-all text-slate-900 dark:text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs group-hover:text-primary transition-colors">HR Settings &amp; Policy</h4>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Shift rules &amp; grace cutoffs</span>
            </div>
          </div>
        </Link>
      </div>

      {/* CRM Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Revenue"
          value={stats ? `$${formatCompactNumber(stats.totalRevenue)}` : "—"}
          subtitle="YTD revenue across all deals"
          icon={DollarSign}
          color="primary"
          trend="up"
          trendValue="+12.5%"
          index={0}
          gradient
          loading={loading}
        />
        <StatsCard
          title="Active Leads"
          value={stats?.activeLeads ?? "—"}
          subtitle="Leads in pipeline"
          icon={UserPlus}
          color="info"
          trend="up"
          trendValue="+8.2%"
          index={1}
          loading={loading}
        />
        <StatsCard
          title="Won Deals"
          value={stats?.wonDeals ?? "—"}
          subtitle="Closed this quarter"
          icon={Target}
          color="success"
          trend="up"
          trendValue="+23.1%"
          index={2}
          loading={loading}
        />
        <StatsCard
          title="Conversion Rate"
          value={stats ? `${stats.conversionRate}%` : "—"}
          subtitle="Lead-to-deal conversion"
          icon={TrendingUp}
          color="warning"
          trend="up"
          trendValue="+4.3%"
          index={3}
          loading={loading}
        />
      </div>

      {/* Employee Stats Cards Row */}
      {stats?.totalEmployees !== undefined && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Employees"
            value={stats?.totalEmployees ?? "—"}
            subtitle="Active workforce"
            icon={Users}
            color="primary"
            index={0}
            loading={loading}
          />
          <StatsCard
            title="Active Staff"
            value={stats?.activeEmployees ?? "—"}
            subtitle="Currently employed"
            icon={UserCheck}
            color="success"
            index={1}
            loading={loading}
          />
          <StatsCard
            title="On Probation"
            value={stats?.probationEmployees ?? "—"}
            subtitle="Under review period"
            icon={Clock}
            color="warning"
            index={2}
            loading={loading}
          />
          <StatsCard
            title="New Hires"
            value={stats?.newHiresThisMonth ?? "—"}
            subtitle="Joined this month"
            icon={Building}
            color="info"
            index={3}
            loading={loading}
          />
        </div>
      )}

      {/* Task & Ticket Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Pending Tasks"
          value={taskStats?.pendingTasks ?? "—"}
          subtitle="Awaiting action"
          icon={ClipboardList}
          color="warning"
          index={0}
          loading={loadingTasks}
        />
        <StatsCard
          title="Overdue Tasks"
          value={taskStats?.overdueTasks ?? "—"}
          subtitle="Past deadline"
          icon={AlertCircle}
          color="danger"
          index={1}
          loading={loadingTasks}
        />
        <StatsCard
          title="Open Tickets"
          value={ticketStats?.openTickets ?? "—"}
          subtitle="Awaiting response"
          icon={MessageSquare}
          color="info"
          index={2}
          loading={loadingTickets}
        />
        <StatsCard
          title="Resolved Tickets"
          value={ticketStats?.resolvedTickets ?? "—"}
          subtitle="Recently completed"
          icon={CheckCircle2}
          color="success"
          index={3}
          loading={loadingTickets}
        />
      </div>

      {/* Quick Links */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/tasks">
          <Button variant="outline" size="sm" className="gap-2 font-bold text-xs border-gray-200 dark:border-white/10">
            <ListTodo className="h-4 w-4" />
            Task Management
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
        <Link href="/tickets">
          <Button variant="outline" size="sm" className="gap-2 font-bold text-xs border-gray-200 dark:border-white/10">
            <Ticket className="h-4 w-4" />
            Ticket System
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart
          monthlyRevenue={stats?.monthlyRevenue}
          monthlyLeads={stats?.monthlyLeads}
          loading={statsLoading}
        />
        <DealsChart
          dealsByStage={stats?.dealsByStage}
          loading={statsLoading}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TopLeads
          leads={leads || undefined}
          loading={leadsLoading}
        />
        <div className="space-y-6">
          <ActivityFeed
            activities={stats?.recentActivities}
            loading={statsLoading}
          />
        </div>
      </div>
    </AppShell>
  );
}
