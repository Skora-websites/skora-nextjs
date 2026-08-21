"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  CheckCircle2,
  LogOut,
  Navigation,
  AlertCircle,
  AlertTriangle,
  Lock,
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

const DEFAULT_OFFICE: OfficeLocation = {
  latitude: 28.6007594, // Office location
  longitude: 77.4319307,
  radius: 100,
};

// ── Office hours constants ─────────────────────────────────
const OFFICE_START = 10; // 10:00 AM
const OFFICE_END = 19; // 7:00 PM
const LUNCH_START = 14; // 2:00 PM
const LUNCH_END = 14.5; // 2:30 PM
const LATE_CUTOFF = 10.5; // 10:30 AM

export function AttendancePunchCard() {
  const { user } = useAuth();
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState<string>("PRESENT");
  const [workSeconds, setWorkSeconds] = useState(0);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [overtimePending, setOvertimePending] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  // ── Restore state from localStorage ───────────────────────
  useEffect(() => {
    const storedState = localStorage.getItem("employee-punch-state");
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        if (parsed.punchedIn && parsed.date === todayStr) {
          setPunchedIn(true);
          setPunchTime(parsed.punchTime);
          setLocationName(parsed.locationName || "GPS Verified");
          setStatusLabel(parsed.statusLabel || "PRESENT");
          setDistanceMeters(parsed.distanceMeters || null);
          const elapsed = Math.floor(
            (Date.now() - new Date(parsed.punchTime).getTime()) / 1000
          );
          setWorkSeconds(elapsed > 0 ? elapsed : 0);
        }
      } catch { /* ignore */ }
    }
  }, [todayStr]);

  // ── Sync pending offline records when DB comes back ─────────
  useEffect(() => {
    const syncPending = async () => {
      const pending = JSON.parse(localStorage.getItem("pending-attendance") || "[]");
      if (pending.length === 0) return;
      const synced: typeof pending = [];
      for (const rec of pending) {
        try {
          const res = await punchInAction({
            userId: rec.userId,
            userName: rec.userName,
            userEmail: rec.userEmail,
            employeeCode: rec.employeeCode,
            location: rec.location,
            status: rec.status,
          });
          if (res.success && res.record) synced.push(rec);
        } catch { break; } // DB still down, stop trying
      }
      if (synced.length > 0) {
        const remaining = pending.filter((r: any) => !synced.includes(r));
        localStorage.setItem("pending-attendance", JSON.stringify(remaining));
        // Update punch state to show synced
        const stored = localStorage.getItem("employee-punch-state");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.synced = true;
          parsed.locationName = (parsed.locationName || "").replace(" (Offline - pending sync)", "");
          localStorage.setItem("employee-punch-state", JSON.stringify(parsed));
          setLocationName(parsed.locationName);
        }
      }
    };
    syncPending();
  }, []);

  // ── Timer ─────────────────────────────────────────────────
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (punchedIn) {
      interval = setInterval(() => {
        setWorkSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [punchedIn]);

  // ── Fetch office location from tenant ────────────────────
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
    const day = new Date().getDay();
    if (day === 0 || day === 6) return "WEEK_OFF";
    if (punchHour > LATE_CUTOFF) return "LATE";
    return "PRESENT";
  };

  // ── Check if currently in lunch break ────────────────────
  const isLunchBreak = (): boolean => {
    const now = new Date();
    const hours = now.getHours() + now.getMinutes() / 60;
    return hours >= LUNCH_START && hours < LUNCH_END;
  };

  // ── Check overtime (after 7 PM) ──────────────────────────
  const checkOvertime = (punchHour: number) => {
    if (punchHour >= OFFICE_END) {
      setOvertimePending(true);
    }
  };

  // ── Handle Punch In ──────────────────────────────────────
  const handleMarkAttendance = () => {
    setErrorMsg(null);
    setLoadingLocation(true);

    if (!navigator.geolocation) {
      // No geolocation available — deny punch in for security
      setLoadingLocation(false);
      setErrorMsg("Geolocation is required for punch in. Please enable location access in your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // Fetch office coordinates
        const office = await getOfficeLocation();

        // Validate geofence using Haversine
        const { within, distance } = isWithinGeofence(
          userLat,
          userLng,
          office.latitude,
          office.longitude,
          office.radius
        );

        setDistanceMeters(distance);

        if (!within) {
          setLoadingLocation(false);
          setErrorMsg(
            `You are ${distance}m away from the office. Punch in is only allowed within ${office.radius}m radius. Please move closer to the office.`
          );
          return;
        }

        // Within geofence — proceed with punch in
        const now = new Date();
        const currentHour = now.getHours() + now.getMinutes() / 60;

        // Check if before office hours
        if (currentHour < OFFICE_START) {
          setLoadingLocation(false);
          setErrorMsg("Office hours start at 10:00 AM. You cannot punch in before then.");
          return;
        }

        // Check if after office hours
        if (currentHour >= OFFICE_END + 1) {
          setLoadingLocation(false);
          setErrorMsg("Office hours end at 7:00 PM. Late punch-ins are not accepted.");
          return;
        }

        const locationStr = `Lat: ${userLat.toFixed(4)}, Lng: ${userLng.toFixed(4)} (${distance}m from office)`;
        const status = getAttendanceStatus(currentHour);

        // Check overtime
        checkOvertime(currentHour);

        // Determine if it's a half-day (punched in after 2:30 PM)
        const isHalfDay = currentHour >= LUNCH_END;

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
    const userId = user?.id || user?.email || "emp_user";
    const userName = user?.name || user?.email || "Employee";
    const userEmail = user?.email || "employee@company.com";
    const empCode = user?.id ? `EMP-2026-${user.id.substring(0, 4).toUpperCase()}` : "EMP-2026-XXXX";

    const finalStatus = isHalfDay ? "HALF_DAY" : status;
    const now = new Date();

    // Try saving to database first
    let serverSaved = false;
    try {
      const res = await punchInAction({
        userId,
        userName,
        userEmail,
        employeeCode: empCode,
        location: locStr,
        status: finalStatus,
      });
      if (res.success && res.record) {
        serverSaved = true;
        setPunchedIn(true);
        setPunchTime(res.record.punchInTime);
        setLocationName(res.record.location || locStr);
        setStatusLabel(res.record.status || finalStatus);
        setWorkSeconds(0);
        localStorage.setItem(
          "employee-punch-state",
          JSON.stringify({
            punchedIn: true,
            date: todayStr,
            punchTime: res.record.punchInTime,
            locationName: res.record.location || locStr,
            statusLabel: res.record.status || finalStatus,
            distanceMeters: distanceMeters,
            synced: true,
          })
        );
      }
    } catch { /* server unavailable */ }

    // Fallback: save locally if server is unavailable
    if (!serverSaved) {
      const localRecord = {
        userId,
        userName,
        userEmail,
        employeeCode: empCode,
        date: todayStr,
        punchInTime: now.toISOString(),
        location: locStr,
        status: finalStatus,
      };
      // Save to pending sync queue
      const pending = JSON.parse(localStorage.getItem("pending-attendance") || "[]");
      pending.push(localRecord);
      localStorage.setItem("pending-attendance", JSON.stringify(pending));

      // Also save to punch state for immediate UI update
      setPunchedIn(true);
      setPunchTime(now.toISOString());
      setLocationName(locStr + " (Offline - pending sync)");
      setStatusLabel(finalStatus);
      setWorkSeconds(0);
      localStorage.setItem(
        "employee-punch-state",
        JSON.stringify({
          punchedIn: true,
          date: todayStr,
          punchTime: now.toISOString(),
          locationName: locStr + " (Offline - pending sync)",
          statusLabel: finalStatus,
          distanceMeters: distanceMeters,
          synced: false,
        })
      );
      setErrorMsg("Database unavailable. Attendance saved locally and will sync when the server is back online.");
    }

    setLoadingLocation(false);
  };

  // ── Handle Punch Out ─────────────────────────────────────
  const handlePunchOut = async () => {
    // Check if during lunch break
    if (isLunchBreak()) {
      setErrorMsg("You cannot punch out during lunch break (2:00 PM - 2:30 PM).");
      return;
    }

    const userId = user?.id || user?.email || "emp_user";
    await punchOutAction(userId, todayStr);

    // Check if overtime should be triggered (after 7 PM)
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    if (currentHour >= OFFICE_END) {
      setOvertimePending(true);
    }

    setPunchedIn(false);
    setPunchTime(null);
    setLocationName(null);
    setWorkSeconds(0);
    setDistanceMeters(null);
    setOvertimePending(false);

    localStorage.removeItem("employee-punch-state");
  };

  // ── Format time ──────────────────────────────────────────
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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
            Office: <strong>10:00 AM – 7:00 PM</strong> · Lunch: <strong>2:00 – 2:30 PM</strong> · Late after 10:30 AM
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

      {/* Overtime pending notice */}
      {overtimePending && punchedIn && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 p-3 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>Overtime detected (past 7:00 PM). This will require Manager approval for payment.</span>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-5 rounded-xl bg-slate-50 dark:bg-black/40 border border-gray-200 dark:border-white/5">
        <div>
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            {punchedIn ? "Punched In at:" : "Status:"}
          </span>
          <p className="text-base font-bold text-slate-900 dark:text-white">
            {punchedIn && punchTime
              ? new Date(punchTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
              : "Not Punched In Today"}
          </p>
          {punchedIn && (
            <div className="mt-2 space-y-1">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                statusLabel === "LATE" ? "text-yellow-600 dark:text-yellow-400" :
                statusLabel === "HALF_DAY" ? "text-orange-600 dark:text-orange-400" :
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
                <span className="flex items-center gap-2">
                  📍 Punch In
                </span>
              )}
            </Button>
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
          <MapPin className="h-3 w-3" /> Punch in requires GPS location within 100m of the office (Haversine geofence)
        </p>
      )}
    </div>
  );
}
