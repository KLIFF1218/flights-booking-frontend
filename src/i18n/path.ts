import { routing, type AppLocale } from "./routing";

export function stripLeadingLocale(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) {
      continue;
    }

    const prefix = `/${locale}`;
    if (pathname === prefix) {
      return "/";
    }

    if (pathname.startsWith(`${prefix}/`)) {
      return pathname.slice(prefix.length) || "/";
    }
  }

  return pathname;
}

export function getLocaleFromPathname(pathname: string): AppLocale {
  const segment = pathname.split("/")[1];

  if (
    segment &&
    routing.locales.includes(segment as AppLocale) &&
    segment !== routing.defaultLocale
  ) {
    return segment as AppLocale;
  }

  return routing.defaultLocale;
}
