"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  AuthError,
  confirmEmailVerification,
  loadCurrentUser,
} from "@/features/auth/api/auth.api";
import { getAccessToken } from "@/shared/api/apiClient";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
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
          setMessage("Email verified. You can continue booking.");
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error instanceof AuthError
              ? error.message
              : "Verification failed. The link may have expired.",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border p-6 text-center">
        <h1 className="text-xl font-semibold mb-3">Email verification</h1>
        <p
          className={
            status === "error" ? "text-red-600 text-sm" : "text-gray-600 text-sm"
          }
        >
          {message}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/auth/login" className="text-sm text-teal-700 underline">
            Go to sign in
          </Link>
          <Link href="/my/settings" className="text-sm text-gray-500 underline">
            Account settings
          </Link>
        </div>
      </div>
    </div>
  );
}
