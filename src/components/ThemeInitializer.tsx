"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/theme-store";

export function ThemeInitializer() {
  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedTheme = window.localStorage.getItem("theme-storage");
    if (!storedTheme) {
      setTheme("light");
    }
  }, [setTheme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return null;
}
