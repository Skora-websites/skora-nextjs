"use client";

import React from "react";

interface SerpPreviewProps {
  /** Absolute or path URL shown as the result link. */
  url: string;
  title: string;
  description: string;
}

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 160;

function Counter({ value, limit }: { value: number; limit: number }) {
  const over = value > limit;
  const near = !over && value > limit * 0.85;
  return (
    <span
      className={`font-mono text-[10px] font-bold ${
        over ? "text-red-500" : near ? "text-amber-500" : "text-slate-400"
      }`}
    >
      {value}/{limit}
    </span>
  );
}

/** Google-style search result preview used while editing a post's SEO. */
export default function SerpPreview({ url, title, description }: SerpPreviewProps) {
  const displayTitle = title.trim() || "Your post title will appear here";
  const displayDescription =
    description.trim() || "Add a meta description so searchers know what this article is about.";

  return (
    <div className="rounded-2xl border border-[#E1E6DF] bg-white p-5 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#E1E6DF]">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
          Google preview
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Title</span>
            <Counter value={title.trim().length} limit={TITLE_LIMIT} />
          </span>
          <span className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Description</span>
            <Counter value={description.trim().length} limit={DESCRIPTION_LIMIT} />
          </span>
        </div>
      </div>

      {/* Result */}
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-[#EFF6FF] border border-[#2563EB]/20 flex items-center justify-center text-[10px] font-black text-[#2563EB] shrink-0">
          SK
        </div>
        <div className="min-w-0">
          <p className="text-[13px] text-slate-700 font-medium truncate">{url || "/blog/your-post"}</p>
          <p className="text-lg text-[#1a0dab] font-medium leading-snug break-words hover:underline cursor-default">
            {displayTitle.length > TITLE_LIMIT + 40
              ? `${displayTitle.slice(0, TITLE_LIMIT)}…`
              : displayTitle}
          </p>
          <p className="text-[13px] text-slate-600 leading-relaxed break-words">
            {displayDescription.length > DESCRIPTION_LIMIT + 60
              ? `${displayDescription.slice(0, DESCRIPTION_LIMIT)}…`
              : displayDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
