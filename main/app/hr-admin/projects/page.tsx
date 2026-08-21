export const dynamic = 'force-dynamic';
import { FolderKanban, Plus } from 'lucide-react';

export default function HRAdminProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Project & Budget Setup</h1>
        <p className="text-xs text-slate-400">Create company projects, assign client budgets, and allocate Project Managers</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider font-mono">ACTIVE PROJECT</span>
            <h3 className="text-base font-bold text-white">Next.js Enterprise HRMS Portal</h3>
            <p className="text-xs text-slate-400">Client Budget: <span className="text-white font-mono font-bold">$45,000</span></p>
            <p className="text-xs text-slate-400">Assigned Manager: <span className="text-indigo-300 font-semibold">Marcus Brody</span></p>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
            <span className="text-[10px] text-blue-400 uppercase font-bold tracking-wider font-mono">PLANNING PHASE</span>
            <h3 className="text-base font-bold text-white">Healthcare Mobile Companion App</h3>
            <p className="text-xs text-slate-400">Client Budget: <span className="text-white font-mono font-bold">$60,000</span></p>
            <p className="text-xs text-slate-400">Assigned Manager: <span className="text-indigo-300 font-semibold">Marcus Brody</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
