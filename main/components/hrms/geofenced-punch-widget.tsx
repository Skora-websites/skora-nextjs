'use client';

import { useState } from 'react';
import { handleGeofencedPunchIn, handleGeofencedPunchOut, requestAttendanceRegularization } from '@/lib/actions/hrms-actions';
import { MapPin, Clock, AlertTriangle, CheckCircle2, Navigation, Coffee } from 'lucide-react';

interface GeofencedPunchWidgetProps {
  userId: string;
  userName: string;
  userRole: string;
  todayAttendance?: any;
}

export function GeofencedPunchWidget({ userId, userName, userRole, todayAttendance }: GeofencedPunchWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [regularizeModalOpen, setRegularizeModalOpen] = useState(false);
  const [regReason, setRegReason] = useState('');
  const [regDate, setRegDate] = useState(new Date().toISOString().split('T')[0]);

  const hasPunchedIn = Boolean(todayAttendance?.punchIn);
  const hasPunchedOut = Boolean(todayAttendance?.punchOut);

  const triggerPunchIn = () => {
    if (!navigator.geolocation) {
      setFeedback({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await handleGeofencedPunchIn(userId, pos.coords.latitude, pos.coords.longitude);
          if (res.success) {
            setFeedback({ type: 'success', text: res.message });
            setTimeout(() => window.location.reload(), 1500);
          } else {
            setFeedback({ type: 'error', text: res.message });
          }
        } catch (err: any) {
          setFeedback({ type: 'error', text: err.message || 'Failed to complete punch in.' });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setFeedback({ 
          type: 'error', 
          text: `Location permission denied or unavailable: ${err.message}. Geofenced punch requires location access.` 
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const triggerPunchOut = () => {
    if (!navigator.geolocation) {
      setFeedback({ type: 'error', text: 'Geolocation is not supported by your browser.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await handleGeofencedPunchOut(userId, pos.coords.latitude, pos.coords.longitude);
          if (res.success) {
            setFeedback({ type: 'success', text: res.message });
            setTimeout(() => window.location.reload(), 1500);
          } else {
            setFeedback({ type: 'error', text: res.message });
          }
        } catch (err: any) {
          setFeedback({ type: 'error', text: err.message || 'Failed to complete punch out.' });
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLoading(false);
        setFeedback({ 
          type: 'error', 
          text: `Location permission denied or unavailable: ${err.message}. Geofenced punch requires location access.` 
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleRegularizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regReason.trim()) return;

    setLoading(true);
    try {
      const res = await requestAttendanceRegularization(userId, regDate, regReason);
      if (res.success) {
        setFeedback({ type: 'success', text: res.message });
        setRegularizeModalOpen(false);
        setRegReason('');
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Background Subtle Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Strict Timings: Mon-Fri 10:00 AM - 7:00 PM</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>Geofenced Attendance Action Hub</span>
            {userRole === 'HR_ADMIN' || userRole === 'MANAGER' ? (
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                Escalates to Super Admin
              </span>
            ) : (
              <span className="text-xs bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                Escalates to Manager
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
            <Coffee className="w-4 h-4 text-amber-400" />
            <span>Lunch Break: 2:00 PM – 2:30 PM | 100m Office Geofence Radius</span>
          </p>
        </div>

        {/* Punch Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {!hasPunchedIn ? (
            <button
              onClick={triggerPunchIn}
              disabled={loading}
              className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Navigation className="w-4 h-4 animate-pulse" />
              <span>{loading ? 'Validating Geofence...' : 'Punch In (100m Radius)'}</span>
            </button>
          ) : !hasPunchedOut ? (
            <button
              onClick={triggerPunchOut}
              disabled={loading}
              className="flex items-center space-x-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-rose-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              <span>{loading ? 'Validating Geofence...' : 'Punch Out'}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2 bg-slate-800 text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Shift Completed Today</span>
            </div>
          )}

          <button
            onClick={() => setRegularizeModalOpen(true)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            Request Regularization
          </button>
        </div>
      </div>

      {/* Attendance Today Details */}
      {todayAttendance && (
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs font-mono">
          {todayAttendance.punchIn && (
            <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              In: <span className="text-white font-bold">{new Date(todayAttendance.punchIn).toLocaleTimeString()}</span>
              {todayAttendance.punchInLocation && (
                <span className="text-slate-400 ml-1">({todayAttendance.punchInLocation.distanceMeters}m dist)</span>
              )}
            </div>
          )}
          {todayAttendance.punchOut && (
            <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-300">
              Out: <span className="text-white font-bold">{new Date(todayAttendance.punchOut).toLocaleTimeString()}</span>
              {todayAttendance.punchOutLocation && (
                <span className="text-slate-400 ml-1">({todayAttendance.punchOutLocation.distanceMeters}m dist)</span>
              )}
            </div>
          )}
          {todayAttendance.status === 'LATE' && (
            <span className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-md font-sans text-[11px] font-semibold">
              LATE ARRIVAL (&gt;10:00 AM)
            </span>
          )}
          {todayAttendance.overtimeHours > 0 && (
            <span className="bg-purple-500/10 text-purple-400 border border-purple-500/30 px-2.5 py-1 rounded-md font-sans text-[11px] font-semibold">
              PENDING OVERTIME ({todayAttendance.overtimeHours} hrs past 7PM)
            </span>
          )}
        </div>
      )}

      {/* Feedback Banner */}
      {feedback && (
        <div className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-start gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
            : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Regularization Modal */}
      {regularizeModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Request Attendance Regularization</h3>
            <p className="text-xs text-slate-400">
              Submit a request for late arrival or missed punch in/out. 
              {userRole === 'HR_ADMIN' || userRole === 'MANAGER' 
                ? ' This request routes exclusively to the Super Admin.'
                : ' This request routes to your Reporting Manager.'
              }
            </p>

            <form onSubmit={handleRegularizeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Target Date</label>
                <input
                  type="date"
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Reason for Regularization</label>
                <textarea
                  rows={3}
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="Explain late arrival or missed punch (e.g. client meeting, network error)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRegularizeModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
