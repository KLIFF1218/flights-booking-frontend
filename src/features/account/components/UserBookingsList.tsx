"use client";

import { useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { UserBooking } from "@/features/account/types/user-booking.types";
import { getBookingStatusLabel } from "@/features/account/lib/booking-filters";
import { BookingActions } from "@/features/account/components/BookingActions";
import { Plane, Calendar, User, CreditCard, Clock, MapPin, AlertTriangle } from "lucide-react";
import {
  fetchBookingTickets,
  type BookingTicketItem,
} from "@/features/booking/api/booking.api";
import {
  downloadTicketFromUrl,
  getTicketDownloadUrl,
  getTicketPreviewUrl,
} from "@/features/payments/lib/ticket-download";
import {
  getAirlineLogoUrl,
  handleAirlineLogoError,
} from "@/shared/utils/airline-logo";
import {
  formatFlightArrivalDate,
  formatFlightArrivalTime,
  formatFlightDepartureDate,
  formatFlightDepartureTime,
} from "@/shared/utils/formatDate";

interface BookingListDisplayProps {
  bookings: UserBooking[];
  showActions?: boolean;
  ticketsSectionId?: string;
}

export function BookingListDisplay({
  bookings,
  showActions = true,
  ticketsSectionId,
}: BookingListDisplayProps) {
  const locale = useLocale();
  const t = useTranslations("orders");
  const tStatus = useTranslations("orders.status");
  const ticketCacheRef = useRef<Record<string, BookingTicketItem[]>>({});

  const loadTickets = async (bookingId: string) => {
    if (ticketCacheRef.current[bookingId]) {
      return ticketCacheRef.current[bookingId];
    }

    const tickets = await fetchBookingTickets(bookingId, "view");
    ticketCacheRef.current[bookingId] = tickets;
    return tickets;
  };

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 px-4">
        <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6">✈️</div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
          {t("emptyListTitle")}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 text-center">
          {t("emptyListText")}
        </p>
      </div>
    );
  }

  const openTicket = async (bookingId: string, travelerId: string) => {
    try {
      const tickets = await loadTickets(bookingId);
      const ticket = tickets.find((item) => item.travelerId === travelerId);
      const previewUrl = ticket ? getTicketPreviewUrl(ticket) : null;

      if (!previewUrl) {
        throw new Error("Ticket URL is missing");
      }

      window.open(previewUrl, "_blank");
    } catch (error) {
      console.error(error);
      alert(t("openTicketFailed"));
    }
  };

  const downloadTicket = async (
    bookingId: string,
    travelerId: string,
    ticketNumber: string,
  ) => {
    try {
      const tickets = await fetchBookingTickets(bookingId, "download");
      const ticket = tickets.find((item) => item.travelerId === travelerId);
      const downloadUrl = ticket ? getTicketDownloadUrl(ticket) : null;

      if (!downloadUrl) {
        throw new Error("Download URL is missing");
      }

      await downloadTicketFromUrl(downloadUrl, ticketNumber);
    } catch (error) {
      console.error(error);
      alert(t("downloadTicketFailed"));
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {bookings.map((booking) => {
        const airlineCode = booking.flight?.airline;
        const logo = getAirlineLogoUrl(airlineCode);
        const statusLabel = getBookingStatusLabel(booking.status, tStatus);

        return (
          <div
            key={booking.id}
            className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl sm:rounded-2xl border-2 border-blue-100 overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -z-0" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-3xl -z-0" />

            <div className="relative z-10 p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pb-3 sm:pb-4 border-b-2 border-dashed border-blue-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-md">
                    <div className="w-full h-full bg-white rounded-lg p-1.5 flex items-center justify-center">
                      <Image
                        src={logo}
                        alt={airlineCode ?? "Airline"}
                        width={40}
                        height={40}
                        className="w-full h-full object-contain"
                        unoptimized
                        onError={handleAirlineLogoError}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-0.5">
                      <Plane className="w-3 h-3" />
                      <span className="font-medium">{t("pnr")}</span>
                    </div>
                    <div className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {booking.pnrLocator}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 self-start sm:self-auto">
                  <span
                    className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs font-bold whitespace-nowrap shadow-md ${
                      booking.status === "TICKETED" || booking.status === "PAID"
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                        : booking.status === "CANCELED"
                          ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                          : "bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
                    }`}
                  >
                    {statusLabel}
                  </span>
                  {showActions && (
                    <BookingActions booking={booking} compact />
                  )}
                </div>
              </div>

              {booking.operationalAlert && (
                <div
                  className={`mb-3 rounded-lg border px-3 py-2 text-sm flex items-start gap-2 ${
                    booking.operationalAlert.type === "CANCELLED"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{booking.operationalAlert.message}</span>
                </div>
              )}

              <div className="py-3 sm:py-4 border-b-2 border-dashed border-purple-200">
                {(booking.routes?.length ? booking.routes : [booking.flight]).map(
                  (route, routeIndex) => {
                    const routeLabel =
                      (booking.routes?.length ?? 0) > 1
                        ? routeIndex === 0
                          ? t("outbound")
                          : t("return")
                        : null;

                    return (
                      <div
                        key={`${booking.id}-route-${routeIndex}`}
                        className={
                          routeIndex > 0
                            ? "mt-4 pt-4 border-t border-dashed border-purple-200"
                            : ""
                        }
                      >
                        {routeLabel && (
                          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-600">
                            {routeLabel}
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 relative">
                            <div className="flex-1 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-2 sm:p-3">
                              <div className="flex items-center gap-1.5 text-blue-600 mb-0.5">
                                <MapPin className="w-3 h-3" />
                                <span className="text-xs font-medium">
                                  {t("departure")}
                                </span>
                              </div>
                              <div className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent mb-0.5">
                                {route?.from}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-blue-700 font-medium">
                                <Clock className="w-3 h-3" />
                                {route?.departureDate
                                  ? `${formatFlightDepartureTime({
                                      departureTime: route.departureDate,
                                      from: route.from,
                                      departureLocalDate: route.departureLocalDate,
                                      departureLocalTime: route.departureLocalTime,
                                      departureTimezone: route.departureTimezone,
                                    })}, ${formatFlightDepartureDate({
                                      departureTime: route.departureDate,
                                      from: route.from,
                                      departureLocalDate: route.departureLocalDate,
                                      departureLocalTime: route.departureLocalTime,
                                      departureTimezone: route.departureTimezone,
                                    })}`
                                  : "—"}
                              </div>
                            </div>

                            <div className="flex items-center justify-center">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-md">
                                <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-white rotate-90" />
                              </div>
                            </div>

                            <div className="flex-1 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg p-2 sm:p-3">
                              <div className="flex items-center gap-1.5 text-purple-600 mb-0.5">
                                <MapPin className="w-3 h-3" />
                                <span className="text-xs font-medium">
                                  {t("arrival")}
                                </span>
                              </div>
                              <div className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-0.5">
                                {route?.to}
                              </div>
                              <div className="flex items-center gap-1 text-xs text-purple-700 font-medium">
                                <Clock className="w-3 h-3" />
                                {route?.arrivalDate
                                  ? `${formatFlightArrivalTime({
                                      arrivalTime: route.arrivalDate,
                                      to: route.to,
                                      arrivalLocalDate: route.arrivalLocalDate,
                                      arrivalLocalTime: route.arrivalLocalTime,
                                      arrivalTimezone: route.arrivalTimezone,
                                    })}, ${formatFlightArrivalDate({
                                      arrivalTime: route.arrivalDate,
                                      to: route.to,
                                      arrivalLocalDate: route.arrivalLocalDate,
                                      arrivalLocalTime: route.arrivalLocalTime,
                                      arrivalTimezone: route.arrivalTimezone,
                                    })}`
                                  : "—"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  },
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gradient-to-r from-indigo-50 to-pink-50 rounded-lg p-2 sm:p-3">
                  <div className="flex flex-col gap-2">
                    {booking.travelers?.map((traveler) => (
                      <div
                        key={traveler.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-white/60 rounded-lg px-3 py-2"
                      >
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                          <User className="w-4 h-4 text-indigo-600" />
                          {traveler.firstName} {traveler.lastName}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold shadow-sm">
                            {booking.cabin}
                          </span>

                          {traveler.seatNumber && (
                            <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-bold shadow-sm">
                              💺 {traveler.seatNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 py-3 sm:py-4 border-b-2 border-dashed border-pink-200">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-xs text-cyan-600 mb-1">
                    <CreditCard className="w-3 h-3" />
                    <span className="font-medium">{t("orderNumber")}</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900 break-all">
                    {booking.flightOrderId}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-xs text-emerald-600 mb-1">
                    <span className="font-medium">💰 {t("amount")}</span>
                  </div>
                  <div className="text-base sm:text-lg lg:text-xl font-black bg-gradient-to-r from-emerald-700 to-green-800 bg-clip-text text-transparent">
                    {booking.totalPrice} {booking.currency}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-xs text-violet-600 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">{t("bookedOn")}</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900">
                    {booking.createdAt
                      ? new Date(booking.createdAt).toLocaleDateString(locale)
                      : "—"}
                  </div>
                </div>

                <div
                  className={`bg-gradient-to-br rounded-lg p-2 sm:p-3 ${
                    booking.status === "TICKETED" || booking.status === "PAID"
                      ? "from-green-50 to-emerald-50"
                      : "from-rose-50 to-pink-50"
                  }`}
                >
                  <div
                    className={`flex items-center gap-1 text-xs mb-1 ${
                      booking.status === "TICKETED" || booking.status === "PAID"
                        ? "text-green-600"
                        : "text-rose-600"
                    }`}
                  >
                    {booking.status === "TICKETED" ||
                    booking.status === "PAID" ? (
                      <>
                        <svg
                          className="w-3 h-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span className="font-medium">{t("paid")}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">{t("payBy")}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-gray-900">
                    {(booking.status === "TICKETED" ||
                      booking.status === "PAID") && (
                      <span className="text-green-600">✓</span>
                    )}
                    <span>
                      {booking.lastTicketingDate
                        ? new Date(booking.lastTicketingDate).toLocaleDateString(
                            locale,
                          )
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {booking.status === "TICKETED" && booking.tickets?.length > 0 && (
                <div
                  id={ticketsSectionId}
                  className="pt-4 border-t-2 border-dashed border-blue-200"
                >
                  <div className="mb-3 text-sm font-bold text-gray-800">
                    {t("eTickets")}
                  </div>

                  <div className="space-y-3">
                    {booking.tickets.map((ticket) => {
                      const traveler = booking.travelers?.find(
                        (item) => item.id === ticket.travelerId,
                      );

                      return (
                        <div
                          key={ticket.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-gray-200 bg-white/70 p-3"
                        >
                          <div>
                            <div className="font-semibold text-gray-900">
                              {traveler?.firstName} {traveler?.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {t("ticket", { number: ticket.ticketNumber })}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold"
                              onClick={() =>
                                openTicket(booking.id, ticket.travelerId)
                              }
                            >
                              {t("open")}
                            </button>

                            <button
                              type="button"
                              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold"
                              onClick={() =>
                                downloadTicket(
                                  booking.id,
                                  ticket.travelerId,
                                  ticket.ticketNumber,
                                )
                              }
                            >
                              {t("download")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
