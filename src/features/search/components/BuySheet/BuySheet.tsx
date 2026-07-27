"use client";

import { useCallback, useState } from "react";
import { Drawer } from "vaul";
import styles from "./BuySheet.module.css";
import { formatPrice } from "@/shared/utils/formatPrice";
import { getCurrencySymbol } from "@/shared/utils/getCurrencySymbol";
import { useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useBookingStore } from "@/features/booking/store/booking.store";
import { useAuthStore } from "@/lib/auth-store";
import type { PricedFlight } from "@/shared/types/flight";
import { fetchFlightPricing, initBooking } from "@/features/booking/api/booking.api";
import { LoginDialog } from "@/modals/Login/LoginDialog";
import {
  formatPricingQuoteExpiry,
  isPricingQuoteExpired,
  mapPricingResponseToFlight,
  mapPricingResponseToState,
} from "@/features/booking/lib/pricing.mapper";
import { IndicativePriceBadge } from "@/features/booking/components/IndicativePriceBadge/IndicativePriceBadge";
import type { FareBrandCode } from "@/features/booking/types/pricing.types";
import { useSearchCurrency } from "@/features/search/hooks/useSearchCurrency";
import { getCurrency, setCurrency } from "@/shared/utils/currency";
import { pluralMessageKey } from "@/shared/utils/plural-message";
import { ApiRequestError } from "@/shared/api/apiClient";
import { PaymentMethodSelector } from "@/features/payments/components/PaymentMethodSelector/PaymentMethodSelector";
import type { PaymentProviderCode } from "@/features/payments/types/payment-provider";
import { currencyForPaymentProvider } from "@/features/payments/utils/payment-provider-policy";
import { FlightLegSummary } from "./FlightLegSummary";
import {
  formatPassengerSummary,
  formatSelectedFareMetaLine,
  FLEX_PRICE_MULTIPLIER,
  hasPriceBreakdown,
  resolveBrandCheckedBags,
  resolveTravelerCabin,
  roundMoney,
} from "./buy-sheet.utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginRequired?: () => void;
  onLoginDismissed?: () => void;
  flight: PricedFlight | null;
  isLoading?: boolean;
};

