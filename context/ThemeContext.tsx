"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Theme = "dark" | "light";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  toggleTheme: () => {},
});

const STORAGE_KEY = "skora-theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("light-theme", theme === "light");
}

/**
 * Marketing-site theme (default: dark "Deep Space Neon", opt-in light).
 * Persisted in localStorage. App routes (/hrms, /main, /admin) always stay
 * in their own styling — the light class is never applied there.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const pathname = usePathname();
  const isAppRoute =
    pathname.startsWith("/hrms") || pathname.startsWith("/main") || pathname.startsWith("/admin");

  useEffect(() => {
    let stored: Theme = "dark";
    try {
      stored = (localStorage.getItem(STORAGE_KEY) as Theme) || "dark";
    } catch {
      stored = "dark";
    }
    const effective: Theme = isAppRoute ? "dark" : stored;
    setTheme(effective);
    applyTheme(effective);
  }, [isAppRoute]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // storage unavailable — theme still applies for this session
      }
      applyTheme(next);
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
