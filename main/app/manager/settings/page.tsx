export const dynamic = 'force-dynamic';
import { getHRMSUser, getManagerSettingsData, updateManagerSettingsData } from '@/lib/actions/hrms-actions';
import { Bell, Zap, LayoutGrid, Save } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function ManagerSettingsPage() {
  const user = await getHRMSUser();
  const settings = await getManagerSettingsData(user._id);

  async function handleSaveSettings(formData: FormData) {
    'use server';
    const overtimeNotificationsEnabled = formData.get('overtimeNotificationsEnabled') === 'on';
    const autoTaskAssignment = formData.get('autoTaskAssignment') === 'on';
    const metricLayout = (formData.get('metricLayout') as any) || 'KANBAN_FIRST';

    await updateManagerSettingsData(user._id, {
      overtimeNotificationsEnabled,
      autoTaskAssignment,
      metricLayout
    });

    revalidatePath('/hrms/manager/settings');
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Isolated Role Settings</span>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <span>Manager Dashboard & Team Settings</span>
          <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-mono">
            STRICTLY ISOLATED
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Route: <code className="bg-slate-900 text-blue-400 px-2 py-0.5 rounded">/hrms/manager/settings</code> | Overtime notification alerts, task auto-assignment, metric view layouts.
        </p>
      </div>

      <form action={handleSaveSettings} className="space-y-6">
        {/* 1. Overtime Request Notifications */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Overtime Request Alerts</h2>
              <p className="text-xs text-slate-400">Receive instant alerts when employees log hours past 7:00 PM</p>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-3 bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer text-xs">
              <input
                type="checkbox"
                name="overtimeNotificationsEnabled"
                defaultChecked={settings?.overtimeNotificationsEnabled}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
              />
              <div>
                <p className="font-semibold text-white">Enable Overtime Approval Alerts</p>
                <p className="text-slate-400 text-[11px]">Receive email & push notifications for pending overtime requests</p>
              </div>
            </label>
          </div>
        </div>

        {/* 2. Auto-Assignment Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Auto-Assignment Rules</h2>
              <p className="text-xs text-slate-400">Automatically assign recurring sprint tasks to available team members</p>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center space-x-3 bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer text-xs">
              <input
                type="checkbox"
                name="autoTaskAssignment"
                defaultChecked={settings?.autoTaskAssignment}
                className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
              />
              <div>
                <p className="font-semibold text-white">Enable Auto Task Balancing</p>
                <p className="text-slate-400 text-[11px]">Distribute unassigned sprint backlog tasks based on current logged workload</p>
              </div>
            </label>
          </div>
        </div>

        {/* 3. Metric Layout Toggles */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-600/10 text-purple-400 rounded-xl border border-purple-500/20">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Dashboard Metric View Preference</h2>
              <p className="text-xs text-slate-400">Choose primary view format for PMS project tracking</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs pt-2">
            <label className="bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer flex items-center space-x-3">
              <input
                type="radio"
                name="metricLayout"
                value="KANBAN_FIRST"
                defaultChecked={settings?.metricLayout === 'KANBAN_FIRST'}
                className="text-blue-600"
              />
              <div>
                <p className="font-semibold text-white">Kanban Board First</p>
                <p className="text-slate-400 text-[11px]">Show status columns (To Do, In Progress, Done)</p>
              </div>
            </label>

            <label className="bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer flex items-center space-x-3">
              <input
                type="radio"
                name="metricLayout"
                value="GANTT_FIRST"
                defaultChecked={settings?.metricLayout === 'GANTT_FIRST'}
                className="text-blue-600"
              />
              <div>
                <p className="font-semibold text-white">Gantt Chart First</p>
                <p className="text-slate-400 text-[11px]">Show timeline & milestone dependencies</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Manager Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
