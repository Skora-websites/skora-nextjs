import { HRMSSidebar } from '@/components/hrms/hrms-sidebar';
import { getHRMSUser } from '@/lib/actions/hrms-actions';

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const user = await getHRMSUser();
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HRMSSidebar role="EMPLOYEE" currentEmail={user?.email ?? ''} />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
