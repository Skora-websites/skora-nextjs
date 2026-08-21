export const dynamic = 'force-dynamic';
import { BarChart3 } from 'lucide-react';

export default function ManagerAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">KPI Analytics & Team Performance</h1>
        <p className="text-xs text-slate-400">Track overall team velocity, task completion rate, and individual employee KPI performance metrics</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Team Sprint Velocity</span>
            <p className="text-xl font-black text-blue-400">94.8%</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Punctuality Rate (&lt;10AM)</span>
            <p className="text-xl font-black text-emerald-400">98.2%</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Average Task Estimation Accuracy</span>
            <p className="text-xl font-black text-purple-400">92.0%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
