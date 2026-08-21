export const dynamic = 'force-dynamic';
import { getHRMSUser, getEmployeeSettingsData, updateEmployeeSettingsData } from '@/lib/actions/hrms-actions';
import { User, Phone, Moon, Save } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function EmployeeSettingsPage() {
  const user = await getHRMSUser();
  const settings = await getEmployeeSettingsData(user._id);

  async function handleSaveSettings(formData: FormData) {
    'use server';
    const contactName = String(formData.get('contactName') || '');
    const contactPhone = String(formData.get('contactPhone') || '');
    const contactRelation = String(formData.get('contactRelation') || '');
    const themePreference = (formData.get('themePreference') as any) || 'SYSTEM';

    await updateEmployeeSettingsData(user._id, {
      emergencyContact: { name: contactName, phone: contactPhone, relation: contactRelation },
      themePreference
    });

    revalidatePath('/hrms/employee/settings');
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Isolated Role Settings</span>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <span>Personal Employee Profile & Preferences</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">
            STRICTLY ISOLATED
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Route: <code className="bg-slate-900 text-blue-400 px-2 py-0.5 rounded">/hrms/employee/settings</code> | Personal profile updates, emergency contacts, UI themes.
        </p>
      </div>

      <form action={handleSaveSettings} className="space-y-6">
        {/* 1. Emergency Contact Management */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Emergency Contact Management</h2>
              <p className="text-xs text-slate-400">Primary point of contact for emergency situations</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Contact Full Name</label>
              <input
                type="text"
                name="contactName"
                defaultValue={settings?.emergencyContact?.name || 'Sarah Mercer'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                name="contactPhone"
                defaultValue={settings?.emergencyContact?.phone || '+1 555-0192'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Relationship</label>
              <input
                type="text"
                name="contactRelation"
                defaultValue={settings?.emergencyContact?.relation || 'Spouse'}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* 2. UI Theme Preferences */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">UI Theme Preferences</h2>
              <p className="text-xs text-slate-400">Customize dashboard visual theme</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs pt-2">
            <label className="bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer flex items-center space-x-3">
              <input
                type="radio"
                name="themePreference"
                value="DARK"
                defaultChecked={settings?.themePreference === 'DARK'}
                className="text-blue-600"
              />
              <span className="font-semibold text-white">Dark Mode</span>
            </label>

            <label className="bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer flex items-center space-x-3">
              <input
                type="radio"
                name="themePreference"
                value="LIGHT"
                defaultChecked={settings?.themePreference === 'LIGHT'}
                className="text-blue-600"
              />
              <span className="font-semibold text-white">Light Mode</span>
            </label>

            <label className="bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer flex items-center space-x-3">
              <input
                type="radio"
                name="themePreference"
                value="SYSTEM"
                defaultChecked={settings?.themePreference === 'SYSTEM' || !settings?.themePreference}
                className="text-blue-600"
              />
              <span className="font-semibold text-white">System Default</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Employee Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
