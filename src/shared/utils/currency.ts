import {
  resolveCurrencyPreference,
  resolveDefaultCurrencyForLocale,
} from "./currency-policy";

const CURRENCY_STORAGE_KEY = "currency";
const CURRENCY_USER_OVERRIDE_KEY = "currency_user_override";
const DEFAULT_CURRENCY: CurrencyCode = "USD";

export type CurrencyCode = "USD" | "EUR" | "RUB";

const VALID_CURRENCIES: CurrencyCode[] = ["USD", "EUR", "RUB"];

export const CURRENCY_CHANGED_EVENT = "app:currency-changed";

function emitCurrencyChanged(currency: CurrencyCode) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<CurrencyCode>(CURRENCY_CHANGED_EVENT, { detail: currency }),
  );
}

function persistCurrency(
  currency: CurrencyCode,
  options?: { userOverride?: boolean },
): boolean {
  const previous = getCurrency();
  localStorage.setItem(CURRENCY_STORAGE_KEY, currency);

  if (options?.userOverride) {
    localStorage.setItem(CURRENCY_USER_OVERRIDE_KEY, "1");
  }

  if (previous !== currency) {
    emitCurrencyChanged(currency);
    return true;
  }

  return false;
}

export function getCurrency(locale?: string): CurrencyCode {
  if (typeof window !== "undefined" && hasUserCurrencyOverride()) {
    const value = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (value && VALID_CURRENCIES.includes(value as CurrencyCode)) {
      return value as CurrencyCode;
    }
  }

  if (locale) {
    return resolveDefaultCurrencyForLocale(locale);
  }

  if (typeof window === "undefined") {
    return DEFAULT_CURRENCY;
  }

  const value = localStorage.getItem(CURRENCY_STORAGE_KEY);

  if (value && VALID_CURRENCIES.includes(value as CurrencyCode)) {
    return value as CurrencyCode;
  }

  return DEFAULT_CURRENCY;
}

export function setCurrency(currency: CurrencyCode) {
  persistCurrency(currency);
}

export function setCurrencyWithUserOverride(currency: CurrencyCode) {
  persistCurrency(currency, { userOverride: true });
}

export function hasUserCurrencyOverride(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return localStorage.getItem(CURRENCY_USER_OVERRIDE_KEY) === "1";
}

export function applyLocaleCurrencyIfAuto(locale: string): CurrencyCode {
  if (typeof window === "undefined") {
    return resolveDefaultCurrencyForLocale(locale);
  }

  if (hasUserCurrencyOverride()) {
    return getCurrency();
  }

  const currency = resolveDefaultCurrencyForLocale(locale);
  persistCurrency(currency);
  return currency;
}

export function syncCurrencyFromUserProfile(
  savedCurrency?: string | null,
  country?: string | null,
  locale?: string,
): CurrencyCode {
  const currency = resolveCurrencyPreference({
    savedCurrency,
    country,
    locale,
  });

  if (
    savedCurrency &&
    VALID_CURRENCIES.includes(savedCurrency as CurrencyCode)
  ) {
    persistCurrency(currency, { userOverride: true });
  } else {
    persistCurrency(currency);
  }

  return currency;
}

export function toCurrencyCode(value: string | undefined | null): CurrencyCode {
  if (value && VALID_CURRENCIES.includes(value as CurrencyCode)) {
    return value as CurrencyCode;
  }
  return DEFAULT_CURRENCY;
}

export function formatMoneyAmount(
  amount: number,
  currency: CurrencyCode,
  locale: string,
): string {
  return new Intl.NumberFormat(locale === "ru" ? "ru-RU" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
