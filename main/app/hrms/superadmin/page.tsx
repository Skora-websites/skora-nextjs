import { getHRMSUser, getEscalatedAttendance, getSuperAdminEscalations, getTenantsList } from '@/lib/actions/hrms-actions';
import { Building2, ShieldAlert, MapPin, Users, Settings, Plus, CheckCircle2, Building } from 'lucide-react';
import Link from 'next/link';
import { TenantManagerModal } from '@/components/hrms/tenant-manager-modal';

export default async function SuperAdminDashboardPage() {
  const user = await getHRMSUser();
  const tenants = await getTenantsList();
  const managementAttendance = await getEscalatedAttendance('SUPER_ADMIN');
  const { users: escalatedUsers, documents: escalatedDocs } = await getSuperAdminEscalations();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Global Governance</span>
          <h1 className="text-2xl font-extrabold text-white">Super Admin Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <span className="text-white font-medium">{user.name}</span> | <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-400">/hrms/superadmin</code>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <TenantManagerModal />
          <Link
            href="/hrms/superadmin/settings"
            className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-blue-400" />
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* 1. TOP SECTION: Tenant Management */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Organizations & Assigned HR Admins</h2>
              <p className="text-xs text-slate-400">Manage client organizations, assigned HR Admins, and 100m geofence office locations</p>
            </div>
          </div>
          <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full font-bold">
            Total Tenants: {tenants.length}
          </span>
        </div>

        {tenants.length === 0 ? (
          <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-dashed border-slate-800 space-y-3">
            <Building className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No organizations created yet</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You are starting completely from scratch. Click the button below to provision your first organization and assign an HR Admin.
            </p>
            <div className="pt-2">
              <TenantManagerModal />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tenants.map((t: any) => (
              <div key={t._id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Tenant</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">Active</span>
                </div>
                <div>
                  <p className="text-base font-extrabold text-white">{t.name}</p>
                  <p className="text-xs text-slate-400 font-mono">Domain: {t.domain}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 text-xs space-y-1">
                  <p className="text-slate-400">Geofence Radius: <span className="text-emerald-400 font-bold">{t.officeCoordinates?.radiusMeters || 100}m</span></p>
                  <p className="text-slate-400 font-mono text-[11px]">Coords: {t.officeCoordinates?.latitude}, {t.officeCoordinates?.longitude}</p>
                  <p className="text-slate-400 pt-1">HR Admin: <span className="text-white font-medium">{t.hrAdminId?.name || t.hrAdminId?.email || 'Assigned'}</span></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 2. MIDDLE SECTION: Management Attendance Tracking (Exclusive HR & Manager View) */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Management Attendance Tracking</h2>
            <p className="text-xs text-slate-400">Exclusive view of HR Admin & Manager punch in/out, geofence logs, and regularization requests</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">User & Role</th>
                <th className="p-3">Date</th>
                <th className="p-3">Punch In (Geofence)</th>
                <th className="p-3">Punch Out (Geofence)</th>
                <th className="p-3">Status</th>
                <th className="p-3">Escalation / Overtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {managementAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                    No management attendance punches logged today yet.
                  </td>
                </tr>
              ) : (
                managementAttendance.map((rec: any) => (
                  <tr key={rec._id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-white">
                      {rec.userId?.name} <span className="text-[10px] bg-slate-800 text-indigo-300 px-2 py-0.5 rounded font-mono ml-1">{rec.userId?.role}</span>
                    </td>
                    <td className="p-3 font-mono">{rec.date}</td>
                    <td className="p-3">
                      {rec.punchIn ? (
                        <span className="font-mono text-emerald-400 font-semibold">{new Date(rec.punchIn).toLocaleTimeString()} ({rec.punchInLocation?.distanceMeters || 12}m)</span>
                      ) : (
                        <span className="text-slate-500">Not Punched</span>
                      )}
                    </td>
                    <td className="p-3">
                      {rec.punchOut ? (
                        <span className="font-mono text-emerald-400 font-semibold">{new Date(rec.punchOut).toLocaleTimeString()}</span>
                      ) : (
                        <span className="text-slate-500">Not Punched</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        rec.status === 'PRESENT' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        rec.status === 'LATE' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        rec.status === 'HALF_DAY' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                        'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {rec.status === 'LATE' ? 'LATE (>' + '10:15)' : rec.status === 'HALF_DAY' ? 'HALF DAY' : rec.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {rec.regularizationStatus === 'PENDING' ? (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                          Pending Regularization
                        </span>
                      ) : rec.overtimeHours > 0 ? (
                        <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded text-[10px] font-bold">
                          {rec.overtimeHours}h Pending OT
                        </span>
                      ) : (
                        <span className="text-slate-500">Standard Shift</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. BOTTOM SECTION: Onboarding Escalation Queue (Missed 48-hour document deadline) */}
      <section className="bg-slate-900 border border-rose-900/40 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-rose-600/10 text-rose-400 rounded-xl border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Onboarding Escalation Queue (Missed 48-Hour Deadline)</h2>
            <p className="text-xs text-slate-400">Employees who missed their 48-hour document re-upload window automatically escalate here</p>
          </div>
        </div>

        {escalatedUsers.length === 0 ? (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-200">No Onboarding Escalations</p>
            <p>All employee document re-upload deadlines are currently compliant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {escalatedUsers.map((u: any) => (
              <div key={u._id} className="bg-slate-950 border border-rose-800/50 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{u.name}</h3>
                  <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold px-2 py-0.5 rounded">
                    48H DEADLINE EXPIRED
                  </span>
                </div>
                <p className="text-xs text-slate-400">Email: {u.email} | Department: {u.department}</p>
                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-slate-500 font-mono">Status: ESCALATED_SUPERADMIN</span>
                  <button className="bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold px-3 py-1 rounded">
                    Override & Verify
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
