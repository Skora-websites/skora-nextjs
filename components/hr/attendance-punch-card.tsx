"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  Zap,
  Coffee,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { punchInAction, punchOutAction, updateAUXStateAction } from "@/lib/actions/attendance-actions";
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

  // Live GPS tracking state
  const [gpsTrackingActive, setGpsTrackingActive] = useState(false);
  const [lastGpsUpdate, setLastGpsUpdate] = useState<string | null>(null);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [bgStatus, setBgStatus] = useState<"active" | "paused" | "resumed">("active");
  const wakeLockRef2 = useRef<WakeLockSentinel | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // AUX state (Active / On Break / Meeting)
  const [auxState, setAuxState] = useState<"active" | "on_break" | "meeting">("active");
  const [auxSwitching, setAuxSwitching] = useState(false);
  const [auxSince, setAuxSince] = useState<string | null>(null);
  const auxPeriodsRef = useRef<Array<{ state: string; start: string; end?: string }>>([]);
  const periodStartRef = useRef<string | null>(null);
  const [totalElapsed, setTotalElapsed] = useState(0);

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
        const parsed = JSON.parse(storedState);          if (parsed.punchedIn && parsed.date === todayStr) {
          setPunchedIn(true);
          setPunchTime(parsed.punchTime);
          setPunchOutTime(parsed.punchOutTime || null);
          setLocationName(parsed.locationName || "GPS Verified");
          setStatusLabel(parsed.statusLabel || "PRESENT");
          setDistanceMeters(parsed.distanceMeters || null);
          if (parsed.auxState) setAuxState(parsed.auxState);
          if (parsed.auxSince) setAuxSince(parsed.auxSince);
          // Restore AUX periods from localStorage for accurate timer
          if (parsed.auxPeriods && Array.isArray(parsed.auxPeriods)) {
            auxPeriodsRef.current = parsed.auxPeriods;
          } else {
            // Build a single period from punch-in to now
            auxPeriodsRef.current = [{ state: parsed.auxState || "active", start: parsed.punchTime }];
          }
          periodStartRef.current = parsed.auxSince || parsed.punchTime;
          if (!parsed.punchOutTime) {
            // Compute effective work seconds from AUX history
            const periods = auxPeriodsRef.current;
            let totalMs = 0;
            const nowMs = Date.now();
            for (const p of periods) {
              if (p.state === "active" || p.state === "meeting") {
                const startMs = new Date(p.start).getTime();
                const endMs = p.end ? new Date(p.end).getTime() : nowMs;
                totalMs += endMs - startMs;
              }
            }
            setWorkSeconds(Math.max(0, Math.floor(totalMs / 1000)));
            // Also compute total elapsed (wall clock)
            const totalSecs = Math.floor((Date.now() - new Date(parsed.punchTime).getTime()) / 1000);
            setTotalElapsed(totalSecs > 0 ? totalSecs : 0);
          }
        }
      } catch { /* ignore */ }
    }
  }, [userId, todayStr]);

  // ── Compute effective work seconds from AUX history ───────
  const computeEffectiveWorkSeconds = useCallback(() => {
    const periods = auxPeriodsRef.current;
    if (!periods || periods.length === 0) return 0;
    let totalMs = 0;
    const nowMs = Date.now();
    for (const p of periods) {
      if (p.state === "active" || p.state === "meeting") {
        const startMs = new Date(p.start).getTime();
        const endMs = p.end ? new Date(p.end).getTime() : nowMs;
        totalMs += endMs - startMs;
      }
    }
    return Math.max(0, Math.floor(totalMs / 1000));
  }, []);

  // ── Timer — effective work ticks only during active/meeting ──
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (punchedIn && !punchOutTime && (auxState === "active" || auxState === "meeting")) {
      interval = setInterval(() => {
        setWorkSeconds(computeEffectiveWorkSeconds());
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [punchedIn, punchOutTime, auxState, computeEffectiveWorkSeconds]);

  // ── Total elapsed timer (wall clock — always ticks) ────────
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (punchedIn && !punchOutTime) {
      interval = setInterval(() => {
        setTotalElapsed((prev) => prev + 1);
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

  // ── Handle AUX state change ──────────────────────────────
  const handleAUXChange = async (newState: "active" | "on_break" | "meeting") => {
    if (auxSwitching || newState === auxState) return;
    setAuxSwitching(true);
    const nowISO = new Date().toISOString();
    try {
      const res = await updateAUXStateAction(userId, todayStr, newState);
      if (res.success) {
        // Finalize current period and start new one
        const periods = auxPeriodsRef.current;
        if (periods.length > 0 && !periods[periods.length - 1].end) {
          periods[periods.length - 1].end = nowISO;
        }
        periods.push({ state: newState, start: nowISO });
        periodStartRef.current = nowISO;

        setAuxState(newState);
        setAuxSince(nowISO);

        // Recompute effective work seconds
        setWorkSeconds(computeEffectiveWorkSeconds());

        // Persist to localStorage
        const stored = localStorage.getItem(punchStateKey(userId));
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.auxState = newState;
          parsed.auxSince = nowISO;
          parsed.auxPeriods = auxPeriodsRef.current;
          localStorage.setItem(punchStateKey(userId), JSON.stringify(parsed));
        }
      } else {
        setErrorMsg(res.error || "Failed to update AUX state");
      }
    } catch {
      setErrorMsg("Failed to update AUX state. Please try again.");
    }
    setAuxSwitching(false);
  };

  // ── AUX elapsed time display ──────────────────────────────
  const auxElapsed = (): string => {
    if (!auxSince) return "";
    const secs = Math.floor((Date.now() - new Date(auxSince).getTime()) / 1000);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  // ── Check if punch-out is early (before office end) ──────
  const isEarlyPunchOut = (): boolean => {
    const now = new Date();
    const currentHour = now.getHours() + now.getMinutes() / 60;
    return currentHour < officeRules.officeEnd;
  };


  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1'
  );

  // Send location to server
  const sendLocationUpdate = useCallback(async (lat: number, lng: number, acc: number) => {
    try {
      await fetch("/api/hrm/v2/attendance/location", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, accuracy: acc }),
      });
      setLastGpsUpdate(new Date().toISOString());
      setGpsAccuracy(acc);
    } catch { /* retry next cycle */ }
  }, []);

  // Start continuous GPS tracking
  const startGpsTracking = useCallback(() => {
    if (isLocalhost) {
      setGpsTrackingActive(true);
      setLastGpsUpdate(new Date().toISOString());
      setGpsAccuracy(5);
      locationIntervalRef.current = setInterval(() => {
        const mockLat = DEFAULT_OFFICE.latitude + (Math.random() - 0.5) * 0.0002;
        const mockLng = DEFAULT_OFFICE.longitude + (Math.random() - 0.5) * 0.0002;
        sendLocationUpdate(mockLat, mockLng, 5);
      }, 30000);
      return;
    }
    if (!navigator.geolocation) return;
    setGpsTrackingActive(true);
    setLastGpsUpdate(new Date().toISOString());
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsAccuracy(pos.coords.accuracy);
        (window as any).__gpsLatestPosition = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        };
      },
      (err) => { console.warn("GPS tracking error:", err.message); },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    locationIntervalRef.current = setInterval(() => {
      const p = (window as any).__gpsLatestPosition;
      if (p) sendLocationUpdate(p.latitude, p.longitude, p.accuracy);
    }, 30000);
  }, [isLocalhost, sendLocationUpdate]);

  // Stop GPS tracking
  const stopGpsTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setGpsTrackingActive(false);
    setLastGpsUpdate(null);
    setGpsAccuracy(null);
    (window as any).__gpsLatestPosition = null;
  }, []);
  // Acquire Wake Lock — keeps screen on so GPS stays active
  const acquireWakeLock = useCallback(async () => {
    if (!("wakeLock" in navigator)) return;
    try {
      const wl = await navigator.wakeLock.request("screen");
      wakeLockRef2.current = wl;
      setWakeLockActive(true);
      wl.addEventListener("release", () => {
        wakeLockRef2.current = null;
        setWakeLockActive(false);
      });
    } catch { /* not supported */ }
  }, []);

  // Release Wake Lock
  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef2.current) {
      try { await wakeLockRef2.current.release(); } catch {}
      wakeLockRef2.current = null;
    }
    setWakeLockActive(false);
  }, []);

  // Visibility API — auto-resume GPS when app comes back to foreground
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible" && punchedIn && !punchOutTime) {
        // App came back to foreground — resume GPS
        if (!gpsTrackingActive) startGpsTracking();
        acquireWakeLock();
        setBgStatus("resumed");
      } else if (document.visibilityState === "hidden") {
        setBgStatus("paused");
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [punchedIn, punchOutTime, gpsTrackingActive, startGpsTracking, acquireWakeLock]);

  // Re-acquire Wake Lock on window focus (iOS requirement)
  useEffect(() => {
    const handleFocus = () => {
      if (punchedIn && !punchOutTime && !wakeLockRef2.current) {
        acquireWakeLock();
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [punchedIn, punchOutTime, acquireWakeLock]);

  // Resume tracking if page reloads while punched in
  useEffect(() => {
    if (punchedIn && !punchOutTime && !gpsTrackingActive) {
      startGpsTracking();
    }
  }, [punchedIn, punchOutTime, gpsTrackingActive]);

  // ── Handle Punch In ──────────────────────────────────────

  const handleMarkAttendance = () => {
    setErrorMsg(null);
    setLoadingLocation(true);

    // In development (localhost), skip GPS verification
    if (isLocalhost) {
      const now = new Date();
      const currentHour = now.getHours() + now.getMinutes() / 60;
      const status = getAttendanceStatus(currentHour);
      const isHalfDay = currentHour >= officeRules.halfDayAfter;
      const locationStr = "GPS skipped (localhost development mode)";
      setDistanceMeters(0);
      executePunchIn(locationStr, isHalfDay ? "HALF_DAY" : status, isHalfDay);
      return;
    }

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

        // Determine work location based on GPS distance from office
        const workLocation = within ? "office" : "remote";

        const now = new Date();
        const currentHour = now.getHours() + now.getMinutes() / 60;

        // Only enforce office hours for in-office punch-ins
        if (within) {
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
        }

        const locationStr = `Lat: ${userLat.toFixed(4)}, Lng: ${userLng.toFixed(4)} (${distance}m from office) [${workLocation}]`;
        const status = within ? getAttendanceStatus(currentHour) : "WFH";
        const isHalfDay = within && currentHour >= officeRules.halfDayAfter;

        await executePunchIn(locationStr, status, isHalfDay, workLocation);
      },
      () => {
        setLoadingLocation(false);
        setErrorMsg("Unable to fetch your location. Please enable GPS and try again.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const executePunchIn = async (locStr: string, status: string, isHalfDay: boolean, workLocation: "office" | "remote" = "office") => {
    const userName = user?.name || user?.email || "Employee";
    const userEmail = user?.email || "employee@company.com";
    const empCode = user?.id ? `EMP-2026-${user.id.substring(0, 4).toUpperCase()}` : "EMP-2026-XXXX";
    const finalStatus = isHalfDay ? "HALF_DAY" : status;

    let serverSaved = false;
    try {
      const res = await punchInAction({
        userId, userName, userEmail, employeeCode: empCode,
        location: locStr, status: finalStatus, workLocation,
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
            distanceMeters, synced: true, auxState: "active", auxSince: res.record.punchInTime,
            auxPeriods: [{ state: "active", start: res.record.punchInTime }],
          })
        );
        auxPeriodsRef.current = [{ state: "active", start: res.record.punchInTime }];
        periodStartRef.current = res.record.punchInTime;
        setAuxState("active");
        setAuxSince(res.record.punchInTime);
        window.dispatchEvent(new CustomEvent("attendance-updated", { detail: { type: "punch-in", record: res.record } }));
        startGpsTracking();
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
          distanceMeters, synced: false, auxState: "active", auxSince: now.toISOString(),
          auxPeriods: [{ state: "active", start: now.toISOString() }],
        })
      );
      auxPeriodsRef.current = [{ state: "active", start: now.toISOString() }];
      periodStartRef.current = now.toISOString();
      setAuxState("active");
      setAuxSince(now.toISOString());
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
    stopGpsTracking();
    await punchOutAction(userId, todayStr);

    setPunchedIn(false);
    setPunchOutTime(new Date().toISOString());
    setWorkSeconds(0);
    setDistanceMeters(null);
    setAuxState("active");
    setAuxSince(null);
    auxPeriodsRef.current = [];
    periodStartRef.current = null;
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
        {punchedIn && !punchOutTime && (
          <div className="self-start sm:self-center flex flex-col items-end gap-1.5">
            {distanceMeters !== null && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                <Navigation className="h-3.5 w-3.5" /> {distanceMeters}m from office
              </span>
            )}
            {gpsTrackingActive && (
              <div className="flex flex-col items-end gap-1">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  GPS Active
                  {gpsAccuracy && <span className="text-blue-400">±{Math.round(gpsAccuracy)}m</span>}
                </span>
                {wakeLockActive && (
                  <span className="text-[9px] text-emerald-500 dark:text-emerald-400 font-medium">
                    🔒 Screen lock held — GPS stays active
                  </span>
                )}
                {bgStatus === "paused" && (
                  <span className="text-[9px] text-amber-500 dark:text-amber-400 font-medium animate-pulse">
                    ⏸️ Background — GPS paused (open app to resume)
                  </span>
                )}
                {bgStatus === "resumed" && (
                  <span className="text-[9px] text-emerald-500 dark:text-emerald-400 font-medium">
                    ✅ Resumed — GPS tracking active
                  </span>
                )}
              </div>
            )}
          </div>
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
            Effective Work Hours
          </span>
          <span className="text-[9px] text-slate-400 dark:text-slate-500 block mt-0.5">
            Total elapsed: {formatTime(totalElapsed)}
          </span>
          {auxState === "on_break" && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-1">
              ⏸ Timer paused — on break
            </span>
          )}
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
          <MapPin className="h-3 w-3" /> {isLocalhost ? "Development mode \u2014 GPS verification disabled" : `Punch in requires GPS location within ${DEFAULT_OFFICE.radius}m of the office`}
        </p>
      )}

      {/* ═══ AUX State Toggle (Active / On Break / Meeting) ═══ */}
      {punchedIn && !punchOutTime && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 dark:from-black/30 dark:to-blue-500/5 border border-gray-200 dark:border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" /> AUX Status
            </span>
            {auxSince && (
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                In {auxState === "active" ? "Active" : auxState === "on_break" ? "Break" : "Meeting"} for {auxElapsed()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAUXChange("active")}
              disabled={auxSwitching}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border
                ${auxState === "active"
                  ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                  : "bg-white dark:bg-black/40 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-white/10 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-300 dark:hover:border-emerald-500/30"
                }`
            }
            >
              <Zap className="h-3.5 w-3.5" /> Active
            </button>
            <button
              onClick={() => handleAUXChange("on_break")}
              disabled={auxSwitching}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border
                ${auxState === "on_break"
                  ? "bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20"
                  : "bg-white dark:bg-black/40 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-white/10 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:border-amber-300 dark:hover:border-amber-500/30"
                }`
            }
            >
              <Coffee className="h-3.5 w-3.5" /> On Break
            </button>
            <button
              onClick={() => handleAUXChange("meeting")}
              disabled={auxSwitching}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 border
                ${auxState === "meeting"
                  ? "bg-purple-500 text-white border-purple-600 shadow-md shadow-purple-500/20"
                  : "bg-white dark:bg-black/40 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-white/10 hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 dark:hover:border-purple-500/30"
                }`
            }
            >
              <Users className="h-3.5 w-3.5" /> Meeting
            </button>
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 text-center">
            {auxState === "active" && "Working — all logged hours count toward your shift."}
            {auxState === "on_break" && "On break — timer paused. Extra break deducts from login hours."}
            {auxState === "meeting" && "In meeting — counts as active work time."}
          </p>
          {/* Work / Break breakdown bar */}
          {totalElapsed > 60 && (
            <div className="mt-3">
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-1">
                <span>Work: {formatTime(workSeconds)}</span>
                <span>Break: {formatTime(Math.max(0, totalElapsed - workSeconds))}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${totalElapsed > 0 ? (workSeconds / totalElapsed) * 100 : 0}%` }}
                />
                <div
                  className="h-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${totalElapsed > 0 ? ((totalElapsed - workSeconds) / totalElapsed) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
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
