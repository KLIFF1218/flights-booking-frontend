"use client";

import { useEffect, useRef, useState } from "react";
import { loadCurrentUser } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/lib/auth-store";
import {
  getAccessToken,
  refreshAccessToken,
  terminateAuthSession,
} from "@/shared/api/apiClient";

type GateStatus = "checking" | "redirecting" | "denied" | "ready";

/**
 * Enforces ADMIN via live /users/me (never trusts fb_role or persisted role).
 */
export function AdminRoleGate({ children }: { children: React.ReactNode }) {
  const setAuthChecked = useAuthStore((state) => state.setAuthChecked);
  const [status, setStatus] = useState<GateStatus>("checking");
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) {
      return;
    }
    startedRef.current = true;

    let cancelled = false;

    const ensureAdmin = async () => {
      try {
        let token = getAccessToken();
        if (!token) {
          token = await refreshAccessToken();
        }

        if (!token) {
          if (!cancelled) {
            setStatus("redirecting");
            await terminateAuthSession("/admin/dashboard");
          }
          return;
        }

        const profile = await loadCurrentUser();
        if (cancelled) return;

        if (profile.role !== "ADMIN") {
          setStatus("denied");
          window.location.assign("/");
          return;
        }

        setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("redirecting");
          await terminateAuthSession("/admin/dashboard");
        }
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
        }
      }
    };

    void ensureAdmin();

    return () => {
      cancelled = true;
    };
  }, [setAuthChecked]);

  if (status === "ready") {
    return <>{children}</>;
  }

  if (status === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Admin access required. Redirecting…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
      {status === "redirecting" ? "Redirecting to sign in…" : "Checking admin access…"}
    </div>
  );
}
