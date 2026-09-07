"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "skora-theme";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  const toggle = () => {
    const next = !document.documentElement.classList.contains("light");
    document.documentElement.classList.toggle("light", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "light" : "dark");
    } catch {}
    setIsLight(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
      title={isLight ? "Dark theme" : "Light theme"}
      className={`flex h-11 w-11 items-center justify-center rounded-full glass-card text-ink transition hover:bg-ink/10 cursor-pointer shrink-0 ${className}`}
    >
      {/* Render Sun until mounted so SSR output matches the dark default */}
      {mounted && isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
