"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useBookingStore } from "@/features/booking/store/booking.store";
import { PriceUpdateModal } from "@/features/search/components/PriceUpdateModal/PriceUpdateModal";

import { FlightCard } from "@/features/search/components/FlightCard/FlightCard";
import { BuySheet } from "@/features/search/components/BuySheet/BuySheet";
import { FlightCardSkeleton } from "@/features/search/components/Skeleton/FlightCardSkeleton";

import {
  FilterSidebar,
  FiltersState,
} from "@/features/search/components/Filters/FiltersSidebar";

import type { PricedFlight } from "@/shared/types/flight";
import type { FlightCardResponse } from "@/shared/types/search-response";
import { apiFetch } from "@/shared/api/apiClient";

import { ArrowUp } from "lucide-react";

import styles from "./SearchResultsClient.module.css";
import { getCurrency } from "@/shared/utils/currency";

type SearchStatus = "idle" | "loading" | "success" | "error";

type SortOption = "best" | "cheapest" | "fastest" | "departure" | "arrival";

const SORT_TO_BACKEND: Record<SortOption, string> = {
  best: "BEST",
  cheapest: "CHEAPEST",
  fastest: "FASTEST",
  departure: "DEPARTURE",
  arrival: "ARRIVAL",
};

interface FlightsSearchResponse {
  searchId: string;
  data: FlightCardResponse[];
  expiresAt?: string;
  links?: {
    next?: string | null;
    prev?: string | null;
  } | null;
}

