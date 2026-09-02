import { NextRequest, NextResponse } from "next/server";
import { getAttendanceRecords, getAttendanceById, markAttendance, updateAttendance, deleteAttendance, getAttendanceDashboard, getAttendanceStats, calculateAttendanceStats } from "@/services/hrm/attendance";
import { requireAuth, requireAdmin, isErrorResponse } from "@/lib/api-auth";
import { getDb } from "@/lib/db/mongo-helper";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isErrorResponse(auth)) return auth;
    const tenantId = auth.tenantId;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const requestedUserId = searchParams.get("userId");
    const userId = auth.role === "employee" ? auth.userId : requestedUserId;
    const status = searchParams.get("status");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const dashboard = searchParams.get("dashboard");
    const stats = searchParams.get("stats");
    const date = searchParams.get("date");

    if (id) {
      const record = await getAttendanceById(id);
      if (!record || (record.tenantId && record.tenantId !== tenantId)) return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
      if (auth.role === "employee" && record.userId !== auth.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      return NextResponse.json({ data: record });
    }
    if (dashboard === "true") {
      if (auth.role === "employee") return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
      return NextResponse.json({ data: await getAttendanceDashboard(tenantId) });
    }
    if (stats === "true" && userId) {
      if (auth.role === "employee" && userId !== auth.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
      const y = year ? parseInt(year, 10) : new Date().getFullYear();
      return NextResponse.json({ data: await getAttendanceStats(tenantId, userId, m, y) });
    }
    const records = await getAttendanceRecords(tenantId, { userId: userId || undefined, date: date || undefined, status: status || undefined });
    const enriched = records.map((rec: any) => ({
      _id: rec._id || rec.id, userId: rec.userId, userName: rec.userName || rec.userDisplayName || "", userEmail: rec.userEmail || "",
      employeeCode: rec.employeeCode, date: rec.date || (rec.punchInTime ? new Date(rec.punchInTime).toISOString().split("T")[0] : ""),
      punchInTime: rec.punchInTime || rec.checkIn, punchOutTime: rec.punchOutTime || rec.checkOut, location: rec.location,
      distanceMeters: rec.currentLocation?.distanceFromOffice, status: rec.status, workHours: rec.workHours || rec.totalHours,
      overtimeHours: rec.overtimeHours, regularizationStatus: rec.regularizationStatus, managerId: rec.managerId,
    }));
    return NextResponse.json({ data: enriched });
  } catch (error: any) {
    console.error("GET /api/hrm/v2/attendance error:", error);
    return NextResponse.json({ error: "Unable to load attendance" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isErrorResponse(auth)) return auth;
    const body = await request.json();
    if (!body.userId || !body.date) return NextResponse.json({ error: "userId and date are required" }, { status: 400 });
    const tenantId = auth.tenantId;
    let workdayType = body.workdayType || "regular";
    try {
      const db = await getDb();
      if (db) {
        const settingsDoc = await db.collection("settings").findOne({ key: "super_admin_system" });
        const workDays = settingsDoc?.settings?.officeRules?.workDays;
        if (workDays && !workDays.includes(new Date(body.date).getDay())) workdayType = "weekly_off";
      }
    } catch {}
    const record = await markAttendance(tenantId, {
      userId: body.userId, date: new Date(body.date), checkIn: body.checkIn ? new Date(body.checkIn) : undefined,
      checkOut: body.checkOut ? new Date(body.checkOut) : undefined, shiftId: body.shiftId, workdayType,
      source: body.source || "manual",
    });
    if (body.calculateStats && record) {
      const d = new Date(body.date);
      await calculateAttendanceStats(tenantId, body.userId, d.getMonth() + 1, d.getFullYear());
    }
    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/hrm/v2/attendance error:", error);
    return NextResponse.json({ error: "Unable to save attendance" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isErrorResponse(auth)) return auth;
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id parameter required" }, { status: 400 });
    const existing = await getAttendanceById(id);
    if (!existing || (existing.tenantId && existing.tenantId !== auth.tenantId)) return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    const body = await request.json();
    delete body.tenantId;
    delete body.userId;
    const record = await updateAttendance(id, body);
    if (!record) return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    return NextResponse.json({ data: record });
  } catch (error: any) {
    console.error("PATCH /api/hrm/v2/attendance error:", error);
    return NextResponse.json({ error: "Unable to update attendance" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isErrorResponse(auth)) return auth;
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id parameter required" }, { status: 400 });
    const existing = await getAttendanceById(id);
    if (!existing || (existing.tenantId && existing.tenantId !== auth.tenantId)) return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    if (!(await deleteAttendance(id))) return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/hrm/v2/attendance error:", error);
    return NextResponse.json({ error: "Unable to delete attendance" }, { status: 500 });
  }
}
