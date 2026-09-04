'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface Props {
  userId: string;
  /** Optional label override. Default: "Download All". */
  label?: string;
  /** Optional className for the button. */
  className?: string;
}

/**
 * Triggers a sequential download of every onboarding document for `userId`.
 *
 * Calls POST /api/uploads/batch-download → { items: [{id,url,fileName}] }.
 * Each item's signed URL is opened in a hidden `<a download>` to trigger a
 * browser save. Sequential (not parallel) to dodge Chrome's multi-download
 * block heuristic.
 */
export function DownloadAllButton({ userId, label = "Download All", className = "" }: Props) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/uploads/batch-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(j.error || `HTTP ${res.status}`);
      }
      const { data } = await res.json();
      const items: Array<{ id: string; url: string; fileName: string }> = data?.items || [];
      if (items.length === 0) {
        setErr("No documents to download");
        return;
      }
      for (const it of items) {
        const a = document.createElement("a");
        a.href = it.url;
        a.download = it.fileName;
        a.rel = "noopener noreferrer";
        a.style.display = "none";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Yield to the event loop so the browser registers each download
        // as a separate user gesture.
        await new Promise((r) => setTimeout(r, 250));
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={
          className ||
          "flex items-center gap-1.5 text-[11px] text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 border border-emerald-500/30 rounded px-2.5 py-1.5 disabled:opacity-50"
        }
        title="Download all documents for this employee as individual files"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        <span>{label}</span>
      </button>
      {err && <span className="text-[10px] text-rose-400">{err}</span>}
    </span>
  );
}
