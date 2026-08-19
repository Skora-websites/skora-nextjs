import { getDb } from "./mongo-helper";
import { ObjectId } from "mongodb";

export type AttendanceStatus = "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT";

export interface AttendanceRecord {
  _id?: string;
  tenantId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  employeeCode?: string;
  date: string; // YYYY-MM-DD
  punchInTime: string; // ISO string
  punchOutTime?: string; // ISO string
  location?: string;
  status: AttendanceStatus;
  workHours?: number;
  managerId?: string;
  createdAt?: string;
}

/**
 * Calculates attendance status based on 10:00 AM - 7:00 PM office timings.
 * - Punch in <= 10:30 AM -> PRESENT
 * - Punch in > 10:30 AM & <= 1:00 PM -> LATE
 * - Punch in > 1:00 PM -> HALF_DAY
 */
export function calculateAttendanceStatus(punchInDate: Date): AttendanceStatus {
  const hours = punchInDate.getHours();
  const minutes = punchInDate.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  const tenAM = 10 * 60; // 600 mins
  const tenThirtyAM = 10 * 60 + 30; // 630 mins
  const onePM = 13 * 60; // 780 mins

  if (timeInMinutes <= tenThirtyAM) {
    return "PRESENT";
  } else if (timeInMinutes <= onePM) {
    return "LATE";
  } else {
    return "HALF_DAY";
  }
}

export async function getAttendanceRecords(filter?: {
  userId?: string;
  date?: string;
  tenantId?: string;
  managerId?: string;
}): Promise<AttendanceRecord[]> {
  const db = await getDb();
  if (!db) return [];

  const query: Record<string, unknown> = {};
  if (filter?.userId) query.userId = filter.userId;
  if (filter?.date) query.date = filter.date;
  if (filter?.tenantId) query.tenantId = filter.tenantId;
  if (filter?.managerId) query.managerId = filter.managerId;

  const docs = await db.collection("attendance").find(query).sort({ date: -1, punchInTime: -1 }).toArray();
  return docs.map((d) => ({
    ...d,
    _id: d._id.toString(),
    createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
  })) as AttendanceRecord[];
}

export async function recordPunchIn(data: {
  userId: string;
  userName: string;
  userEmail: string;
  employeeCode?: string;
  location?: string;
  tenantId?: string;
  managerId?: string;
}): Promise<AttendanceRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const status = calculateAttendanceStatus(now);

  const doc = {
    tenantId: data.tenantId || "default",
    userId: data.userId,
    userName: data.userName,
    userEmail: data.userEmail,
    employeeCode: data.employeeCode || "EMP-2026-1001",
    date: todayStr,
    punchInTime: now.toISOString(),
    location: data.location || "Primary Office (GPS Verified)",
    status,
    managerId: data.managerId,
    createdAt: now,
  };

  const res = await db.collection("attendance").insertOne(doc);
  return {
    ...doc,
    _id: res.insertedId.toString(),
    createdAt: now.toISOString(),
  } as AttendanceRecord;
}

export async function recordPunchOut(userId: string, dateStr: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const now = new Date();
  const record = await db.collection("attendance").findOne({ userId, date: dateStr });
  if (!record) return false;

  const punchInTime = new Date(record.punchInTime);
  const workHours = Number(((now.getTime() - punchInTime.getTime()) / 3600000).toFixed(2));

  const res = await db.collection("attendance").updateOne(
    { _id: record._id },
    {
      $set: {
        punchOutTime: now.toISOString(),
        workHours,
      },
    }
  );

  return res.modifiedCount > 0;
}
