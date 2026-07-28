export function readClientLocale(): string {
  if (typeof document === "undefined") {
    return "en";
  }

  const match = document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/);
  if (match?.[1]) {
    return match[1];
  }

  return document.documentElement.lang?.split("-")[0] ?? "en";
}

export function resolveNumberFormatLocale(locale: string): string {
  return locale === "ru" ? "ru-RU" : "en-US";
}
