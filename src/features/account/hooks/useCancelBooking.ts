"use client";

import { useMutation } from "@tanstack/react-query";
import { cancelUserBooking } from "@/features/account/api/user-bookings.api";
import { useInvalidateUserBookings } from "@/features/account/hooks/useUserBookings";

export function useCancelBooking() {
  const invalidate = useInvalidateUserBookings();

  return useMutation({
    mutationFn: cancelUserBooking,
    onSuccess: () => invalidate(),
  });
}
