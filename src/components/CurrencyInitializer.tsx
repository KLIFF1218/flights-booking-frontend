"use client";

import { useEffect } from "react";

const CURRENCY_STORAGE_KEY = "currency";
const DEFAULT_CURRENCY = "USD";

export function CurrencyInitializer() {
  useEffect(() => {
    const storedCurrency = localStorage.getItem(CURRENCY_STORAGE_KEY);

    if (!storedCurrency) {
      localStorage.setItem(CURRENCY_STORAGE_KEY, DEFAULT_CURRENCY);
    }
  }, []);

  return null;
}
