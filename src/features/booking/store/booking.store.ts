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

type BookingState = {
  flight: PricedFlight | null;
  travelers: TravelerForm[] | null;

  searchId: string | null;
  offerId: string | null;

  seatMaps: SeatMapUi[] | null;

  seats: SeatSelection[];

  setFlight: (flight: PricedFlight) => void;
  setTravelers: (travelers: TravelerForm[]) => void;
  setOrder: (args: { searchId: string; offerId: string }) => void;
  setSeatMaps: (seatMaps: SeatMapUi[] | null) => void;
  setSeats: (seats: SeatSelection[]) => void;
  reset: () => void;
};

export const useBookingStore = create<BookingState>((set) => ({
  flight: null,
  travelers: null,
  searchId: null,
  offerId: null,
  seatMaps: null,
  seats: [],

  setFlight: (flight) => set({ flight }),
  setTravelers: (travelers) => set({ travelers }),
  setOrder: ({ searchId, offerId }) => set({ searchId, offerId }),
  setSeatMaps: (seatMaps) => set({ seatMaps }),
  setSeats: (seats) => set({ seats }),

  reset: () =>
    set({
      flight: null,
      travelers: null,
      searchId: null,
      offerId: null,
      seatMaps: null,
      seats: [],
    }),
}));
