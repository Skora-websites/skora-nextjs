import Link from 'next/link';
import { Shield, Users, FolderKanban, UserCheck, ArrowRight, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export default function HRMSPortalLandingPage() {
  const roles = [
    {
      role: 'Super Admin',
      route: '/hrms/superadmin',
      settingsRoute: '/hrms/superadmin/settings',
      description: 'Tenant management, office geofencing coordinates (100m radius), exclusive view of HR & Manager attendance, and 48h onboarding document escalation queue.',
      icon: Shield,
      color: 'from-blue-600 to-indigo-600',
      badge: '/hrms/superadmin'
    },
    {
      role: 'HR Admin',
      route: '/hrms/hr-admin',
      settingsRoute: '/hrms/hr-admin/settings',
      description: 'Personal geofenced punch banner (escalates to Super Admin), document verification & Employee Code generation, project budget setup, and monthly payroll processing.',
      icon: Users,
      color: 'from-indigo-600 to-purple-600',
      badge: '/hrms/hr-admin'
    },
    {
      role: 'Manager',
      route: '/hrms/manager',
      settingsRoute: '/hrms/manager/settings',
      description: 'Personal geofenced punch banner (escalates to Super Admin), PMS Kanban task delegation, approval center for overtime & half-day leaves, and timesheet locking for HR.',
      icon: FolderKanban,
      color: 'from-amber-600 to-orange-600',
      badge: '/hrms/manager'
    },
    {
      role: 'Employee',
      route: '/hrms/employee',
      settingsRoute: '/hrms/employee/settings',
      description: 'Dynamic onboarding banner with 48h re-upload countdown timer, Haversine geofenced punch in/out, task execution timer, and self-service leave requests with half-day toggle.',
      icon: UserCheck,
      color: 'from-emerald-600 to-teal-600',
      badge: '/hrms/employee'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* Hero Banner */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-blue-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Strict Timings: Mon-Fri 10:00 AM - 7:00 PM | Lunch: 2:00 PM - 2:30 PM</span>
            </div>
            <Link
              href="/hrms/login"
              className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow transition-colors"
            >
              <span>Sign In to HRMS</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Structured <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">HRMS Command Portal</span>
          </h1>

          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Multi-Tenant Enterprise HRMS with 100m Haversine Geofenced Punching, 48-Hour Onboarding Countdown Escalation, Strict Attendance Routing, and Isolated Role Settings.
          </p>
        </div>

        {/* 4 Role Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.route}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${r.color} text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      {r.badge}
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-white group-hover:text-blue-400 transition-colors">
                    {r.role} Dashboard
                  </h2>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {r.description}
                  </p>
                </div>

                <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold gap-2 mt-4">
                  <Link
                    href={r.route}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-center py-2.5 rounded-xl shadow transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <span>Enter {r.role} Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={r.settingsRoute}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2.5 rounded-xl border border-slate-700 transition-colors text-[11px]"
                  >
                    Isolated Settings
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-500 font-mono">
        SKORA HRMS Enterprise Platform &copy; 2026 | Geofence Radius: 100m | Haversine Formula Active
      </footer>
    </div>
  );
}
