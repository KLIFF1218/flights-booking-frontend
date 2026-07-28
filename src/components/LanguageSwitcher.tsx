"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { AppLocale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import {
  applyLocaleCurrencyIfAuto,
  hasUserCurrencyOverride,
} from "@/shared/utils/currency";
import styles from "./LanguageSwitcher.module.css";

const LOCALE_LABEL_KEYS = {
  en: "localeEn",
  ru: "localeRu",
} as const satisfies Record<AppLocale, "localeEn" | "localeRu">;

export function LanguageSwitcher() {
  const t = useTranslations("header");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (nextLocale: AppLocale) => {
    if (nextLocale === locale) {
      return;
    }

    const search = window.location.search;
    const hash = window.location.hash;
    const href = `${pathname}${search}${hash}`;

    router.replace(href, { locale: nextLocale });

    if (!hasUserCurrencyOverride()) {
      applyLocaleCurrencyIfAuto(nextLocale);
    }
  };

  return (
    <div className={styles.wrap} role="group" aria-label={t("language")}>
      {routing.locales.map((code) => {
        const isActive = locale === code;

        return (
          <button
            key={code}
            type="button"
            className={`${styles.option} ${isActive ? styles.optionActive : ""}`}
            onClick={() => handleChange(code)}
            aria-pressed={isActive}
            aria-label={t(LOCALE_LABEL_KEYS[code])}
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
