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
} from "lucide-react";
import Link from "next/link";
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
    <AppShell title="Dashboard">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-h3 text-dark dark:text-white font-bold tracking-tighter">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-muted">
          Overview of your organization&apos;s performance and key metrics
        </p>
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
            title="Active"
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
          <Button variant="outline" size="sm" className="gap-2">
            <ListTodo className="h-4 w-4" />
            Task Management
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
        <Link href="/tickets">
          <Button variant="outline" size="sm" className="gap-2">
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
