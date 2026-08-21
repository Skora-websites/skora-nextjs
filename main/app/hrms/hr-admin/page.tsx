import { getHRMSUser, runMonthlyPayroll, createProject } from '@/lib/actions/hrms-actions';
import { GeofencedPunchWidget } from '@/components/hrms/geofenced-punch-widget';
import { Users, FileCheck, DollarSign, FolderKanban, Plus, CheckCircle2, Shield } from 'lucide-react';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function HRAdminDashboardPage() {
  const hrUser = await getHRMSUser();

  async function handleRunPayrollAction() {
    'use server';
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();
    await runMonthlyPayroll(month, year);
    revalidatePath('/hrms/hr-admin');
  }

  async function handleCreateProjectAction(formData: FormData) {
    'use server';
    const name = String(formData.get('name') || '');
    const clientBudget = Number(formData.get('clientBudget') || 0);
    const description = String(formData.get('description') || '');
    
    if (name && hrUser) {
      await createProject({
        name,
        clientBudget,
        description,
        managerId: hrUser._id,
        tenantId: hrUser.tenantId?._id
      });
      revalidatePath('/hrms/hr-admin');
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. HEADER BANNER: Personal Profile & Geofenced Punch In/Out */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest">HR Command & Personal Attendance</span>
            <h1 className="text-2xl font-extrabold text-white">HR Admin Management Portal</h1>
            <p className="text-xs text-slate-400 mt-1">
              Logged in as <span className="text-white font-medium">{hrUser.name}</span> ({hrUser.employeeCode}) | Route: <code className="bg-slate-900 px-2 py-0.5 rounded text-blue-400">/hrms/hr-admin</code>
            </p>
          </div>

          <Link
            href="/hrms/hr-admin/settings"
            className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-4 py-2.5 rounded-xl shadow"
          >
            Access Isolated HR Settings
          </Link>
        </div>

        <GeofencedPunchWidget
          userId={hrUser._id}
          userName={hrUser.name}
          userRole={hrUser.role}
        />
      </div>

      {/* Grid Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. HR & Onboarding Module */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Onboarding & Compliance Master</h2>
                <p className="text-xs text-slate-400">Review uploads, Approve (Generates Employee Code) or Reject (Starts 48h timer)</p>
              </div>
            </div>
            <Link
              href="/hrms/hr-admin/onboarding"
              className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-lg shadow"
            >
              Open Onboarding Queue
            </Link>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <span className="font-semibold text-white">Alex Mercer (Software Engineer)</span>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono">PENDING_REVIEW</span>
            </div>
            <p className="text-slate-400">Uploaded: Aadhaar & PAN Card (Firebase Storage)</p>
            <div className="flex items-center space-x-2 pt-1">
              <Link href="/hrms/hr-admin/onboarding" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-center py-1.5 rounded">
                Review & Generate EMP Code
              </Link>
            </div>
          </div>
        </section>

        {/* 3. Project & Budget Setup */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Project & Client Budget Setup</h2>
              <p className="text-xs text-slate-400">Create new projects, set client budget, assign Project Manager</p>
            </div>
          </div>

          <form action={handleCreateProjectAction} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Project Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Next.js Enterprise HRMS Portal"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Client Budget ($)</label>
                <input
                  type="number"
                  name="clientBudget"
                  defaultValue={45000}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Assigned Manager</label>
                <input
                  type="text"
                  disabled
                  value="Marcus Brody (Manager)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg shadow transition-colors"
            >
              Create Project & Set Budget
            </button>
          </form>
        </section>
      </div>

      {/* 4. Payroll Module (End-of-Month Run) */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Payroll Command Module</h2>
              <p className="text-xs text-slate-400">Fetch locked timesheets, calculate PF/Tax deductions, add approved Overtime, payouts</p>
            </div>
          </div>

          <form action={handleRunPayrollAction}>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-2 active:scale-95 transition-all"
            >
              <DollarSign className="w-4 h-4" />
              <span>Run End-of-Month Payroll</span>
            </button>
          </form>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Standard Base Salary</span>
            <p className="text-base font-extrabold text-white">$75,000 / yr</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Approved Overtime Rate</span>
            <p className="text-base font-extrabold text-purple-400">1.5x Hourly Payout</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Payroll Tax & PF Bracket</span>
            <p className="text-base font-extrabold text-slate-300">12% PF | 10% Tax</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Timesheet Requirement</span>
            <p className="text-base font-extrabold text-emerald-400">Manager Lock Required</p>
          </div>
        </div>
      </section>
    </div>
  );
}
