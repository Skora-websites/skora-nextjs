import { HRMSSidebar } from '@/components/hrms/hrms-sidebar';

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HRMSSidebar role="SUPER_ADMIN" currentEmail="superadmin@skorabiz.com" />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
