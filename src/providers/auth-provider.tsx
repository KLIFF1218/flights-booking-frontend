"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { clearAuthData, apiFetch } from "@/shared/api/apiClient";

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const isAuthorized = useAuthStore((state) => state.isAuthorized);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuthData();
      logout();
    }
  }, [logout]);

  return {
    user,
    setUser,
    isAuthorized,
    logout: handleLogout,
  };
}
