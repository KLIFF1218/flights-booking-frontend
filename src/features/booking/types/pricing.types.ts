import type { PricingState } from "@/features/booking/store/booking.store";

export type FareBrandCode = "LIGHT" | "FLEX";

export type FlightPriceBreakdown = {
  base?: number;
  taxes?: number;
  fees?: number;
  seats?: number;
  total?: number;
  currency?: string;
};

export type FlightPricingApiResponse = {
  id: string;
  quoteId?: string;
  quotedAt?: string;
  expiresAt?: string;
  source?: string;
  pricingMode?: "indicative" | "final";
  fareBrand?: FareBrandCode;
  price: FlightPriceBreakdown;
  outbound: {
    from: string;
    to: string;
    segments: Array<Record<string, unknown>>;
  };
  inbound?: {
    from: string;
    to: string;
    segments: Array<Record<string, unknown>>;
  };
  travelers?: Array<{
    travelerId: string;
    travelerType: string;
    fareDetailsBySegment?: Array<{
      cabin?: string;
      includedCheckedBags?: {
        quantity?: number;
      };
      changeable?: boolean;
      refundable?: boolean;
      brandName?: string;
    }>;
  }>;
  scheduleChanged?: boolean;
  operationalStatus?: string;
  delayMinutes?: number;
  scheduleChanges?: Array<{
    flightInstanceId: string;
    segmentId: string;
    previousDepartureTime: string;
    currentDepartureTime: string;
    previousArrivalTime: string;
    currentArrivalTime: string;
    delayMinutes: number;
  }>;
};

export function isIndicativePricing(pricing: PricingState | null): boolean {
  if (!pricing) {
    return true;
  }

  if (pricing.pricingMode === "indicative") {
    return true;
  }

  if (pricing.pricingMode === "final") {
    return false;
  }

  return pricing.source === "INTERNAL_DB" || pricing.source === undefined;
}
