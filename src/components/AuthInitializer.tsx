"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import {
  clearAuthData,
  getAccessToken,
  refreshAccessToken,
} from "@/shared/api/apiClient";
import { hasAuthSession } from "@/shared/auth/session-cookie";
import { loadCurrentUser } from "@/features/auth/api/auth.api";

export function AuthInitializer() {
  const {
    setIsLoading,
    isLoading,
    authChecked,
    setAuthChecked,
  } = useAuthStore();

  useEffect(() => {
    if (isLoading || authChecked) return;

    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        let token = getAccessToken();
        const hasSessionHint =
          typeof document !== "undefined" && hasAuthSession(document.cookie);
        const hasPersistedUser = Boolean(useAuthStore.getState().user);

        // Memory-only access token: restore from HttpOnly refresh cookie when needed.
        if (!token && (hasSessionHint || hasPersistedUser)) {
          token = await refreshAccessToken();
        }

        if (!token) {
          clearAuthData();
          return;
        }

        await loadCurrentUser();
      } catch {
        clearAuthData();
      } finally {
        setAuthChecked(true);
        setIsLoading(false);
      }
    };

    void initializeAuth();
  }, [isLoading, authChecked, setAuthChecked, setIsLoading]);

  return null;
}
