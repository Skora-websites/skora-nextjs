"use client";

import { useState, useEffect } from "react";
import { Clock, Search, Download, Filter } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";

interface AttendanceRecord {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  employeeCode?: string;
  date: string;
  punchInTime: string;
  punchOutTime?: string;
  status: string;
  workHours?: number;
  location?: string;
  department?: string;
}

export default function HrAdminAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadRecords();
  }, [selectedDate]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hrm/v2/attendance?date=${selectedDate}`);
      if (res.ok) setRecords((await res.json()).data || []);
    } catch { /* empty */ }
    setLoading(false);
  };

  const filtered = records.filter((r) => {
    const matchDate = !selectedDate || (r.punchInTime && new Date(r.punchInTime).toISOString().split("T")[0] === selectedDate) || (r.date && r.date === selectedDate);
    const matchSearch = r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      (r.employeeCode && r.employeeCode.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filterStatus === "all" || r.status === filterStatus;
    return matchDate && matchSearch && matchFilter;
  });

  const presentCount = records.filter((r) => r.status === "PRESENT" || r.status === "LATE" || r.status === "HALF_DAY").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;

  return (
    <AppShell title="Attendance Master">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Master</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Full attendance data for all employees · {records.length} records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary"
          />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="ABSENT">Absent</option>
            <option value="HALF_DAY">Half Day</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-4 text-center text-slate-900 dark:text-white">
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{presentCount}</p>
          <p className="text-[10px] text-slate-500">Present</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-4 text-center text-slate-900 dark:text-white">
          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400">{absentCount}</p>
          <p className="text-[10px] text-slate-500">Absent</p>
        </div>
        <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-4 text-center text-slate-900 dark:text-white">
          <p className="text-2xl font-extrabold text-primary">{records.length}</p>
          <p className="text-[10px] text-slate-500">Total Records</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-xs">Loading attendance...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-gray-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
            No attendance records for this date.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Code</th>
                  <th className="pb-3 font-semibold">Punch In</th>
                  <th className="pb-3 font-semibold">Punch Out</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Hours</th>
                  <th className="pb-3 font-semibold">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filtered.map((r) => (
                  <tr key={r._id}>
                    <td className="py-3 font-bold">
                      {r.userName}
                      <span className="block text-[10px] text-slate-500 font-normal">{r.userEmail}</span>
                    </td>
                    <td className="py-3 font-mono font-bold text-primary text-[11px]">{r.employeeCode || "—"}</td>
                    <td className="py-3 font-mono">{r.punchInTime ? new Date(r.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td className="py-3 font-mono">{r.punchOutTime ? new Date(r.punchOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Active"}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                        r.status === "PRESENT" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                        r.status === "LATE" ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" :
                        "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}>{r.status}</span>
                    </td>
                    <td className="py-3 font-mono font-bold">{r.workHours ? `${r.workHours}h` : "—"}</td>
                    <td className="py-3 text-slate-500 text-[10px] truncate max-w-[120px]">{r.location || "Office"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
