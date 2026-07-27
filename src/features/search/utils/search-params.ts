import type { TravelClass } from "@/shared/types/passengers";
import { normalizeTravelClass } from "@/shared/utils/travel-class";
import type { FlightSortOption } from "@/features/search/api/search.api";

export type ParsedFlightSearchParams = {
  from: string;
  to: string;
  dateFrom: string;
  dateTo: string | null;
  adults: string;
  children: string;
  infants: string;
  seatedInfants: string;
  travelClass: TravelClass;
};

const ROUTE_PARAM_KEYS = [
  "from",
  "to",
  "dateFrom",
  "dateTo",
  "adults",
  "children",
  "infants",
  "seatedInfants",
  "travelClass",
] as const;

const SORT_PARAM = "sort";
const FILTER_PARAMS = [
  "minPrice",
  "maxPrice",
  "stops",
  "airlines",
  "durations",
] as const;

const VALID_SORTS: FlightSortOption[] = [
  "best",
  "cheapest",
  "fastest",
  "departure",
  "arrival",
];

export function parseFlightSearchParams(
  searchParams: URLSearchParams,
): ParsedFlightSearchParams | null {
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const dateFrom = searchParams.get("dateFrom");
  const adults = searchParams.get("adults");
  const travelClass = normalizeTravelClass(searchParams.get("travelClass"));

  if (!from || !to || !dateFrom || !adults || !travelClass) {
    return null;
  }

  return {
    from,
    to,
    dateFrom,
    dateTo: searchParams.get("dateTo"),
    adults,
    children: searchParams.get("children") ?? "0",
    infants: searchParams.get("infants") ?? "0",
    seatedInfants: searchParams.get("seatedInfants") ?? "0",
    travelClass,
  };
}

export function getRouteSearchKey(searchParams: URLSearchParams): string {
  const params = new URLSearchParams();

  for (const key of ROUTE_PARAM_KEYS) {
    const value = searchParams.get(key);
    if (value) {
      params.set(key, value);
    }
  }

  return params.toString();
}

export function parseSortFromSearchParams(
  searchParams: URLSearchParams,
): FlightSortOption {
  const sort = searchParams.get(SORT_PARAM);

  if (sort && VALID_SORTS.includes(sort as FlightSortOption)) {
    return sort as FlightSortOption;
  }

  return "best";
}

export function isSortOrFilterParam(key: string): boolean {
  return key === SORT_PARAM || FILTER_PARAMS.includes(key as (typeof FILTER_PARAMS)[number]);
}
