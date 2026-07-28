"use client";

import { useTranslations } from "next-intl";
import { isIndicativePricing } from "@/features/booking/types/pricing.types";
import type { PricingState } from "@/features/booking/store/booking.store";

type IndicativePriceBadgeProps = {
  pricing?: PricingState | null;
  showCheckoutNote?: boolean;
  className?: string;
  noteClassName?: string;
};

export function IndicativePriceBadge({
  pricing = null,
  showCheckoutNote = false,
  className = "",
  noteClassName = "",
}: IndicativePriceBadgeProps) {
  const t = useTranslations("results");

  if (!isIndicativePricing(pricing)) {
    return null;
  }

  return (
    <div className={className}>
      <span>{t("indicativePrice")}</span>
      {showCheckoutNote && (
        <span className={noteClassName}>{t("indicativeCheckoutNote")}</span>
      )}
    </div>
  );
}
