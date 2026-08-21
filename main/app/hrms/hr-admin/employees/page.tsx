import { getAllHRMSUsers, getHRMSUser, createEmployee } from '@/lib/actions/hrms-actions';
import { Users, Plus, UserPlus, Shield, Building2, DollarSign } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function HRAdminEmployeesPage() {
  const hrUser = await getHRMSUser();
  const employees = await getAllHRMSUsers();

  async function handleAddEmployeeAction(formData: FormData) {
    'use server';
    const name = String(formData.get('name') || '');
    const email = String(formData.get('email') || '');
    const department = String(formData.get('department') || 'General');
    const role = (formData.get('role') as any) || 'EMPLOYEE';
    const baseSalary = Number(formData.get('baseSalary') || 50000);
    const reportingManagerId = String(formData.get('reportingManagerId') || '');

    if (name && email) {
      await createEmployee({
        name,
        email,
        department,
        role,
        baseSalary,
        reportingManagerId: reportingManagerId || undefined,
        tenantId: hrUser.tenantId?._id,
      });
      revalidatePath('/hrms/hr-admin/employees');
      revalidatePath('/hrms/hr-admin');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Employee Directory</h1>
          <p className="text-xs text-slate-400">View and manage company employee records, roles, reporting managers and departments</p>
        </div>
        <span className="text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full font-bold">
          Total: {employees.length} Employees
        </span>
      </div>

      {/* Add Employee Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Add New Employee</h2>
            <p className="text-xs text-slate-400">Manually add an employee. They will receive a pending onboarding status until documents are verified.</p>
          </div>
        </div>

        <form action={handleAddEmployeeAction} className="space-y-3 text-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. John Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="john@skorabiz.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Department</label>
              <select name="department" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white">
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Finance">Finance</option>
                <option value="Operations">Operations</option>
                <option value="General">General</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Role</label>
              <select name="role" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white">
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Base Salary ($/yr)</label>
              <input
                type="number"
                name="baseSalary"
                defaultValue={50000}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Reporting Manager (Employee Code)</label>
              <input
                type="text"
                name="reportingManagerId"
                placeholder="Leave empty if none"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow flex items-center space-x-2 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Employee & Generate Code</span>
          </button>
        </form>
      </div>

      {/* Employee Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-white">All Employees</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="p-3">Employee Code</th>
                <th className="p-3">Name & Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Department</th>
                <th className="p-3">Base Salary</th>
                <th className="p-3">Onboarding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-slate-500 italic">
                    No employees found. Add your first employee above.
                  </td>
                </tr>
              ) : (
                employees.map((emp: any) => (
                  <tr key={emp._id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-blue-400 font-mono">{emp.employeeCode || 'PENDING'}</td>
                    <td className="p-3 font-sans font-semibold text-white">{emp.name} <span className="text-slate-400 font-normal">({emp.email})</span></td>
                    <td className="p-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        emp.role === 'SUPER_ADMIN' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        emp.role === 'HR_ADMIN' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        emp.role === 'MANAGER' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400 font-sans">{emp.department}</td>
                    <td className="p-3 text-emerald-400 font-bold font-mono">${(emp.baseSalary || 0).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                        emp.onboardingStatus === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        emp.onboardingStatus === 'PENDING_REVIEW' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        emp.onboardingStatus === 'REJECTED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {emp.onboardingStatus}
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
