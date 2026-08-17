"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getBooking } from "@/features/booking/api/booking.api";

const POLL_INTERVAL_MS = 30_000;

function formatBookingCountdown(
  expiresAt: Date,
  t: ReturnType<typeof useTranslations<"booking.expiry">>,
): string {
  const diffMs = expiresAt.getTime() - Date.now();
  if (diffMs <= 0) {
    return t("expired");
  }

  const totalMinutes = Math.ceil(diffMs / 60_000);
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return t("countdownHours", { hours, minutes });
  }

  return t("countdownMinutes", { count: totalMinutes });
}

function isBookingExpiredStatus(status: string): boolean {
  return status === "EXPIRED";
}

export function useBookingExpiry(
  bookingId: string,
  initialExpiresAt?: string | null,
) {
  const t = useTranslations("booking.expiry");
  const [expiresAt, setExpiresAt] = useState<Date | null>(() =>
    initialExpiresAt ? new Date(initialExpiresAt) : null,
  );
  const [isExpired, setIsExpired] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (initialExpiresAt) {
      setExpiresAt(new Date(initialExpiresAt));
    }
  }, [initialExpiresAt]);

  useEffect(() => {
    if (!expiresAt || isExpired) {
      setCountdown(null);
      setIsUrgent(false);
      return;
    }

    const tick = () => {
      const diffMs = expiresAt.getTime() - Date.now();
      if (diffMs <= 0) {
        setIsExpired(true);
        setCountdown(null);
        setIsUrgent(false);
        return;
      }

      setCountdown(formatBookingCountdown(expiresAt, t));
      setIsUrgent(diffMs <= 5 * 60_000);
    };

    tick();
    const intervalId = window.setInterval(tick, 1_000);
    return () => window.clearInterval(intervalId);
  }, [expiresAt, isExpired, t]);

  useEffect(() => {
    if (!bookingId || isExpired) {
      return;
    }

    let cancelled = false;

    async function pollBooking() {
      try {
        const nextBooking = await getBooking(bookingId);
        if (cancelled) {
          return;
        }

        if (nextBooking.expiresAt) {
          setExpiresAt(new Date(nextBooking.expiresAt));
        }

        if (
          isBookingExpiredStatus(nextBooking.status) ||
          (nextBooking.expiresAt &&
            new Date(nextBooking.expiresAt).getTime() <= Date.now())
        ) {
          setIsExpired(true);
        }
      } catch {
        // Ignore transient poll errors; countdown still runs locally.
      }
    }

    const intervalId = window.setInterval(() => {
      void pollBooking();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [bookingId, isExpired]);

  return {
    expiresAt,
    countdown,
    isExpired,
    isUrgent,
  };
}
