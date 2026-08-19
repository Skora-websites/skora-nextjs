import { AppShell } from "@/components/layout/app-shell";
import { Users, Mail, Phone, Clock, CalendarDays, CheckCircle2 } from "lucide-react";

export default function ManagerMyTeamPage() {
  const dummyTeamMembers = [
    { id: "1", name: "Rahul Sharma", role: "Senior Frontend Engineer", email: "rahul@edskora.com", punchedIn: true, leaveBalance: 12, tasksCount: 4 },
    { id: "2", name: "Priya Patel", role: "UI/UX Designer", email: "priya@edskora.com", punchedIn: true, leaveBalance: 10, tasksCount: 3 },
    { id: "3", name: "Amit Kumar", role: "Backend Developer", email: "amit@edskora.com", punchedIn: false, leaveBalance: 8, tasksCount: 5 },
    { id: "4", name: "Sneha Reddy", role: "QA Engineer", email: "sneha@edskora.com", punchedIn: true, leaveBalance: 15, tasksCount: 2 },
  ];

  return (
    <AppShell title="My Team Roster">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">Direct Reports & Department Team</h2>
        <p className="text-xs text-slate-400 mt-1">Overview of team attendance, active task load, and leave balances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dummyTeamMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border border-white/10 bg-[#0B0F19]/90 p-5 backdrop-blur-md flex flex-col justify-between"
          >
            <div>
              {/* Status Header */}
              <div className="flex items-center justify-between mb-3">
                <span className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                  {member.name.substring(0, 2).toUpperCase()}
                </span>
                {member.punchedIn ? (
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> Punched In
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 text-[10px] text-slate-400 font-semibold">
                    Offline / Out
                  </span>
                )}
              </div>

              {/* Name & Role */}
              <h3 className="font-bold text-white text-base">{member.name}</h3>
              <p className="text-xs text-primary font-medium">{member.role}</p>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                <Mail className="h-3 w-3" /> {member.email}
              </p>
            </div>

            {/* Bottom details */}
            <div className="pt-4 border-t border-white/5 mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/30 rounded-xl p-2 text-center">
                <span className="block text-[10px] text-slate-400">Active Tasks</span>
                <span className="font-bold text-white text-sm">{member.tasksCount}</span>
              </div>
              <div className="bg-black/30 rounded-xl p-2 text-center">
                <span className="block text-[10px] text-slate-400">Leave Bal.</span>
                <span className="font-bold text-white text-sm">{member.leaveBalance} days</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
