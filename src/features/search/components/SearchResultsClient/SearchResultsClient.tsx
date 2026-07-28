"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useBookingStore } from "@/features/booking/store/booking.store";
import { fetchFlightPricing } from "@/features/booking/api/booking.api";
import {
  mapPricingResponseToFlight,
  mapPricingResponseToState,
} from "@/features/booking/lib/pricing.mapper";
import { PriceUpdateModal } from "@/features/search/components/PriceUpdateModal/PriceUpdateModal";

import { FlightCard } from "@/features/search/components/FlightCard/FlightCard";
import { BuySheet } from "@/features/search/components/BuySheet/BuySheet";
import { FlightCardSkeleton } from "@/features/search/components/Skeleton/FlightCardSkeleton";
import { FilterSidebar } from "@/features/search/components/Filters/FiltersSidebar";

import type { PricedFlight } from "@/shared/types/flight";
import { apiFetch } from "@/shared/api/apiClient";
import { parseFlightSearchParams, parseSortFromSearchParams, getRouteSearchKey } from "@/features/search/utils/search-params";
import {
  appendFiltersToSearchParams,
  EMPTY_FILTERS,
  hasActiveFilters,
  parseFiltersFromSearchParams,
  type FlightSearchFilters,
} from "@/features/search/utils/search-filters";
import { useFlightSearch } from "@/features/search/hooks/useFlightSearch";
import { useSearchCurrency } from "@/features/search/hooks/useSearchCurrency";
import {
  type FlightSortOption,
  isSearchSessionExpiredError,
} from "@/features/search/api/search.api";

import { ArrowUp } from "lucide-react";

import styles from "./SearchResultsClient.module.css";

