"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  AuthError,
  requestPasswordReset,
} from "@/features/auth/api/auth.api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await requestPasswordReset(email.trim());
      setDone(true);
    } catch (err) {
      setError(
        err instanceof AuthError
          ? err.message
          : "Could not send reset email. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md border p-6">
        <h1 className="text-xl font-semibold mb-2">Forgot password</h1>
        <p className="text-sm text-gray-600 mb-4">
          Enter your email and we will send a reset link if an account exists.
        </p>

        {done ? (
          <p className="text-sm text-teal-800 bg-teal-50 border border-teal-100 rounded-lg p-3">
            If an account exists for that email, a reset link has been sent.
          </p>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={onSubmit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              autoComplete="email"
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
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <Link
          href="/auth/login"
          className="inline-block mt-4 text-sm text-gray-500 underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
