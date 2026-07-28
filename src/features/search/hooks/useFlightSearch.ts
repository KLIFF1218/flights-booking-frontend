"use client";

import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ParsedFlightSearchParams } from "@/features/search/utils/search-params";
import {
  EMPTY_FILTERS,
  getFiltersQueryKey,
  type FlightSearchFilters,
} from "@/features/search/utils/search-filters";
import {
  createFlightSearch,
  extractCursorFromLink,
  fetchFlightSearchPage,
  isSearchSessionExpiredError,
  type FlightSortOption,
} from "@/features/search/api/search.api";
import { useSearchCurrency } from "@/features/search/hooks/useSearchCurrency";

const SESSION_STALE_MS = 5 * 60_000;
const RESULTS_STALE_MS = 5 * 60_000;

function getSessionQueryKey(routeSearchKey: string, currency: string) {
  return ["flight-search-session", routeSearchKey, currency] as const;
}

function getResultsQueryKey(
  searchId: string,
  sort: FlightSortOption,
  filters: FlightSearchFilters,
) {
  return [
    "flight-search-results",
    searchId,
    sort,
    getFiltersQueryKey(filters),
  ] as const;
}

export function useFlightSearch({
  parsedSearch,
  routeSearchKey,
  sort,
  filters,
}: {
  parsedSearch: ParsedFlightSearchParams | null;
  routeSearchKey: string;
  sort: FlightSortOption;
  filters: FlightSearchFilters;
}) {
  const queryClient = useQueryClient();
  const searchCurrency = useSearchCurrency();
  const sessionQueryKey = getSessionQueryKey(routeSearchKey, searchCurrency);

  const fetchSession = (signal?: AbortSignal) => {
    if (!parsedSearch) {
      throw new Error("Invalid search parameters");
    }

    return createFlightSearch(parsedSearch, {
      sort: "best",
      filters: EMPTY_FILTERS,
      signal,
      currencyCode: searchCurrency,
    });
  };

  const sessionQuery = useQuery({
    queryKey: sessionQueryKey,
    queryFn: ({ signal }) => fetchSession(signal),
    enabled: Boolean(parsedSearch),
    staleTime: SESSION_STALE_MS,
    gcTime: 20 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const searchId = sessionQuery.data?.searchId;

  const resultsQuery = useInfiniteQuery({
    queryKey: searchId
      ? getResultsQueryKey(searchId, sort, filters)
      : ["flight-search-results", "pending"],
    enabled: Boolean(searchId),
    initialPageParam: null as string | null,
    staleTime: RESULTS_STALE_MS,
    gcTime: 20 * 60_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    queryFn: async ({ pageParam, signal }) => {
      if (!searchId) {
        throw new Error("Search session is missing");
      }

      try {
        return await fetchFlightSearchPage(searchId, {
          sort,
          filters,
          cursor: pageParam,
          signal,
        });
      } catch (error) {
        if (!isSearchSessionExpiredError(error)) {
          throw error;
        }

        await queryClient.invalidateQueries({ queryKey: sessionQueryKey });

        const refreshedSession = await queryClient.fetchQuery({
          queryKey: sessionQueryKey,
          queryFn: ({ signal: sessionSignal }) => fetchSession(sessionSignal),
        });

        if (!refreshedSession.searchId) {
          throw new Error("Search session is missing");
        }

        return fetchFlightSearchPage(refreshedSession.searchId, {
          sort,
          filters,
          cursor: pageParam,
          signal,
        });
      }
    },
    getNextPageParam: (lastPage) =>
      extractCursorFromLink(lastPage.links?.next ?? null),
  });

  const refreshSearch = async () => {
    await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    await queryClient.invalidateQueries({
      queryKey: ["flight-search-results"],
    });
    await sessionQuery.refetch();
  };

  return {
    sessionQuery,
    resultsQuery,
    searchId,
    refreshSearch,
  };
}
