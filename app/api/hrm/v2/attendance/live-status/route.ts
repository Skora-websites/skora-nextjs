import { NextResponse } from "next/server";
import { requireAuth, isErrorResponse } from "@/lib/api-auth";
import { getDb } from "@/lib/db/mongo-helper";

/**
 * GET /api/hrm/v2/attendance/live-status
 *
 * Returns real-time attendance status for all employees today:
 * - AUX state (active / on_break / meeting)
 * - Effective work minutes & break minutes
 * - Punch-in / punch-out times
 * - Current location (if GPS tracked)
 * - Auto-refreshes on client every 15s
 *
 * Accessible by: super_admin, hr_admin, manager
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (isErrorResponse(auth)) return auth;

    // Only admins and managers can see live status
    if (auth.role === "employee") {
      return NextResponse.json(
        { error: "Forbidden: insufficient permissions" },
        { status: 403 }
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database not available" },
        { status: 503 }
      );
    }

    const now = new Date();
    const todayStr =
      now.getFullYear() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");

    // For managers, find their department to scope results
    let managerDepartment: string | null = null;
    if (auth.role === "manager") {
      const managerUser = await db.collection("users").findOne({ _id: new (require("mongodb").ObjectId)(auth.userId) });
      managerDepartment = managerUser?.department || managerUser?.departmentName || null;
    }

    // Build the user query filter
    const userQuery: any = {
      role: { $in: ["employee", "manager", "hr_admin"] },
      status: { $ne: "inactive" },
    };
    // Managers only see their own department
    if (managerDepartment) {
      userQuery.$or = [
        { department: managerDepartment },
        { departmentName: managerDepartment },
      ];
    }

    // Fetch all attendance records for today
    const records = await db
      .collection("attendance")
      .find({ date: todayStr })
      .toArray();

    // Also fetch all users to include employees who haven't punched in yet
    const allUsers = await db
      .collection("users")
      .find(userQuery)
      .project({
        _id: 1,
        email: 1,
        displayName: 1,
        employeeCode: 1,
        department: 1,
        designation: 1,
        role: 1,
      })
      .toArray();

    const userMap = new Map(
      allUsers.map((u: any) => [u._id.toString(), u])
    );

    // Build enriched status for each employee
    const nowMs = now.getTime();
    const enriched = allUsers.map((user: any) => {
      const userId = user._id.toString();
      const record = records.find((r: any) => r.userId === userId);

      if (!record) {
        return {
          userId,
          name: user.displayName || user.email,
          email: user.email,
          employeeCode: user.employeeCode || "—",
          department: user.department || "—",
          designation: user.designation || "—",
          role: user.role,
          status: "absent",
          auxState: null,
          punchInTime: null,
          punchOutTime: null,
          effectiveWorkMinutes: 0,
          totalBreakMinutes: 0,
          workHours: 0,
          totalElapsedMinutes: 0,
          currentLocation: null,
          auxSince: null,
          workLocation: null,
        };
      }

      // Compute live effective work minutes (for in-progress records)
      let effectiveWorkMinutes = record.effectiveWorkMinutes || 0;
      let totalBreakMinutes = record.totalBreakMinutes || 0;
      let totalElapsedMinutes = 0;

      if (record.punchInTime && !record.punchOutTime) {
        // Employee is currently punched in — compute live values from auxHistory
        const history = record.auxHistory || [];
        const punchInMs = new Date(record.punchInTime).getTime();

        // Total elapsed since punch-in
        totalElapsedMinutes = Math.max(
          0,
          Math.round((nowMs - punchInMs) / 60000)
        );

        // Recompute effective and break from auxHistory (including current open period)
        effectiveWorkMinutes = 0;
        totalBreakMinutes = 0;
        for (const entry of history) {
          const startMs = new Date(entry.startTime).getTime();
          const endMs = entry.endTime
            ? new Date(entry.endTime).getTime()
            : nowMs;
          const durMs = endMs - startMs;
          if (entry.state === "active" || entry.state === "meeting") {
            effectiveWorkMinutes += durMs;
          } else if (entry.state === "on_break") {
            totalBreakMinutes += durMs;
          }
        }
        effectiveWorkMinutes = Math.round(effectiveWorkMinutes / 60000);
        totalBreakMinutes = Math.round(totalBreakMinutes / 60000);
      } else if (record.punchOutTime) {
        // Already punched out
        const punchInMs = new Date(record.punchInTime).getTime();
        const punchOutMs = new Date(record.punchOutTime).getTime();
        totalElapsedMinutes = Math.round(
          (punchOutMs - punchInMs) / 60000
        );
      }

      // Find current AUX period start time
      const auxHistory = record.auxHistory || [];
      const currentPeriod =
        auxHistory.length > 0 ? auxHistory[auxHistory.length - 1] : null;
      const auxSince =
        currentPeriod && !currentPeriod.endTime
          ? currentPeriod.startTime
          : null;

      return {
        userId,
        name: record.userName || user.displayName || user.email,
        email: record.userEmail || user.email,
        employeeCode: record.employeeCode || user.employeeCode || "—",
        department: user.department || "—",
        designation: user.designation || "—",
        role: user.role,
        status: record.punchOutTime
          ? "punched_out"
          : record.punchInTime
          ? "punched_in"
          : "absent",
        auxState: record.auxState || "active",
        punchInTime: record.punchInTime || null,
        punchOutTime: record.punchOutTime || null,
        effectiveWorkMinutes,
        totalBreakMinutes,
        workHours: record.workHours || Number((effectiveWorkMinutes / 60).toFixed(2)),
        totalElapsedMinutes,
        currentLocation: record.currentLocation || null,
        auxSince,
        location: record.location || null,
        workLocation: record.workLocation || (record.location && record.location.includes("[remote]") ? "remote" : "office"),
        status_label: record.status || "—",
      };
    });

    // Sort: punched_in first, then by name
    enriched.sort((a: any, b: any) => {
      const order: Record<string, number> = {
        punched_in: 0,
        punched_out: 1,
        absent: 2,
      };
      const diff = (order[a.status] ?? 3) - (order[b.status] ?? 3);
      return diff !== 0 ? diff : a.name.localeCompare(b.name);
    });

    // Summary stats
    const summary = {
      totalEmployees: allUsers.length,
      punchedIn: enriched.filter((e: any) => e.status === "punched_in").length,
      onBreak: enriched.filter(
        (e: any) => e.status === "punched_in" && e.auxState === "on_break"
      ).length,
      inMeeting: enriched.filter(
        (e: any) => e.status === "punched_in" && e.auxState === "meeting"
      ).length,
      active: enriched.filter(
        (e: any) => e.status === "punched_in" && e.auxState === "active"
      ).length,
      punchedOut: enriched.filter((e: any) => e.status === "punched_out")
        .length,
      absent: enriched.filter((e: any) => e.status === "absent").length,
      inOffice: enriched.filter((e: any) => e.status === "punched_in" && e.workLocation === "office").length,
      remote: enriched.filter((e: any) => e.status === "punched_in" && e.workLocation === "remote").length,
    };

    return NextResponse.json({ data: enriched, summary });
  } catch (error: any) {
    console.error("GET /api/hrm/v2/attendance/live-status error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
