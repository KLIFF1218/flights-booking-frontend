"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { sanitizeReturnUrl } from "@/shared/auth/return-url";

export function useRequireAuth() {
  const router = useRouter();
  const authChecked = useAuthStore((state) => state.authChecked);
  const isAuthorized = useAuthStore((state) => state.isAuthorized);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    if (!authChecked || isLoading || isAuthorized) {
      return;
    }

    const currentPath =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/my/orders";

    const returnPath = sanitizeReturnUrl(currentPath);
    router.replace(`/auth/login?returnUrl=${encodeURIComponent(returnPath)}`);
  }, [authChecked, isAuthorized, isLoading, router]);

  const isChecking = !authChecked || isLoading;
  const isReady = authChecked && !isLoading && isAuthorized;

  return { isChecking, isReady };
}
