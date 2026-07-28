import type { PricingState } from "@/features/booking/store/booking.store";
import type {
  FlightPricingApiResponse,
  FareBrandCode,
} from "@/features/booking/types/pricing.types";
import type { PricedFlight } from "@/shared/types/flight";
import { getCurrency, type CurrencyCode } from "@/shared/utils/currency";
import { readClientLocale } from "@/shared/utils/locale";

function resolveFallbackCurrency(fallbackCurrency?: CurrencyCode): CurrencyCode {
  return fallbackCurrency ?? getCurrency(readClientLocale());
}

export function mapPricingResponseToState(
  response: FlightPricingApiResponse,
  fallbackCurrency?: CurrencyCode,
): PricingState {
  const currency = resolveFallbackCurrency(fallbackCurrency);
  const firstFare = response.travelers?.[0]?.fareDetailsBySegment?.[0];

  return {
    baseTotal: response.price.base ?? 0,
    taxesTotal: response.price.taxes ?? 0,
    feesTotal: response.price.fees ?? 0,
    seatsTotal: response.price.seats ?? 0,
    finalTotal: response.price.total ?? 0,
    currency: response.price.currency ?? currency,
    quoteId: response.quoteId,
    quotedAt: response.quotedAt,
    expiresAt: response.expiresAt,
    scheduleChanged: response.scheduleChanged,
    operationalStatus: response.operationalStatus,
    delayMinutes: response.delayMinutes,
    source: response.source,
    pricingMode: response.pricingMode,
    fareBrand: response.fareBrand,
    changeable: firstFare?.changeable,
    refundable: firstFare?.refundable,
  };
}

export function mapPricingResponseToFlight(
  response: FlightPricingApiResponse,
  fallbackCurrency?: CurrencyCode,
): PricedFlight {
  const currency = resolveFallbackCurrency(fallbackCurrency);

  return {
    id: response.id,
    outbound: response.outbound as PricedFlight["outbound"],
    inbound: response.inbound as PricedFlight["inbound"],
    travelers: (response.travelers ?? []).map((traveler) => ({
      travelerId: traveler.travelerId,
      travelerType: traveler.travelerType,
      fareDetailsBySegment: traveler.fareDetailsBySegment,
    })),
    price: {
      total: response.price.total ?? 0,
      currency: response.price.currency ?? currency,
      base: response.price.base,
      taxes: response.price.taxes,
      fees: response.price.fees,
      seats: response.price.seats,
    },
  };
}

export function mapSnapshotPriceToState(
  price: FlightPriceBreakdown | undefined,
  totalPrice: number | string,
  currency: string,
  quote?: Pick<FlightPricingApiResponse, "quoteId" | "quotedAt" | "expiresAt">,
): PricingState {
  return {
    baseTotal: price?.base ?? Number(totalPrice),
    taxesTotal: price?.taxes ?? 0,
    feesTotal: price?.fees ?? 0,
    seatsTotal: price?.seats ?? 0,
    finalTotal: price?.total ?? Number(totalPrice),
    currency: price?.currency ?? currency,
    quoteId: quote?.quoteId,
    quotedAt: quote?.quotedAt,
    expiresAt: quote?.expiresAt,
  };
}

type FlightPriceBreakdown = FlightPricingApiResponse["price"];

export function isPricingQuoteExpired(pricing: PricingState | null): boolean {
  if (!pricing?.expiresAt) return false;
  return new Date(pricing.expiresAt).getTime() < Date.now();
}

export function formatPricingQuoteExpiry(
  pricing: PricingState | null,
  locale = readClientLocale(),
): string | null {
  if (!pricing?.expiresAt) return null;
  return new Date(pricing.expiresAt).toLocaleTimeString(
    locale === "ru" ? "ru-RU" : "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

export function formatFareBrandLabel(brand: FareBrandCode): string {
  return brand === "FLEX" ? "FLEX" : "LIGHT";
}
