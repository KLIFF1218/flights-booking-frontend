"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  AuthError,
  confirmEmailVerification,
  loadCurrentUser,
} from "@/features/auth/api/auth.api";
import { getAccessToken } from "@/shared/api/apiClient";

export function VerifyEmailClient() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState(t("verifyEmailVerifying"));

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("verifyEmailMissingToken"));
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        await confirmEmailVerification(token);
        if (getAccessToken()) {
          await loadCurrentUser().catch(() => undefined);
        }
        if (!cancelled) {
          setStatus("ok");
          setMessage(t("verifyEmailSuccess"));
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error instanceof AuthError ? error.message : t("verifyEmailFailed"),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, t]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border p-6 text-center">
        <h1 className="text-xl font-semibold mb-3">{t("verifyEmailTitle")}</h1>
        <p
          className={
            status === "error"
              ? "text-red-600 text-sm"
              : "text-gray-600 text-sm"
          }
        >
          {message}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/auth/login" className="text-sm text-teal-700 underline">
            {t("verifyEmailGoToSignIn")}
          </Link>
          <Link href="/my/settings" className="text-sm text-gray-500 underline">
            {t("verifyEmailAccountSettings")}
          </Link>
        </div>
      </div>
    </div>
  );
}
