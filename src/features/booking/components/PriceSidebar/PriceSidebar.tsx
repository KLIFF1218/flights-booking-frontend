"use client";

import { useTranslations, useLocale } from "next-intl";
import { useBookingStore } from "@/features/booking/store/booking.store";
import { formatPrice } from "@/shared/utils/formatPrice";
import { getCurrencySymbol } from "@/shared/utils/getCurrencySymbol";
import {
  formatPricingQuoteExpiry,
  isPricingQuoteExpired,
} from "@/features/booking/lib/pricing.mapper";
import {
  formatAirlineLabel,
  formatFlightNumberLabel,
  resolveSegmentAirlineCode,
  resolveSegmentAirlineName,
} from "@/shared/utils/airline-display";
import {
  getAirlineLogoUrl,
  handleAirlineLogoError,
} from "@/shared/utils/airline-logo";
import { getCurrency } from "@/shared/utils/currency";
import { IndicativePriceBadge } from "@/features/booking/components/IndicativePriceBadge/IndicativePriceBadge";
import Image from "next/image";
import { PaymentMethodSelector } from "@/features/payments/components/PaymentMethodSelector/PaymentMethodSelector";
import type { PaymentProviderCode } from "@/features/payments/types/payment-provider";
import { ChevronDown } from "lucide-react";

type PriceSidebarProps = {
  onContinue?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  isPricingLoading?: boolean;
  pricingError?: string | null;
  isInitialLoading?: boolean;
  buttonLabel?: string;
  paymentProvider?: PaymentProviderCode;
  onPaymentProviderChange?: (provider: PaymentProviderCode) => void;
  showPaymentMethod?: boolean;
  /** Checkout on seats page: compact layout without sticky positioning. */
  variant?: "default" | "checkout";
};

