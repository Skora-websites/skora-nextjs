"use server";

import { recordPunchIn, recordPunchOut, getAttendanceRecords } from "@/lib/db/attendance";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db/mongo-helper";

export async function punchInAction(data: {
  userId: string;
  userName: string;
  userEmail: string;
  employeeCode?: string;
  location?: string;
  status?: string;
  tenantId?: string;
  managerId?: string;
}) {
  try {
    const record = await recordPunchIn(data);

    if (!record) {
      return { success: false, error: "Failed to save attendance record. The database may be unavailable. Please try again." };
    }

    if (record) {
      // Dispatch notification to Manager & HR Admin
      try {
        const db = await getDb();
        if (db) {
          await db.collection("notifications").insertOne({
            userId: data.managerId || "admin",
            title: `Attendance Marked: ${data.userName}`,
            body: `${data.userName} (${data.employeeCode || "Employee"}) punched in at ${new Date(record.punchInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Status: ${record.status}. Location: ${record.location}`,
            type: "attendance",
            isRead: false,
            createdAt: new Date(),
          });
        }
      } catch (err) {
        console.warn("Notification dispatch notice:", err);
      }

      revalidatePath("/hrms/attendance");
      revalidatePath("/hrms/employee");
      revalidatePath("/hrms/manager");
      revalidatePath("/hrms/manager/my-team");
    }

    return { success: true, record };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function punchOutAction(userId: string, dateStr: string) {
  try {
    const success = await recordPunchOut(userId, dateStr);
    if (success) {
      revalidatePath("/hrms/attendance");
      revalidatePath("/hrms/employee");
      revalidatePath("/hrms/manager");
      revalidatePath("/hrms/manager/my-team");
    }
    return { success };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export async function fetchAttendanceRecordsAction(filter?: { userId?: string; date?: string }) {
  try {
    const records = await getAttendanceRecords(filter);
    return { success: true, records };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
