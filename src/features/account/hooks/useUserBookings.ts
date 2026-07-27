"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth-store";
import { fetchAllUserBookings } from "@/features/account/api/user-bookings.api";

export const USER_BOOKINGS_QUERY_KEY = ["user-bookings"] as const;

export function useUserBookings() {
  const authChecked = useAuthStore((state) => state.authChecked);
  const isAuthorized = useAuthStore((state) => state.isAuthorized);

  const query = useQuery({
    queryKey: USER_BOOKINGS_QUERY_KEY,
    queryFn: fetchAllUserBookings,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    enabled: authChecked && isAuthorized,
  });

  return {
    bookings: query.data?.bookings ?? [],
    total: query.data?.total ?? 0,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch,
  };
}

export function useInvalidateUserBookings() {
  const queryClient = useQueryClient();

  return () =>
    queryClient.invalidateQueries({ queryKey: USER_BOOKINGS_QUERY_KEY });
}
