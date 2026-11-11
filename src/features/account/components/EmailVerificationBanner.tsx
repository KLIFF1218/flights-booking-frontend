"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/auth-store";
import {
  AuthError,
  resendEmailVerification,
} from "@/features/auth/api/auth.api";

export function EmailVerificationBanner() {
  const user = useAuthStore((state) => state.user);
  const t = useTranslations("settings");
  const [message, setMessage] = useState<string | null>(null);
  const [messageIsError, setMessageIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!user?.email || user.emailVerifiedAt) {
    return null;
  }

  const onResend = async () => {
    setLoading(true);
    setMessage(null);
    setMessageIsError(false);
    try {
      await resendEmailVerification();
      setMessage(t("emailVerificationResent"));
    } catch (error) {
      setMessageIsError(true);
      setMessage(
        error instanceof AuthError
          ? error.message
          : t("emailVerificationResendFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">{t("emailVerificationBannerTitle")}</p>
      <p className="mt-1 text-amber-900/80">
        {t("emailVerificationBannerBody", { email: user.email })}
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onResend()}
          disabled={loading}
          className="text-sm font-medium underline disabled:opacity-60"
        >
          {loading
            ? t("emailVerificationResending")
            : t("emailVerificationResend")}
        </button>
        {message ? (
          <span
            className={messageIsError ? "text-red-800" : "text-amber-900/80"}
          >
            {message}
          </span>
        ) : null}
      </div>
    </div>
  );
}
