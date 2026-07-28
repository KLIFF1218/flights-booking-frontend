"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import {
  AuthError,
  loadCurrentUser,
  resendEmailVerification,
} from "@/features/auth/api/auth.api";

export function EmailVerificationBanner() {
  const user = useAuthStore((state) => state.user);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user?.email || user.emailVerifiedAt) {
    return null;
  }

  const onResend = async () => {
    setLoading(true);
    setMessage(null);
    try {
      await resendEmailVerification();
      setMessage("Verification email sent.");
      await loadCurrentUser().catch(() => undefined);
    } catch (error) {
      setMessage(
        error instanceof AuthError
          ? error.message
          : "Could not resend verification email.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">Verify your email to complete payments.</p>
      <p className="mt-1 text-amber-900/80">
        We sent a link to <strong>{user.email}</strong>. Check spam if you do
        not see it.
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void onResend()}
          disabled={loading}
          className="text-sm font-medium underline disabled:opacity-60"
        >
          {loading ? "Sending…" : "Resend verification email"}
        </button>
        {message ? <span className="text-amber-900/80">{message}</span> : null}
      </div>
    </div>
  );
}
