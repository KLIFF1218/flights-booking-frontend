import type { SeatMapSegment } from "@/features/booking/api/booking.api";
import type { PricedFlight } from "@/shared/types/flight";

type FlightLeg = PricedFlight["outbound"]["segments"][number];

export function getFlightLegs(flight: PricedFlight | null): FlightLeg[] {
  if (!flight) {
    return [];
  }

  return [
    ...(flight.outbound?.segments ?? []),
    ...(flight.inbound?.segments ?? []),
  ];
}

export function getSeatMapSegmentLabel(
  map: SeatMapSegment,
  index: number,
  flight: PricedFlight | null,
  totalMaps: number,
  t: (key: string, values?: Record<string, string | number>) => string,
): string {
  const legs = getFlightLegs(flight);
  const leg = legs[index];

  if (leg?.from && leg?.to) {
    return `${leg.from} — ${leg.to}`;
  }

  if (flight?.outbound?.from && flight.outbound.to && totalMaps === 1) {
    return `${flight.outbound.from} — ${flight.outbound.to}`;
  }

  if (totalMaps > 1) {
    return t("flightLegNumber", { number: index + 1 });
  }

  return t("flightLeg");
}

export function getSeatMapSegmentLabelById(
  segmentId: string,
  seatMaps: SeatMapSegment[],
  flight: PricedFlight | null,
  t: (key: string, values?: Record<string, string | number>) => string,
): string {
  const index = seatMaps.findIndex((map) => map.segmentId === segmentId);
  if (index < 0) {
    return t("flightLeg");
  }

  return getSeatMapSegmentLabel(seatMaps[index], index, flight, seatMaps.length, t);
}
