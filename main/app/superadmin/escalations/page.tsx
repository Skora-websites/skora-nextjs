export const dynamic = 'force-dynamic';
import { getSuperAdminEscalations } from '@/lib/actions/hrms-actions';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default async function SuperAdminEscalationsPage() {
  const { users: escalatedUsers } = await getSuperAdminEscalations();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Onboarding Document Escalations Queue</h1>
        <p className="text-xs text-slate-400">Employees who failed to re-upload corrected compliance documents within the 48-hour deadline</p>
      </div>

      <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-6 shadow-xl space-y-4">
        {escalatedUsers.length === 0 ? (
          <div className="text-center p-6 text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-bold text-white text-sm">No Active Document Escalations</p>
            <p>All employee re-upload timers are within compliance parameters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {escalatedUsers.map((u: any) => (
              <div key={u._id} className="bg-slate-950 border border-rose-800/60 p-4 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white text-sm">{u.name}</p>
                  <p className="text-slate-400 font-mono">Email: {u.email} | Dept: {u.department}</p>
                </div>
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold px-3 py-1 rounded font-mono">
                  48H DEADLINE EXPIRED
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
