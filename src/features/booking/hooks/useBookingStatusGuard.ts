"use client";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { getBooking } from "@/features/booking/api/booking.api";
import {
  getInactiveBookingReason,
  isBookingStepAllowed,
  resolveBookingRoute,
  type BookingFlowStep,
} from "@/features/account/lib/booking-navigation";
import type { BookingStatus } from "@/features/account/types/user-booking.types";

export type BookingInactiveReason = "expired" | "canceled" | "failed" | "not_found";

export function useBookingStatusGuard(
  bookingId: string,
  currentStep: BookingFlowStep,
) {
  const router = useRouter();
  const [isRouting, setIsRouting] = useState(true);
  const [inactiveReason, setInactiveReason] =
    useState<BookingInactiveReason | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function guardRoute() {
      if (!bookingId) {
        setIsRouting(false);
        setInactiveReason(null);
        return;
      }

      setIsRouting(true);
      setInactiveReason(null);

      try {
        const booking = await getBooking(bookingId);
        if (cancelled) {
          return;
        }

        const status = booking.status as BookingStatus;

        if (!isBookingStepAllowed(status, currentStep)) {
          const inactive = getInactiveBookingReason(status);
          if (inactive) {
            setInactiveReason(inactive);
            setIsRouting(false);
            return;
          }

          router.replace(resolveBookingRoute(bookingId, status));
          return;
        }

        setIsRouting(false);
      } catch {
        if (!cancelled) {
          setInactiveReason("not_found");
          setIsRouting(false);
        }
      }
    }

    void guardRoute();

    return () => {
      cancelled = true;
    };
  }, [bookingId, currentStep, router]);

  return { isRouting, inactiveReason };
}
