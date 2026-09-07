import React from "react";

type PillTone = "blue" | "emerald" | "gold";

const toneClasses: Record<PillTone, string> = {
  blue: "glass-pill",
  emerald: "bg-emerald-500/10 border border-emerald-400/30 text-emerald-700 backdrop-blur-sm",
  gold: "bg-amber-500/10 border border-amber-400/30 text-amber-700 backdrop-blur-sm",
};

interface PillProps {
  children: React.ReactNode;
  tone?: PillTone;
  className?: string;
}

/** The single badge/pill style used across the whole marketing site. */
export default function Pill({ children, tone = "blue", className = "" }: PillProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-mono font-bold uppercase tracking-widest ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
