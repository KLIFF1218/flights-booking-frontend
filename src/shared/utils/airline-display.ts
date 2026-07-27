import { normalizeAirlineCode } from "@/shared/utils/airline-logo";

export function resolveAirlineIataCode(
  ...candidates: Array<string | undefined | null>
): string | null {
  for (const candidate of candidates) {
    const code = normalizeAirlineCode(candidate);
    if (code) {
      return code;
    }
  }

  return null;
}

export function formatAirlineLabel(
  name?: string | null,
  code?: string | null,
): string {
  const normalizedCode = normalizeAirlineCode(code);
  const trimmedName = name?.trim();

  if (
    trimmedName &&
    normalizedCode &&
    trimmedName.toUpperCase() !== normalizedCode
  ) {
    return `${trimmedName} (${normalizedCode})`;
  }

  return trimmedName || normalizedCode || "Airline";
}

export function formatFlightNumberLabel(
  airlineCode?: string | null,
  flightNumber?: string | null,
): string {
  const code = normalizeAirlineCode(airlineCode);
  const number = flightNumber?.trim();

  if (!number) {
    return code || "—";
  }

  if (!code) {
    return number;
  }

  const normalizedNumber = number.toUpperCase();
  if (
    normalizedNumber === code ||
    normalizedNumber.startsWith(`${code} `) ||
    normalizedNumber.startsWith(code)
  ) {
    return number;
  }

  return `${code} ${number}`;
}

type AirlineSegmentLike = {
  airline?: string | null;
  airlineName?: string | null;
  airlineIata?: string | null;
  carrierCode?: string | null;
};

export function resolveSegmentAirlineName(segment?: AirlineSegmentLike | null): string {
  if (!segment) {
    return "Airline";
  }

  const name = segment.airlineName?.trim() || segment.airline?.trim();
  const code = resolveAirlineIataCode(
    segment.airlineIata,
    segment.carrierCode,
    segment.airline,
  );

  if (name && code && name.toUpperCase() !== code) {
    return name;
  }

  return name || code || "Airline";
}

export function resolveSegmentAirlineCode(
  segment?: AirlineSegmentLike | null,
): string | null {
  if (!segment) {
    return null;
  }

  return resolveAirlineIataCode(
    segment.airlineIata,
    segment.carrierCode,
    segment.airline,
  );
}
