import Link from 'next/link';
import {
  Building2, Users, ShieldAlert, Settings, FileCheck, DollarSign,
  FolderKanban, Clock, CheckSquare, BarChart3, LayoutDashboard,
  LogOut, Shield, MapPin, Bell
} from 'lucide-react';
import { getPendingApprovalCounts } from '@/lib/actions/hrms-actions';
import type { HRMSRole } from '@/lib/hrms-roles';
import { SidebarNavClient, type SidebarNavItem } from './hrms-sidebar-client';

interface SidebarProps {
  role: 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
  currentEmail: string;
  currentName?: string;
  hrmsRole: HRMSRole;
}

export async function HRMSSidebar({ role, currentEmail, currentName, hrmsRole }: SidebarProps) {
  let pendingTotal = 0;
  try {
    const counts = await getPendingApprovalCounts(hrmsRole);
    pendingTotal = counts.total;
  } catch {
    // Sidebar must never crash the layout; swallow and show no badge.
  }

  const navItemsByRole: Record<SidebarRole, SidebarNavItem[]> = {
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
    ],
  };

  const navItems = navItemsByRole[role] || navItemsByRole.EMPLOYEE;
  const showApprovalsShortcut = role !== 'EMPLOYEE';

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-200 min-h-screen flex flex-col justify-between p-4 shadow-xl">
      <div>
        <div className="flex items-center space-x-3 px-2 py-4 mb-6 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            S
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-white tracking-wide">SKORA <span className="text-blue-400">HRMS</span></h1>
            <p className="text-xs text-slate-400 font-mono">Mon-Fri 10AM-7PM</p>
          </div>
        </div>

        <div className="px-2 mb-6">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2.5 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Role</p>
              <p className="text-xs font-semibold text-white truncate">{role.replace('_', ' ')}</p>
            </div>
          </div>
        </div>

        {showApprovalsShortcut && (
          <Link
            href="/hrms/approvals"
            className="mx-2 mb-4 flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-rose-500/10 border border-amber-500/30 hover:border-amber-400 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Approvals</span>
            </span>
            {pendingTotal > 0 ? (
              <span className="bg-rose-500 text-white text-[10px] font-extrabold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                {pendingTotal}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-mono">0</span>
            )}
          </Link>
        )}

        <SidebarNavClient navItems={navItems} />
      </div>

      <div className="border-t border-slate-800 pt-4 space-y-2">
        <div className="px-2 py-1.5 bg-slate-950/60 rounded-lg text-[11px] text-slate-400 font-mono">
          <p className="truncate text-white font-semibold">{currentName || currentEmail}</p>
          <p className="truncate">{currentEmail}</p>
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

type SidebarRole = 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE';
