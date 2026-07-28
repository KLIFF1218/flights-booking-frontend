"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { UserBooking } from "@/features/account/types/user-booking.types";
import { resumeBookingPayment } from "@/features/account/api/user-bookings.api";
import {
  getBookingPaymentPath,
  getBookingResumePath,
  getBookingSecondaryLink,
  getCancelBookingCopy,
  isBookingCancellable,
} from "@/features/account/lib/booking-filters";
import { useCancelBooking } from "@/features/account/hooks/useCancelBooking";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";

type BookingActionsProps = {
  booking: UserBooking;
  compact?: boolean;
};

export function BookingActions({ booking, compact = false }: BookingActionsProps) {
  const router = useRouter();
  const tActions = useTranslations("orders.actions");
  const tCancel = useTranslations("orders.cancel");
  const cancelMutation = useCancelBooking();
  const resumePath = getBookingResumePath(booking);
  const secondaryLink = compact
    ? getBookingSecondaryLink(booking, tActions)
    : null;
  const canCancel = isBookingCancellable(booking);
  const cancelCopy = getCancelBookingCopy(booking.status, tCancel);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);

  const handleCancel = async () => {
    setCancelError(null);

    try {
      await cancelMutation.mutateAsync(booking.id);
      setCancelOpen(false);
    } catch (error) {
      setCancelError(
        error instanceof Error ? error.message : tActions("cancelFailed"),
      );
    }
  };

  const handleResume = async () => {
    if (!resumePath) {
      return;
    }

    setResumeError(null);

    if (booking.status === "PAYMENT_PENDING") {
      setIsResuming(true);

      try {
        const payment = await resumeBookingPayment(booking.id);
        window.location.href = payment.paymentRedirectUrl;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : tActions("startPaymentFailed");

        if (message.toLowerCase().includes("payment window has expired")) {
          router.push("/search");
          return;
        }

        setResumeError(message);
        setIsResuming(false);
        router.push(getBookingPaymentPath(booking.id));
      }

      return;
    }

    setIsNavigating(true);
    router.push(resumePath);
  };

  const buttonClass = compact
    ? "px-3 py-1.5 text-xs font-semibold rounded-lg"
    : "px-4 py-2 text-sm font-semibold rounded-lg";

  const isBusy = isResuming || isNavigating;

  return (
    <>
      <div className={`flex flex-col gap-2 ${compact ? "" : "items-end"}`}>
        <div className={`flex flex-wrap gap-2 ${compact ? "" : "justify-end"}`}>
          {secondaryLink ? (
            <Link
              href={secondaryLink.href}
              className={`${buttonClass} border border-gray-300 text-gray-700 hover:bg-gray-50`}
            >
              {secondaryLink.label}
            </Link>
          ) : null}

          {resumePath && (
            <button
              type="button"
              onClick={() => void handleResume()}
              disabled={isBusy || cancelMutation.isPending}
              className={`${buttonClass} bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-wait inline-flex items-center gap-2`}
            >
              {isResuming ? (
                <>
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"
                    aria-hidden
                  />
                  {tActions("openingPayment")}
                </>
              ) : isNavigating ? (
                tActions("opening")
              ) : booking.status === "PNR_CREATED" ? (
                tActions("continue")
              ) : booking.status === "PAYMENT_PENDING" ? (
                tActions("payNow")
              ) : (
                tActions("continue")
              )}
            </button>
          )}

          {canCancel && (
            <button
              type="button"
              onClick={() => {
                setCancelError(null);
                setCancelOpen(true);
              }}
              disabled={cancelMutation.isPending || isBusy}
              className={`${buttonClass} border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50`}
            >
              {cancelMutation.isPending ? tActions("canceling") : tActions("cancel")}
            </button>
          )}
        </div>

        {resumeError ? (
          <p className="text-xs text-red-600" role="alert">
            {resumeError}
          </p>
        ) : null}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={cancelCopy.title}
        description={cancelCopy.description}
        confirmLabel={tCancel("confirm")}
        cancelLabel={tCancel("keep")}
        isLoading={cancelMutation.isPending}
        error={cancelError}
        onConfirm={handleCancel}
        destructive
      />
    </>
  );
}
