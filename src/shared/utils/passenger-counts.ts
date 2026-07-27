import type { Passengers } from "@/shared/types/passengers";

export const MAX_PASSENGERS_PER_BOOKING = 9;

export function getPassengerTotal(passengers: Passengers): number {
  return (
    passengers.adults +
    passengers.children +
    passengers.infants +
    passengers.seatedInfants
  );
}

export function getTotalInfants(passengers: Passengers): number {
  return passengers.infants + passengers.seatedInfants;
}

type PassengerCountTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function validatePassengerCounts(
  passengers: Passengers,
  t?: PassengerCountTranslator,
): string | null {
  if (passengers.adults < 1) {
    return t ? t("errors.adultRequired") : "At least one adult passenger is required";
  }

  if (getTotalInfants(passengers) > passengers.adults) {
    return t
      ? t("errors.tooManyInfants")
      : "There cannot be more infants than adults";
  }

  if (getPassengerTotal(passengers) > MAX_PASSENGERS_PER_BOOKING) {
    return t
      ? t("errors.maxPassengers", { count: MAX_PASSENGERS_PER_BOOKING })
      : `Maximum ${MAX_PASSENGERS_PER_BOOKING} passengers per booking`;
  }

  return null;
}
