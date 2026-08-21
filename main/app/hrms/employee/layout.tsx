import { HRMSSidebar } from '@/components/hrms/hrms-sidebar';

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <HRMSSidebar role="EMPLOYEE" currentEmail="employee@skorabiz.com" />
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
