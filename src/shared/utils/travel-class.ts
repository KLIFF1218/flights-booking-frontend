import type { CabinClass } from "@/shared/types/search-response";

export type TravelClass = CabinClass;

export const TRAVEL_CLASS_OPTIONS: Array<{ value: TravelClass; label: string }> =
  [
    { value: "ECONOMY", label: "Economy" },
    { value: "PREMIUM_ECONOMY", label: "Premium Economy" },
    { value: "BUSINESS", label: "Business" },
    { value: "FIRST", label: "First Class" },
  ];

const TRAVEL_CLASS_LABELS: Record<TravelClass, string> = {
  ECONOMY: "economy",
  PREMIUM_ECONOMY: "premium economy",
  BUSINESS: "business",
  FIRST: "first class",
};

const CABIN_LABELS: Record<CabinClass, string> = {
  ECONOMY: "Economy",
  PREMIUM_ECONOMY: "Premium Economy",
  BUSINESS: "Business",
  FIRST: "First Class",
};

/** @deprecated Use PREMIUM_ECONOMY */
const LEGACY_COMFORT = "COMFORT";

export function normalizeTravelClass(value: string | null | undefined): TravelClass {
  if (!value) return "ECONOMY";
  if (value === LEGACY_COMFORT) return "PREMIUM_ECONOMY";
  if (TRAVEL_CLASS_OPTIONS.some((option) => option.value === value)) {
    return value as TravelClass;
  }
  return "ECONOMY";
}

export function formatTravelClassLabel(
  travelClass: TravelClass,
  t?: (key: string) => string,
): string {
  if (t) {
    return t(`travelClass.${travelClass}`);
  }

  return TRAVEL_CLASS_LABELS[travelClass];
}

export function formatCabinLabel(
  cabin: CabinClass,
  t?: (key: string) => string,
): string {
  if (t) {
    return t(`travelClass.${cabin}`);
  }

  return CABIN_LABELS[cabin];
}
