"use client";

import { useLayoutEffect, useEffect, useState } from "react";
import { useLocale } from "next-intl";

import {
  CURRENCY_CHANGED_EVENT,
  applyLocaleCurrencyIfAuto,
  getCurrency,
  type CurrencyCode,
} from "@/shared/utils/currency";
import { resolveDefaultCurrencyForLocale } from "@/shared/utils/currency-policy";

export function useSearchCurrency(): CurrencyCode {
  const locale = useLocale();
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    if (typeof window === "undefined") {
      return resolveDefaultCurrencyForLocale(locale);
    }

    return getCurrency(locale);
  });

  useLayoutEffect(() => {
    setCurrencyState(applyLocaleCurrencyIfAuto(locale));
  }, [locale]);

  useEffect(() => {
    const onCurrencyChanged = (event: Event) => {
      const detail = (event as CustomEvent<CurrencyCode>).detail;
      setCurrencyState(detail ?? getCurrency(locale));
    };

    window.addEventListener(CURRENCY_CHANGED_EVENT, onCurrencyChanged);
    return () =>
      window.removeEventListener(CURRENCY_CHANGED_EVENT, onCurrencyChanged);
  }, [locale]);

  return currency;
}
