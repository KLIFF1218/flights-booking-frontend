const LAST_SEARCH_QUERY_KEY = "flight-search:last-query";

export function buildSearchResultsPath(queryString?: string | null): string {
  if (!queryString?.trim()) {
    return "/search";
  }

  const normalized = queryString.startsWith("?")
    ? queryString.slice(1)
    : queryString;

  if (!normalized.trim()) {
    return "/search";
  }

  return `/search?${normalized}#search-results`;
}

export function persistLastSearchQuery(queryString: string): void {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = queryString.startsWith("?")
    ? queryString.slice(1)
    : queryString;

  if (!normalized.trim()) {
    return;
  }

  sessionStorage.setItem(LAST_SEARCH_QUERY_KEY, normalized);
}

export function getLastSearchQuery(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = sessionStorage.getItem(LAST_SEARCH_QUERY_KEY);
  return value?.trim() ? value : null;
}

export function resolveSearchResultsPath(options?: {
  queryString?: string | null;
}): string {
  if (options?.queryString?.trim()) {
    return buildSearchResultsPath(options.queryString);
  }

  const lastQuery = getLastSearchQuery();
  if (lastQuery) {
    return buildSearchResultsPath(lastQuery);
  }

  return "/search";
}
