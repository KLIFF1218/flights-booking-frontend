import { buildApiUrl } from "./buildApiUrl";

const CSRF_HEADER = "x-xsrf-token";

let csrfToken: string | null = null;

export function getCsrfToken(): string | null {
  return csrfToken;
}

export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

export function csrfHeaders(): HeadersInit {
  if (!csrfToken) {
    return {};
  }

  return { [CSRF_HEADER]: csrfToken };
}

/** Fetch a CSRF token when memory is empty (e.g. after reload before refresh/logout). */
export async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) {
    return csrfToken;
  }

  const response = await fetch(buildApiUrl("/auth/csrf"), {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to obtain CSRF token");
  }

  const data = (await response.json()) as { csrfToken?: string };
  if (typeof data.csrfToken !== "string" || !data.csrfToken) {
    throw new Error("CSRF token missing in response");
  }

  csrfToken = data.csrfToken;
  return csrfToken;
}
