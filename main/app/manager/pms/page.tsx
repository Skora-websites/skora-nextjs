import { getProjects, getTasks, getHRMSUser } from '@/lib/actions/hrms-actions';
import { TaskStatusSelect } from '@/components/hrms/task-status-select';
import { FolderKanban } from 'lucide-react';

const COLUMNS: { key: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'; label: string; color: string }[] = [
  { key: 'TODO', label: 'Backlog / To Do', color: 'text-slate-400' },
  { key: 'IN_PROGRESS', label: 'In Progress', color: 'text-blue-400' },
  { key: 'REVIEW', label: 'Review', color: 'text-amber-400' },
  { key: 'DONE', label: 'Completed', color: 'text-emerald-400' },
];

export default async function ManagerPMSPage() {
  const user = await getHRMSUser();
  if (!user) return null;
  const [projects, tasks] = await Promise.all([getProjects(), getTasks()]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">Project PMS & Kanban Execution</h1>
        <p className="text-xs text-slate-400">{projects.length} project(s), {tasks.length} task(s) in your tenant</p>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
          <FolderKanban className="w-8 h-8 mx-auto mb-2 text-slate-700" />
          No tasks yet. Use the Employees page to create one, or seed the database.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t: any) => t.status === col.key);
            return (
              <div key={col.key} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <h3 className={`font-bold uppercase text-[11px] tracking-wider ${col.color}`}>
                  {col.label} ({colTasks.length})
                </h3>
                {colTasks.map((t: any) => (
                  <div key={t._id} className={`bg-slate-900 border p-3 rounded-lg space-y-1 ${
                    col.key === 'IN_PROGRESS' ? 'border-blue-500/30' :
                    col.key === 'DONE' ? 'border-emerald-500/30' :
                    col.key === 'REVIEW' ? 'border-amber-500/30' : 'border-slate-800'
                  }`}>
                    <p className="font-semibold text-white">{t.title}</p>
                    <p className="text-[11px] text-slate-400">
                      Project: {t.projectId?.name ?? '—'} | Assignee: {t.assigneeId?.name ?? '—'}
                    </p>
                    {t.estimatedHours ? (
                      <p className="text-[11px] text-slate-400">Est: {t.estimatedHours}h | Logged: {t.loggedHours ?? 0}h</p>
                    ) : null}
                    <div className="pt-1">
                      <TaskStatusSelect taskId={String(t._id)} current={t.status} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
