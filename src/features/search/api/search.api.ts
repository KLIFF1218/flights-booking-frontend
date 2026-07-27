import { apiFetch } from "@/shared/api/apiClient";
import type { FlightCardResponse } from "@/shared/types/search-response";
import type { ParsedFlightSearchParams } from "@/features/search/utils/search-params";
import type {
  FlightFiltersMeta,
  FlightSearchFilters,
} from "@/features/search/utils/search-filters";
import { getCurrency, type CurrencyCode } from "@/shared/utils/currency";

export type FlightSortOption =
  | "best"
  | "cheapest"
  | "fastest"
  | "departure"
  | "arrival";

export const SORT_TO_BACKEND: Record<FlightSortOption, string> = {
  best: "BEST",
  cheapest: "CHEAPEST",
  fastest: "FASTEST",
  departure: "DEPARTURE",
  arrival: "ARRIVAL",
};

export type FlightsSearchResponse = {
  searchId: string;
  data: FlightCardResponse[];
  expiresAt?: string | null;
  meta?: {
    total?: number;
    limit?: number;
    hasNextPage?: boolean;
  };
  links?: {
    next?: string | null;
    prev?: string | null;
  } | null;
  filters?: FlightFiltersMeta;
};

function buildFilterQueryString(filters: FlightSearchFilters): string {
  const params = new URLSearchParams();

  if (filters.minPrice !== undefined) {
    params.set("minPrice", String(filters.minPrice));
  }

  if (filters.maxPrice !== undefined) {
    params.set("maxPrice", String(filters.maxPrice));
  }

  if (filters.stops.length > 0) {
    params.set("stops", filters.stops.join(","));
  }

  if (filters.airlines.length > 0) {
    params.set("airlines", filters.airlines.join(","));
  }

  if (filters.durations.length > 0) {
    params.set("durations", filters.durations.join(","));
  }

  const query = params.toString();
  return query ? `&${query}` : "";
}

export function extractCursorFromLink(link: string | null): string | null {
  if (!link) return null;

  try {
    const url = new URL(link, "http://localhost");
    return url.searchParams.get("cursor");
  } catch {
    return null;
  }
}

export function isSearchSessionExpiredError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("404") ||
    message.includes("search expired") ||
    message.includes("not found")
  );
}

export async function createFlightSearch(
  search: ParsedFlightSearchParams,
  options: {
    sort: FlightSortOption;
    filters: FlightSearchFilters;
    limit?: number;
    signal?: AbortSignal;
    currencyCode?: CurrencyCode;
  },
): Promise<FlightsSearchResponse> {
  const directions = [
    {
      origin: search.from,
      destination: search.to,
      dateFrom: search.dateFrom,
    },
  ];

  if (search.dateTo) {
    directions.push({
      origin: search.to,
      destination: search.from,
      dateFrom: search.dateTo,
    });
  }

  const filterQuery = buildFilterQueryString(options.filters);
  const limit = options.limit ?? 10;

  return apiFetch<FlightsSearchResponse>(
    `/flights/search?sort=${SORT_TO_BACKEND[options.sort]}&limit=${limit}${filterQuery}`,
    {
      method: "POST",
      body: JSON.stringify({
        directions,
        passengers: {
          adults: Number(search.adults),
          children: Number(search.children),
          infants: Number(search.infants),
          seatedInfants: Number(search.seatedInfants),
        },
        travelClass: search.travelClass,
        currencyCode: options.currencyCode ?? getCurrency(),
      }),
      signal: options.signal,
    },
  );
}

export async function fetchFlightSearchPage(
  searchId: string,
  options: {
    sort: FlightSortOption;
    filters: FlightSearchFilters;
    cursor?: string | null;
    limit?: number;
    signal?: AbortSignal;
  },
): Promise<FlightsSearchResponse> {
  const limit = options.limit ?? 10;
  const filterQuery = buildFilterQueryString(options.filters);
  const cursorQuery = options.cursor
    ? `&cursor=${encodeURIComponent(options.cursor)}`
    : "";

  return apiFetch<FlightsSearchResponse>(
    `/flights/search/${searchId}?limit=${limit}&sort=${SORT_TO_BACKEND[options.sort]}${cursorQuery}${filterQuery}`,
    {
      signal: options.signal,
    },
  );
}
