import { ApiRequestError } from "@/shared/api/apiClient";

export function isSearchSessionExpiredError(error: unknown): boolean {
  if (error instanceof ApiRequestError && error.status === 404) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("search expired") || message.includes("offer not found")
  );
}

export type SeatMapLoadFailure = "search_expired" | "load_failed";

export function resolveSeatMapLoadFailure(error: unknown): SeatMapLoadFailure {
  return isSearchSessionExpiredError(error) ? "search_expired" : "load_failed";
}
