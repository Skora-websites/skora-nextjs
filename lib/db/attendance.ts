import { getDb } from "./mongo-helper";
import { ObjectId } from "mongodb";

export type AttendanceStatus = "PRESENT" | "LATE" | "HALF_DAY" | "ABSENT";
export type AUXState = "active" | "on_break" | "meeting";

export interface AUXEntry {
  state: AUXState;
  startTime: string;
  endTime?: string;
}

export interface AttendanceRecord {
  _id?: string;
  tenantId?: string;
  userId: string;
  userName: string;
  userEmail: string;
  employeeCode?: string;
  date: string;
  punchInTime: string;
  punchOutTime?: string;
  location?: string;
  status: AttendanceStatus;
  workHours?: number;
  managerId?: string;
  createdAt?: string;
  auxState?: AUXState;
  auxHistory?: AUXEntry[];
  totalBreakMinutes?: number;
  effectiveWorkMinutes?: number;
}

export function calculateAttendanceStatus(punchInDate: Date): AttendanceStatus {
  const hours = punchInDate.getHours();
  const minutes = punchInDate.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  const tenThirtyAM = 10 * 60 + 30;
  const onePM = 13 * 60;
  if (timeInMinutes <= tenThirtyAM) return "PRESENT";
  if (timeInMinutes <= onePM) return "LATE";
  return "HALF_DAY";
}

export function calculateEffectiveWorkMinutes(auxHistory: AUXEntry[]): number {
  let totalMs = 0;
  const now = new Date();
  for (const entry of auxHistory) {
    if (entry.state === "active" || entry.state === "meeting") {
      const start = new Date(entry.startTime).getTime();
      const end = entry.endTime ? new Date(entry.endTime).getTime() : now.getTime();
      totalMs += end - start;
    }
  }
  return Math.max(0, Math.round(totalMs / 60000));
}

export function calculateBreakMinutes(auxHistory: AUXEntry[]): number {
  let totalMs = 0;
  const now = new Date();
  for (const entry of auxHistory) {
    if (entry.state === "on_break") {
      const start = new Date(entry.startTime).getTime();
      const end = entry.endTime ? new Date(entry.endTime).getTime() : now.getTime();
      totalMs += end - start;
    }
  }
  return Math.max(0, Math.round(totalMs / 60000));
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
  status?: string;
  tenantId?: string;
  managerId?: string;
}): Promise<AttendanceRecord | null> {
  const db = await getDb();
  if (!db) return null;
  const now = new Date();
  const todayStr = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");
  const status = data.status || calculateAttendanceStatus(now);
  const nowISO = now.toISOString();
  const existing = await db.collection("attendance").findOne({ userId: data.userId, date: todayStr });
  if (existing) {
    await db.collection("attendance").updateOne(
      { _id: existing._id },
      { $set: { userName: data.userName || existing.userName, userEmail: data.userEmail || existing.userEmail, employeeCode: data.employeeCode || existing.employeeCode, location: data.location || existing.location } }
    );
    return {
      ...existing, _id: existing._id.toString(),
      auxState: existing.auxState || "active", auxHistory: existing.auxHistory || [],
      totalBreakMinutes: existing.totalBreakMinutes || 0, effectiveWorkMinutes: existing.effectiveWorkMinutes || 0,
      createdAt: existing.createdAt ? existing.createdAt.toISOString() : now.toISOString(),
    } as AttendanceRecord;
  }
  const initialAUX: AUXEntry[] = [{ state: "active", startTime: nowISO }];
  const doc = {
    tenantId: data.tenantId || "default", userId: data.userId, userName: data.userName,
    userEmail: data.userEmail, employeeCode: data.employeeCode || "EMP-2026-1001",
    date: todayStr, punchInTime: nowISO, location: data.location || "Primary Office (GPS Verified)",
    status, managerId: data.managerId, auxState: "active" as AUXState,
    auxHistory: initialAUX, totalBreakMinutes: 0, effectiveWorkMinutes: 0, createdAt: now,
  };
  const res = await db.collection("attendance").insertOne(doc);
  return { ...doc, _id: res.insertedId.toString(), createdAt: now.toISOString() } as AttendanceRecord;
}

export async function recordAUXChange(userId: string, dateStr: string, newState: AUXState): Promise<AttendanceRecord | null> {
  const db = await getDb();
  if (!db) return null;
  const record = await db.collection("attendance").findOne({ userId, date: dateStr });
  if (!record) return null;
  const nowISO = new Date().toISOString();
  const history: AUXEntry[] = record.auxHistory || [];
  const updatedHistory = history.map((entry: AUXEntry, idx: number) => {
    if (idx === history.length - 1 && !entry.endTime) return { ...entry, endTime: nowISO };
    return entry;
  });
  updatedHistory.push({ state: newState, startTime: nowISO });
  const effectiveWorkMinutes = calculateEffectiveWorkMinutes(updatedHistory);
  const totalBreakMinutes = calculateBreakMinutes(updatedHistory);
  await db.collection("attendance").updateOne(
    { _id: record._id },
    { $set: { auxState: newState, auxHistory: updatedHistory, totalBreakMinutes, effectiveWorkMinutes } }
  );
  return {
    ...record, _id: record._id.toString(), auxState: newState,
    auxHistory: updatedHistory, totalBreakMinutes, effectiveWorkMinutes,
    createdAt: record.createdAt ? record.createdAt.toISOString() : new Date().toISOString(),
  } as AttendanceRecord;
}

export async function recordPunchOut(userId: string, dateStr: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const now = new Date();
  const nowISO = now.toISOString();
  const record = await db.collection("attendance").findOne({ userId, date: dateStr });
  if (!record) return false;
  let history: AUXEntry[] = record.auxHistory || [];
  history = history.map((entry: AUXEntry, idx: number) => {
    if (idx === history.length - 1 && !entry.endTime) return { ...entry, endTime: nowISO };
    return entry;
  });
  const effectiveWorkMinutes = calculateEffectiveWorkMinutes(history);
  const totalBreakMinutes = calculateBreakMinutes(history);
  const workHours = Number((effectiveWorkMinutes / 60).toFixed(2));
  const res = await db.collection("attendance").updateOne(
    { _id: record._id },
    { $set: { punchOutTime: nowISO, workHours, auxState: "active", auxHistory: history, totalBreakMinutes, effectiveWorkMinutes } }
  );
  return res.modifiedCount > 0;
}
