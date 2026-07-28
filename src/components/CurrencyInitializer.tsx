"use client";

import { useLayoutEffect } from "react";
import { useLocale } from "next-intl";

import { applyLocaleCurrencyIfAuto } from "@/shared/utils/currency";

export function CurrencyInitializer() {
  const locale = useLocale();

  useLayoutEffect(() => {
    applyLocaleCurrencyIfAuto(locale);
  }, [locale]);

  return null;
}
