import type { PricedFlight } from "@/shared/types/flight";
import { getAirportTimezone } from "@/shared/utils/airport-timezone";

function resolveIntlLocale(locale?: string): string {
  return locale === "ru" ? "ru-RU" : "en-US";
}

export function formatTime(date: string, timeZone?: string, locale?: string) {
  return new Date(date).toLocaleTimeString(resolveIntlLocale(locale), {
    hour: "2-digit",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
  });
}

export function formatDuration(time: number, locale?: string) {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  if (locale === "ru") {
    return `${hours} ч ${minutes} мин`;
  }

  return `${hours}h ${minutes}m`;
}

export const formatDate = (
  dateString: string,
  timeZone?: string,
  locale?: string,
): string => {
  const date = new Date(dateString);
  return date
    .toLocaleDateString(resolveIntlLocale(locale), {
      day: "numeric",
      month: "short",
      weekday: "short",
      ...(timeZone ? { timeZone } : {}),
    })
    .replace(".", "");
};

/** Formats YYYY-MM-DD without interpreting it as a UTC midnight instant. */
export function formatLocalDateString(localDate: string, locale?: string): string {
  const [year, month, day] = localDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  return date
    .toLocaleDateString(resolveIntlLocale(locale), {
      day: "numeric",
      month: "short",
      weekday: "short",
    })
    .replace(".", "");
}

type FlightEndpointLike = {
  departureTime: string;
  from: string;
  departureLocalDate?: string;
  departureLocalTime?: string;
  departureTimezone?: string;
};

type AirportEndpointLike = {
  airport: string;
  time: string;
  date: string;
  localDate?: string;
  localTime?: string;
  timezone?: string;
};

export function formatFlightDepartureDate(
  direction: FlightEndpointLike,
  locale?: string,
): string {
  if (direction.departureLocalDate) {
    return formatLocalDateString(direction.departureLocalDate, locale);
  }

  return formatDate(
    direction.departureTime,
    direction.departureTimezone ?? getAirportTimezone(direction.from),
    locale,
  );
}

export function formatFlightDepartureTime(
  direction: FlightEndpointLike,
  locale?: string,
): string {
  if (direction.departureLocalTime) {
    return direction.departureLocalTime;
  }

  return formatTime(
    direction.departureTime,
    direction.departureTimezone ?? getAirportTimezone(direction.from),
    locale,
  );
}

export function formatAirportDepartureDate(
  endpoint: AirportEndpointLike,
  locale?: string,
): string {
  if (endpoint.localDate) {
    return formatLocalDateString(endpoint.localDate, locale);
  }

  return formatDate(
    endpoint.date,
    endpoint.timezone ?? getAirportTimezone(endpoint.airport),
    locale,
  );
}

export function formatAirportDepartureTime(
  endpoint: AirportEndpointLike,
  locale?: string,
): string {
  if (endpoint.localTime) {
    return endpoint.localTime;
  }

  return formatTime(
    endpoint.time,
    endpoint.timezone ?? getAirportTimezone(endpoint.airport),
    locale,
  );
}

export function formatAirportArrivalDate(
  endpoint: AirportEndpointLike,
  airportCode: string,
  locale?: string,
): string {
  if (endpoint.localDate) {
    return formatLocalDateString(endpoint.localDate, locale);
  }

  return formatDate(
    endpoint.date,
    endpoint.timezone ?? getAirportTimezone(airportCode),
    locale,
  );
}

export function formatAirportArrivalTime(
  endpoint: AirportEndpointLike,
  airportCode: string,
  locale?: string,
): string {
  if (endpoint.localTime) {
    return endpoint.localTime;
  }

  return formatTime(
    endpoint.time,
    endpoint.timezone ?? getAirportTimezone(airportCode),
    locale,
  );
}

type FlightArrivalEndpointLike = {
  arrivalTime: string;
  to: string;
  arrivalLocalDate?: string;
  arrivalLocalTime?: string;
  arrivalTimezone?: string;
};

export function formatFlightArrivalDate(
  direction: FlightArrivalEndpointLike,
  locale?: string,
): string {
  if (direction.arrivalLocalDate) {
    return formatLocalDateString(direction.arrivalLocalDate, locale);
  }

  return formatDate(
    direction.arrivalTime,
    direction.arrivalTimezone ?? getAirportTimezone(direction.to),
    locale,
  );
}

export function formatFlightArrivalTime(
  direction: FlightArrivalEndpointLike,
  locale?: string,
): string {
  if (direction.arrivalLocalTime) {
    return direction.arrivalLocalTime;
  }

  return formatTime(
    direction.arrivalTime,
    direction.arrivalTimezone ?? getAirportTimezone(direction.to),
    locale,
  );
}

export function formatDateTimeLabel(
  dateString: string,
  airportCode: string,
  timeZone: string,
): string {
  return `${formatTime(dateString, timeZone)}, ${formatDate(dateString, timeZone)} (${airportCode})`;
}

export function formatDateRange(flight: Pick<PricedFlight, "outbound" | "inbound">) {
  const from = formatFlightDepartureDate(flight.outbound);

  if (!flight.inbound) {
    return from;
  }

  const to = formatFlightDepartureDate(flight.inbound);
  return `${from} — ${to}`;
}
