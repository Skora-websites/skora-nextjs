import { HRMSSidebar } from '@/components/hrms/hrms-sidebar';
import { getHRMSUser } from '@/lib/actions/hrms-actions';

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getHRMSUser();
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HRMSSidebar role="SUPER_ADMIN" currentEmail={user?.email ?? ''} />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
