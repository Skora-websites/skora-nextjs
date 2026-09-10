import React from "react";

interface SectionHeaderProps {
  badge?: string;
  title: React.ReactNode;
  subtext?: string;
  align?: "left" | "center";
  className?: string;
}

/** Consistent section header: kicker → display headline → subtext. */
export default function SectionHeader({
  badge,
  title,
  subtext,
  align = "left",
  className = "",
}: SectionHeaderProps) {
  const centered = align === "center";
  return (
    <div
      className={`mb-12 space-y-4 ${centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl text-left"} ${className}`}
    >
      {badge && (
        <span className={`kicker ${centered ? "justify-center" : ""}`}>{badge}</span>
      )}
      <h2 className="display-hero text-3xl sm:text-5xl">{title}</h2>
      {subtext && (
        <p className="text-base font-medium leading-relaxed text-sub sm:text-lg">{subtext}</p>
      )}
    </div>
  );
}
