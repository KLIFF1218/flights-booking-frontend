"use client";

import { useAuth } from "@/providers/auth-provider";

export function useCurrentUser() {
  const { user, isAuthorized } = useAuth();

  return {
    user,
    isAuthorized,
    userId: user?.id,
    email: user?.email,
    firstName: user?.firstName,
  };
}
