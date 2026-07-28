import { sanitizeReturnUrl } from "@/shared/auth/return-url";

export function redirectToLogin(): void {
  if (typeof window === "undefined") return;

  const path = window.location.pathname;
  if (path.startsWith("/auth/login")) return;

  const returnPath = sanitizeReturnUrl(
    `${window.location.pathname}${window.location.search}`,
    "/",
  );
  const returnUrl = encodeURIComponent(returnPath);

  window.location.assign(`/auth/login?returnUrl=${returnUrl}`);
}
