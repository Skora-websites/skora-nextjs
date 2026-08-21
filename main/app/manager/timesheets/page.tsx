export const dynamic = 'force-dynamic';
import { Clock, Lock } from 'lucide-react';

export default function ManagerTimesheetsPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Timesheet Review & Locking</h1>
        <p className="text-xs text-slate-400">Review task hours logged by team members, lock timesheets, and route them to HR Admin for payroll processing</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Employee</th>
                <th className="p-3">Project & Task</th>
                <th className="p-3">Logged Hours</th>
                <th className="p-3">Overtime</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              <tr>
                <td className="p-3 font-sans font-semibold text-white">Alex Mercer</td>
                <td className="p-3 font-sans text-slate-300">HRMS Portal (Geofence Module)</td>
                <td className="p-3 font-bold text-emerald-400">42.5 hrs / wk</td>
                <td className="p-3 text-purple-400">1.5 hrs OT</td>
                <td className="p-3"><span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-sans text-[10px] font-bold">READY FOR HR LOCK</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
