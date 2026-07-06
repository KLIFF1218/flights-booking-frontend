"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  redirectTo = "/",
  fallback,
}: ProtectedRouteProps) {
  const { isAuthorized } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthorized) {
      router.push(redirectTo);
    }
  }, [isAuthorized, redirectTo, router]);

  if (!isAuthorized) {
    return fallback || <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return <>{children}</>;
}

export function useProtectedRoute(redirectTo = "/") {
  const { isAuthorized } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthorized) {
      router.push(redirectTo);
    }
  }, [isAuthorized, redirectTo, router]);

  return { isAuthorized };
}
