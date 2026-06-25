const CURRENCY_STORAGE_KEY = "currency";
const DEFAULT_CURRENCY: CurrencyCode = "USD";

export type CurrencyCode = "USD" | "EUR" | "RUB";

const VALID_CURRENCIES: CurrencyCode[] = ["USD", "EUR", "RUB"];

export function getCurrency(): CurrencyCode {
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
  localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}