export function SearchResultsClient() {
  const router = useRouter();
  const t = useTranslations("results");
  const tSearch = useTranslations("search");
  const searchParams = useSearchParams();

  const setOrder = useBookingStore((s) => s.setOrder);
  const setFlight = useBookingStore((s) => s.setFlight);
  const setPricing = useBookingStore((s) => s.setPricing);

  const [pricingState, setPricingState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    flight: PricedFlight | null;
  }>({
    status: "idle",
    flight: null,
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const searchQueryKey = searchParams.toString();
  const routeSearchKey = useMemo(
    () => getRouteSearchKey(new URLSearchParams(searchQueryKey)),
    [searchQueryKey],
  );
  const parsedSearch = useMemo(
    () => parseFlightSearchParams(new URLSearchParams(searchQueryKey)),
    [searchQueryKey],
  );
  const filters = useMemo(
    () => parseFiltersFromSearchParams(new URLSearchParams(searchQueryKey)),
    [searchQueryKey],
  );
  const sortBy = useMemo(
    () => parseSortFromSearchParams(new URLSearchParams(searchQueryKey)),
    [searchQueryKey],
  );
  const hasValidSearchParams = parsedSearch !== null;
  const searchCurrency = useSearchCurrency();

  const { sessionQuery, resultsQuery, searchId: sessionSearchId, refreshSearch } = useFlightSearch({
    parsedSearch,
    routeSearchKey,
    sort: sortBy,
    filters,
  });

  const firstPage = resultsQuery.data?.pages[0];
  const flights = useMemo(
    () => resultsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [resultsQuery.data],
  );
  const filterMeta = firstPage?.filters ?? sessionQuery.data?.filters ?? null;
  const searchId = sessionSearchId ?? "";
  const expiresAt = firstPage?.expiresAt ?? sessionQuery.data?.expiresAt;
  const isDetailsOpen =
    pricingState.status === "loading" || pricingState.status === "success";
  const isBuySheetOpen = isSheetOpen && isDetailsOpen;

  const previousSearchCurrencyRef = useRef(searchCurrency);

  useEffect(() => {
    if (previousSearchCurrencyRef.current === searchCurrency) {
      return;
    }

    previousSearchCurrencyRef.current = searchCurrency;
    setIsSheetOpen(false);
    setPricingState({ status: "idle", flight: null });
    setFlight(null);
    setPricing(null);
  }, [searchCurrency, setFlight, setPricing]);

  const isLoading =
    sessionQuery.isLoading ||
    resultsQuery.isLoading ||
    (resultsQuery.isError && isSearchSessionExpiredError(resultsQuery.error));
  const isFetching =
    resultsQuery.isFetching && !resultsQuery.isFetchingNextPage;

  function isSearchExpired() {
    if (!expiresAt) {
      return false;
    }

    return new Date(expiresAt).getTime() <= Date.now();
  }

  const updateFiltersInUrl = useCallback(
    (nextFilters: FlightSearchFilters) => {
      const params = new URLSearchParams(searchQueryKey);
      appendFiltersToSearchParams(params, nextFilters);
      router.replace(`/search?${params.toString()}#search-results`, {
        scroll: false,
      });
    },
    [router, searchQueryKey],
  );

  const updateSortInUrl = useCallback(
    (nextSort: FlightSortOption) => {
      const params = new URLSearchParams(searchQueryKey);
      params.set("sort", nextSort);
      router.replace(`/search?${params.toString()}#search-results`, {
        scroll: false,
      });
    },
    [router, searchQueryKey],
  );

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const timeoutMs = new Date(expiresAt).getTime() - Date.now();
    if (timeoutMs <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setPricingState({ status: "idle", flight: null });
      setPriceModalOpen(true);
    }, timeoutMs);

    return () => {
      clearTimeout(timer);
    };
  }, [expiresAt]);

  const fetchNextPage = resultsQuery.fetchNextPage;

  useEffect(() => {
    if (!resultsQuery.hasNextPage || resultsQuery.isFetchingNextPage) {
      return;
    }

    const element = loadMoreRef.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void fetchNextPage();
        }
      },
      {
        rootMargin: "500px",
        threshold: 0,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [
    resultsQuery.hasNextPage,
    resultsQuery.isFetchingNextPage,
    fetchNextPage,
    flights.length,
  ]);

  async function handleSelectFlight({
    searchId: selectedSearchId,
    id,
  }: {
    searchId: string;
    id: string;
  }) {
    if (isSearchExpired()) {
      setPriceModalOpen(true);
      return;
    }

    try {
      setOrder({ searchId: selectedSearchId, offerId: id });
      setIsSheetOpen(true);
      setPricingState({ status: "loading", flight: null });

      const pricedFlightResponse = await fetchFlightPricing(selectedSearchId, id, {
        currencyCode: searchCurrency,
      });
      const pricedFlight = mapPricingResponseToFlight(
        pricedFlightResponse,
        searchCurrency,
      );

      setFlight(pricedFlight);
      setPricing(mapPricingResponseToState(pricedFlightResponse, searchCurrency));
      setPricingState({ status: "success", flight: pricedFlight });

      if (pricedFlightResponse.scheduleChanged) {
        const delayLabel =
          pricedFlightResponse.delayMinutes && pricedFlightResponse.delayMinutes > 0
            ? ` (+${pricedFlightResponse.delayMinutes} min)`
            : "";
        window.alert(
          `Flight time has changed${delayLabel}. The updated schedule is shown before booking.`,
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : String(error ?? "");

      const isUnavailable =
        message.includes("cancelled") ||
        message.includes("cancel") ||
        message.includes("no longer available");

      if (isUnavailable) {
        setPricingState({ status: "error", flight: null });
        window.alert(t("flightUnavailable"));
        return;
      }

      const isExpired =
        message.includes("expired") ||
        message.includes("not found") ||
        message.includes("Search expired");

      if (isExpired) {
        setPriceModalOpen(true);
        setPricingState({ status: "idle", flight: null });
        return;
      }

      setPricingState({ status: "error", flight: null });
    }
  }

  async function handleRefreshSearch() {
    setPriceModalOpen(false);
    setPricingState({ status: "idle", flight: null });
    await refreshSearch();
  }

  function handleSortChange(nextSort: FlightSortOption) {
    updateSortInUrl(nextSort);
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const sortOptions = [
    { value: "best", label: t("sortBest") },
    { value: "cheapest", label: t("sortCheapest") },
    { value: "fastest", label: t("sortFastest") },
    { value: "departure", label: t("sortDeparture") },
    { value: "arrival", label: t("sortArrival") },
  ] as const;

  const hasResults = !isLoading && flights.length > 0;

  if (sessionQuery.isError) {
    throw sessionQuery.error;
  }

  if (
    resultsQuery.isError &&
    !isSearchSessionExpiredError(resultsQuery.error)
  ) {
    throw resultsQuery.error;
  }

  return (
    <div ref={containerRef}>
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:py-8">
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start">
          <aside className="w-full flex-shrink-0 lg:w-80">
            {hasValidSearchParams && (
              <FilterSidebar
                filterMeta={filterMeta}
                filters={filters}
                onChange={updateFiltersInUrl}
              />
            )}
          </aside>

          <div
            id="search-results"
            className="scroll-mt-[5.5rem] min-w-0 flex-1"
          >
            {hasValidSearchParams && (
              <div className="mb-4 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-sm sm:mb-6 sm:p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <span className="shrink-0 px-1 text-sm font-semibold text-gray-700 sm:px-2">
                    {t("sortBy")}
                  </span>

                  <div
                    className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5 lg:flex-1"
                    role="group"
                    aria-label={t("sortAria")}
                  >
                    {sortOptions.map((option) => {
                      const isActive = sortBy === option.value;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleSortChange(option.value)}
                          aria-pressed={isActive}
                          className={`w-full rounded-lg px-2 py-2 text-center text-xs font-medium transition sm:px-3 sm:text-sm ${
                            isActive
                              ? "bg-blue-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className={styles.cardsDiv}>
              <div className={styles.cardContainer}>
                {!hasValidSearchParams && (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {t("enterSearchParams")}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      {t("enterSearchParamsHint", {
                        action: tSearch("searchFlights"),
                      })}
                    </p>
                  </div>
                )}

                {hasValidSearchParams && (isLoading || isFetching) && (
                  <div className="space-y-4">
                    <FlightCardSkeleton />
                    <FlightCardSkeleton />
                    <FlightCardSkeleton />
                    <FlightCardSkeleton />
                  </div>
                )}

                {hasValidSearchParams && !isLoading && !isFetching && hasResults && (
                  <>
                    <FlightCard
                      flights={flights}
                      searchId={searchId}
                      onSelect={handleSelectFlight}
                      disabled={pricingState.status === "loading"}
                      sortBy={sortBy}
                    />
                    <div ref={loadMoreRef} className="mt-8 flex justify-center">
                      {resultsQuery.isFetchingNextPage && (
                        <div className="space-y-4 w-full">
                          <FlightCardSkeleton />
                          <FlightCardSkeleton />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {hasValidSearchParams &&
                  !isLoading &&
                  !isFetching &&
                  !hasResults && (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t("noResults")}
                      </h3>
                      <p className="mt-2 text-sm text-gray-600">
                        {hasActiveFilters(filters)
                          ? t("noResultsFiltered")
                          : t("noResultsRoute")}
                      </p>
                      {hasActiveFilters(filters) && (
                        <button
                          type="button"
                          onClick={() => updateFiltersInUrl(EMPTY_FILTERS)}
                          className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          {t("resetFilters")}
                        </button>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <PriceUpdateModal
        open={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        onRefresh={handleRefreshSearch}
      />

      <BuySheet
        open={isBuySheetOpen}
        isLoading={pricingState.status === "loading"}
        onOpenChange={(open) => {
          setIsSheetOpen(open);

          if (!open) {
            setPricingState({ status: "idle", flight: null });
          }
        }}
        onLoginRequired={() => {
          setIsSheetOpen(false);
        }}
        onLoginDismissed={() => {
          if (pricingState.status === "success") {
            setIsSheetOpen(true);
          }
        }}
        flight={pricingState.flight}
      />

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-900 transition"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
