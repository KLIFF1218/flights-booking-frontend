export type DurationBucket =
  | "UP_TO_5H"
  | "FROM_5_TO_10H"
  | "FROM_10_TO_15H"
  | "OVER_15H";

export type FlightSearchFilters = {
  minPrice?: number;
  maxPrice?: number;
  stops: number[];
  airlines: string[];
  durations: DurationBucket[];
};

export type FlightFiltersMeta = {
  minPrice: number;
  maxPrice: number;
  stops: { stops: number; count: number }[];
  airlines: { code: string; name: string; count: number }[];
  durations: { id: DurationBucket; label: string; count: number }[];
};

export const EMPTY_FILTERS: FlightSearchFilters = {
  stops: [],
  airlines: [],
  durations: [],
};

export const DURATION_BUCKET_LABELS: Record<DurationBucket, string> = {
  UP_TO_5H: "up to 5h",
  FROM_5_TO_10H: "5–10h",
  FROM_10_TO_15H: "10–15h",
  OVER_15H: "15h+",
};

const DURATION_BUCKET_SET = new Set<string>(Object.keys(DURATION_BUCKET_LABELS));

function parseCsv(value: string | null): string[] {
  if (!value?.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseOptionalPrice(value: string | null): number | undefined {
  if (value === null || value === "") {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseFiltersFromSearchParams(
  searchParams: URLSearchParams,
): FlightSearchFilters {
  const stops = parseCsv(searchParams.get("stops"))
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  const airlines = parseCsv(searchParams.get("airlines")).map((value) =>
    value.toUpperCase(),
  );

  const durations = parseCsv(searchParams.get("durations")).filter(
    (value): value is DurationBucket =>
      DURATION_BUCKET_SET.has(value),
  ) as DurationBucket[];

  const parsed: FlightSearchFilters = {
    minPrice: parseOptionalPrice(searchParams.get("minPrice")),
    maxPrice: parseOptionalPrice(searchParams.get("maxPrice")),
    stops,
    airlines,
    durations,
  };

  if (
    parsed.minPrice !== undefined &&
    parsed.maxPrice !== undefined &&
    parsed.minPrice > parsed.maxPrice
  ) {
    return {
      ...parsed,
      minPrice: parsed.maxPrice,
      maxPrice: parsed.minPrice,
    };
  }

  return parsed;
}

export function countActiveFilters(filters: FlightSearchFilters): number {
  let count = 0;

  if (filters.minPrice !== undefined) count += 1;
  if (filters.maxPrice !== undefined) count += 1;
  count += filters.stops.length;
  count += filters.airlines.length;
  count += filters.durations.length;

  return count;
}

export function formatStopsLabel(
  stops: number,
  t?: (key: string, values?: Record<string, string | number>) => string,
): string {
  if (t) {
    if (stops === 0) {
      return t("transfers.nonStop");
    }

    if (stops === 1) {
      return t("transfers.oneStop");
    }

    return t("transfers.manyStops", { count: stops });
  }

  if (stops === 0) return "Non-stop";
  if (stops === 1) return "1 stop";
  return `${stops} stops`;
}

const DURATION_BUCKET_KEYS: Record<DurationBucket, string> = {
  UP_TO_5H: "durationUpTo5h",
  FROM_5_TO_10H: "duration5to10h",
  FROM_10_TO_15H: "duration10to15h",
  OVER_15H: "durationOver15h",
};

export function getDurationBucketLabel(
  id: DurationBucket,
  t?: (key: string) => string,
): string {
  if (t) {
    return t(DURATION_BUCKET_KEYS[id]);
  }

  return DURATION_BUCKET_LABELS[id];
}

export function hasActiveFilters(filters: FlightSearchFilters): boolean {
  return countActiveFilters(filters) > 0;
}

export function getFiltersQueryKey(filters: FlightSearchFilters): string {
  return JSON.stringify({
    minPrice: filters.minPrice ?? null,
    maxPrice: filters.maxPrice ?? null,
    stops: [...filters.stops].sort(),
    airlines: [...filters.airlines].sort(),
    durations: [...filters.durations].sort(),
  });
}

export function appendFiltersToSearchParams(
  params: URLSearchParams,
  filters: FlightSearchFilters,
): void {
  params.delete("minPrice");
  params.delete("maxPrice");
  params.delete("stops");
  params.delete("airlines");
  params.delete("durations");

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
}

export function normalizePriceRange(
  minPrice: number | undefined,
  maxPrice: number | undefined,
  bounds?: Pick<FlightFiltersMeta, "minPrice" | "maxPrice"> | null,
): { minPrice?: number; maxPrice?: number } {
  const boundMin = bounds?.minPrice ?? 0;
  const boundMax = bounds?.maxPrice ?? 0;

  let nextMin = minPrice;
  let nextMax = maxPrice;

  if (nextMin !== undefined) {
    nextMin = Math.max(boundMin, nextMin);
  }

  if (nextMax !== undefined) {
    nextMax = Math.min(boundMax > 0 ? boundMax : nextMax, nextMax);
  }

  if (nextMin !== undefined && nextMax !== undefined && nextMin > nextMax) {
    [nextMin, nextMax] = [nextMax, nextMin];
  }

  if (nextMin !== undefined && nextMin <= boundMin) {
    nextMin = undefined;
  }

  if (nextMax !== undefined && boundMax > 0 && nextMax >= boundMax) {
    nextMax = undefined;
  }

  return {
    minPrice: nextMin,
    maxPrice: nextMax,
  };
}
