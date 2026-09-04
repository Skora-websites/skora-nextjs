'use client';
import { useTransition } from 'react';
import { updateTaskStatus } from '@/lib/actions/hrms-actions';
import { useRouter } from 'next/navigation';

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export function TaskStatusSelect({ taskId, current }: { taskId: string; current: TaskStatus }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <select
      aria-label="Task status"
      disabled={pending}
      defaultValue={current}
      onChange={(e) => {
        const next = e.target.value as TaskStatus;
        start(async () => {
          await updateTaskStatus({ taskId, status: next });
          router.refresh();
        });
      }}
      className="bg-slate-900 border border-slate-800 text-[10px] text-slate-200 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
    >
      <option value="TODO">To Do</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="REVIEW">Review</option>
      <option value="DONE">Done</option>
    </select>
  );
}
