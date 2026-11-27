"use client";

import { useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { getBookingSearchQuery } from "@/features/booking/api/booking.api";
import { resolveSearchResultsPath } from "@/features/search/utils/search-navigation";

export function useBackToSearch(bookingId?: string) {
  const router = useRouter();

  return useCallback(() => {
    const queryString = bookingId ? getBookingSearchQuery(bookingId) : null;

    router.push(
      resolveSearchResultsPath({
        queryString,
      }),
    );
  }, [bookingId, router]);
}
