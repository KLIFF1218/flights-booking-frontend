"use client";

import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";
import { getAccessToken, apiFetch } from "@/shared/api/apiClient";

type User = {
  id: string;
  email: string;
  firstName?: string;
};

export function useInitializeAuth() {
  const { setUser, user } = useAuth();

  useEffect(() => {
    if (user) return;

    const initializeAuth = async () => {
      const token = getAccessToken();

      if (!token) return;

      try {
        const userProfile = await apiFetch<User>("/users/me");
        setUser(userProfile);
      } catch (error) {
        console.warn("Failed to initialize auth:", error);
      }
    };

    initializeAuth();
  }, [user, setUser]);
}
