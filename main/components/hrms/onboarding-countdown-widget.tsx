'use client';

import { useState, useEffect } from 'react';
import { Clock, ShieldAlert, Upload, CheckCircle2, FileText } from 'lucide-react';
import { uploadOnboardingDocument } from '@/lib/actions/hrms-actions';

interface OnboardingCountdownWidgetProps {
  user: any;
}

export function OnboardingCountdownWidget({ user }: OnboardingCountdownWidgetProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState('AADHAAR');
  const [fileName, setFileName] = useState('');
  const [msg, setMsg] = useState('');

  const isPendingUpload = user.onboardingStatus === 'PENDING_UPLOAD';
  const isPendingReview = user.onboardingStatus === 'PENDING_REVIEW';
  const isRejected = user.onboardingStatus === 'REJECTED';
  const isEscalated = user.onboardingStatus === 'ESCALATED_SUPERADMIN';
  const isVerified = user.onboardingStatus === 'VERIFIED';

  useEffect(() => {
    if (!user.onboardingDeadline) return;

    const interval = setInterval(() => {
      const target = new Date(user.onboardingDeadline).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user.onboardingDeadline]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    setLoading(true);
    try {
      const mockUrl = `https://firebasestorage.googleapis.com/v0/b/skora-hrms.appspot.com/o/docs%2F${user._id}_${docType}.pdf?alt=media`;
      const res = await uploadOnboardingDocument(user._id, docType, fileName, mockUrl);
      if (res.success) {
        setMsg(res.message);
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err: any) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          <div>
            <h3 className="text-white font-bold text-base">Onboarding Verified</h3>
            <p className="text-xs text-slate-300">
              Employee Code: <span className="font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">{user.employeeCode || 'EMP-2026-0042'}</span> | Department: <span className="text-white font-medium">{user.department}</span>
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-400">
          Reporting Manager: <span className="text-slate-200 font-semibold">{user.reportingManagerId?.name || 'Marcus Brody'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl p-6 border shadow-xl relative overflow-hidden ${
      isRejected || isEscalated ? 'bg-rose-950/40 border-rose-800/60' : 'bg-slate-900 border-slate-800'
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            {isEscalated ? (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" /> ESCALATED TO SUPER ADMIN (48H DEADLINE EXPIRED)
              </span>
            ) : isRejected ? (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 animate-spin" /> RE-UPLOAD REQUIRED (48-HOUR COUNTDOWN RUNNING)
              </span>
            ) : isPendingReview ? (
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-full text-xs font-bold">
                UNDER HR REVIEW
              </span>
            ) : (
              <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-bold">
                PENDING DOCUMENT UPLOAD
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white">Compliance & Onboarding Verification</h3>
          <p className="text-xs text-slate-300 max-w-xl">
            {isRejected 
              ? 'Your compliance documents were rejected by HR. Please re-upload corrected documents before the 48-hour deadline expires.'
              : isEscalated
              ? 'Your document re-upload deadline of 48 hours passed and has been escalated to the Super Admin for compliance audit.'
              : 'Upload mandatory compliance documents (Aadhaar, PAN, Resume) for HR verification to receive your official Employee Code.'
            }
          </p>
        </div>

        {/* Live Countdown Timer if Rejected */}
        {(isRejected || isEscalated) && timeLeft && (
          <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-4 text-center min-w-[200px]">
            <p className="text-[10px] uppercase tracking-wider text-rose-400 font-bold mb-1">Time Remaining</p>
            <div className="text-2xl font-black font-mono text-white tracking-widest">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">48h Re-upload Window</p>
          </div>
        )}
      </div>

      {/* Upload Form if Pending or Rejected */}
      {!isPendingReview && !isVerified && (
        <form onSubmit={handleUploadSubmit} className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Document Type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="AADHAAR">Aadhaar Card</option>
              <option value="PAN">PAN Card</option>
              <option value="RESUME">Resume / CV</option>
              <option value="CERTIFICATE">Educational Certificate</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Document File Name</label>
            <input
              type="text"
              placeholder="e.g. alex_mercer_aadhaar.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? 'Uploading to Firebase...' : 'Upload to Firebase Storage'}</span>
            </button>
          </div>
        </form>
      )}

      {msg && <p className="mt-3 text-xs text-blue-400 font-medium">{msg}</p>}
    </div>
  );
}
