"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  MapPin,
  CheckCircle2,
  LogOut,
  Navigation,
  AlertCircle,
  AlertTriangle,
  Send,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { punchInAction, punchOutAction } from "@/lib/actions/attendance-actions";
import { isWithinGeofence } from "@/lib/geofencing";

// ── Office config (fetched from tenant) ────────────────────
interface OfficeLocation {
  latitude: number;
  longitude: number;
  radius: number; // meters
}

interface OfficeRules {
  officeStart: number; // hour (e.g. 10 = 10:00 AM)
  officeEnd: number;   // hour (e.g. 19 = 7:00 PM)
  lateAfter: number;   // hour (e.g. 10.5 = 10:30 AM)
  workDays: number[];  // 0=Sun, 1=Mon, ... 6=Sat
  halfDayAfter: number; // hour after which it's half-day
}

const DEFAULT_OFFICE: OfficeLocation = {
  latitude: 28.6007594,
  longitude: 77.4319307,
  radius: 100,
};

const DEFAULT_RULES: OfficeRules = {
  officeStart: 10,
  officeEnd: 19,
  lateAfter: 10.5,
  workDays: [1, 2, 3, 4, 5], // Mon-Fri
  halfDayAfter: 14.5,
};

// ── Per-user localStorage keys ─────────────────────────────
function punchStateKey(userId: string) {
  return `employee-punch-state-${userId}`;
}

