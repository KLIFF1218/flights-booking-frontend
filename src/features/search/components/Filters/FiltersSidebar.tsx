"use client";

import { ChevronDown, Filter, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";
import type {
  DurationBucket,
  FlightFiltersMeta,
  FlightSearchFilters,
} from "@/features/search/utils/search-filters";
import {
  countActiveFilters,
  formatStopsLabel,
  getDurationBucketLabel,
  hasActiveFilters,
  normalizePriceRange,
} from "@/features/search/utils/search-filters";
import { formatAirlineLabel } from "@/shared/utils/airline-display";
import {
  getAirlineLogoUrl,
  handleAirlineLogoError,
} from "@/shared/utils/airline-logo";

type Props = {
  filterMeta: FlightFiltersMeta | null;
  filters: FlightSearchFilters;
  onChange: (filters: FlightSearchFilters) => void;
};

const VISIBLE_AIRLINES_LIMIT = 6;

function toggleInList<T>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-gray-100 py-5 last:border-b-0 last:pb-0">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h4>
      {children}
    </section>
  );
}

function FilterCheckbox({
  checked,
  label,
  count,
  onChange,
  leading,
}: {
  checked: boolean;
  label: string;
  count?: number;
  onChange: () => void;
  leading?: ReactNode;
}) {
  return (
    <label className="group flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-gray-50">
      <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="peer sr-only"
        />
        <span className="h-5 w-5 rounded-md border border-gray-300 bg-white transition peer-checked:border-blue-600 peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-200" />
        <svg
          viewBox="0 0 12 10"
          className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition peer-checked:opacity-100"
          aria-hidden
        >
          <path
            d="M1 5.5L4.5 9 11 1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {leading}

      <span className="flex min-w-0 flex-1 items-center justify-between gap-2 text-sm text-gray-800">
        <span className="truncate">{label}</span>
        {count !== undefined && (
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {count}
          </span>
        )}
      </span>
    </label>
  );
}

function FilterSidebarSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:w-80">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="space-y-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-10 animate-pulse rounded-xl bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  );
}

