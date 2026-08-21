export const dynamic = 'force-dynamic';
import { CheckSquare, Play, Clock } from 'lucide-react';

export default function EmployeeTasksPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">My Tasks & Execution Board</h1>
        <p className="text-xs text-slate-400">View tasks delegated by your Manager (Marcus Brody), track task timers and log daily hours</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="space-y-3 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider font-mono">IN PROGRESS</span>
              <p className="font-semibold text-white text-sm mt-0.5">Implement Haversine Geofence Punching</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Project: Next.js Enterprise HRMS Portal | Est: 8.0h | Logged: 4.5h</p>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg flex items-center space-x-1">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Task Timer</span>
            </button>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider font-mono">TODO</span>
              <p className="font-semibold text-white text-sm mt-0.5">48h Onboarding Re-upload Countdown</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Project: Next.js Enterprise HRMS Portal | Est: 6.0h | Logged: 3.0h</p>
            </div>
            <button className="bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold px-4 py-2 rounded-lg flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Log Manual Hours</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
