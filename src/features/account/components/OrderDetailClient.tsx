"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { useUserBookings } from "@/features/account/hooks/useUserBookings";
import { BookingListDisplay } from "@/features/account/components/UserBookingsList";
import { BookingActions } from "@/features/account/components/BookingActions";
import {
  getBookingPaymentPath,
  getBookingStatusLabel,
} from "@/features/account/lib/booking-filters";
import type { UserBooking } from "@/features/account/types/user-booking.types";

function OrderStatusBanner({ booking }: { booking: UserBooking }) {
  const locale = useLocale();
  const t = useTranslations("orders.detail");
  const tStatus = useTranslations("orders.status");
  const paymentStatusHref = booking.transaction?.id
    ? `/payment/${booking.transaction.id}/success`
    : null;

  if (booking.status === "PAYMENT_PENDING") {
    return (
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">{t("awaitingPaymentTitle")}</p>
        <p className="mt-1 text-amber-900/90">
          {t("awaitingPaymentText")}
          {booking.lastTicketingDate
            ? t("awaitingPaymentDeadline", {
                date: new Date(booking.lastTicketingDate).toLocaleString(
                  locale,
                  {
                    dateStyle: "medium",
                    timeStyle: "short",
                  },
                ),
              })
            : ""}
          .
        </p>
      </div>
    );
  }

  if (booking.status === "TICKETING") {
    return (
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
        <p className="font-semibold">{t("paymentReceivedTitle")}</p>
        <p className="mt-1">
          {t("paymentReceivedText")}{" "}
          {paymentStatusHref ? (
            <Link href={paymentStatusHref} className="font-medium underline">
              {t("trackProgress")}
            </Link>
          ) : null}
        </p>
      </div>
    );
  }

  if (booking.status === "TICKETED") {
    return null;
  }

  if (booking.status === "PAID") {
    return (
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-950">
        <p className="font-semibold">{t("paidTitle")}</p>
        <p className="mt-1">
          {t("paidText")}{" "}
          {paymentStatusHref ? (
            <Link href={paymentStatusHref} className="font-medium underline">
              {t("viewPaymentStatus")}
            </Link>
          ) : null}
        </p>
      </div>
    );
  }

  if (
    booking.status === "CANCELED" ||
    booking.status === "EXPIRED" ||
    booking.status === "FAILED"
  ) {
    return (
      <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        <p className="font-semibold">
          {t("inactiveTitle", {
            status: getBookingStatusLabel(booking.status, tStatus),
          })}
        </p>
        <p className="mt-1">
          {t("inactiveText")}{" "}
          <Link href="/search" className="font-medium text-blue-600 hover:underline">
            {t("searchNewFlights")}
          </Link>
        </p>
      </div>
    );
  }

  if (booking.status === "PNR_CREATED" || booking.status === "SEATS_SELECTED") {
    return (
      <div className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-950">
        <p className="font-semibold">{t("inProgressTitle")}</p>
        <p className="mt-1">{t("inProgressText")}</p>
      </div>
    );
  }

  return null;
}

export function OrderDetailClient({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const t = useTranslations("orders.detail");
  const tStatus = useTranslations("orders.status");
  const tOrders = useTranslations("orders");
  const { bookings, loading, error } = useUserBookings();
  const booking = bookings.find((item) => item.id === bookingId);

  useEffect(() => {
    if (!booking || typeof window === "undefined") {
      return;
    }

    if (window.location.hash === "#tickets") {
      document.getElementById("tickets")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [booking]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-600">{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700">{tOrders("error", { message: error.message })}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {t("notFound")}
        </h1>
        <p className="text-gray-600 mb-6">{t("noAccess")}</p>
        <Link
          href="/my/orders"
          className="text-blue-600 hover:underline font-medium"
        >
          {t("backToOrders")}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => router.push("/my/orders")}
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToOrders")}
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">
            {getBookingStatusLabel(booking.status, tStatus)}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t("orderTitle", { pnr: booking.pnrLocator })}
          </h1>
        </div>
        <BookingActions booking={booking} />
      </div>

      <OrderStatusBanner booking={booking} />

      {booking.status === "PAYMENT_PENDING" ? (
        <p className="mb-4 text-sm text-gray-600">
          {t("resumeCheckoutPrefix")}{" "}
          <Link
            href={getBookingPaymentPath(booking.id)}
            className="text-blue-600 hover:underline"
          >
            {t("resumeCheckout")}
          </Link>
        </p>
      ) : null}

      <BookingListDisplay
        bookings={[booking]}
        showActions={false}
        ticketsSectionId="tickets"
      />
    </div>
  );
}
