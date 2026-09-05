import { redirect } from 'next/navigation';
import { HRMSSidebar } from '@/components/hrms/hrms-sidebar';
import { getHRMSUser } from '@/lib/actions/hrms-actions';
import { mapFirebaseRoleToHRMS, type HRMSRole } from '@/lib/hrms-roles';

const ALLOWED: HRMSRole[] = ['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER', 'EMPLOYEE'];

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await getHRMSUser();
  } catch {
    redirect('/hrms/login');
  }

  const hrmsRole = mapFirebaseRoleToHRMS(user?.role);
  if (!ALLOWED.includes(hrmsRole)) {
    redirect('/hrms/login');
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HRMSSidebar role="EMPLOYEE" currentEmail={user.email} currentName={user.name} hrmsRole={hrmsRole} />
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
