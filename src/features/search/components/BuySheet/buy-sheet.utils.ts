import type { PricingState } from "@/features/booking/store/booking.store";
import type { PricedFlight } from "@/shared/types/flight";
import { formatCabinLabel } from "@/shared/utils/travel-class";
import type { CabinClass } from "@/shared/types/search-response";
import type { FareBrandCode } from "@/features/booking/types/pricing.types";
import { pluralMessageKey } from "@/shared/utils/plural-message";

type TravelerLike = PricedFlight["travelers"][number];

/** Matches backend FLEX multiplier in fare-brand.constants.ts */
export const FLEX_PRICE_MULTIPLIER = 1.35;

export type BuySheetTranslator = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

const PASSENGER_TYPE_KEYS: Record<string, string> = {
  ADULT: "travelerAdult",
  CHILD: "travelerChild",
  HELD_INFANT: "travelerHeldInfant",
  SEATED_INFANT: "travelerSeatedInfant",
};

export function formatPassengerSummary(
  travelers: TravelerLike[],
  t: BuySheetTranslator,
  locale: string,
): string {
  const counts = new Map<string, number>();

  for (const traveler of travelers) {
    const type = traveler.travelerType.toUpperCase();
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([type, count]) => {
      const baseKey = PASSENGER_TYPE_KEYS[type] ?? "travelerOther";
      return t(pluralMessageKey(baseKey, count, locale), { count });
    })
    .join(", ");
}

export function extractFareMeta(
  travelers: TravelerLike[],
  tCabin?: (key: string) => string,
): {
  cabin: string | null;
  checkedBags: number | null;
} {
  const fareDetails = travelers[0]?.fareDetailsBySegment?.[0];

  if (!fareDetails) {
    return { cabin: null, checkedBags: null };
  }

  const cabin = fareDetails.cabin
    ? formatCabinLabel(fareDetails.cabin as CabinClass, tCabin)
    : null;
  const checkedBags = fareDetails.includedCheckedBags?.quantity ?? null;

  return { cabin, checkedBags };
}

export function formatFareMetaLine(
  travelers: TravelerLike[],
  t: BuySheetTranslator,
  locale: string,
  tCabin?: (key: string) => string,
): string | null {
  const { cabin, checkedBags } = extractFareMeta(travelers, tCabin);
  const parts: string[] = [];

  if (cabin) {
    parts.push(cabin);
  }

  if (checkedBags !== null) {
    parts.push(formatCheckedBagsLabel(checkedBags, t, locale));
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}

export function formatCheckedBagsLabel(
  count: number,
  t: BuySheetTranslator,
  locale: string,
): string {
  if (count <= 0) {
    return t("noCheckedBags");
  }

  return t(pluralMessageKey("checkedBag", count, locale), { count });
}

/** Mirrors backend resolveFareBrandRules checkedBags. */
export function resolveBrandCheckedBags(
  brand: FareBrandCode,
  cabin: CabinClass = "ECONOMY",
): number {
  if (brand === "FLEX") {
    return cabin === "ECONOMY" ? 1 : 2;
  }

  return cabin === "ECONOMY" ? 0 : 1;
}

export function resolveTravelerCabin(travelers: TravelerLike[]): CabinClass {
  const cabin = travelers[0]?.fareDetailsBySegment?.[0]?.cabin;
  if (
    cabin === "ECONOMY" ||
    cabin === "PREMIUM_ECONOMY" ||
    cabin === "BUSINESS" ||
    cabin === "FIRST"
  ) {
    return cabin;
  }

  return "ECONOMY";
}

export function formatBrandPolicyLine(brand: FareBrandCode): string {
  return brand === "FLEX"
    ? "Changes allowed · refundable"
    : "No changes · no refund";
}

export function formatBrandBaggageLine(
  brand: FareBrandCode,
  cabin: CabinClass,
  t: BuySheetTranslator,
  locale: string,
): string {
  return formatCheckedBagsLabel(resolveBrandCheckedBags(brand, cabin), t, locale);
}

export function formatSelectedFareMetaLine(
  travelers: TravelerLike[],
  selectedBrand: FareBrandCode,
  t: BuySheetTranslator,
  locale: string,
  tCabin: (key: string) => string,
): string | null {
  const cabin = resolveTravelerCabin(travelers);
  const cabinLabel = formatCabinLabel(cabin, tCabin);
  const bags = resolveBrandCheckedBags(selectedBrand, cabin);

  return `${cabinLabel} · ${formatCheckedBagsLabel(bags, t, locale)}`;
}

export function hasPriceBreakdown(pricing: PricingState | null): boolean {
  if (!pricing) {
    return false;
  }

  return pricing.baseTotal > 0 || pricing.taxesTotal > 0 || pricing.feesTotal > 0;
}
