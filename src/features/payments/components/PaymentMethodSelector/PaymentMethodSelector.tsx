"use client";

import { useTranslations } from "next-intl";
import { Check, CreditCard, Wallet } from "lucide-react";
import type { PaymentProviderCode } from "@/features/payments/types/payment-provider";
import { PAYMENT_PROVIDER_OPTIONS } from "@/features/payments/types/payment-provider";
import styles from "./PaymentMethodSelector.module.css";

type PaymentMethodSelectorProps = {
  value: PaymentProviderCode;
  onChange: (provider: PaymentProviderCode) => void;
  disabled?: boolean;
  className?: string;
  compact?: boolean;
};

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
  className,
  compact = false,
}: PaymentMethodSelectorProps) {
  const t = useTranslations("paymentMethod");

  return (
    <div className={[styles.section, className].filter(Boolean).join(" ")}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t("title")}</h3>
        {!compact && <p className={styles.subtitle}>{t("hint")}</p>}
      </div>

      <div className={styles.list}>
        {PAYMENT_PROVIDER_OPTIONS.map((provider) => {
          const selected = value === provider;
          const isStripe = provider === "STRIPE";

          return (
            <button
              key={provider}
              type="button"
              className={selected ? `${styles.option} ${styles.optionSelected}` : styles.option}
              onClick={() => onChange(provider)}
              disabled={disabled}
              aria-pressed={selected}
            >
              <span
                className={
                  isStripe
                    ? `${styles.iconWrap} ${styles.iconStripe}`
                    : `${styles.iconWrap} ${styles.iconYookassa}`
                }
              >
                {isStripe ? (
                  <CreditCard className="w-5 h-5" strokeWidth={2} />
                ) : (
                  <Wallet className="w-5 h-5" strokeWidth={2} />
                )}
              </span>

              <span className={styles.body}>
                <span className={styles.name}>
                  {isStripe ? t("stripe.name") : t("yookassa.name")}
                </span>
                <span className={styles.meta}>
                  {isStripe ? t("stripe.meta") : t("yookassa.meta")}
                </span>
              </span>

              <span
                className={selected ? `${styles.check} ${styles.checkSelected}` : styles.check}
                aria-hidden
              >
                {selected ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
