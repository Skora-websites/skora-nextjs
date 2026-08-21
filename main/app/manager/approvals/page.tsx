export const dynamic = 'force-dynamic';
import { CheckSquare, Clock, HeartHandshake } from 'lucide-react';

export default function ManagerApprovalsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Manager Approval Center & Team Roster</h1>
        <p className="text-xs text-slate-400">Approve or reject team leave requests (with Half-Day Morning/Afternoon option), Regularization, and Overtime past 7:00 PM</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <span className="font-bold text-white text-sm">Alex Mercer</span>
              <span className="text-slate-400 ml-2 font-mono">(EMP-2026-0042)</span>
            </div>
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded font-mono font-semibold">
              CASUAL LEAVE (HALF-DAY MORNING SESSION)
            </span>
          </div>
          <p className="text-slate-300">Requested Date: 2026-08-25 | Reason: Medical appointment in the morning.</p>
          <div className="flex items-center space-x-2 pt-1">
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded">
              Approve Half-Day Leave
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-1.5 rounded">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
