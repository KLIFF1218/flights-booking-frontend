import type { BookingSnapshot } from "@/shared/types/booking-snapshot";

export function getBookingSnapshotRoute(snapshot: BookingSnapshot | null | undefined) {
  const segment =
    snapshot?.offer?.itineraries?.[0]?.segments?.[0] ??
    snapshot?.flightOffers?.[0]?.itineraries?.[0]?.segments?.[0];

  return {
    number: segment?.number ?? "—",
    from: segment?.departure?.iataCode ?? "—",
    to: segment?.arrival?.iataCode ?? "—",
    departureDate: segment?.departure?.at,
    airline: segment?.carrierCode ?? "—",
  };
}

export function getBookingSnapshotPassengersCount(
  snapshot: BookingSnapshot | null | undefined,
): number {
  return (
    snapshot?.travelers?.length ??
    snapshot?.pricing?.travelers?.length ??
    0
  );
}
