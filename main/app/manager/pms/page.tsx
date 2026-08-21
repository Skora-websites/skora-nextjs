export const dynamic = 'force-dynamic';
import { FolderKanban, CheckSquare, Plus } from 'lucide-react';

export default function ManagerPMSPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Project PMS & Kanban Execution</h1>
        <p className="text-xs text-slate-400">Delegate sprint tasks, set estimated hours, and track team execution progress</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="font-bold text-slate-400 uppercase text-[11px] tracking-wider">Backlog / To Do</h3>
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-1">
              <p className="font-semibold text-white">Write Haversine Unit Tests</p>
              <p className="text-[11px] text-slate-400">Assignee: Alex Mercer | Est: 4h</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="font-bold text-blue-400 uppercase text-[11px] tracking-wider">In Progress</h3>
            <div className="bg-slate-900 border border-blue-500/30 p-3 rounded-lg space-y-1">
              <p className="font-semibold text-white">Implement 48h Countdown Escalation</p>
              <p className="text-[11px] text-slate-400">Assignee: Alex Mercer | Est: 8h</p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
            <h3 className="font-bold text-emerald-400 uppercase text-[11px] tracking-wider">Completed / Review</h3>
            <div className="bg-slate-900 border border-emerald-500/30 p-3 rounded-lg space-y-1">
              <p className="font-semibold text-white">Setup Mongoose Schemas with Isolated Settings</p>
              <p className="text-[11px] text-slate-400">Logged: 12h | Done</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
