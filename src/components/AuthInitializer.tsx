"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { apiFetch } from "@/shared/api/apiClient";

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export function AuthInitializer() {
  const {
    setUser,
    setIsLoading,
    isLoading,
    user,
    authChecked,
    setAuthChecked,
  } = useAuthStore();

  useEffect(() => {
    if (user || isLoading || authChecked) return;

    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        
        const user = await apiFetch<User>("/users/me");
        console.log("Fetched user profile:", user);
        setUser(user);
      } catch (error) {
        console.warn("Failed to initialize auth:", error);
      } finally {
        setAuthChecked(true);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [setUser, setIsLoading, user, isLoading, authChecked, setAuthChecked]);

  return null;
}
