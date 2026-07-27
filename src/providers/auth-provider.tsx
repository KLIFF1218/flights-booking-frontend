"use client";

import { useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { clearAuthData, apiFetch } from "@/shared/api/apiClient";

export function useAuth() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthorized = useAuthStore((state) => state.isAuthorized);
  const setUser = useAuthStore((state) => state.setUser);

  const handleLogout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuthData();
      router.replace("/");
    }
  }, [router]);

  return {
    user,
    setUser,
    isAuthorized,
    logout: handleLogout,
  };
}
