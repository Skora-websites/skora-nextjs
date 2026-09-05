import { redirect } from 'next/navigation';
import { getHRMSUser } from '@/lib/actions/hrms-actions';
import { getPendingApprovalsForActor } from '@/lib/actions/hrms-actions';
import { mapFirebaseRoleToHRMS } from '@/lib/hrms-roles';
import { Bell, Users, Clock, FileCheck, ShieldAlert, DollarSign, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const TABS = [
  { key: 'all', label: 'All', icon: Bell, types: null as readonly string[] | null },
  { key: 'leaves', label: 'Leaves', icon: Users, types: ['leave'] },
  { key: 'regularization', label: 'Regularization', icon: Clock, types: ['regularization'] },
  { key: 'overtime', label: 'Overtime', icon: Clock, types: ['overtime'] },
  { key: 'onboarding', label: 'Onboarding', icon: FileCheck, types: ['onboarding'] },
  { key: 'escalation', label: 'Escalations', icon: ShieldAlert, types: ['escalation'] },
  { key: 'timesheets', label: 'Timesheets', icon: CheckSquare, types: ['timesheet'] },
  { key: 'payroll', label: 'Payroll', icon: DollarSign, types: ['payroll'] },
] as const;

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams?: { tab?: string };
}) {
  let user;
  try {
    user = await getHRMSUser();
  } catch {
    redirect('/hrms/login');
  }

  const role = mapFirebaseRoleToHRMS(user?.role);
  if (role === 'EMPLOYEE') {
    redirect('/hrms/employee');
  }

  const queue = await getPendingApprovalsForActor();
  const activeTab = (searchParams?.tab ?? 'all') as (typeof TABS)[number]['key'];
  const tab = TABS.find((t) => t.key === activeTab) ?? TABS[0];
  const tabTypes = tab.types as readonly string[] | null;

  const visibleItems =
    tabTypes == null
      ? queue.items
      : queue.items.filter((i) => tabTypes.includes(i.type));

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">Authority Queue</span>
          <h1 className="text-2xl font-extrabold text-white">Approvals Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            {user.name} · <span className="font-mono">{role}</span> · {queue.items.length} item(s) awaiting action
          </p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[10px] font-mono">
          <Pill label="Leaves" v={queue.counts.leaves} />
          <Pill label="Regul." v={queue.counts.regularization} />
          <Pill label="OT" v={queue.counts.overtime} />
          <Pill label="Onboard" v={queue.counts.onboarding} />
          <Pill label="Escal." v={queue.counts.escalations} />
          <Pill label="Timesheet" v={queue.counts.timesheets} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const isActive = t.key === tab.key;
          const Icon = t.icon;
          return (
            <Link
              key={t.key}
              href={`/hrms/approvals?tab=${t.key}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                isActive
                  ? 'bg-blue-600/10 text-blue-300 border-blue-500/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Items */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        {visibleItems.length === 0 ? (
          <div className="p-10 text-center text-slate-500 italic text-sm">
            Nothing in the {tab.label.toLowerCase()} queue. {role === 'SUPER_ADMIN' ? 'All escalations cleared.' : 'You are caught up.'}
          </div>
        ) : (
          <ul className="divide-y divide-slate-800/70">
            {visibleItems.map((item) => (
              <li key={`${item.type}-${item.id}`} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-slate-800/30">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${typeBadge(item.type)}`}>
                      {item.type}
                    </span>
                    <p className="text-sm font-bold text-white truncate">{item.title}</p>
                  </div>
                  {item.subtitle && (
                    <p className="text-xs text-slate-400 mt-1 truncate">{item.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono uppercase text-slate-300 bg-slate-950 border border-slate-800 px-2 py-1 rounded">
                    {item.status}
                  </span>
                  {item.requestedAt && (
                    <span className="text-[10px] font-mono text-slate-500">
                      {new Date(item.requestedAt).toLocaleDateString()}
                    </span>
                  )}
                  <Link
                    href={item.href}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Review →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Pill({ label, v }: { label: string; v: number }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-center">
      <p className="text-[9px] uppercase text-slate-400 tracking-wider">{label}</p>
      <p className={`text-sm font-extrabold ${v > 0 ? 'text-amber-300' : 'text-slate-500'}`}>{v}</p>
    </div>
  );
}

function typeBadge(type: string): string {
  switch (type) {
    case 'leave': return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    case 'regularization': return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    case 'overtime': return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
    case 'onboarding': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    case 'escalation': return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
    case 'timesheet': return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    case 'payroll': return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    default: return 'bg-slate-800 text-slate-300 border-slate-700';
  }
}
