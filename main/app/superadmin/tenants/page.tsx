export const dynamic = 'force-dynamic';
import { getTenantsList } from '@/lib/actions/hrms-actions';
import { Building2, MapPin, Shield, Building } from 'lucide-react';
import { TenantManagerModal } from '@/components/hrms/tenant-manager-modal';

export default async function SuperAdminTenantsPage() {
  const tenants = await getTenantsList();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Tenants & Office Geofencing Setup</h1>
          <p className="text-xs text-slate-400">Configure client organizations, HR Admins, and office Lat/Lng coordinates for 100m radius validation</p>
        </div>
        <TenantManagerModal />
      </div>

      {tenants.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-dashed border-slate-800 rounded-2xl space-y-4">
          <Building className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No organizations provisioned</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your client company tenant, configure 100m geofencing coordinates, and assign the lead HR Admin.
            </p>
          </div>
          <div className="pt-2">
            <TenantManagerModal />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tenants.map((t: any) => (
            <div key={t._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">{t.name}</h2>
                  <p className="text-xs text-slate-400 font-mono">Domain: {t.domain}</p>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
                  ACTIVE TENANT
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Latitude</span>
                  <p className="text-sm font-semibold text-white">{t.officeCoordinates?.latitude}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Longitude</span>
                  <p className="text-sm font-semibold text-white">{t.officeCoordinates?.longitude}</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Geofence Radius</span>
                  <p className="text-sm font-semibold text-emerald-400">{t.officeCoordinates?.radiusMeters || 100}m</p>
                </div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Assigned HR Admin:</span>
                <span className="text-white font-semibold">{t.hrAdminId?.name || t.hrAdminId?.email || 'None'} ({t.hrAdminId?.email})</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

