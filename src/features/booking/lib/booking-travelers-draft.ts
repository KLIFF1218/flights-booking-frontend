import type { TravelerForm } from "@/features/booking/validation/traveler.schema";

import type { PricingState } from "@/features/booking/store/booking.store";
import type { PricedFlight } from "@/shared/types/flight";

const DRAFT_KEY_PREFIX = "booking-travelers-draft:";
const CONFIRMED_KEY_PREFIX = "booking-travelers-confirmed:";
const PRICING_KEY_PREFIX = "booking-pricing:";
const FLIGHT_KEY_PREFIX = "booking-flight:";

function draftKey(bookingId: string) {
  return `${DRAFT_KEY_PREFIX}${bookingId}`;
}

function confirmedKey(bookingId: string) {
  return `${CONFIRMED_KEY_PREFIX}${bookingId}`;
}

function flightKey(bookingId: string) {
  return `${FLIGHT_KEY_PREFIX}${bookingId}`;
}

export function saveBookingFlight(bookingId: string, flight: PricedFlight): void {
  if (typeof window === "undefined" || !bookingId) return;

  try {
    sessionStorage.setItem(flightKey(bookingId), JSON.stringify(flight));
  } catch (error) {
    console.error("Failed to save booking flight", error);
  }
}

export function loadBookingFlight(bookingId: string): PricedFlight | null {
  if (typeof window === "undefined" || !bookingId) return null;

  try {
    const raw = sessionStorage.getItem(flightKey(bookingId));
    if (!raw) return null;

    return JSON.parse(raw) as PricedFlight;
  } catch {
    return null;
  }
}

function pricingKey(bookingId: string) {
  return `${PRICING_KEY_PREFIX}${bookingId}`;
}

export function saveBookingPricing(
  bookingId: string,
  pricing: PricingState,
): void {
  if (typeof window === "undefined" || !bookingId) return;

  try {
    sessionStorage.setItem(pricingKey(bookingId), JSON.stringify(pricing));
  } catch (error) {
    console.error("Failed to save booking pricing", error);
  }
}

export function loadBookingPricing(bookingId: string): PricingState | null {
  if (typeof window === "undefined" || !bookingId) return null;

  try {
    const raw = sessionStorage.getItem(pricingKey(bookingId));
    if (!raw) return null;

    return JSON.parse(raw) as PricingState;
  } catch {
    return null;
  }
}

export function saveBookingTravelersDraft(
  bookingId: string,
  travelers: TravelerForm[],
): void {
  if (typeof window === "undefined" || !bookingId) return;

  try {
    sessionStorage.setItem(draftKey(bookingId), JSON.stringify(travelers));
  } catch (error) {
    console.error("Failed to save travelers draft", error);
  }
}

export function loadBookingTravelersDraft(
  bookingId: string,
): TravelerForm[] | null {
  if (typeof window === "undefined" || !bookingId) return null;

  try {
    const raw = sessionStorage.getItem(draftKey(bookingId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TravelerForm[]) : null;
  } catch {
    return null;
  }
}

export function saveBookingTravelersConfirmed(
  bookingId: string,
  travelers: TravelerForm[],
): void {
  if (typeof window === "undefined" || !bookingId) return;

  try {
    sessionStorage.setItem(confirmedKey(bookingId), JSON.stringify(travelers));
  } catch (error) {
    console.error("Failed to save confirmed travelers", error);
  }
}

export function loadBookingTravelersConfirmed(
  bookingId: string,
): TravelerForm[] | null {
  if (typeof window === "undefined" || !bookingId) return null;

  try {
    const raw = sessionStorage.getItem(confirmedKey(bookingId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as TravelerForm[]) : null;
  } catch {
    return null;
  }
}

export function mergeTravelersWithDraft(
  slots: TravelerForm[],
  draft: TravelerForm[] | null,
): TravelerForm[] {
  if (!draft?.length || draft.length !== slots.length) {
    return slots;
  }

  return slots.map((slot, index) => {
    const saved = draft[index];
    if (!saved || saved.type !== slot.type) {
      return slot;
    }

    return {
      ...slot,
      ...saved,
      id: slot.id,
      type: slot.type,
    };
  });
}
