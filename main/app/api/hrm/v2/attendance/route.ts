import { NextRequest, NextResponse } from "next/server";
import {
  getAttendanceRecords,
  getAttendanceById,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceDashboard,
  getAttendanceStats,
  calculateAttendanceStats,
} from "@/services/hrm/attendance";
import { resolveTenantFromOrigin } from "@/services/hrm/tenant";
import { requireAuth, requireAdmin, isErrorResponse } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isErrorResponse(auth)) return auth;

    const origin = request.headers.get("origin");
    const tenantCtx = await resolveTenantFromOrigin(origin);
    const tenantId = tenantCtx?.tenantId || "default";

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const dashboard = searchParams.get("dashboard");
    const stats = searchParams.get("stats");

    if (id) {
      const record = await getAttendanceById(id);
      if (!record) {
        return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
      }
      return NextResponse.json({ data: record });
    }

    if (dashboard === "true") {
      // Only admins can view the attendance dashboard
      if (auth.role === "employee") {
        return NextResponse.json({ error: "Forbidden: insufficient permissions" }, { status: 403 });
      }
      const dashData = await getAttendanceDashboard(tenantId);
      return NextResponse.json({ data: dashData });
    }

    if (stats === "true" && userId) {
      // Employees can only view their own stats
      if (auth.role === "employee" && userId !== auth.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      const m = month ? parseInt(month) : new Date().getMonth() + 1;
      const y = year ? parseInt(year) : new Date().getFullYear();
      const statData = await getAttendanceStats(tenantId, userId, m, y);
      return NextResponse.json({ data: statData });
    }

    const records = await getAttendanceRecords(tenantId, {
      userId: userId || undefined,
      status: status || undefined,
    });

    // Employees can only view their own records
    if (auth.role === "employee") {
      const filtered = records.filter((r) => r.userId === auth.userId);
      return NextResponse.json({ data: filtered });
    }

    return NextResponse.json({ data: records });
  } catch (error: any) {
    console.error("GET /api/hrm/v2/attendance error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth();
    if (isErrorResponse(auth)) return auth;

    const origin = request.headers.get("origin");
    const tenantCtx = await resolveTenantFromOrigin(origin);
    const tenantId = tenantCtx?.tenantId || "default";

    const body = await request.json();

    // Employees can only mark their own attendance
    if (auth.role === "employee" && body.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const record = await markAttendance(tenantId, {
      userId: body.userId,
      date: new Date(body.date),
      checkIn: body.checkIn ? new Date(body.checkIn) : undefined,
      checkOut: body.checkOut ? new Date(body.checkOut) : undefined,
      shiftId: body.shiftId,
      workdayType: body.workdayType || "regular",
      source: body.source || "manual",
    });

    if (body.calculateStats && record) {
      const d = new Date(body.date);
      await calculateAttendanceStats(tenantId, body.userId, d.getMonth() + 1, d.getFullYear());
    }

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/hrm/v2/attendance error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isErrorResponse(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id parameter required" }, { status: 400 });
    }

    const body = await request.json();
    const record = await updateAttendance(id, body);
    if (!record) {
      return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    }

    return NextResponse.json({ data: record });
  } catch (error: any) {
    console.error("PATCH /api/hrm/v2/attendance error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isErrorResponse(auth)) return auth;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id parameter required" }, { status: 400 });
    }

    const deleted = await deleteAttendance(id);
    if (!deleted) {
      return NextResponse.json({ error: "Attendance not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/hrm/v2/attendance error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
