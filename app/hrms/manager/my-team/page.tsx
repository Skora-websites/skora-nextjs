"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { Users, Mail, Clock, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

interface TeamMember {
  _id: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  department?: string;
  designation?: string;
  employeeCode?: string;
  status?: string;
}

export default function ManagerMyTeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/hrm/v2/users?action=list");
      if (!res.ok) {
        throw new Error("Failed to load team data");
      }
      const data = await res.json();
      // Filter: only employees (not other managers or admins) + exclude super_admin
      const team = (data.data || []).filter((u: TeamMember) => {
        const r = (u.role || "").toLowerCase();
        return r === "employee" || r === "agent";
      });
      setMembers(team);
    } catch (err: any) {
      setError(err.message || "Failed to load team");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchTeam();
  }, [user]);

  return (
    <AppShell title="My Team Roster">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Direct Reports & Department Team</h2>
          <p className="text-xs text-slate-400 mt-1">
            Overview of team members in your department
          </p>
        </div>
        <button
          onClick={fetchTeam}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-400 bg-red-500/10 rounded-xl border border-red-500/20 mb-4">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-[#0B0F19]/90 p-5 backdrop-blur-md animate-pulse h-48"
            />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0B0F19]/90 p-12 text-center">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <p className="text-white font-semibold text-lg">No team members found</p>
          <p className="text-xs text-slate-400 mt-1">
            Team members will appear here once employees are added.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {members.map((member) => {
            const initials = (member.displayName || member.firstName || "U")
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            const isActive = (member.status || "").toLowerCase() === "active";

            return (
              <div
                key={member._id}
                className="rounded-2xl border border-white/10 bg-[#0B0F19]/90 p-5 backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  {/* Status Header */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                      {initials}
                    </span>
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                        isActive
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-slate-500/10 border-slate-500/20 text-slate-400"
                      }`}
                    >
                      {isActive ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {isActive ? "Active" : member.status || "Inactive"}
                    </span>
                  </div>

                  {/* Name & Role */}
                  <h3 className="font-bold text-white text-base">{member.displayName || "Unknown"}</h3>
                  <p className="text-xs text-primary font-medium">{member.designation || member.role}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-2">
                    <Mail className="h-3 w-3" /> {member.email}
                  </p>
                </div>

                {/* Bottom details */}
                <div className="pt-4 border-t border-white/5 mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/30 rounded-xl p-2 text-center">
                    <span className="block text-[10px] text-slate-400">Department</span>
                    <span className="font-bold text-white text-sm">{member.department || "—"}</span>
                  </div>
                  <div className="bg-black/30 rounded-xl p-2 text-center">
                    <span className="block text-[10px] text-slate-400">Emp Code</span>
                    <span className="font-bold text-white text-sm font-mono">{member.employeeCode || "—"}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
