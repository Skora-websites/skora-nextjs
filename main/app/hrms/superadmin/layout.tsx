import { redirect } from 'next/navigation';
import { HRMSSidebar } from '@/components/hrms/hrms-sidebar';
import { getHRMSUser } from '@/lib/actions/hrms-actions';
import { mapFirebaseRoleToHRMS, type HRMSRole } from '@/lib/hrms-roles';

const ALLOWED: HRMSRole[] = ['SUPER_ADMIN'];

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await getHRMSUser();
  } catch {
    redirect('/hrms/login');
  }

  const hrmsRole = mapFirebaseRoleToHRMS(user?.role);
  if (!ALLOWED.includes(hrmsRole)) {
    redirect('/hrms');
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HRMSSidebar role="SUPER_ADMIN" currentEmail={user.email} currentName={user.name} hrmsRole={hrmsRole} />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
