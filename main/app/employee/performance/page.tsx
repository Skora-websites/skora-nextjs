export const dynamic = 'force-dynamic';
import { BarChart3, Award } from 'lucide-react';

export default function EmployeePerformancePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">My Performance & KPI Analytics</h1>
        <p className="text-xs text-slate-400">View your individual performance charts, task efficiency metrics, and punctuality record</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">On-Time Punch Ratio</span>
            <p className="text-xl font-black text-emerald-400">98.5%</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Task Completion Speed</span>
            <p className="text-xl font-black text-blue-400">1.2x Faster</p>
          </div>
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Overall KPI Score</span>
            <p className="text-xl font-black text-purple-400">4.9 / 5.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
