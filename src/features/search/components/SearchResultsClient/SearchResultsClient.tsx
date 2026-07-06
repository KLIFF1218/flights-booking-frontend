"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBookingStore } from "@/features/booking/store/booking.store";
import { PriceUpdateModal } from "@/features/search/components/PriceUpdateModal/PriceUpdateModal";

import { FlightCard } from "@/features/search/components/FlightCard/FlightCard";
import { BuySheet } from "@/features/search/components/BuySheet/BuySheet";
import { FlightCardSkeleton } from "@/features/search/components/Skeleton/FlightCardSkeleton";

import {
  FilterSidebar,
  FiltersState,
} from "@/features/search/components/Filters/FiltersSidebar";
import { SearchSummary } from "../Filters/SearchSummary";
import { Header } from "@/shared/ui/header/Header";

import type { PricedFlight } from "@/shared/types/flight";
import { buildApiUrl } from "@/shared/api/buildApiUrl";
import { apiFetch } from "@/shared/api/apiClient";

import { ArrowLeft, ArrowUp } from "lucide-react";

import styles from "./SearchResultsClient.module.css";
import { getCurrency } from "@/shared/utils/currency";

type SearchStatus = "idle" | "loading" | "success" | "error";

type SortOption = "best" | "cheapest" | "fastest" | "departure" | "arrival";

export function SearchResultsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

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
  const [flights, setFlights] = useState<any | null>(null);
  const [pricingState, setPricingState] = useState<{
    status: "idle" | "loading" | "success" | "error";
    flight: PricedFlight | null;
  }>({
    status: "idle",
    flight: null,
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);

  const [priceModalOpen, setPriceModalOpen] = useState(false);

  const [isRefreshingSearch, setIsRefreshingSearch] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

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

  async function runSearch() {
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

      const data = await apiFetch("/flights/search", {
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
      });

      setFlights(data);

      setVisibleCount(10);

      setStatus("success");
    } catch (error) {
      console.error("Flight search error:", error);

      setStatus("error");
    }
  }

  useEffect(() => {
    runSearch();
  }, [searchParams]);

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
      setIsRefreshingSearch(true);

      setPriceModalOpen(false);

      setPricingState({
        status: "idle",
        flight: null,
      });

      await runSearch();
    } finally {
      setIsRefreshingSearch(false);
    }
  }

  function getFilteredFlights() {
    if (!flights) return [];

    return flights.data.filter((flight: any) => {
      const price = Number(flight.price.total);
      if (price > filters.maxPrice) return false;

      const stops = flight.routes[0]?.stops ?? 0;
      if (filters.stops.length && !filters.stops.includes(stops)) return false;

      const airline = flight.routes[0]?.airline;
      if (filters.airlines.length && !filters.airlines.includes(airline))
        return false;

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

  function getSortedFlights() {
    const list = [...getFilteredFlights()];

    switch (sortBy) {
      case "cheapest":
        return list.sort(
          (a, b) => Number(a.price.total) - Number(b.price.total),
        );

      case "fastest":
        return list.sort(
          (a, b) => a.totalDurationMinutes - b.totalDurationMinutes,
        );

      case "departure":
        return list.sort(
          (a, b) =>
            new Date(a.routes[0].departure.time).getTime() -
            new Date(b.routes[0].departure.time).getTime(),
        );

      case "arrival":
        return list.sort(
          (a, b) =>
            new Date(a.routes[0].arrival.time).getTime() -
            new Date(b.routes[0].arrival.time).getTime(),
        );

      default:
        return list;
    }
  }

  const sortOptions = [
    { value: "best", label: "Best" },
    { value: "cheapest", label: "Cheapest" },
    { value: "fastest", label: "Fastest" },
    { value: "departure", label: "Departure" },
    { value: "arrival", label: "Arrival" },
  ];

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
                        onClick={() => setSortBy(option.value as SortOption)}
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
                  <>
                    <FlightCardSkeleton />
                    <FlightCardSkeleton />
                    <FlightCardSkeleton />
                    <FlightCardSkeleton />
                    <FlightCardSkeleton />
                    <FlightCardSkeleton />
                  </>
                )}

                {status === "success" && flights && (
                  <>
                    <FlightCard
                      flights={getSortedFlights().slice(0, visibleCount)}
                      searchId={flights.searchId}
                      onSelect={handleSelectFlight}
                      disabled={pricingState.status === "loading"}
                      sortBy={sortBy}
                    />
                    {visibleCount < getSortedFlights().length && (
                      <div className="text-center mt-8">
                        <button
                          onClick={() => setVisibleCount((prev) => prev + 10)}
                          className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-blue-600 hover:text-blue-600 transition"
                        >
                          Load More Flights
                        </button>
                      </div>
                    )}
                  </>
                )}

                {status === "error" && (
                  <div className="text-center py-10 text-red-500">
                    Failed to load flights
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
