"use server";

import { recordPunchIn, recordPunchOut, recordAUXChange, getAttendanceRecords, type AUXState } from "@/lib/db/attendance";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/mongo-helper";
import { requireAuth } from "@/lib/api-auth";
import { hrmUsersService } from "@/lib/hrm/firestore";
import { istDateKey } from "@/lib/ist-date";

export async function punchInAction(data: {
  userId: string;
  userName: string;
  userEmail: string;
  employeeCode?: string;
  location?: string;
  status?: string;
  tenantId?: string;
  managerId?: string;
  workLocation?: "office" | "remote";
}) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return { success: false, error: "Unauthorized" };
    if (data.userId !== auth.userId) return { success: false, error: "You can only mark your own attendance" };

    const user = await hrmUsersService.findById(auth.userId);
    if (!user || (user as any).tenantId !== auth.tenantId) return { success: false, error: "User not found" };

    const record = await recordPunchIn({
      userId: auth.userId,
      userName: (user as any).displayName || (user as any).firstName || "Employee",
      userEmail: (user as any).email || "",
      employeeCode: (user as any).employeeCode,
      location: data.location,
      tenantId: auth.tenantId,
      managerId: (user as any).managerId,
      workLocation: data.workLocation,
    });
    if (!record) return { success: false, error: "Failed to save attendance record. Please try again." };

    try {
      const db = await getDb();
      if (db) {
        await db.collection("notifications").insertOne({
          userId: (user as any).managerId || "admin",
          title: `Attendance Marked: ${(user as any).displayName || (user as any).firstName || "Employee"}`,
          body: `Attendance was marked at ${new Date(record.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Status: ${record.status}.`,
          type: "attendance", isRead: false, createdAt: new Date(), tenantId: auth.tenantId,
        });
      }
    } catch (err) {
      console.warn("Notification dispatch notice:", err);
    }
    revalidatePath("/hrms/attendance");
    revalidatePath("/hrms/employee");
    revalidatePath("/hrms/manager");
    revalidatePath("/hrms/manager/my-team");
    return { success: true, record };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function punchOutAction(userId: string, dateStr?: string) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return { success: false, error: "Unauthorized" };
    if (userId !== auth.userId) return { success: false, error: "You can only punch out your own attendance" };
    // Never trust the client-supplied date for the lookup: the punch-in row is
    // keyed by the office (IST) calendar date, so resolve it server-side.
    const success = await recordPunchOut(auth.userId, istDateKey(), auth.tenantId);
    if (success) {
      revalidatePath("/hrms/attendance");
      revalidatePath("/hrms/employee");
      revalidatePath("/hrms/manager");
      revalidatePath("/hrms/manager/my-team");
    }
    return { success, error: success ? undefined : "Attendance could not be punched out. It may already be closed or missing." };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function updateAUXStateAction(userId: string, dateStr: string, newState: AUXState) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return { success: false, error: "Unauthorized" };
    if (userId !== auth.userId) return { success: false, error: "You can only change your own AUX state" };
    if (!auth.tenantId) return { success: false, error: "Tenant not resolved. Please sign in again." };
    // The client's date key can drift (timezone/clock) from the IST key the
    // record was stored under — resolve "today" server-side to keep the
    // punch-in → AUX → punch-out chain on the same row.
    const record = await recordAUXChange(auth.userId, istDateKey(), newState, auth.tenantId);
    if (!record) return { success: false, error: "No attendance record found for today. Please punch in first." };
    revalidatePath("/hrms/attendance");
    revalidatePath("/hrms/employee");
    return { success: true, record };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function fetchAttendanceRecordsAction(filter?: { userId?: string; date?: string }) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return { success: false, records: [], error: "Unauthorized" };
    const requestedUserId = filter?.userId;
    if (auth.role === "employee" && requestedUserId && requestedUserId !== auth.userId) {
      return { success: false, records: [], error: "Forbidden" };
    }
    const records = await getAttendanceRecords({
      userId: auth.role === "employee" ? auth.userId : requestedUserId,
      date: filter?.date,
      tenantId: auth.tenantId,
    });
    return { success: true, records };
  } catch (error) {
    return { success: false, records: [], error: (error as Error).message };
  }
}
