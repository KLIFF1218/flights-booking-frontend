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
  ...rest
}: IndicativePriceBadgeProps) {
  if (!isIndicativePricing(pricing)) {
    return null;
  }

  return <IndicativePriceBadgeContent {...rest} />;
}

function IndicativePriceBadgeContent({
  showCheckoutNote = false,
  className = "",
  noteClassName = "",
}: Omit<IndicativePriceBadgeProps, "pricing">) {
  const t = useTranslations("results");

  return (
    <div className={className}>
      <span>{t("indicativePrice")}</span>
      {showCheckoutNote && (
        <span className={noteClassName}>{t("indicativeCheckoutNote")}</span>
      )}
    </div>
  );
}
