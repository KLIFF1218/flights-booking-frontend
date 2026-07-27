export function sanitizeReturnUrl(
  returnUrl: string | null | undefined,
  fallback = "/",
): string {
  if (!returnUrl) {
    return fallback;
  }

  if (!returnUrl.startsWith("/") || returnUrl.startsWith("//")) {
    return fallback;
  }

  if (returnUrl.includes("://") || returnUrl.includes("\\")) {
    return fallback;
  }

  return returnUrl;
}
