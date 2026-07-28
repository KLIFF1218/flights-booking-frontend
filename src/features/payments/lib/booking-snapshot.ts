import type { BookingSnapshot, BookingSnapshotSegment } from "@/shared/types/booking-snapshot";

export function parseBookingSnapshot(snapshot: unknown): BookingSnapshot | null {
  if (!snapshot) {
    return null;
  }

  if (typeof snapshot === "string") {
    try {
      return JSON.parse(snapshot) as BookingSnapshot;
    } catch {
      return null;
    }
  }

  return snapshot as BookingSnapshot;
}

type SnapshotOffer = {
  itineraries?: Array<{ segments?: BookingSnapshotSegment[] }>;
  travelerPricings?: Array<{
    fareDetailsBySegment?: Array<{ cabin?: string }>;
  }>;
};

export function extractFlightOffer(
  snapshot: BookingSnapshot | null,
): SnapshotOffer | null {
  if (!snapshot) {
    return null;
  }

  if (snapshot.offer) {
    return snapshot.offer as SnapshotOffer;
  }

  const flightOffers = Array.isArray(snapshot.flightOffers)
    ? snapshot.flightOffers
    : [];

  return (flightOffers[0] as SnapshotOffer | undefined) ?? null;
}

export function extractFlightSegments(
  snapshot: BookingSnapshot | null,
): BookingSnapshotSegment[] {
  const offer = extractFlightOffer(snapshot);
  const itineraries = offer?.itineraries ?? [];

  return itineraries.flatMap((itinerary) => itinerary.segments ?? []);
}

export function extractCabinClass(snapshot: BookingSnapshot | null): string | null {
  const offer = extractFlightOffer(snapshot);

  const travelerPricing = offer?.travelerPricings?.[0];
  const fareDetails = travelerPricing?.fareDetailsBySegment?.[0];

  return (
    fareDetails?.cabin ??
    snapshot?.pricing?.travelers?.[0]?.fareDetailsBySegment?.[0]?.cabin ??
    null
  );
}
