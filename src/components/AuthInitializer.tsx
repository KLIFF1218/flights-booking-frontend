"use client";

import { useCallback, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import {
  clearAuthData,
  getAccessToken,
  refreshAccessToken,
} from "@/shared/api/apiClient";
import {
  hasAuthSession,
  hasRefreshSessionCookie,
} from "@/shared/auth/session-cookie";
import { loadCurrentUser } from "@/features/auth/api/auth.api";

function hasClientSessionHint(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return (
    hasAuthSession(document.cookie) ||
    hasRefreshSessionCookie(document.cookie)
  );
}

function shouldRebootstrapAuthOnPageShow(event: PageTransitionEvent): boolean {
  if (event.persisted) {
    return true;
  }

  const { authChecked, isAuthorized } = useAuthStore.getState();

  return (
    authChecked &&
    !isAuthorized &&
    !getAccessToken() &&
    hasClientSessionHint()
  );
}

export function AuthInitializer() {
  const authChecked = useAuthStore((state) => state.authChecked);
  const isLoading = useAuthStore((state) => state.isLoading);
  const setIsLoading = useAuthStore((state) => state.setIsLoading);
  const setAuthChecked = useAuthStore((state) => state.setAuthChecked);

  const bootstrapAuth = useCallback(async () => {
    setIsLoading(true);

    try {
      let token = getAccessToken();
      const hasSessionHint = hasClientSessionHint();
      const hasPersistedUser = Boolean(useAuthStore.getState().user);

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
  }, [setAuthChecked, setIsLoading]);

  const requestAuthBootstrap = useCallback(() => {
    setAuthChecked(false);
    setIsLoading(false);
  }, [setAuthChecked, setIsLoading]);

  useEffect(() => {
    if (isLoading || authChecked) {
      return;
    }

    void bootstrapAuth();
  }, [authChecked, bootstrapAuth, isLoading]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (!shouldRebootstrapAuthOnPageShow(event)) {
        return;
      }

      requestAuthBootstrap();
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [requestAuthBootstrap]);

  return null;
}
