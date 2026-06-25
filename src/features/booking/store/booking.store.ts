"use client";

import { create } from "zustand";
import type { TravelerForm } from "@/features/booking/components/TravelersForm/TravelersForm";
import type { SeatMapUi } from "@/features/booking/api/booking.api";
import type { PricedFlight } from "@/shared/types/flight";

export type SeatSelection = {
  travelerId: string;
  segmentId: string;
  seatNumber: string;
};

export type PricingState = {
  baseTotal: number;    
  seatsTotal: number;    
  finalTotal: number;    
  currency: string;
};

type BookingState = {
  flight: PricedFlight | null;
  travelers: TravelerForm[];

  searchId: string | null;
  offerId: string | null;

  seatMaps: SeatMapUi[];
  seats: SeatSelection[];

  pricing: PricingState | null;

  setFlight: (flight: PricedFlight) => void;
  setTravelers: (travelers: TravelerForm[]) => void;
  setOrder: (args: { searchId: string; offerId: string }) => void;
  setSeatMaps: (seatMaps: SeatMapUi[] | null) => void;
  setSeats: (seats: SeatSelection[]) => void;
  setPricing: (pricing: PricingState | null) => void;

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

  setFlight: (flight) =>
  set({
    flight,
    pricing: flight?.price
      ? {
          baseTotal: flight.price.base ?? 0,
          seatsTotal: flight.price.seats ?? 0,
          finalTotal: flight.price.total ?? 0,
          currency: flight.price.currency ?? "USD",
        }
      : null,
  }),

  setTravelers: (travelers) => set({ travelers }),

  setOrder: ({ searchId, offerId }) => set({ searchId, offerId }),

  setSeatMaps: (seatMaps) => set({ seatMaps }),

  setSeats: (seats) => set({ seats }),

  setPricing: (pricing) => set({ pricing }),

  reset: () =>
  set({
    flight: null,
    travelers: [],
    searchId: null,
    offerId: null,
    seatMaps: [],
    seats: [],
    pricing: null,
  }),
}));