export function SearchResultsClient() {
  const searchParams = useSearchParams();

  const setOrder = useBookingStore((s) => s.setOrder);
  const setFlight = useBookingStore((s) => s.setFlight);

  const [filters, setFilters] = useState<FiltersState>({
    maxPrice: 2000,
    stops: [],
    airlines: [],
    durations: [],
  });

  const [sortBy, setSortBy] = useState<SortOption>("best");

  const [status, setStatus] = useState<SearchStatus>("idle");
  const [flights, setFlights] = useState<FlightsSearchResponse | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pricingState, setPricingState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    flight: PricedFlight | null;
  }>({
    status: "idle",
    flight: null,
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [priceModalOpen, setPriceModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const isDetailsOpen =
    pricingState.status === "loading" || pricingState.status === "success";

  function isSearchExpired() {
    if (!flights?.expiresAt) {
      return true;
    }

    return new Date(flights.expiresAt).getTime() <= Date.now();
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function extractCursorFromLink(link: string | null): string | null {
    if (!link) return null;

    try {
      const url = new URL(link, window.location.origin);
      return url.searchParams.get("cursor");
    } catch {
      return null;
    }
  }

  const runSearch = useCallback(async () => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");
    const infants = searchParams.get("infants");
    const travelClass = searchParams.get("travelClass");

    const currencyCode = getCurrency();

    if (!from || !to || !dateFrom || !adults || !travelClass) {
      return;
    }

    setStatus("loading");

    try {
      const directions = [
        {
          origin: from,
          destination: to,
          dateFrom,
        },
      ];

      if (dateTo) {
        directions.push({
          origin: to,
          destination: from,
          dateFrom: dateTo,
        });
      }

      const data = await apiFetch<FlightsSearchResponse>(
        `/flights/search?sort=${SORT_TO_BACKEND[sortBy]}`,
        {
          method: "POST",
          body: JSON.stringify({
            directions,
            passengers: {
              adults: Number(adults),
              children: Number(children),
              infants: Number(infants),
            },
            travelClass,
            currencyCode,
          }),
        },
      );


      setFlights(data);
      setNextCursor(extractCursorFromLink(data.links?.next ?? null));
      setHasMore(Boolean(data.links?.next));
      setStatus("success");

      requestAnimationFrame(() => {
        const results = document.getElementById("search-results");

        if (!results) return;

        window.scrollTo({
          top: results.getBoundingClientRect().top + window.scrollY - 96,
          behavior: "smooth",
        });
      });
    } catch (error) {
      console.error("Flight search error:", error);

      setStatus("error");
    }
  }, [searchParams, sortBy]);

  useEffect(() => {
    runSearch();
  }, [runSearch]);

  useEffect(() => {
    if (!flights?.expiresAt) {
      return;
    }

    const expiresAtMs = new Date(flights.expiresAt).getTime();

    const timeoutMs = expiresAtMs - Date.now();

    if (timeoutMs <= 0) {
      setPricingState({
        status: "idle",
        flight: null,
      });

      setPriceModalOpen(true);

      return;
    }

    const timer = window.setTimeout(() => {
      setPricingState({
        status: "idle",
        flight: null,
      });

      setPriceModalOpen(true);
    }, timeoutMs);

    return () => {
      clearTimeout(timer);
    };
  }, [flights?.expiresAt]);

  const loadNextPage = useCallback(async () => {
    if (!flights?.searchId || !nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const nextPage = await apiFetch<FlightsSearchResponse>(
        `/flights/search/${flights.searchId}?cursor=${encodeURIComponent(nextCursor)}&limit=10&sort=${SORT_TO_BACKEND[sortBy]}`,
      );

      setFlights((prev) => {
        if (!prev) return nextPage;

        const mergedData = [...prev.data, ...nextPage.data];
        const uniqueData = dedupeFlights(mergedData);

        return {
          ...prev,
          data: uniqueData,
          links: nextPage.links ?? null,
        };
      });
      setNextCursor(extractCursorFromLink(nextPage.links?.next ?? null));
      setHasMore(Boolean(nextPage.links?.next));
    } finally {
      setIsLoadingMore(false);
    }
  }, [flights?.searchId, nextCursor, isLoadingMore, sortBy, flights]);

  useEffect(() => {
    if (!hasMore) return;

    const element = loadMoreRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && hasMore) {
          loadNextPage();
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
  }, [hasMore, isLoadingMore, loadNextPage]);

  async function handleSelectFlight({
    searchId,
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
      setOrder({ searchId, offerId: id });

      setPricingState({
        status: "loading",
        flight: null,
      });

      const pricedFlight = await apiFetch<PricedFlight>("/flight/pricing", {
        method: "POST",
        body: JSON.stringify({
          searchId,
          offerId: id,
        }),
      });

      setFlight(pricedFlight);

      setPricingState({
        status: "success",
        flight: pricedFlight,
      });
    } catch (error: any) {
      const message = typeof error?.message === "string" ? error.message : "";

      const isExpired =
        message.includes("expired") ||
        message.includes("not found") ||
        message.includes("Search expired");

      if (isExpired) {
        setPriceModalOpen(true);

        setPricingState({
          status: "idle",
          flight: null,
        });

        return;
      }

      setPricingState({
        status: "error",
        flight: null,
      });
    }
  }

  async function handleRefreshSearch() {
    try {
      setPriceModalOpen(false);

      setPricingState({
        status: "idle",
        flight: null,
      });

      await runSearch();
    } finally {
    }
  }

  async function handleSortChange(nextSort: SortOption) {
    if (!flights?.searchId) return;

    setSortBy(nextSort);
    setStatus("loading");

    try {
      const sortedPage = await apiFetch<FlightsSearchResponse>(
        `/flights/search/${flights.searchId}?limit=10&sort=${SORT_TO_BACKEND[nextSort]}`,
      );

      setFlights({
        ...flights,
        data: dedupeFlights(sortedPage.data),
        links: sortedPage.links ?? null,
      });

      setNextCursor(extractCursorFromLink(sortedPage?.links?.next ?? null));
      setHasMore(Boolean(sortedPage?.links?.next));
      setStatus("success");

      requestAnimationFrame(() => {
        const results = document.getElementById("search-results");

        if (!results) return;

        window.scrollTo({
          top: results.getBoundingClientRect().top + window.scrollY - 96,
          behavior: "smooth",
        });
      });
    } catch (error) {
      console.error("Flight sort error:", error);
      setStatus("error");
    }
  }

  function dedupeFlights(flightsList: FlightCardResponse[]) {
    const seen = new Set<string>();

    return flightsList.filter((flight) => {
      if (!flight?.offerId) return false;
      if (seen.has(flight.offerId)) return false;
      seen.add(flight.offerId);
      return true;
    });
  }

  function getFilteredFlights() {
    if (!flights) return [];

    return flights.data.filter((flight: FlightCardResponse) => {
      const price = Number(flight.price.total);
      if (price > filters.maxPrice) return false;

      const stops = flight.routes[0]?.stops ?? 0;
      if (filters.stops.length && !filters.stops.includes(stops)) return false;

      if (filters.airlines.length) {
        const flightAirlines = new Set<string>();

        for (const route of flight.routes) {
          if (route.airline) flightAirlines.add(route.airline);
          // runtime may include airlineIata even if types don't declare it
          if ((route as any).airlineIata)
            flightAirlines.add((route as any).airlineIata);

          for (const seg of route.segments) {
            if (seg.airline) flightAirlines.add(seg.airline);
            if ((seg as any).airlineIata)
              flightAirlines.add((seg as any).airlineIata);
          }
        }

        const matches = filters.airlines.some((a) => flightAirlines.has(a));
        if (!matches) return false;
      }

      const duration = flight.routes[0]?.durationMinutes ?? 0;
      if (filters.durations.length) {
        if (filters.durations.includes("до 5ч") && duration <= 300) return true;
        if (
          filters.durations.includes("5–10ч") &&
          duration > 300 &&
          duration <= 600
        )
          return true;
        if (
          filters.durations.includes("10–15ч") &&
          duration > 600 &&
          duration <= 900
        )
          return true;
        if (filters.durations.includes("15ч+") && duration > 900) return true;
        return false;
      }

      return true;
    });
  }

  const sortOptions = [
    { value: "best", label: "Best" },
    { value: "cheapest", label: "Cheapest" },
    { value: "fastest", label: "Fastest" },
    { value: "departure", label: "Departure" },
    { value: "arrival", label: "Arrival" },
  ];

  const filteredFlights = getFilteredFlights();
  const hasResults =
    status === "success" && flights && filteredFlights.length > 0;

  return (
    <div className="min-h-screen bg-gray-50" ref={containerRef}>
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 justify-center">
          <aside className="w-full lg:w-80 flex-shrink-0">
            {flights && (
              <FilterSidebar onChange={setFilters} flightsData={flights} />
            )}
          </aside>

          <div
            id="search-results"
            className="scroll-mt-40 flex-1 min-w-0 max-w-full lg:max-w-4xl"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2 sm:gap-3">
                  <div className="text-xs sm:text-sm text-gray-600 flex-shrink-0">
                    Sort by:
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() =>
                          handleSortChange(option.value as SortOption)
                        }
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                          sortBy === option.value
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.cardsDiv}>
              <div className={styles.cardContainer}>
                {status === "loading" && (
                  <div className="space-y-4">
                    <FlightCardSkeleton />
                    <FlightCardSkeleton />
                    <FlightCardSkeleton />
                    <FlightCardSkeleton />
                  </div>
                )}

                {status === "success" && flights && hasResults && (
                  <>
                    <FlightCard
                      flights={filteredFlights}
                      searchId={flights.searchId}
                      onSelect={handleSelectFlight}
                      disabled={pricingState.status === "loading"}
                      sortBy={sortBy}
                    />
                    <div ref={loadMoreRef} className="mt-8 flex justify-center">
                      {isLoadingMore && (
                        <div className="space-y-4 w-full">
                          <FlightCardSkeleton />
                          <FlightCardSkeleton />
                        </div>
                      )}
                    </div>
                  </>
                )}

                {status === "success" && flights && !hasResults && (
                  <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      No flights matched this search
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">
                      Try adjusting your date, route or filters and search
                      again.
                    </p>
                  </div>
                )}

                {status === "error" && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                    <h3 className="text-lg font-semibold">
                      We could not load flights right now
                    </h3>
                    <p className="mt-2 text-sm">
                      Please try again in a moment or change your search
                      parameters.
                    </p>
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
        open={isDetailsOpen}
        onOpenChange={(open) => {
          if (!open) {
            setPricingState({
              status: "idle",
              flight: null,
            });
          }
        }}
        flight={pricingState.flight}
      />
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 text-white shadow-lg hover:bg-gray-900 transition"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}