export function BuySheet({
  open,
  onOpenChange,
  onLoginRequired,
  onLoginDismissed,
  flight,
  isLoading = false,
}: Props) {
  const router = useRouter();
  const t = useTranslations("buySheet");
  const tSearch = useTranslations("search");
  const locale = useLocale();
  const searchCurrency = useSearchCurrency();
  const translateCabin = (key: string) => tSearch(key);
  const searchId = useBookingStore((s) => s.searchId);
  const offerId = useBookingStore((s) => s.offerId);
  const storeFlight = useBookingStore((s) => s.flight);
  const pricing = useBookingStore((s) => s.pricing);
  const setTravelers = useBookingStore((s) => s.setTravelers);
  const setFlight = useBookingStore((s) => s.setFlight);
  const setSeats = useBookingStore((s) => s.setSeats);
  const setSeatMaps = useBookingStore((s) => s.setSeatMaps);
  const setPricing = useBookingStore((s) => s.setPricing);
  const paymentProvider = useBookingStore((s) => s.paymentProvider);
  const setPaymentProvider = useBookingStore((s) => s.setPaymentProvider);
  const authChecked = useAuthStore((state) => state.authChecked);
  const isAuthorized = useAuthStore((state) => state.isAuthorized);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const displayFlight = storeFlight ?? flight;
  const selectedBrand: FareBrandCode = pricing?.fareBrand ?? "LIGHT";
  const currency =
    pricing?.currency ?? displayFlight?.price.currency ?? getCurrency(locale);
  const symbol = getCurrencySymbol(currency);
  const quoteExpired = isPricingQuoteExpired(pricing);
  const quoteExpiryLabel = formatPricingQuoteExpiry(pricing, locale);
  const scheduleChanged = pricing?.scheduleChanged === true;
  const delayMinutes = pricing?.delayMinutes ?? 0;
  const passengerSummary = displayFlight
    ? formatPassengerSummary(displayFlight.travelers, t, locale)
    : null;
  const travelerCabin = displayFlight
    ? resolveTravelerCabin(displayFlight.travelers)
    : "ECONOMY";
  const fareMetaLine = displayFlight
    ? formatSelectedFareMetaLine(
        displayFlight.travelers,
        selectedBrand,
        t,
        locale,
        translateCabin,
      )
    : null;

  function formatBrandBaggageLabel(brand: FareBrandCode) {
    const bags = resolveBrandCheckedBags(brand, travelerCabin);
    if (bags === 0) {
      return t("noCheckedBags");
    }

    return t(pluralMessageKey("checkedBag", bags, locale), { count: bags });
  }

  async function handleBrandSelect(brand: FareBrandCode) {
    if (!searchId || !offerId || brand === selectedBrand || brandLoading) {
      return;
    }

    setBrandLoading(true);
    setError(null);

    try {
      const response = await fetchFlightPricing(searchId, offerId, {
        fareBrand: brand,
        currencyCode: searchCurrency,
      });
      setFlight(mapPricingResponseToFlight(response, searchCurrency));
      setPricing(mapPricingResponseToState(response, searchCurrency));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("fareUpdateFailed");
      setError(message);
    } finally {
      setBrandLoading(false);
    }
  }

  async function handlePaymentProviderChange(provider: PaymentProviderCode) {
    if (!searchId || !offerId || provider === paymentProvider || brandLoading) {
      return;
    }

    const nextCurrency = currencyForPaymentProvider(provider, searchCurrency);
    setPaymentProvider(provider);

    if (nextCurrency !== searchCurrency) {
      setCurrency(nextCurrency);
    }

    setBrandLoading(true);
    setError(null);

    try {
      const response = await fetchFlightPricing(searchId, offerId, {
        fareBrand: selectedBrand,
        currencyCode: nextCurrency,
      });
      setFlight(mapPricingResponseToFlight(response, nextCurrency));
      setPricing(mapPricingResponseToState(response, nextCurrency));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("fareUpdateFailed");
      setError(message);
    } finally {
      setBrandLoading(false);
    }
  }

  const continueBooking = useCallback(async () => {
    if (!displayFlight || !searchId || !offerId) {
      setError(t("searchLost"));
      return;
    }

    if (quoteExpired) {
      setError(t("quoteExpired"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const booking = await initBooking(searchId, offerId, paymentProvider);

      onOpenChange(false);
      setTravelers([]);
      setSeats([]);
      setSeatMaps([]);
      router.push(`/booking/${booking.id}`);
    } catch (err) {
      if (err instanceof ApiRequestError && err.repriceReason) {
        setError(err.message);
      } else {
        const message =
          err instanceof Error ? err.message : t("bookingFailed");
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [
    displayFlight,
    offerId,
    onOpenChange,
    quoteExpired,
    router,
    searchId,
    setSeatMaps,
    setSeats,
    setTravelers,
    paymentProvider,
    t,
  ]);

  function handleBooking() {
    if (!displayFlight || !searchId || !offerId) {
      setError(t("searchLost"));
      return;
    }

    if (quoteExpired) {
      setError(t("quoteExpired"));
      return;
    }

    if (!authChecked || !isAuthorized) {
      onLoginRequired?.();
      setLoginOpen(true);
      return;
    }

    void continueBooking();
  }

  function handleLoginOpenChange(nextOpen: boolean) {
    setLoginOpen(nextOpen);

    if (!nextOpen) {
      onLoginDismissed?.();
    }
  }

  const base = pricing?.baseTotal ?? displayFlight?.price.base ?? 0;
  const taxes = pricing?.taxesTotal ?? displayFlight?.price.taxes ?? 0;
  const fees = pricing?.feesTotal ?? displayFlight?.price.fees ?? 0;
  const total = pricing?.finalTotal ?? displayFlight?.price.total ?? 0;
  const showBreakdown =
    hasPriceBreakdown(pricing) || base > 0 || taxes > 0 || fees > 0;

  const lightTotal = roundMoney(
    selectedBrand === "LIGHT" ? total : total / FLEX_PRICE_MULTIPLIER,
  );
  const flexTotal = roundMoney(
    selectedBrand === "FLEX" ? total : total * FLEX_PRICE_MULTIPLIER,
  );

  return (
    <>
      <Drawer.Root open={open} onOpenChange={onOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className={styles.overlay} />
          <Drawer.Content className={styles.content}>
            <Drawer.Handle className={styles.handle} />
            <Drawer.Title className={styles.title}>{t("title")}</Drawer.Title>

            {isLoading || !displayFlight ? (
              <p className={styles.loading}>{t("loadingFare")}</p>
            ) : (
              <div className={styles.sheetInner}>
                <div className={styles.body}>
                  <IndicativePriceBadge
                    pricing={pricing}
                    showCheckoutNote
                    className={styles.indicativeBadge}
                    noteClassName={styles.indicativeNote}
                  />

                  {scheduleChanged && (
                    <p className={styles.scheduleWarning} role="status">
                      {t("scheduleChangedFull", {
                        delay:
                          delayMinutes > 0 ? ` (+${delayMinutes} min)` : "",
                      })}
                    </p>
                  )}

                  <div className={styles.legsCard}>
                    <FlightLegSummary label={t("outbound")} leg={displayFlight.outbound} />
                    {displayFlight.inbound && (
                      <>
                        <div className={styles.legDivider} />
                        <FlightLegSummary label={t("return")} leg={displayFlight.inbound} />
                      </>
                    )}
                  </div>

                  <div className={styles.brandSection}>
                    <h3 className={styles.brandSectionTitle}>{t("fareFamily")}</h3>
                    <div className={styles.brandGrid}>
                      <button
                        type="button"
                        className={
                          selectedBrand === "LIGHT"
                            ? styles.brandCardSelected
                            : styles.brandCard
                        }
                        onClick={() => handleBrandSelect("LIGHT")}
                        disabled={brandLoading || isSubmitting}
                      >
                        <span className={styles.brandName}>{t("light")}</span>
                        <span className={styles.brandPrice}>
                          {formatPrice(lightTotal, locale)} {symbol}
                        </span>
                        <span className={styles.brandMeta}>
                          {t("lightPolicy")} · {formatBrandBaggageLabel("LIGHT")}
                        </span>
                      </button>

                      <button
                        type="button"
                        className={
                          selectedBrand === "FLEX"
                            ? styles.brandCardSelected
                            : styles.brandCard
                        }
                        onClick={() => handleBrandSelect("FLEX")}
                        disabled={brandLoading || isSubmitting}
                      >
                        <span className={styles.brandName}>{t("flex")}</span>
                        <span className={styles.brandPrice}>
                          {formatPrice(flexTotal, locale)} {symbol}
                        </span>
                        <span className={styles.brandMeta}>
                          {t("flexPolicy")} · {formatBrandBaggageLabel("FLEX")}
                        </span>
                      </button>
                    </div>
                    {brandLoading && (
                      <p className={styles.brandLoading}>{t("updatingFareFamily")}</p>
                    )}
                  </div>

                  <div className={styles.metaBlock}>
                    {passengerSummary && (
                      <p className={styles.metaLine}>{passengerSummary}</p>
                    )}
                    {fareMetaLine && (
                      <p className={styles.metaLine}>{fareMetaLine}</p>
                    )}
                    {quoteExpiryLabel && (
                      <p
                        className={
                          quoteExpired ? styles.quoteExpired : styles.quoteValid
                        }
                      >
                        {quoteExpired
                          ? t("quoteExpiredRefresh")
                          : t("quoteValidUntil", { time: quoteExpiryLabel })}
                      </p>
                    )}
                  </div>

                  {showBreakdown && (
                    <div className={styles.priceBlock}>
                      <h3 className={styles.priceBlockTitle}>{t("priceBreakdown")}</h3>

                      <div className={styles.priceRow}>
                        <span>{t("baseFare")}</span>
                        <span>
                          {formatPrice(base, locale)} {symbol}
                        </span>
                      </div>

                      {taxes > 0 && (
                        <div className={styles.priceRow}>
                          <span>{t("taxes")}</span>
                          <span>
                            {formatPrice(taxes, locale)} {symbol}
                          </span>
                        </div>
                      )}

                      {fees > 0 && (
                        <div className={styles.priceRow}>
                          <span>{t("fees")}</span>
                          <span>
                            {formatPrice(fees, locale)} {symbol}
                          </span>
                        </div>
                      )}

                      <div className={styles.priceDivider} />

                      <div className={styles.priceTotalRow}>
                        <span>{t("total")}</span>
                        <span>
                          {formatPrice(total, locale)} {symbol}
                        </span>
                      </div>
                    </div>
                  )}

                  {!showBreakdown && (
                    <div className={styles.totalOnly}>
                      <span>{t("total")}</span>
                      <span>
                        {formatPrice(total, locale)} {symbol}
                      </span>
                    </div>
                  )}

                  <PaymentMethodSelector
                    value={paymentProvider}
                    onChange={handlePaymentProviderChange}
                    disabled={isSubmitting || quoteExpired || brandLoading}
                  />
                </div>

                <div className={styles.footer}>
                  {error && (
                    <p className={styles.error} role="alert">
                      {error}
                    </p>
                  )}

                  <button
                    className={styles.buyButton}
                    onClick={handleBooking}
                    disabled={isSubmitting || quoteExpired || brandLoading}
                  >
                    {isSubmitting ? t("booking") : t("book")}
                  </button>
                </div>
              </div>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <LoginDialog
        open={loginOpen}
        elevated
        onOpenChange={handleLoginOpenChange}
        onSuccess={() => {
          void continueBooking();
        }}
      />
    </>
  );
}
