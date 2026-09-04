'use client';

import { useState, useEffect, useRef } from 'react';
import { Clock, ShieldAlert, Upload, CheckCircle2, FileText, X } from 'lucide-react';
import { attachOnboardingDocument } from '@/lib/actions/hrms-actions';

interface OnboardingCountdownWidgetProps {
  user: any;
}

// Client-side size check is for UX only. The server re-validates everything.
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT_ATTR = '.pdf,.jpg,.jpeg,.png,.webp,.docx,application/pdf,image/jpeg,image/png,image/webp,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

interface PendingFile {
  file: File;
  preview: string | null;
}

export function OnboardingCountdownWidget({ user }: OnboardingCountdownWidgetProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [docType, setDocType] = useState('AADHAAR');
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Clean up object URLs for previews.
  useEffect(() => {
    return () => {
      for (const p of files) if (p.preview) URL.revokeObjectURL(p.preview);
    };
  }, [files]);

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    const next: PendingFile[] = [];
    for (const f of Array.from(list)) {
      // UX guard; server is the final authority.
      if (f.size > MAX_BYTES) {
        setMsg({ kind: 'err', text: `${f.name} exceeds 5MB limit.` });
        continue;
      }
      const isImage = f.type.startsWith('image/');
      next.push({ file: f, preview: isImage ? URL.createObjectURL(f) : null });
    }
    setFiles(next);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => {
      const removed = prev[idx];
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setMsg({ kind: 'err', text: 'Pick at least one file.' });
      return;
    }
    setLoading(true);
    setMsg(null);

    const successes: string[] = [];
    const failures: string[] = [];

    for (const { file } of files) {
      try {
        // Step 1: upload bytes to /api/uploads. Server returns a server-issued
        // `path` (NOT a public URL). F-12: the path is the only thing the
        // server trusts when we attach the DB record.
        const fd = new FormData();
        fd.append('file', file);
        fd.append('docType', docType);
        fd.append('userId', user._id);
        const upRes = await fetch('/api/uploads', { method: 'POST', body: fd });
        if (!upRes.ok) {
          const err = await upRes.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(err.error || 'Upload failed');
        }
        const up = await upRes.json();

        // Step 2: persist record. `up.path` must round-trip the server's
        // tenant/user namespace check.
        const res = await attachOnboardingDocument(user._id, docType, up.path, up.fileName, up.mime);
        if (res?.success) successes.push(`${docType} (${Math.round(up.size / 1024)} KB)`);
      } catch (err: any) {
        failures.push(`${file.name}: ${err.message}`);
      }
    }

    setLoading(false);

    if (successes.length) {
      setMsg({ kind: 'ok', text: `${successes.join(', ')} uploaded. Awaiting HR review.` });
      setTimeout(() => window.location.reload(), 1500);
    } else if (failures.length) {
      setMsg({ kind: 'err', text: failures.join('; ') });
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

          <div className="md:col-span-2">
            <label className="block text-slate-300 font-medium mb-1">Document File(s) (PDF/JPG/PNG/WEBP/DOCX, max 5MB each)</label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPT_ATTR}
              onChange={(e) => handleFiles(e.target.files)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 file:mr-3 file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1.5 file:text-xs"
            />
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((p, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-[11px] text-slate-300">
                    {p.preview ? (
                      <img src={p.preview} alt="" className="h-5 w-5 object-cover rounded" />
                    ) : (
                      <FileText className="h-4 w-4 text-slate-500" />
                    )}
                    <span className="truncate flex-1">{p.file.name}</span>
                    <span className="text-slate-500">{Math.round(p.file.size / 1024)} KB</span>
                    <button type="button" onClick={() => removeFile(idx)} className="text-slate-500 hover:text-rose-400">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={loading || files.length === 0}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? 'Uploading...' : `Upload ${files.length} file${files.length === 1 ? '' : 's'}`}</span>
            </button>
          </div>
        </form>
      )}

      {msg && (
        <p className={`mt-3 text-xs font-medium ${msg.kind === 'ok' ? 'text-emerald-400' : 'text-rose-400'}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
