"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

/**
 * Theme switch button. Uses utility classes that the light-theme CSS layer
 * flips automatically, so one style set adapts to both themes (and the
 * `media-dark` restoration keeps it readable inside dark cinematic zones).
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      title={isLight ? "Switch to dark theme" : "Switch to light theme"}
      className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-200 transition-all hover:bg-white/10 ${className}`}
    >
      {isLight ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  );
}