export function AttendancePunchCard() {
  const { user } = useAuth();
  const userId = user?.id || "";

  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState<string | null>(null);
  const [punchOutTime, setPunchOutTime] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState<string>("PRESENT");
  const [workSeconds, setWorkSeconds] = useState(0);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [officeRules, setOfficeRules] = useState<OfficeRules>(DEFAULT_RULES);

  // Early punch-out approval state
  const [showEarlyLeaveModal, setShowEarlyLeaveModal] = useState(false);
  const [earlyLeaveReason, setEarlyLeaveReason] = useState("");
  const [submittingApproval, setSubmittingApproval] = useState(false);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todayDay = new Date().getDay();

  // ── Fetch office rules from DB ────────────────────────────
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await fetch("/api/hrm/v2/tenants/current");
        if (res.ok) {
          const data = await res.json();
          if (data.officeRules) {
            setOfficeRules({
              officeStart: data.officeRules.officeStart ?? DEFAULT_RULES.officeStart,
              officeEnd: data.officeRules.officeEnd ?? DEFAULT_RULES.officeEnd,
              lateAfter: data.officeRules.lateAfter ?? DEFAULT_RULES.lateAfter,
              workDays: data.officeRules.workDays ?? DEFAULT_RULES.workDays,
              halfDayAfter: data.officeRules.halfDayAfter ?? DEFAULT_RULES.halfDayAfter,
            });
          }
        }
      } catch { /* use defaults */ }
    };
    fetchRules();
  }, []);

  // ── Check if today is a work day ──────────────────────────
  const isWorkDay = officeRules.workDays.includes(todayDay);

  // ── Restore state from per-user localStorage ──────────────
  useEffect(() => {
    if (!userId) return;
    const storedState = localStorage.getItem(punchStateKey(userId));
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        if (parsed.punchedIn && parsed.date === todayStr) {
          setPunchedIn(true);
          setPunchTime(parsed.punchTime);
          setPunchOutTime(parsed.punchOutTime || null);
          setLocationName(parsed.locationName || "GPS Verified");
          setStatusLabel(parsed.statusLabel || "PRESENT");
          setDistanceMeters(parsed.distanceMeters || null);
          if (!parsed.punchOutTime) {
            const elapsed = Math.floor(
              (Date.now() - new Date(parsed.punchTime).getTime()) / 1000
            );
            setWorkSeconds(elapsed > 0 ? elapsed : 0);
          }
        }
      } catch { /* ignore */ }
    }
  }, [userId, todayStr]);

  // ── Timer ─────────────────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (punchedIn && !punchOutTime) {
      interval = setInterval(() => {
        setWorkSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [punchedIn, punchOutTime]);

  // ── Clear messages after 4 seconds ────────────────────────
  useEffect(() => {
    if (successMsg) {
      const t = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(t);
    }
  }, [successMsg]);

  // ── Fetch office location ─────────────────────────────────
  const getOfficeLocation = async (): Promise<OfficeLocation> => {
    try {
      const res = await fetch("/api/hrm/v2/tenants/current");
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          return {
            latitude: data.latitude,
            longitude: data.longitude,
            radius: data.geofenceRadius || 100,
          };
        }
      }
    } catch { /* use default */ }
    return DEFAULT_OFFICE;
  };

  // ── Determine attendance status based on time ────────────
  const getAttendanceStatus = (punchHour: number): string => {
    if (!isWorkDay) return "WEEK_OFF";
    if (punchHour > officeRules.lateAfter) return "LATE";
    return "PRESENT";
  };

  // ── Check if punch-out is early (before office end) ──────
  const isEarlyPunchOut = (): boolean => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    return currentHour < officeRules.officeEnd;
  };

  // ── Handle Punch In ──────────────────────────────────────
  const handleMarkAttendance = () => {
    setErrorMsg(null);
    setLoadingLocation(true);

    if (!navigator.geolocation) {
      setLoadingLocation(false);
      setErrorMsg("Geolocation is required for punch in. Please enable location access in your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const office = await getOfficeLocation();

        const { within, distance } = isWithinGeofence(
          userLat, userLng, office.latitude, office.longitude, office.radius
        );

        setDistanceMeters(distance);

        if (!within) {
          setLoadingLocation(false);
          setErrorMsg(
            `You are ${distance}m away from the office. Punch in is only allowed within ${office.radius}m radius. Please move closer to the office.`
          );
          return;
        }

        const now = new Date();
        const currentHour = now.getHours() + now.getMinutes() / 60;

        if (currentHour < officeRules.officeStart) {
          setLoadingLocation(false);
          setErrorMsg(`Office hours start at ${formatHour(officeRules.officeStart)}. You cannot punch in before then.`);
          return;
        }

        if (currentHour >= officeRules.officeEnd + 1) {
          setLoadingLocation(false);
          setErrorMsg(`Office hours end at ${formatHour(officeRules.officeEnd)}. Late punch-ins are not accepted.`);
          return;
        }

        const locationStr = `Lat: ${userLat.toFixed(4)}, Lng: ${userLng.toFixed(4)} (${distance}m from office)`;
        const status = getAttendanceStatus(currentHour);
        const isHalfDay = currentHour >= officeRules.halfDayAfter;

        await executePunchIn(locationStr, status, isHalfDay);
      },
      () => {
        setLoadingLocation(false);
        setErrorMsg("Unable to fetch your location. Please enable GPS and try again.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const executePunchIn = async (locStr: string, status: string, isHalfDay: boolean) => {
    const userName = user?.name || user?.email || "Employee";
    const userEmail = user?.email || "employee@company.com";
    const empCode = user?.id ? `EMP-2026-${user.id.substring(0, 4).toUpperCase()}` : "EMP-2026-XXXX";
    const finalStatus = isHalfDay ? "HALF_DAY" : status;

    let serverSaved = false;
    try {
      const res = await punchInAction({
        userId, userName, userEmail, employeeCode: empCode,
        location: locStr, status: finalStatus,
      });
      if (res.success && res.record) {
        serverSaved = true;
        setPunchedIn(true);
        setPunchTime(res.record.punchInTime);
        setLocationName(res.record.location || locStr);
        setStatusLabel(res.record.status || finalStatus);
        setWorkSeconds(0);
        setPunchOutTime(null);
        localStorage.setItem(
          punchStateKey(userId),
          JSON.stringify({
            punchedIn: true, date: todayStr, punchTime: res.record.punchInTime,
            locationName: res.record.location || locStr, statusLabel: res.record.status || finalStatus,
            distanceMeters, synced: true,
          })
        );
        window.dispatchEvent(new CustomEvent("attendance-updated", { detail: { type: "punch-in", record: res.record } }));
      }
    } catch { /* server unavailable */ }

    if (!serverSaved) {
      const now = new Date();
      const localRecord = {
        userId, userName, userEmail, employeeCode: empCode,
        date: todayStr, punchInTime: now.toISOString(), location: locStr, status: finalStatus,
      };
      const pending = JSON.parse(localStorage.getItem("pending-attendance") || "[]");
      pending.push(localRecord);
      localStorage.setItem("pending-attendance", JSON.stringify(pending));

      setPunchedIn(true);
      setPunchTime(now.toISOString());
      setLocationName(locStr + " (Offline - pending sync)");
      setStatusLabel(finalStatus);
      setWorkSeconds(0);
      setPunchOutTime(null);
      localStorage.setItem(
        punchStateKey(userId),
        JSON.stringify({
          punchedIn: true, date: todayStr, punchTime: now.toISOString(),
          locationName: locStr + " (Offline - pending sync)", statusLabel: finalStatus,
          distanceMeters, synced: false,
        })
      );
      window.dispatchEvent(new CustomEvent("attendance-updated", { detail: { type: "punch-in-local", record: localRecord } }));
      setErrorMsg("Database unavailable. Attendance saved locally and will sync when the server is back online.");
    }

    setLoadingLocation(false);
  };

  // ── Handle Punch Out ─────────────────────────────────────
  const handlePunchOut = async () => {
    // Always allow punch-out, but check if it's early
    if (isEarlyPunchOut() && isWorkDay) {
      setShowEarlyLeaveModal(true);
      return;
    }

    await executePunchOut();
  };

  const executePunchOut = async () => {
    await punchOutAction(userId, todayStr);

    setPunchedIn(false);
    setPunchOutTime(new Date().toISOString());
    setWorkSeconds(0);
    setDistanceMeters(null);
    localStorage.removeItem(punchStateKey(userId));

    window.dispatchEvent(new CustomEvent("attendance-updated", { detail: { type: "punch-out", userId } }));
  };

  // ── Submit early leave request ────────────────────────────
  const submitEarlyLeaveRequest = async () => {
    if (!earlyLeaveReason.trim()) return;
    setSubmittingApproval(true);

    try {
      // Create an early departure notification to HR (not a full leave request since there's no leave type)
      // This sends an approval request that HR and CEO need to review
      await fetch("/api/hrm/v2/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_to_role",
          role: "hr_admin",
          title: "Early Departure Approval Required",
          body: `${user?.name || user?.email} requests early punch-out at ${new Date().toLocaleTimeString()}. Reason: ${earlyLeaveReason}. Requires CEO approval.`,
          type: "approval",
          referenceType: "early_departure",
          referenceId: userId,
        }),
      });

      // Also send notification to HR
      await fetch("/api/hrm/v2/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          userId: userId,
          title: "Early Departure Request",
          body: `${user?.name || user?.email} requested early punch-out. Reason: ${earlyLeaveReason}`,
          type: "approval",
        }),
      });

      // Still allow the punch-out
      await executePunchOut();
      setShowEarlyLeaveModal(false);
      setEarlyLeaveReason("");
      setSuccessMsg("Early departure request sent to HR for approval.");
    } catch {
      // Still punch out even if notification fails
      await executePunchOut();
      setShowEarlyLeaveModal(false);
      setEarlyLeaveReason("");
    }

    setSubmittingApproval(false);
  };

  // ── Helpers ──────────────────────────────────────────────
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatHour = (h: number) => {
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    const ampm = hrs >= 12 ? "PM" : "AM";
    const displayHr = hrs > 12 ? hrs - 12 : hrs === 0 ? 12 : hrs;
    return `${displayHr}:${mins.toString().padStart(2, "0")} ${ampm}`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
            <Clock className="h-5 w-5 text-primary animate-pulse" /> Daily Attendance &amp; Shift Punch
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Office: <strong>{formatHour(officeRules.officeStart)} – {formatHour(officeRules.officeEnd)}</strong> · Late after <strong>{formatHour(officeRules.lateAfter)}</strong>
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            Work days: {officeRules.workDays.map(d => ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d]).join(", ")}
          </p>
        </div>
        {distanceMeters !== null && punchedIn && (
          <span className="self-start sm:self-center flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
            <Navigation className="h-3.5 w-3.5" /> {distanceMeters}m from office
          </span>
        )}
      </div>

      {/* Error message */}
      {errorMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Success message */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5 rounded-xl bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/5">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            {punchedIn && !punchOutTime ? "Punched In at:" : punchOutTime ? "Punched Out at:" : "Status:"}
          </span>
          <p className="text-base font-bold text-slate-900 dark:text-white">
            {punchedIn && punchTime
              ? new Date(punchTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "Not Punched In Today"}
          </p>
          {punchOutTime && (
            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              Out: {new Date(punchOutTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          {punchedIn && (
            <div className="mt-2 space-y-1">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                statusLabel === "LATE" ? "text-yellow-600 dark:text-yellow-400" :
                statusLabel === "HALF_DAY" ? "text-orange-600 dark:text-orange-400" :
                statusLabel === "WEEK_OFF" ? "text-blue-600 dark:text-blue-400" :
                "text-emerald-600 dark:text-emerald-400"
              }`}>
                <CheckCircle2 className="h-4 w-4" /> Status: {statusLabel}
              </span>
              {locationName && (
                <p className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> {locationName}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Stopwatch */}
        <div className="text-center bg-white dark:bg-black/60 px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 shadow-inner">
          <span className="font-mono text-3xl font-extrabold tracking-wider text-slate-900 dark:text-white">
            {formatTime(workSeconds)}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5 font-medium">
            Elapsed Shift Hours
          </span>
        </div>

        {/* Action Buttons */}
        <div>
          {!punchedIn ? (
            <Button
              onClick={handleMarkAttendance}
              disabled={loadingLocation}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-6 h-11 text-sm shadow-md"
            >
              {loadingLocation ? (
                <span className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 animate-spin" /> Validating Geofence...
                </span>
              ) : (
                <span className="flex items-center gap-2">📍 Punch In</span>
              )}
            </Button>
          ) : punchOutTime ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10">
              ✓ Shift Complete
            </span>
          ) : (
            <Button onClick={handlePunchOut} variant="danger" className="font-bold gap-2 px-6 h-11 text-sm">
              <LogOut className="h-4 w-4" /> Punch Out
            </Button>
          )}
        </div>
      </div>

      {/* Geofence notice */}
      {!punchedIn && !errorMsg && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3 text-center flex items-center justify-center gap-1">
          <MapPin className="h-3 w-3" /> Punch in requires GPS location within {DEFAULT_OFFICE.radius}m of the office
        </p>
      )}

      {/* ═══ Early Leave Approval Modal ═══ */}
      {showEarlyLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0B0F19] rounded-2xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Early Departure Request
              </h3>
              <button onClick={() => setShowEarlyLeaveModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You are punching out before the office end time ({formatHour(officeRules.officeEnd)}). This will be sent to HR for approval and requires CEO sign-off.
            </p>
            <textarea
              placeholder="Reason for early departure..."
              value={earlyLeaveReason}
              onChange={(e) => setEarlyLeaveReason(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-primary"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEarlyLeaveModal(false)} className="text-xs">Cancel</Button>
              <Button
                onClick={submitEarlyLeaveRequest}
                disabled={submittingApproval || !earlyLeaveReason.trim()}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs gap-1"
              >
                {submittingApproval ? "Submitting..." : <><Send className="h-3 w-3" /> Submit & Punch Out</>}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
