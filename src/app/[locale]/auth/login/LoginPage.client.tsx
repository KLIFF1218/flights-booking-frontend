"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { AuthForm } from "@/features/auth/components/AuthForm/AuthForm";
import { sanitizeReturnUrl } from "@/shared/auth/return-url";
import { syncAuthSessionCookiesFromStorage } from "@/shared/auth/session-cookie";

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = sanitizeReturnUrl(searchParams.get("returnUrl"));
  const isAuthorized = useAuthStore((state) => state.isAuthorized);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    syncAuthSessionCookiesFromStorage();
  }, []);

  useEffect(() => {
    if (!isAuthorized && !accessToken) return;
    router.replace(returnUrl);
  }, [isAuthorized, accessToken, router, returnUrl]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border p-6">
        <AuthForm
          variant="page"
          onSuccess={() => router.replace(returnUrl)}
        />
      </div>
    </div>
  );
}
