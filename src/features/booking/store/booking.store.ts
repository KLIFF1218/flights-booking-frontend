"use client";

import { create } from "zustand";
import type { TravelerForm } from "@/features/booking/validation/traveler.schema";
import type { SeatMapUi } from "@/features/booking/api/booking.api";
import type { PricedFlight } from "@/shared/types/flight";
import type { PaymentProviderCode } from "@/features/payments/types/payment-provider";
import { paymentProviderForCurrency } from "@/features/payments/utils/payment-provider-policy";
import { getCurrency } from "@/shared/utils/currency";

export type SeatSelection = {
  travelerId: string;
  segmentId: string;
  seatNumber: string;
};

export type PricingState = {
  baseTotal: number;
  taxesTotal: number;
  feesTotal: number;
  seatsTotal: number;
  finalTotal: number;
  currency: string;
  quoteId?: string;
  quotedAt?: string;
  expiresAt?: string;
  scheduleChanged?: boolean;
  operationalStatus?: string;
  delayMinutes?: number;
  source?: string;
  pricingMode?: "indicative" | "final";
  fareBrand?: "LIGHT" | "FLEX";
  changeable?: boolean;
  refundable?: boolean;
};

export function pricingFromFlight(flight: PricedFlight): PricingState {
  return {
    baseTotal: flight.price.base ?? 0,
    taxesTotal: flight.price.taxes ?? 0,
    feesTotal: flight.price.fees ?? 0,
    seatsTotal: flight.price.seats ?? 0,
    finalTotal: flight.price.total ?? 0,
    currency: flight.price.currency ?? "USD",
  };
}

type BookingState = {
  flight: PricedFlight | null;
  travelers: TravelerForm[];

  searchId: string | null;
  offerId: string | null;

  seatMaps: SeatMapUi[];
  seats: SeatSelection[];

  pricing: PricingState | null;

  paymentProvider: PaymentProviderCode;

  setFlight: (flight: PricedFlight | null) => void;
  setTravelers: (travelers: TravelerForm[]) => void;
  setOrder: (args: { searchId: string; offerId: string }) => void;
  setSeatMaps: (seatMaps: SeatMapUi[] | null | undefined) => void;
  setSeats: (seats: SeatSelection[]) => void;
  setPricing: (pricing: PricingState | null) => void;
  setPaymentProvider: (paymentProvider: PaymentProviderCode) => void;

  reset: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  flight: null,
  travelers: [],
  searchId: null,
  offerId: null,
  seatMaps: [],
  seats: [],
  pricing: null,
  paymentProvider: paymentProviderForCurrency(getCurrency()),

  setFlight: (flight) => set({ flight }),

  setTravelers: (travelers) => set({ travelers }),

  setOrder: ({ searchId, offerId }) => set({ searchId, offerId }),

  setSeatMaps: (seatMaps) => set({ seatMaps: seatMaps ?? [] }),

  setSeats: (seats) => set({ seats }),

  setPricing: (pricing) => set({ pricing }),

  setPaymentProvider: (paymentProvider) => set({ paymentProvider }),

  reset: () =>
  set({
    flight: null,
    travelers: [],
    searchId: null,
    offerId: null,
    seatMaps: [],
    seats: [],
    pricing: null,
    paymentProvider: paymentProviderForCurrency(getCurrency()),
  }),
}));