import { buildApiUrl } from "./buildApiUrl";
import { useAuthStore } from "@/lib/auth-store";
import { redirectToLogin } from "./authRedirect";
import { csrfHeaders, ensureCsrfToken, setCsrfToken } from "./csrf";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly errorCode?: string;
  readonly repriceReason?: string;

  constructor(
    message: string,
    status: number,
    errorCode?: string,
    repriceReason?: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errorCode = errorCode;
    this.repriceReason = repriceReason ?? errorCode;
  }
}

type ApiErrorPayload = {
  message?: string | string[];
  error?: string;
  errorCode?: string;
  repriceReason?: string;
};

async function readErrorPayload(response: Response): Promise<{
  message: string;
  errorCode?: string;
  repriceReason?: string;
}> {
  const fallback = `API Error: ${response.status} ${response.statusText}`;

  try {
    const text = await response.text();
    if (!text) {
      return { message: fallback };
    }

    const data = JSON.parse(text) as ApiErrorPayload;

    let message = fallback;

    if (Array.isArray(data.message)) {
      message = data.message.join(", ");
    } else if (typeof data.message === "string" && data.message.trim()) {
      message = data.message;
    } else if (typeof data.error === "string" && data.error.trim()) {
      message = data.error;
    }

    return {
      message,
      errorCode: data.errorCode,
      repriceReason: data.repriceReason ?? data.errorCode,
    };
  } catch {
    return { message: fallback };
  }
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().accessToken;
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  useAuthStore.getState().setToken(token);
}

export function clearAuthData(): void {
  if (typeof window === "undefined") return;
  setCsrfToken(null);
  useAuthStore.getState().logout();
}

/** Clears HttpOnly refresh cookie server-side, then redirects to login. */
export async function terminateAuthSession(returnUrl?: string): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    await ensureCsrfToken();
    await fetch(buildApiUrl("/auth/logout"), {
      method: "POST",
      credentials: "include",
      headers: {
        ...csrfHeaders(),
      },
    });
  } catch {
    // Best-effort: still clear client state and redirect.
  } finally {
    clearAuthData();
    const loginPath =
      returnUrl !== undefined
        ? `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`
        : `/auth/login?returnUrl=${encodeURIComponent(
            `${window.location.pathname}${window.location.search}`,
          )}`;
    window.location.assign(loginPath);
  }
}

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      await ensureCsrfToken();

      const response = await fetch(buildApiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
        headers: {
          ...csrfHeaders(),
        },
      });

      if (!response.ok) {
        clearAuthData();
        return null;
      }

      const data = (await response.json()) as {
        accessToken: string;
        csrfToken?: string;
      };
      const newToken = data.accessToken;

      if (typeof data.csrfToken === "string" && data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }

      setAccessToken(newToken);

      return newToken;
    } catch (error) {
      console.error("Token refresh failed:", error);
      clearAuthData();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (
    options.body &&
    !headers.has("Content-Type") &&
    typeof options.body === "string"
  ) {
    headers.set("Content-Type", "application/json");
  }

  const method = (options.method ?? "GET").toUpperCase();
  const needsCsrf =
    url.includes("/auth/logout") ||
    url.includes("/auth/refresh") ||
    url.includes("/auth/sessions");

  if (needsCsrf && method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    await ensureCsrfToken();
    const csrf = csrfHeaders();
    for (const [key, value] of Object.entries(csrf)) {
      headers.set(key, value);
    }
  }

  const fullUrl = url.startsWith("http") ? url : buildApiUrl(url);

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    const hadToken = Boolean(token);
    const newToken = await refreshAccessToken();

    if (newToken) {
      const retryHeaders = new Headers(options.headers);
      retryHeaders.set("Authorization", `Bearer ${newToken}`);

      if (
        options.body &&
        !retryHeaders.has("Content-Type") &&
        typeof options.body === "string"
      ) {
        retryHeaders.set("Content-Type", "application/json");
      }

      if (needsCsrf) {
        await ensureCsrfToken();
        const csrf = csrfHeaders();
        for (const [key, value] of Object.entries(csrf)) {
          retryHeaders.set(key, value);
        }
      }

      const retryResponse = await fetch(fullUrl, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });

      if (!retryResponse.ok) {
        if (retryResponse.status === 401) {
          clearAuthData();
          redirectToLogin();
        }

        const errorPayload = await readErrorPayload(retryResponse);
        throw new ApiRequestError(
          errorPayload.message,
          retryResponse.status,
          errorPayload.errorCode,
          errorPayload.repriceReason,
        );
      }

      return retryResponse.json() as Promise<T>;
    }

    if (hadToken) {
      clearAuthData();
      redirectToLogin();
    }

    throw new Error("Authentication required");
  }

  if (!response.ok) {
    const errorPayload = await readErrorPayload(response);
    throw new ApiRequestError(
      errorPayload.message,
      response.status,
      errorPayload.errorCode,
      errorPayload.repriceReason,
    );
  }

  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}
