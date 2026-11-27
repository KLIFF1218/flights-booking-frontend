import { stripLeadingLocale } from "@/i18n/path";

export function sanitizeReturnUrl(
  returnUrl: string | null | undefined,
  fallback = "/",
): string {
  if (!returnUrl) {
    return stripLeadingLocale(fallback);
  }

  if (!returnUrl.startsWith("/") || returnUrl.startsWith("//")) {
    return stripLeadingLocale(fallback);
  }

  if (returnUrl.includes("://") || returnUrl.includes("\\")) {
    return stripLeadingLocale(fallback);
  }

  const queryIndex = returnUrl.indexOf("?");
  const pathname = queryIndex === -1 ? returnUrl : returnUrl.slice(0, queryIndex);
  const query = queryIndex === -1 ? "" : returnUrl.slice(queryIndex);

  return `${stripLeadingLocale(pathname)}${query}`;
}
