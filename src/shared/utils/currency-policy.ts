import type { AppLocale } from "@/i18n/routing";
import type { CurrencyCode } from "./currency";

const LOCALE_DEFAULT_CURRENCY: Record<AppLocale, CurrencyCode> = {
  en: "USD",
  ru: "RUB",
};

const COUNTRY_DEFAULT_CURRENCY: Record<string, CurrencyCode> = {
  RU: "RUB",
  KZ: "RUB",
  BY: "RUB",
  Russia: "RUB",
  Kazakhstan: "RUB",
  Belarus: "RUB",
};

export function resolveDefaultCurrencyForLocale(
  locale: string,
): CurrencyCode {
  if (locale === "ru") {
    return LOCALE_DEFAULT_CURRENCY.ru;
  }
  if (locale === "en") {
    return LOCALE_DEFAULT_CURRENCY.en;
  }
  return "USD";
}

export function resolveDefaultCurrencyForCountry(
  country: string | null | undefined,
): CurrencyCode | null {
  if (!country) {
    return null;
  }
  return COUNTRY_DEFAULT_CURRENCY[country] ?? null;
}

export function resolveCurrencyPreference(params: {
  savedCurrency?: string | null;
  country?: string | null;
  locale?: string;
}): CurrencyCode {
  const valid: CurrencyCode[] = ["USD", "EUR", "RUB"];
  if (
    params.savedCurrency &&
    valid.includes(params.savedCurrency as CurrencyCode)
  ) {
    return params.savedCurrency as CurrencyCode;
  }

  const fromCountry = resolveDefaultCurrencyForCountry(params.country);
  if (fromCountry) {
    return fromCountry;
  }

  if (params.locale) {
    return resolveDefaultCurrencyForLocale(params.locale);
  }

  return "USD";
}
