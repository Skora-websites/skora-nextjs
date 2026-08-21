export const dynamic = 'force-dynamic';
import { getHRAdminSettingsData, updateHRAdminSettingsData } from '@/lib/actions/hrms-actions';
import { Calendar, HeartHandshake, Percent, Save } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function HRAdminSettingsPage() {
  const settings = await getHRAdminSettingsData();

  async function handleSaveSettings(formData: FormData) {
    'use server';
    const sickLeaveQuota = Number(formData.get('sickLeaveQuota') || 12);
    const casualLeaveQuota = Number(formData.get('casualLeaveQuota') || 12);
    const taxRatePercent = Number(formData.get('taxRatePercent') || 10);
    const pfDeductionPercent = Number(formData.get('pfDeductionPercent') || 12);

    await updateHRAdminSettingsData({
      leaveAccrual: { sickLeaveQuota, casualLeaveQuota },
      payrollDeductions: { taxRatePercent, pfDeductionPercent }
    });

    revalidatePath('/hrms/hr-admin/settings');
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">Isolated Role Settings</span>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <span>HR Admin Company-Wide Policy Settings</span>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded font-mono">
            STRICTLY ISOLATED
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Route: <code className="bg-slate-900 text-blue-400 px-2 py-0.5 rounded">/hrms/hr-admin/settings</code> | Company holiday calendar, leave quotas, payroll tax brackets.
        </p>
      </div>

      <form action={handleSaveSettings} className="space-y-6">
        {/* 1. Holiday Calendar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Company Holiday Calendar (2026)</h2>
              <p className="text-xs text-slate-400">Configured official company paid holidays</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
            {(settings?.holidayCalendar || [
              { date: '2026-01-01', name: 'New Year Day' },
              { date: '2026-01-26', name: 'Republic Day' },
              { date: '2026-08-15', name: 'Independence Day' },
              { date: '2026-10-02', name: 'Gandhi Jayanti' }
            ]).map((h: any, idx: number) => (
              <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                <span className="font-semibold text-white">{h.name}</span>
                <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">{h.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Leave Quotas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Sick & Casual Leave Accrual Rules</h2>
              <p className="text-xs text-slate-400">Set annual quota allowances for standard employees</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <label className="block font-semibold text-white">Sick Leave Annual Quota (Days)</label>
              <input
                type="number"
                name="sickLeaveQuota"
                defaultValue={settings?.leaveAccrual?.sickLeaveQuota || 12}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <label className="block font-semibold text-white">Casual Leave Annual Quota (Days)</label>
              <input
                type="number"
                name="casualLeaveQuota"
                defaultValue={settings?.leaveAccrual?.casualLeaveQuota || 12}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* 3. Payroll Deduction Brackets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-600/10 text-purple-400 rounded-xl border border-purple-500/20">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Standard Payroll Deduction Brackets</h2>
              <p className="text-xs text-slate-400">Configure standard tax withholding and PF deduction percentages</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <label className="block font-semibold text-white">Income Tax Withholding (%)</label>
              <input
                type="number"
                name="taxRatePercent"
                defaultValue={settings?.payrollDeductions?.taxRatePercent || 10}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white font-mono"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
              <label className="block font-semibold text-white">Provident Fund Deduction (%)</label>
              <input
                type="number"
                name="pfDeductionPercent"
                defaultValue={settings?.payrollDeductions?.pfDeductionPercent || 12}
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save HR Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
