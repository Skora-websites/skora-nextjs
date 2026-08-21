export const dynamic = 'force-dynamic';
import { getSuperAdminSettingsData, updateSuperAdminSettingsData } from '@/lib/actions/hrms-actions';
import { Shield, Key, RefreshCw, Save, CheckCircle2 } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function SuperAdminSettingsPage() {
  const settings = await getSuperAdminSettingsData();

  async function handleSaveSettings(formData: FormData) {
    'use server';
    const mfaEnforced = formData.get('mfaEnforced') === 'on';
    const sessionTimeoutMinutes = Number(formData.get('sessionTimeoutMinutes') || 60);
    const geolocationProviderKey = String(formData.get('geolocationProviderKey') || '');
    const paymentGatewayKey = String(formData.get('paymentGatewayKey') || '');
    const autoProvision = formData.get('autoProvision') === 'on';
    const syncIntervalHours = Number(formData.get('syncIntervalHours') || 24);

    await updateSuperAdminSettingsData({
      globalSecurityPolicy: { mfaEnforced, sessionTimeoutMinutes },
      apiKeys: { geolocationProviderKey, paymentGatewayKey },
      firebaseAuthSync: { autoProvision, syncIntervalHours }
    });

    revalidatePath('/hrms/superadmin/settings');
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Isolated Role Settings</span>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <span>Super Admin Security & Infrastructure Settings</span>
          <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded font-mono">
            STRICTLY ISOLATED
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Route: <code className="bg-slate-900 text-blue-400 px-2 py-0.5 rounded">/hrms/superadmin/settings</code> | Configures platform security, API keys & Firebase sync.
        </p>
      </div>

      <form action={handleSaveSettings} className="space-y-6">
        {/* 1. Global Platform Security */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Global Platform Security Policy</h2>
              <p className="text-xs text-slate-400">Configure multi-factor authentication & session timeout policies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <label className="flex items-center space-x-3 bg-slate-950 border border-slate-800 p-3 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                name="mfaEnforced"
                defaultChecked={settings?.globalSecurityPolicy?.mfaEnforced}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
              />
              <div>
                <p className="font-semibold text-white">Enforce MFA Mandatory</p>
                <p className="text-slate-400 text-[11px]">Require 2FA authentication for all administrative accounts</p>
              </div>
            </label>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
              <label className="block font-semibold text-white">Session Timeout (Minutes)</label>
              <input
                type="number"
                name="sessionTimeoutMinutes"
                defaultValue={settings?.globalSecurityPolicy?.sessionTimeoutMinutes || 60}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. API Keys Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Platform API Key Management</h2>
              <p className="text-xs text-slate-400">Configure Geolocation provider & Payment Gateway API keys</p>
            </div>
          </div>

          <div className="space-y-3 text-xs pt-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Geolocation Provider API Key</label>
              <input
                type="text"
                name="geolocationProviderKey"
                defaultValue={settings?.apiKeys?.geolocationProviderKey || 'GEO_LIVE_99812'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Payment Gateway Secret Key (Payroll Payouts)</label>
              <input
                type="password"
                name="paymentGatewayKey"
                defaultValue={settings?.apiKeys?.paymentGatewayKey || 'PAY_LIVE_00492'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 3. Firebase Auth Sync Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-600/10 text-purple-400 rounded-xl border border-purple-500/20">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Firebase Auth Sync Controls</h2>
              <p className="text-xs text-slate-400">Auto-provision user accounts from Firebase Auth directory</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <label className="flex items-center space-x-3 bg-slate-950 border border-slate-800 p-3 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                name="autoProvision"
                defaultChecked={settings?.firebaseAuthSync?.autoProvision}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
              />
              <div>
                <p className="font-semibold text-white">Auto-Provision Firebase Users</p>
                <p className="text-slate-400 text-[11px]">Sync new registered Firebase users automatically</p>
              </div>
            </label>

            <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl space-y-1">
              <label className="block font-semibold text-white">Sync Interval (Hours)</label>
              <input
                type="number"
                name="syncIntervalHours"
                defaultValue={settings?.firebaseAuthSync?.syncIntervalHours || 24}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Super Admin Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
