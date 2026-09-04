'use client';

import { useState } from 'react';
import { Eye, Loader2, FileText, Trash2, ExternalLink } from 'lucide-react';

interface DocRow {
  _id: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  uploadedAt: string;
  rejectionReason?: string;
}

interface Props {
  doc: DocRow;
  onDelete?: (id: string) => void;
}

/**
 * Renders one onboarding document with a lazy signed-URL fetch.
 * - Click "View" → POST-less GET to /api/uploads/[id] → opens signed URL in new tab.
 * - The signed URL is cached for 4 minutes (slightly less than the 5-min TTL) so
 *   back-to-back clicks don't re-hit the API.
 * - Click "Delete" → calls DELETE /api/uploads/[id], then `onDelete(id)` to let
 *   the parent refresh.
 */
export function OnboardingDocPreview({ doc, onDelete }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const view = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/uploads/${doc._id}`, { method: 'GET' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const { data } = await res.json();
      if (!data?.url) throw new Error('No URL returned');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete ${doc.docType}? This cannot be undone.`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/uploads/${doc._id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: 'Failed' }));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      onDelete?.(doc._id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  const ext = doc.fileName.split('.').pop()?.toLowerCase() || '';
  const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
  const isPdf = ext === 'pdf';
  const isDocx = ext === 'docx';

  return (
    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="h-9 w-9 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
          {isImage ? (
            <span className="text-[10px] font-mono uppercase">{ext}</span>
          ) : isPdf ? (
            <span className="text-[10px] font-mono text-rose-400">PDF</span>
          ) : isDocx ? (
            <span className="text-[10px] font-mono text-blue-400">DOCX</span>
          ) : (
            <FileText className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-white truncate">{doc.docType}</p>
          <p className="text-[11px] text-slate-400 font-mono truncate">{doc.fileName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                doc.status === 'APPROVED'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : doc.status === 'REJECTED'
                  ? 'bg-rose-500/20 text-rose-300'
                  : 'bg-blue-500/20 text-blue-300'
              }`}
            >
              {doc.status}
            </span>
            <span className="text-[10px] text-slate-500">
              {new Date(doc.uploadedAt).toLocaleString()}
            </span>
          </div>
          {doc.status === 'REJECTED' && doc.rejectionReason && (
            <p className="text-[10px] text-rose-300 mt-0.5">Reason: {doc.rejectionReason}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={view}
          disabled={loading}
          className="flex items-center gap-1 text-[11px] text-blue-300 hover:text-blue-200 bg-blue-500/10 border border-blue-500/30 rounded px-2.5 py-1.5 disabled:opacity-50"
          title="Open in new tab"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />}
          <span>View</span>
          <ExternalLink className="h-3 w-3 opacity-60" />
        </button>
        {onDelete && (
          <button
            type="button"
            onClick={remove}
            disabled={deleting}
            className="flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-200 bg-rose-500/10 border border-rose-500/30 rounded px-2.5 py-1.5 disabled:opacity-50"
            title="Delete"
          >
            {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            <span>Delete</span>
          </button>
        )}
      </div>
      {error && <p className="text-[10px] text-rose-400 self-end ml-2">{error}</p>}
    </div>
  );
}
