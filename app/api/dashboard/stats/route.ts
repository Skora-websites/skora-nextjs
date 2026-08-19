import { apiRoute, toISO } from "@/lib/api-utils";
import { leadsService, dealsService, activitiesService, tasksService } from "@/lib/firestore";
import { hrmUsersService } from "@/lib/hrm/firestore";

// ── Helpers ────────────────────────────────────────────

function capitalize(str: string): string {
  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ── Route ──────────────────────────────────────────────

export const GET = apiRoute(async ({ role, userId }) => {
  // ── Role-based data fetching ─────────────────────────
  const isEmployee = role === "employee";
  const tenantId = "default";

  const [allLeads, allDeals, recentActivities, upcomingTasks, allEmployees] = await Promise.all([
    isEmployee ? Promise.resolve([]) : leadsService.findMany(),
    isEmployee ? Promise.resolve([]) : dealsService.findMany(),
    isEmployee ? Promise.resolve([]) : activitiesService.findMany({
      orderByField: "createdAt",
      orderByDirection: "desc",
      limitCount: 10,
    }),
    tasksService
      .findMany({
        orderByField: "dueDate",
        orderByDirection: "asc",
        limitCount: 20,
      })
      .then((all) => {
        const filtered = isEmployee && userId ? all.filter((t) => t.assigneeId === userId) : all;
        return filtered.filter((t) => t.status !== "completed").slice(0, 10);
      }),
    isEmployee ? Promise.resolve([]) : hrmUsersService.findManyInTenant(tenantId),
  ]);

  // ── Compute Stats ──────────────────────────────────

  const totalRevenue = isEmployee
    ? 0
    : allDeals
        .filter((d) => d.stage === "closed_won")
        .reduce((sum, d) => sum + d.value, 0);

  const activeLeadsCount = isEmployee
    ? 0
    : allLeads.filter((l) => l.status !== "won" && l.status !== "lost").length;

  const wonDealsCount = isEmployee
    ? 0
    : allDeals.filter((d) => d.stage === "closed_won").length;

  const conversionRate = isEmployee
    ? 0
    : allLeads.length > 0
      ? Math.round(
          (allLeads.filter((l) => l.status === "won").length / allLeads.length) * 100 * 10
        ) / 10
      : 0;

  // ── Employee Stats ─────────────────────────────────
  const totalEmployees = allEmployees.length;
  const activeEmployees = allEmployees.filter((e: any) => e.status === "active").length;
  const probationEmployees = allEmployees.filter((e: any) => e.status === "probation").length;
  const newHiresThisMonth = allEmployees.filter((e: any) => {
    if (!e.joiningDate) return false;
    const joinDate = e.joiningDate instanceof Date ? e.joiningDate : new Date(e.joiningDate);
    const now = new Date();
    return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear();
  }).length;

  // ── Monthly Aggregation ──────────────────────────────

  const currentYear = new Date().getFullYear();
  const monthlyRevenue: number[] = new Array(12).fill(0);
  const monthlyLeads: number[] = new Array(12).fill(0);

  if (!isEmployee) {
    for (const deal of allDeals) {
      if (deal.stage === "closed_won" && deal.createdAt.getFullYear() === currentYear) {
        monthlyRevenue[deal.createdAt.getMonth()] += deal.value;
      }
    }

    for (const lead of allLeads) {
      if (lead.createdAt.getFullYear() === currentYear) {
        monthlyLeads[lead.createdAt.getMonth()] += 1;
      }
    }
  }

  // ── Leads by Source ────────────────────────────────

  const leadsBySource = isEmployee
    ? []
    : Array.from(
        allLeads.reduce((map, lead) => {
          const source = lead.source || "other";
          map.set(source, (map.get(source) || 0) + 1);
          return map;
        }, new Map<string, number>())
      )
        .map(([name, value]) => ({ name: capitalize(name), value }))
        .sort((a, b) => b.value - a.value);

  // ── Deals by Stage ────────────────────────────────

  const stageNames: Record<string, string> = {
    lead: "Lead In",
    qualified: "Qualified",
    proposal: "Proposal",
    negotiation: "Negotiation",
    closed_won: "Closed Won",
    closed_lost: "Closed Lost",
  };
  const stageOrder = ["Lead In", "Qualified", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

  const dealsByStage = isEmployee
    ? stageOrder.map((name) => ({ name, value: 0, amount: 0 }))
    : (() => {
        const stageMap = new Map<string, { value: number; amount: number }>();
        for (const deal of allDeals) {
          const existing = stageMap.get(deal.stage) || { value: 0, amount: 0 };
          existing.value += 1;
          existing.amount += deal.value;
          stageMap.set(deal.stage, existing);
        }
        return stageOrder.map((name) => {
          const stageKey = Object.entries(stageNames).find(([, v]) => v === name)?.[0];
          const data = stageKey ? stageMap.get(stageKey) : undefined;
          return { name, value: data?.value || 0, amount: data?.amount || 0 };
        });
      })();

  // ── Map Activities & Tasks ─────────────────────────

  const recentActivitiesData = recentActivities.map((a) => ({
    id: a.id,
    type: a.type,
    title: a.title,
    description: a.description || "",
    user: "",
    relatedTo: a.relatedTo || undefined,
    relatedType: a.relatedType as "lead" | "customer" | "contact" | "deal" | undefined,
    createdAt: toISO(a.createdAt),
  }));

  const upcomingTasksData = upcomingTasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    assignee: "",
    dueDate: toISO(t.dueDate),
    relatedTo: t.relatedTo,
    createdAt: toISO(t.createdAt),
  }));

  return {
    totalRevenue,
    activeLeads: activeLeadsCount,
    wonDeals: wonDealsCount,
    conversionRate,
    monthlyRevenue,
    monthlyLeads,
    leadsBySource,
    dealsByStage,
    recentActivities: recentActivitiesData,
    upcomingTasks: upcomingTasksData,
    totalEmployees,
    activeEmployees,
    probationEmployees,
    newHiresThisMonth,
    ...(isEmployee && {
      myTasks: upcomingTasksData.length,
    }),
  };
});
