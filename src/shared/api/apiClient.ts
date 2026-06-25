import { buildApiUrl } from "./buildApiUrl";
import { useAuthStore } from "@/lib/auth-store";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;

  const store = useAuthStore.getState();

  if (token) {
    localStorage.setItem("accessToken", token);
    store.setToken(token);
  } else {
    localStorage.removeItem("accessToken");
    store.setToken(null);
  }
}

export function clearAuthData(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");

  const store = useAuthStore.getState();
  store.logout();
}

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(buildApiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include", 
      });

      if (!response.ok) {
        clearAuthData();
        return null;
      }

      const data = (await response.json()) as { accessToken: string };
      const newToken = data.accessToken;

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
  let token = getAccessToken();
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

  const fullUrl = url.startsWith("http") ? url : buildApiUrl(url);

  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: "include", 
  });

  if (response.status === 401) {
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

      const retryResponse = await fetch(fullUrl, {
        ...options,
        headers: retryHeaders,
        credentials: "include",
      });

      if (!retryResponse.ok) {
        throw new Error(
          `API Error: ${retryResponse.status} ${retryResponse.statusText}`,
        );
      }

      return retryResponse.json() as Promise<T>;
    }

    throw new Error("Authentication failed. Please login again.");
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();

  if (!text) {
    return {} as T;
  }

  return JSON.parse(text) as T;
}
