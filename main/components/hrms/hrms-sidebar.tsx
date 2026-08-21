'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Building2, Users, ShieldAlert, Settings, FileCheck, DollarSign, 
  FolderKanban, Clock, CheckSquare, BarChart3, UserCheck, LayoutDashboard,
  LogOut, Shield, MapPin
} from 'lucide-react';

interface SidebarProps {
  role: 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
  currentEmail: string;
}

export function HRMSSidebar({ role, currentEmail }: SidebarProps) {
  const pathname = usePathname();

  const navItemsByRole = {
    SUPER_ADMIN: [
      { name: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
      { name: 'Tenants & Geofencing', href: '/superadmin/tenants', icon: Building2 },
      { name: 'Management Attendance', href: '/superadmin/attendance', icon: MapPin },
      { name: 'Onboarding Escalations', href: '/superadmin/escalations', icon: ShieldAlert },
      { name: 'Isolated Settings', href: '/superadmin/settings', icon: Settings },
    ],
    HR_ADMIN: [
      { name: 'HR Overview', href: '/hr-admin', icon: LayoutDashboard },
      { name: 'Employee Directory', href: '/hr-admin/employees', icon: Users },
      { name: 'Onboarding Verification', href: '/hr-admin/onboarding', icon: FileCheck },
      { name: 'Payroll Module', href: '/hr-admin/payroll', icon: DollarSign },
      { name: 'Projects & Budgets', href: '/hr-admin/projects', icon: FolderKanban },
      { name: 'Isolated Settings', href: '/hr-admin/settings', icon: Settings },
    ],
    MANAGER: [
      { name: 'Manager Overview', href: '/manager', icon: LayoutDashboard },
      { name: 'Project PMS', href: '/manager/pms', icon: FolderKanban },
      { name: 'Approvals & Roster', href: '/manager/approvals', icon: CheckSquare },
      { name: 'Timesheet Review', href: '/manager/timesheets', icon: Clock },
      { name: 'KPI Analytics', href: '/manager/analytics', icon: BarChart3 },
      { name: 'Isolated Settings', href: '/manager/settings', icon: Settings },
    ],
    EMPLOYEE: [
      { name: 'My Hub', href: '/employee', icon: LayoutDashboard },
      { name: 'Onboarding Upload', href: '/employee/onboarding', icon: FileCheck },
      { name: 'My Tasks (PMS)', href: '/employee/tasks', icon: CheckSquare },
      { name: 'My Payslips', href: '/employee/payslips', icon: DollarSign },
      { name: 'My Performance', href: '/employee/performance', icon: BarChart3 },
      { name: 'Isolated Settings', href: '/employee/settings', icon: Settings },
    ]
  };

  const navItems = navItemsByRole[role] || navItemsByRole.EMPLOYEE;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-200 min-h-screen flex flex-col justify-between p-4 shadow-xl">
      <div>
        {/* Brand */}
        <div className="flex items-center space-x-3 px-2 py-4 mb-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-wide">SKORA <span className="text-blue-400">HRMS</span></h1>
            <p className="text-xs text-slate-400 font-mono">Mon-Fri 10AM-7PM</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="px-2 mb-6">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2.5 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Role</p>
              <p className="text-xs font-semibold text-white">{role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isHrmsPrefix = pathname.startsWith('/hrms');
            const targetHref = isHrmsPrefix ? `/hrms${item.href}` : item.href;
            const isActive = pathname === targetHref || pathname === item.href || pathname.startsWith(`${targetHref}/`) || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={targetHref}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Switcher & User Footer */}
      <div className="border-t border-slate-800 pt-4 space-y-2">
        <div className="px-2 py-1.5 bg-slate-950/60 rounded-lg text-[11px] text-slate-400 font-mono flex items-center justify-between">
          <span className="truncate">{currentEmail}</span>
        </div>
        <Link 
          href="/hrms/logout"
          className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Switch Role / Logout</span>
        </Link>
      </div>
    </aside>
  );
}
