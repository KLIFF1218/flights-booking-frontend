export const AUTH_COOKIE = "fb_auth";
/** @deprecated Legacy cookie — cleared on logout; JWT is no longer stored in cookies. */
export const ACCESS_TOKEN_COOKIE = "fb_access_token";
/** @deprecated Hint only — never use for authorization. Cleared on logout. */
export const ROLE_COOKIE = "fb_role";

const REFRESH_COOKIE = "refreshToken";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type UserRole = "USER" | "ADMIN";

function buildCookie(name: string, value: string, maxAge = MAX_AGE_SECONDS): string {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function buildExpiredCookie(name: string): string {
  return `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

/**
 * Lightweight UX hints only (not AuthZ). Edge proxy uses HttpOnly refreshToken
 * presence; admin role is checked via API in AdminRoleGate.
 */
export function setAuthSessionCookies(role?: UserRole): void {
  if (typeof document === "undefined") return;

  document.cookie = buildCookie(AUTH_COOKIE, "1");

  if (role) {
    document.cookie = buildCookie(ROLE_COOKIE, role);
  }
}

export function setRoleCookie(role: UserRole): void {
  if (typeof document === "undefined") return;
  document.cookie = buildCookie(ROLE_COOKIE, role);
}

export function clearAuthSessionCookies(): void {
  if (typeof document === "undefined") return;

  document.cookie = buildExpiredCookie(AUTH_COOKIE);
  document.cookie = buildExpiredCookie(ACCESS_TOKEN_COOKIE);
  document.cookie = buildExpiredCookie(ROLE_COOKIE);
}

function readCookieValue(
  cookieHeader: string | undefined,
  name: string,
): string | null {
  if (!cookieHeader) return null;

  const prefix = `${name}=`;
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!match) return null;

  const value = match.slice(prefix.length);
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** Soft client hint that a session may exist (not used for edge AuthZ). */
export function hasAuthSession(cookieHeader: string | undefined): boolean {
  return readCookieValue(cookieHeader, AUTH_COOKIE) === "1";
}

/** Edge/proxy check: HttpOnly refresh cookie set by the API. */
export function hasRefreshSessionCookie(
  cookieHeader: string | undefined,
): boolean {
  const value = readCookieValue(cookieHeader, REFRESH_COOKIE);
  return Boolean(value && value.length > 0);
}

export function getRoleFromCookies(
  cookieHeader: string | undefined,
): UserRole | null {
  const role = readCookieValue(cookieHeader, ROLE_COOKIE);

  if (role === "USER" || role === "ADMIN") {
    return role;
  }

  return null;
}

export function syncAuthSessionCookiesFromStorage(): void {
  if (typeof window === "undefined") return;

  const raw = localStorage.getItem("auth-storage");
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw) as {
      state?: {
        user?: { role?: UserRole } | null;
      };
    };

    if (!parsed.state?.user) return;

    setAuthSessionCookies(parsed.state.user.role);
  } catch {
    // ignore malformed persisted auth state
  }
}
