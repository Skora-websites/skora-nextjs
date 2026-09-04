import { getProjects, getHRMSUser, getAllHRMSUsers, createProject } from '@/lib/actions/hrms-actions';
import { FolderKanban, Plus } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function HRAdminProjectsPage() {
  const user = await getHRMSUser();
  if (!user) return null;
  const [projects, allUsers] = await Promise.all([getProjects(), getAllHRMSUsers()]);
  const managers = allUsers.filter((u: any) => u.role === 'MANAGER' || u.role === 'HR_ADMIN');

  async function handleCreate(formData: FormData) {
    'use server';
    const name = String(formData.get('name') || '').trim();
    const clientBudget = Number(formData.get('clientBudget') || 0);
    const description = String(formData.get('description') || '');
    const managerId = String(formData.get('managerId') || user.id);
    if (!name) return;
    await createProject({ name, clientBudget, description, managerId, tenantId: user.tenantId?._id });
    revalidatePath('/hrms/hr-admin/projects');
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Project & Budget Setup</h1>
        <p className="text-xs text-slate-400">{projects.length} project(s) in this tenant</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <details className="bg-slate-950 border border-slate-800 rounded-xl p-4">
          <summary className="cursor-pointer text-xs font-semibold text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create new project
          </summary>
          <form action={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-xs">
            <input name="name" placeholder="Project name" required className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white" />
            <input name="clientBudget" type="number" placeholder="Client budget" defaultValue={0} className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white font-mono" />
            <input name="description" placeholder="Description (optional)" className="md:col-span-2 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white" />
            <select name="managerId" className="md:col-span-2 bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white">
              {managers.length === 0 ? (
                <option value={user.id}>Assign to me</option>
              ) : (
                managers.map((m: any) => (
                  <option key={m.id ?? m._id} value={m.id ?? m._id}>{m.name} ({m.employeeCode ?? m.email})</option>
                ))
              )}
            </select>
            <button type="submit" className="md:col-span-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg">
              Create Project
            </button>
          </form>
        </details>

        {projects.length === 0 ? (
          <p className="text-xs text-slate-500 italic flex items-center gap-2">
            <FolderKanban className="w-4 h-4" /> No projects yet. Use the form above to create one.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((p: any) => (
              <div key={p._id} className={`bg-slate-950 border p-4 rounded-xl space-y-2 ${
                p.status === 'COMPLETED' ? 'border-emerald-800' :
                p.status === 'PLANNING' ? 'border-blue-800' : 'border-slate-800'
              }`}>
                <span className={`text-[10px] uppercase font-bold tracking-wider font-mono ${
                  p.status === 'COMPLETED' ? 'text-emerald-400' :
                  p.status === 'PLANNING' ? 'text-blue-400' : 'text-amber-400'
                }`}>{p.status}</span>
                <h3 className="text-base font-bold text-white">{p.name}</h3>
                <p className="text-xs text-slate-400">Client Budget: <span className="text-white font-mono font-bold">${p.clientBudget?.toLocaleString() ?? 0}</span></p>
                <p className="text-xs text-slate-400">Manager: <span className="text-indigo-300 font-semibold">{p.managerId?.name ?? '—'}</span></p>
                {p.description && <p className="text-xs text-slate-500 pt-1">{p.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
