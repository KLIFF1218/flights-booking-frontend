"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AuthError,
  listSessions,
  logoutAllSessions,
  revokeSession,
  type AuthSession,
} from "@/features/auth/api/auth.api";
import { clearAuthData } from "@/shared/api/apiClient";
import {
  formatDeviceLabel,
  formatSessionIp,
} from "@/shared/utils/user-agent";
import { useRouter } from "next/navigation";

function formatWhen(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function SessionsPanel() {
  const router = useRouter();
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSessions(await listSessions());
    } catch (err) {
      setError(
        err instanceof AuthError || err instanceof Error
          ? err.message
          : "Failed to load sessions",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onRevoke = async (session: AuthSession) => {
    setBusyId(session.id);
    setError(null);
    try {
      const result = await revokeSession(session.id);
      if (result.revokedCurrent) {
        clearAuthData();
        router.replace("/auth/login");
        return;
      }
      await load();
    } catch (err) {
      setError(
        err instanceof AuthError || err instanceof Error
          ? err.message
          : "Failed to revoke session",
      );
    } finally {
      setBusyId(null);
    }
  };

  const onLogoutAll = async () => {
    setBusyId("all");
    setError(null);
    try {
      await logoutAllSessions();
      clearAuthData();
      router.replace("/auth/login");
    } catch (err) {
      setError(
        err instanceof AuthError || err instanceof Error
          ? err.message
          : "Failed to sign out everywhere",
      );
      setBusyId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Where you&apos;re logged in</h2>
          <p className="text-sm text-gray-500">
            Active sessions on your account. Revoke any device you do not recognize.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onLogoutAll()}
          disabled={busyId !== null || loading || sessions.length === 0}
          className="px-4 py-2 text-sm rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          {busyId === "all" ? "Signing out…" : "Sign out everywhere"}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-600 mb-3" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-gray-500">Loading sessions…</p>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-gray-500">No active sessions.</p>
      ) : (
        <ul className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDeviceLabel(session.userAgent)}
                  </p>
                  {session.current ? (
                    <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      This device
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatSessionIp(session.ip)} · Last seen{" "}
                  {formatWhen(session.lastSeen)} · Expires{" "}
                  {formatWhen(session.expiresAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void onRevoke(session)}
                disabled={busyId !== null}
                className="shrink-0 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {busyId === session.id
                  ? "Revoking…"
                  : session.current
                    ? "Sign out"
                    : "Revoke"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
