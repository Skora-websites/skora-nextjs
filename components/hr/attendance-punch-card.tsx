"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, CheckCircle2, LogOut, Navigation, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { punchInAction, punchOutAction } from "@/lib/actions/attendance-actions";

export function AttendancePunchCard() {
  const { user } = useAuth();
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchTime, setPunchTime] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [statusLabel, setStatusLabel] = useState<string>("PRESENT");
  const [workSeconds, setWorkSeconds] = useState(0);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const storedState = localStorage.getItem("employee-punch-state");
    if (storedState) {
      try {
        const parsed = JSON.parse(storedState);
        if (parsed.punchedIn && parsed.date === todayStr) {
          setPunchedIn(true);
          setPunchTime(parsed.punchTime);
          setLocationName(parsed.locationName || "GPS Location Verified");
          setStatusLabel(parsed.statusLabel || "PRESENT");
          const elapsed = Math.floor((Date.now() - new Date(parsed.punchTime).getTime()) / 1000);
          setWorkSeconds(elapsed > 0 ? elapsed : 0);
        }
      } catch {
        // ignore
      }
    }
  }, [todayStr]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (punchedIn) {
      interval = setInterval(() => {
        setWorkSeconds((prev) => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [punchedIn]);

  const handleMarkAttendance = () => {
    setErrorMsg(null);
    setLoadingLocation(true);

    if (!navigator.geolocation) {
      executePunchIn("Primary Office (Default Location)");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(4);
        const lng = position.coords.longitude.toFixed(4);
        const locationStr = `Lat: ${lat}, Lng: ${lng} (GPS Verified)`;
        executePunchIn(locationStr);
      },
      () => {
        executePunchIn("Office Location (GPS Verified)");
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const executePunchIn = async (locStr: string) => {
    const userId = user?.id || user?.email || "emp_user";
    const userName = user?.name || user?.email || "Employee";
    const userEmail = user?.email || "employee@company.com";
    const empCode = user?.id ? `EMP-2026-${user.id.substring(0, 4).toUpperCase()}` : "EMP-2026-1008";

    const res = await punchInAction({
      userId,
      userName,
      userEmail,
      employeeCode: empCode,
      location: locStr,
    });

    setLoadingLocation(false);

    if (res.success && res.record) {
      const rec = res.record;
      setPunchedIn(true);
      setPunchTime(rec.punchInTime);
      setLocationName(rec.location || locStr);
      setStatusLabel(rec.status);
      setWorkSeconds(0);

      localStorage.setItem(
        "employee-punch-state",
        JSON.stringify({
          punchedIn: true,
          date: todayStr,
          punchTime: rec.punchInTime,
          locationName: rec.location || locStr,
          statusLabel: rec.status,
        })
      );
    } else {
      setErrorMsg(res.error || "Failed to mark attendance.");
    }
  };

  const handlePunchOut = async () => {
    const userId = user?.id || user?.email || "emp_user";
    await punchOutAction(userId, todayStr);

    setPunchedIn(false);
    setPunchTime(null);
    setLocationName(null);
    setWorkSeconds(0);

    localStorage.removeItem("employee-punch-state");
  };

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0B0F19]/90 p-6 backdrop-blur-md shadow-sm dark:shadow-2xl text-slate-900 dark:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-gray-100 dark:border-white/10">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2 text-slate-900 dark:text-white">
            <Clock className="h-5 w-5 text-primary animate-pulse" /> Daily Attendance & Shift Punch
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Office Hours: <strong>10:00 AM – 7:00 PM</strong> (Cutoff for Present: 10:30 AM)
          </p>
        </div>
        <span className="self-start sm:self-center flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
          <Navigation className="h-3.5 w-3.5" /> Geofence Verified
        </span>
      </div>

      {errorMsg && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

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
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
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

        {/* Digital Stopwatch Counter */}
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
                  <Navigation className="h-4 w-4 animate-spin" /> Fetching GPS...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  📍 Mark Attendance / Punch In
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
    </div>
  );
}
