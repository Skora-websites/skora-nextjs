import React from "react";
import Pill from "./Pill";

interface SectionHeaderProps {
  badge?: string;
  badgeTone?: "blue" | "emerald" | "gold";
  title: React.ReactNode;
  subtext?: string;
  align?: "left" | "center";
  className?: string;
}

/** Consistent section header: mono pill badge → extrabold heading → subtext. */
export default function SectionHeader({
  badge,
  badgeTone = "blue",
  title,
  subtext,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={`mb-14 space-y-4 ${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left"} ${className}`}
    >
      {badge && <Pill tone={badgeTone}>{badge}</Pill>}
      <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl">{title}</h2>
      {subtext && (
        <p className="text-base font-medium leading-relaxed text-sub sm:text-lg">{subtext}</p>
      )}
    </div>
  );
}
