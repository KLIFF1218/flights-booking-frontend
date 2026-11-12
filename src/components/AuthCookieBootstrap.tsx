"use client";

import { useEffect } from "react";
import { syncAuthSessionCookiesFromStorage } from "@/shared/auth/session-cookie";

export function AuthCookieBootstrap() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem("accessToken");
      const raw = localStorage.getItem("auth-storage");
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
        if (parsed.state && "accessToken" in parsed.state) {
          delete parsed.state.accessToken;
          localStorage.setItem("auth-storage", JSON.stringify(parsed));
        }
      }
    } catch {}

    try {
      syncAuthSessionCookiesFromStorage();
    } catch {}
  }, []);

  return null;
}
