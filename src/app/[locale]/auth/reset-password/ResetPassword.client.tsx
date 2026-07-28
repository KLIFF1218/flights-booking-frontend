"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { AuthError, resetPassword } from "@/features/auth/api/auth.api";
import { clearAuthData } from "@/shared/api/apiClient";
import {
  isStrongPassword,
  PASSWORD_POLICY_MESSAGE,
} from "@/shared/auth/password-policy";

export function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("Reset token is missing.");
      return;
    }

    if (!isStrongPassword(password)) {
      setError(PASSWORD_POLICY_MESSAGE);
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      clearAuthData();
      setDone(true);
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "Password reset failed. The link may have expired.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border p-6">
        <h1 className="text-xl font-semibold mb-2">Reset password</h1>

        {done ? (
          <>
            <p className="text-sm text-teal-800 bg-teal-50 border border-teal-100 rounded-lg p-3 mb-4">
              Password updated. Sign in with your new password. All other
              sessions were signed out.
            </p>
            <Link href="/auth/login" className="text-sm text-teal-700 underline">
              Go to sign in
            </Link>
          </>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              autoComplete="new-password"
            />
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              autoComplete="new-password"
            />
            {error ? (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium disabled:opacity-60"
            >
              {loading ? "Saving…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
