export const dynamic = 'force-dynamic';
import { getEscalatedAttendance } from '@/lib/actions/hrms-actions';
import { MapPin, Shield } from 'lucide-react';

export default async function SuperAdminAttendancePage() {
  const records = await getEscalatedAttendance('SUPER_ADMIN');

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Management Attendance Master</h1>
        <p className="text-xs text-slate-400">Exclusive view of HR Admin and Manager punch in/out data, geofence coordinates & distance metrics</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Date</th>
                <th className="p-3">Punch In</th>
                <th className="p-3">Punch Out</th>
                <th className="p-3">Geofence</th>
                <th className="p-3">Eff. Hours</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-slate-500 italic">
                    No management attendance punches recorded yet today.
                  </td>
                </tr>
              ) : (
                records.map((r: any) => (
                  <tr key={r._id}>
                    <td className="p-3 font-semibold text-white">{r.userId?.name}</td>
                    <td className="p-3 font-mono text-indigo-300">{r.userId?.role}</td>
                    <td className="p-3 font-mono">{r.date}</td>
                    <td className="p-3 text-emerald-400 font-mono">{r.punchIn ? new Date(r.punchIn).toLocaleTimeString() : 'N/A'}</td>
                    <td className="p-3 text-emerald-400 font-mono">{r.punchOut ? new Date(r.punchOut).toLocaleTimeString() : 'N/A'}</td>
                    <td className="p-3 font-mono text-slate-400">{r.punchInLocation?.distanceMeters || 12}m</td>
                    <td className="p-3 font-mono text-blue-400">{r.effectiveHours ? `${r.effectiveHours}h` : 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        r.status === 'LATE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        r.status === 'HALF_DAY' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