export function PriceSidebar({
  onContinue,
  disabled,
  isLoading,
  isPricingLoading,
  pricingError,
  isInitialLoading,
  buttonLabel,
  paymentProvider,
  onPaymentProviderChange,
  showPaymentMethod = false,
  variant = "default",
}: PriceSidebarProps) {
  const t = useTranslations("priceSidebar");
  const tSearch = useTranslations("search");
  const tBuySheet = useTranslations("buySheet");
  const locale = useLocale();
  const flight = useBookingStore((s) => s.flight);
  const pricing = useBookingStore((s) => s.pricing);
  const travelers = useBookingStore((s) => s.travelers);

  const isCheckout = variant === "checkout";
  const asideClass = isCheckout
    ? "w-full"
    : "w-full lg:sticky lg:top-6 lg:self-start";

  if (isInitialLoading) {
    return (
      <aside className={asideClass}>
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-1/2 mb-6" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded" />
          </div>
          <div className="h-11 bg-gray-200 rounded mt-6" />
        </div>
      </aside>
    );
  }

  if (!flight || !pricing) {
    return null;
  }

  const base = pricing.baseTotal ?? 0;
  const taxes = pricing.taxesTotal ?? 0;
  const fees = pricing.feesTotal ?? 0;
  const seats = pricing.seatsTotal ?? 0;
  const total = pricing.finalTotal ?? 0;
  const currency = pricing.currency ?? getCurrency(locale);
  const quoteExpired = isPricingQuoteExpired(pricing);
  const quoteExpiryLabel = formatPricingQuoteExpiry(pricing, locale);
  const scheduleChanged = pricing.scheduleChanged === true;
  const delayMinutes = pricing.delayMinutes ?? 0;

  const symbol = getCurrencySymbol(currency);
  const primarySegment = flight.outbound.segments[0];
  const airlineCode = resolveSegmentAirlineCode(primarySegment);
  const airlineName = resolveSegmentAirlineName(primarySegment);

  const priceBreakdown = (
    <div className="space-y-2.5">
      <div className="flex justify-between items-start gap-2 text-sm">
        <span className="text-gray-600">{t("baseFare")}</span>
        <span
          className={`text-gray-900 font-medium text-right ${isPricingLoading ? "opacity-50" : ""}`}
        >
          {formatPrice(base, locale)} {symbol}
        </span>
      </div>

      {taxes > 0 && (
        <div className="flex justify-between items-start gap-2 text-sm">
          <span className="text-gray-600">{t("taxes")}</span>
          <span
            className={`text-gray-900 font-medium text-right ${isPricingLoading ? "opacity-50" : ""}`}
          >
            {formatPrice(taxes, locale)} {symbol}
          </span>
        </div>
      )}

      {fees > 0 && (
        <div className="flex justify-between items-start gap-2 text-sm">
          <span className="text-gray-600">{t("fees")}</span>
          <span
            className={`text-gray-900 font-medium text-right ${isPricingLoading ? "opacity-50" : ""}`}
          >
            {formatPrice(fees, locale)} {symbol}
          </span>
        </div>
      )}

      {(seats > 0 || isPricingLoading) && (
        <div className="flex justify-between items-start gap-2 text-sm">
          <span className="text-gray-600">{t("seats")}</span>
          <span
            className={`text-gray-900 font-medium text-right ${isPricingLoading ? "opacity-50" : ""}`}
          >
            {formatPrice(seats, locale)} {symbol}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <aside className={asideClass}>
      <div
        className={
          isCheckout
            ? "bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-5"
            : "bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 overflow-hidden"
        }
      >
        {isCheckout ? (
          <div className="mb-3">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {t("checkoutSummary")}
            </p>
            <p className="text-base font-semibold text-gray-900 mt-1">
              {flight.outbound.from} — {flight.outbound.to}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {travelers?.length}{" "}
              {travelers?.length === 1
                ? tSearch("passenger_one")
                : tSearch("passenger_other")}
            </p>
          </div>
        ) : (
          <>
            <div className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 break-words">
              {flight.outbound.from} — {flight.outbound.to}
            </div>

            {primarySegment && (
              <div className="mb-4 flex items-center gap-3">
                <Image
                  src={getAirlineLogoUrl(airlineCode)}
                  alt={airlineName}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full border border-gray-100 bg-white object-contain"
                  onError={handleAirlineLogoError}
                />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 break-words">
                    {formatAirlineLabel(airlineName, airlineCode)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatFlightNumberLabel(airlineCode, primarySegment.flightNumber)}
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600 mb-4 sm:mb-6">
              {travelers?.length}{" "}
              {travelers?.length === 1
                ? tSearch("passenger_one")
                : tSearch("passenger_other")}
            </div>
          </>
        )}

        <IndicativePriceBadge
          pricing={pricing}
          showCheckoutNote
          className="text-xs text-gray-500 mb-3 flex flex-col gap-0.5"
          noteClassName="text-gray-400"
        />

        {scheduleChanged && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-3">
            {tBuySheet("scheduleChangedFull", {
              delay:
                delayMinutes > 0
                  ? ` (${tBuySheet("delayMinutes", { minutes: delayMinutes })})`
                  : "",
            })}
          </p>
        )}

        {quoteExpiryLabel && (
          <p
            className={`text-xs mb-3 ${quoteExpired ? "text-red-600" : "text-gray-500"}`}
          >
            {quoteExpired
              ? t("quoteExpired")
              : t("quoteValidUntil", { time: quoteExpiryLabel })}
          </p>
        )}

        {pricingError && (
          <p className="text-xs text-red-600 mb-3 rounded-lg bg-red-50 border border-red-100 px-3 py-2">
            {pricingError}
          </p>
        )}

        {isCheckout ? (
          <details className="group mb-3 rounded-lg border border-gray-100 bg-gray-50/80">
            <summary className="flex items-center justify-between gap-2 cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-gray-700">
              <span>{t("priceDetails")}</span>
              <ChevronDown
                className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <div className="px-3 pb-3 border-t border-gray-100 pt-2">{priceBreakdown}</div>
          </details>
        ) : (
          <div className="space-y-3 mb-4">{priceBreakdown}</div>
        )}

        <div className="flex justify-between items-center gap-2 py-2 border-t border-gray-200">
          <span className="text-base font-semibold text-gray-900">{t("total")}</span>
          <span
            className={`text-lg font-bold text-gray-900 ${isPricingLoading ? "opacity-50" : ""}`}
          >
            {formatPrice(total, locale)} {symbol}
          </span>
        </div>

        {isPricingLoading && (
          <p className="text-xs text-gray-500 mt-1 mb-2">{t("updatingPrice")}</p>
        )}

        {showPaymentMethod && paymentProvider && onPaymentProviderChange && (
          <PaymentMethodSelector
            value={paymentProvider}
            onChange={onPaymentProviderChange}
            disabled={disabled || isPricingLoading || isLoading}
            compact={isCheckout}
            className="mt-4 mb-1"
          />
        )}

        {onContinue && (
          <button
            disabled={disabled || isPricingLoading || quoteExpired}
            onClick={onContinue}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 text-sm sm:text-base shadow-sm"
          >
            {isLoading ? t("continue") : (buttonLabel ?? t("continue"))}
          </button>
        )}
      </div>
    </aside>
  );
}
