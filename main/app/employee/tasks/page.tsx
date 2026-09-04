import { getHRMSUser, getTasks, toggleTaskTimer, logTimesheet } from '@/lib/actions/hrms-actions';
import { TaskStatusSelect } from '@/components/hrms/task-status-select';
import { CheckSquare, Play, Pause, Clock } from 'lucide-react';
import { revalidatePath } from 'next/cache';

const STATUS_LABEL: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
};

export default async function EmployeeTasksPage() {
  const user = await getHRMSUser();
  if (!user) return null;
  const tasks = await getTasks();

  async function handleToggle(taskId: string) {
    'use server';
    await toggleTaskTimer(taskId);
    revalidatePath('/hrms/employee/tasks');
  }

  async function handleLog(formData: FormData) {
    'use server';
    const taskId = String(formData.get('taskId'));
    const hours = Number(formData.get('hours') || 0);
    const description = String(formData.get('description') || '');
    if (hours <= 0 || !taskId) return;
    await logTimesheet({ userId: user.id, projectId: String(formData.get('projectId')), taskId, hours, description });
    revalidatePath('/hrms/employee/tasks');
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-xl font-bold text-white">My Tasks & Execution Board</h1>
        <p className="text-xs text-slate-400">{tasks.length} task(s) assigned to you</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        {tasks.length === 0 ? (
          <p className="text-xs text-slate-500 italic flex items-center gap-2">
            <CheckSquare className="w-4 h-4" /> No tasks assigned yet. Your manager will delegate work here.
          </p>
        ) : (
          <div className="space-y-3 text-xs">
            {tasks.map((t: any) => (
              <div key={t._id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider font-mono ${
                      t.status === 'DONE' ? 'text-emerald-400' :
                      t.status === 'IN_PROGRESS' ? 'text-blue-400' :
                      t.status === 'REVIEW' ? 'text-amber-400' : 'text-purple-400'
                    }`}>
                      {STATUS_LABEL[t.status] ?? t.status}
                      {t.timerActive ? ' · TIMER RUNNING' : ''}
                    </span>
                    <p className="font-semibold text-white text-sm mt-0.5">{t.title}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Project: {t.projectId?.name ?? '—'} | Est: {t.estimatedHours ?? 0}h | Logged: {t.loggedHours ?? 0}h
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <TaskStatusSelect taskId={String(t._id)} current={t.status} />
                    <form action={handleToggle.bind(null, String(t._id))}>
                      <button type="submit" className={`px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1 ${
                        t.timerActive ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      }`}>
                        {t.timerActive ? <><Pause className="w-3.5 h-3.5" /><span>Stop Timer</span></> : <><Play className="w-3.5 h-3.5" /><span>Start Timer</span></>}
                      </button>
                    </form>
                  </div>
                </div>
                <form action={handleLog} className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60">
                  <input type="hidden" name="taskId" value={String(t._id)} />
                  <input type="hidden" name="projectId" value={String(t.projectId?._id ?? t.projectId)} />
                  <input name="description" placeholder="What did you work on?" className="md:col-span-2 bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-white" />
                  <input name="hours" type="number" step="0.5" min="0.5" max="24" placeholder="Hours" className="bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-white font-mono" />
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded px-3 py-1.5 flex items-center justify-center gap-1">
                    <Clock className="w-3.5 h-3.5" /><span>Log</span>
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
