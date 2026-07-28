"use client";

import { useTranslations } from "next-intl";
import styles from "./SearchError.module.css";

type SearchErrorProps = {
  title?: string;
  description?: string;
  errorMessage?: string;
  onRetry?: () => void;
  retryLabel?: string;
};

export function SearchError({
  title,
  description,
  errorMessage,
  onRetry,
  retryLabel,
}: SearchErrorProps) {
  const t = useTranslations("results.error");

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.icon}>✈️</div>

        <h2 className={styles.title}>{title ?? t("title")}</h2>
        <p className={styles.description}>{description ?? t("description")}</p>

        {process.env.NODE_ENV === "development" && errorMessage && (
          <p className={styles.devMessage}>{errorMessage}</p>
        )}

        {onRetry && (
          <button type="button" className={styles.button} onClick={onRetry}>
            {retryLabel ?? t("retry")}
          </button>
        )}
      </div>
    </section>
  );
}
