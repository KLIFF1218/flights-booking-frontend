import { useAuthStore, type User } from "@/lib/auth-store";
import { apiFetch, setAccessToken } from "@/shared/api/apiClient";
import { buildApiUrl } from "@/shared/api/buildApiUrl";
import { setCsrfToken } from "@/shared/api/csrf";
import { syncCurrencyFromUserProfile } from "@/shared/utils/currency";
import { readClientLocale } from "@/shared/utils/locale";

export type AuthResponse = {
  accessToken: string;
  accessMaxAge: number;
  csrfToken: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  locale?: string;
  currency?: string;
};

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

async function parseResponseBody(
  response: Response,
): Promise<Record<string, unknown>> {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

function getErrorMessage(data: Record<string, unknown>, fallback: string): string {
  const message = data.message;
  if (typeof message === "string" && message.trim()) {
    return message;
  }

  const error = data.error;
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  return fallback;
}

function applyAuthResponse(data: Record<string, unknown>): AuthResponse {
  const accessToken = data.accessToken;
  if (typeof accessToken !== "string" || !accessToken) {
    throw new AuthError("No access token received from server");
  }

  const csrfToken = data.csrfToken;
  if (typeof csrfToken === "string" && csrfToken) {
    setCsrfToken(csrfToken);
  }

  const accessMaxAge = data.accessMaxAge;
  return {
    accessToken,
    accessMaxAge: typeof accessMaxAge === "number" ? accessMaxAge : 0,
    csrfToken: typeof csrfToken === "string" ? csrfToken : "",
  };
}

async function postAuth(
  endpoint: "/auth/login" | "/auth/register",
  payload: AuthCredentials,
): Promise<AuthResponse> {
  const response = await fetch(buildApiUrl(endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new AuthError(getErrorMessage(data, "Authentication failed"));
  }

  return applyAuthResponse(data);
}

export async function loadCurrentUser(): Promise<User> {
  const user = await apiFetch<User>("/users/me");
  useAuthStore.getState().setUser(user);
  syncCurrencyFromUserProfile(
    user.currency,
    user.country,
    readClientLocale(),
  );
  return user;
}

export async function establishSession(accessToken: string): Promise<User> {
  setAccessToken(accessToken);

  try {
    return await loadCurrentUser();
  } catch (error) {
    setAccessToken(null);
    useAuthStore.getState().setUser(null);
    throw error instanceof AuthError
      ? error
      : new AuthError(
          error instanceof Error
            ? error.message
            : "Failed to load user profile after sign-in",
        );
  } finally {
    useAuthStore.getState().setAuthChecked(true);
  }
}

export async function loginWithEmail(
  credentials: AuthCredentials,
): Promise<User> {
  const { accessToken } = await postAuth("/auth/login", credentials);
  return establishSession(accessToken);
}

export async function registerWithEmail(
  credentials: AuthCredentials,
): Promise<User> {
  const { accessToken } = await postAuth("/auth/register", credentials);
  return establishSession(accessToken);
}

export type VkExchangePayload = {
  code: string;
  device_id: string;
  state: string;
  code_verifier: string;
};

export async function prepareVkState(state: string): Promise<void> {
  const response = await fetch(buildApiUrl("/auth/vk/prepare"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ state }),
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new AuthError(getErrorMessage(data, "Failed to prepare VK sign-in"));
  }
}

export async function exchangeVkCode(
  payload: VkExchangePayload,
): Promise<User> {
  const response = await fetch(buildApiUrl("/auth/vk/exchange"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new AuthError(getErrorMessage(data, "VK sign-in failed"));
  }

  const { accessToken } = applyAuthResponse(data);
  return establishSession(accessToken);
}

export async function confirmEmailVerification(token: string): Promise<void> {
  const response = await fetch(buildApiUrl("/auth/email/verify/confirm"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token }),
  });

  const data = await parseResponseBody(response);
  if (!response.ok) {
    throw new AuthError(getErrorMessage(data, "Email verification failed"));
  }
}

export async function resendEmailVerification(): Promise<void> {
  await apiFetch("/auth/email/verify/resend", { method: "POST" });
}

export async function requestPasswordReset(email: string): Promise<void> {
  const response = await fetch(buildApiUrl("/auth/password/forgot"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const data = await parseResponseBody(response);
  if (!response.ok) {
    throw new AuthError(getErrorMessage(data, "Failed to request password reset"));
  }
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  const response = await fetch(buildApiUrl("/auth/password/reset"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await parseResponseBody(response);
  if (!response.ok) {
    throw new AuthError(getErrorMessage(data, "Password reset failed"));
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiFetch("/auth/password/change", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export type AuthSession = {
  id: string;
  deviceId: string;
  userAgent: string | null;
  ip: string | null;
  createdAt: string;
  lastSeen: string;
  expiresAt: string;
  current: boolean;
};

export async function listSessions(): Promise<AuthSession[]> {
  const data = await apiFetch<{ sessions: AuthSession[] }>("/auth/sessions");
  return data.sessions ?? [];
}

export async function revokeSession(
  sessionId: string,
): Promise<{ ok: true; revokedCurrent: boolean }> {
  return apiFetch<{ ok: true; revokedCurrent: boolean }>(
    `/auth/sessions/${sessionId}`,
    { method: "DELETE" },
  );
}

export async function logoutAllSessions(): Promise<void> {
  await apiFetch("/auth/logout-all", { method: "POST" });
}