function PriceRangeFields({
  filters,
  filterMeta,
  onApply,
}: {
  filters: FlightSearchFilters;
  filterMeta: FlightFiltersMeta;
  onApply: (minPrice?: number, maxPrice?: number) => void;
}) {
  const t = useTranslations("results.filters");
  const tResults = useTranslations("results");
  const [minDraft, setMinDraft] = useState(
    filters.minPrice !== undefined ? String(filters.minPrice) : "",
  );
  const [maxDraft, setMaxDraft] = useState(
    filters.maxPrice !== undefined ? String(filters.maxPrice) : "",
  );
  const [error, setError] = useState<string | null>(null);

  function applyPriceRange() {
    const parsedMin = minDraft.trim() ? Number(minDraft) : undefined;
    const parsedMax = maxDraft.trim() ? Number(maxDraft) : undefined;

    if (
      (parsedMin !== undefined && !Number.isFinite(parsedMin)) ||
      (parsedMax !== undefined && !Number.isFinite(parsedMax))
    ) {
      setError(t("invalidNumbers"));
      return;
    }

    const normalized = normalizePriceRange(parsedMin, parsedMax, filterMeta);
    setError(null);
    onApply(normalized.minPrice, normalized.maxPrice);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      applyPriceRange();
    }
  }

  const hasAppliedPrice =
    filters.minPrice !== undefined || filters.maxPrice !== undefined;

  return (
    <FilterSection title={t("price")}>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-gray-600">{t("from")}</span>
          <input
            type="number"
            min={filterMeta.minPrice}
            max={filterMeta.maxPrice}
            inputMode="numeric"
            placeholder={String(filterMeta.minPrice)}
            value={minDraft}
            onChange={(event) => {
              setMinDraft(event.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-gray-600">{t("to")}</span>
          <input
            type="number"
            min={filterMeta.minPrice}
            max={filterMeta.maxPrice}
            inputMode="numeric"
            placeholder={String(filterMeta.maxPrice)}
            value={maxDraft}
            onChange={(event) => {
              setMaxDraft(event.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={applyPriceRange}
          className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {t("apply")}
        </button>
        {hasAppliedPrice && (
          <button
            type="button"
            onClick={() => onApply(undefined, undefined)}
            className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            {tResults("resetFilters")}
          </button>
        )}
      </div>
    </FilterSection>
  );
}

export function FilterSidebar({ filterMeta, filters, onChange }: Props) {
  const t = useTranslations("results.filters");
  const tResults = useTranslations("results");
  const [showAllAirlines, setShowAllAirlines] = useState(false);
  const activeCount = countActiveFilters(filters);

  function updateFilters(next: FlightSearchFilters) {
    onChange(next);
  }

  function toggleStops(value: number) {
    updateFilters({
      ...filters,
      stops: toggleInList(filters.stops, value),
    });
  }

  function toggleAirline(value: string) {
    updateFilters({
      ...filters,
      airlines: toggleInList(filters.airlines, value),
    });
  }

  function toggleDuration(value: DurationBucket) {
    updateFilters({
      ...filters,
      durations: toggleInList(filters.durations, value),
    });
  }

  function resetFilters() {
    updateFilters({
      minPrice: undefined,
      maxPrice: undefined,
      stops: [],
      airlines: [],
      durations: [],
    });
  }

  if (!filterMeta) {
    return <FilterSidebarSkeleton />;
  }

  const visibleAirlines = showAllAirlines
    ? filterMeta.airlines
    : filterMeta.airlines.slice(0, VISIBLE_AIRLINES_LIMIT);
  const hiddenAirlinesCount = Math.max(
    filterMeta.airlines.length - VISIBLE_AIRLINES_LIMIT,
    0,
  );

  const durationOptions =
    filterMeta.durations.length > 0
      ? filterMeta.durations.map((duration) => ({
          ...duration,
          label: getDurationBucketLabel(duration.id, t),
        }))
      : (["UP_TO_5H", "FROM_5_TO_10H", "FROM_10_TO_15H", "OVER_15H"] as const).map(
          (id) => ({
            id,
            label: getDurationBucketLabel(id, t),
            count: 0,
          }),
        );

  return (
    <div className="sticky top-[4.75rem] w-full rounded-2xl border border-gray-200 bg-white shadow-sm lg:w-80">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Filter className="h-4 w-4" />
          </span>
          <div>
            <h3 className="font-semibold text-gray-900">{t("title")}</h3>
            {activeCount > 0 && (
              <p className="text-xs text-gray-500">
                {t("selected", { count: activeCount })}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!hasActiveFilters(filters)}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-300"
          onClick={resetFilters}
        >
          <RotateCcw className="h-4 w-4" />
          {t("reset")}
        </button>
      </div>

      <div className="px-3 pb-4">
        <PriceRangeFields
          key={`${filters.minPrice ?? "min"}-${filters.maxPrice ?? "max"}`}
          filters={filters}
          filterMeta={filterMeta}
          onApply={(minPrice, maxPrice) =>
            updateFilters({
              ...filters,
              minPrice,
              maxPrice,
            })
          }
        />

        {filterMeta.stops.length > 0 && (
          <FilterSection title={t("stops")}>
            <div className="space-y-1">
              {filterMeta.stops.map((stop) => (
                <FilterCheckbox
                  key={stop.stops}
                  checked={filters.stops.includes(stop.stops)}
                  label={formatStopsLabel(stop.stops, tResults)}
                  count={stop.count}
                  onChange={() => toggleStops(stop.stops)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {filterMeta.airlines.length > 0 && (
          <FilterSection title={t("airlines")}>
            <div className="space-y-1">
              {visibleAirlines.map((airline) => (
                <FilterCheckbox
                  key={airline.code}
                  checked={filters.airlines.includes(airline.code)}
                  label={formatAirlineLabel(airline.name, airline.code)}
                  count={airline.count}
                  onChange={() => toggleAirline(airline.code)}
                  leading={
                    <Image
                      src={getAirlineLogoUrl(airline.code)}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 rounded-full border border-gray-100 bg-white object-contain"
                      onError={handleAirlineLogoError}
                    />
                  }
                />
              ))}
            </div>

            {hiddenAirlinesCount > 0 && (
              <button
                type="button"
                onClick={() => setShowAllAirlines((value) => !value)}
                className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm text-blue-600 transition hover:bg-blue-50"
              >
                {showAllAirlines
                  ? t("showLess")
                  : t("showMore", { count: hiddenAirlinesCount })}
                <ChevronDown
                  className={`h-4 w-4 transition ${showAllAirlines ? "rotate-180" : ""}`}
                />
              </button>
            )}
          </FilterSection>
        )}

        <FilterSection title={t("duration")}>
          <div className="space-y-1">
            {durationOptions.map((duration) => (
              <FilterCheckbox
                key={duration.id}
                checked={filters.durations.includes(duration.id)}
                label={duration.label}
                count={duration.count > 0 ? duration.count : undefined}
                onChange={() => toggleDuration(duration.id)}
              />
            ))}
          </div>
        </FilterSection>
      </div>
    </div>
  );
}
