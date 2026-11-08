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

  const locale = routing.locales.find((locale) => locale === segment);

  if (locale && locale !== routing.defaultLocale) {
    return locale;
  }

  return routing.defaultLocale;
}
