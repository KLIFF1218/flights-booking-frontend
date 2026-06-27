"use client";

import { Booking } from "@/hooks/useUserBookings";
import { Plane, Calendar, User, CreditCard, Clock, MapPin } from "lucide-react";
import { apiFetch } from "@/shared/api/apiClient";

interface BookingListDisplayProps {
  bookings: Booking[];
}

function getAirlineLogo(code?: string) {
  if (!code) return null;
  return `https://content.airhex.com/content/logos/airlines_${code}_200_200_s.png`;
}

export function BookingListDisplay({ bookings }: BookingListDisplayProps) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 px-4">
        <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6">✈️</div>
        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
          Бронирований пока нет
        </h3>
        <p className="text-sm sm:text-base text-gray-600 text-center">
          После покупки билет появится здесь
        </p>
      </div>
    );
  }

  type TicketResponse = {
    travelerId: string;
    ticketNumber: string;
    status: string;
    url: string;
  };

  type Ticket = {
    id: string;
    travelerId: string;
    ticketNumber: string;
    status: string;
    previewUrl: string;
    downloadUrl: string;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {bookings.map((booking) => {
        const airlineCode = booking.flight?.airline;
        const logo = getAirlineLogo(airlineCode);

        return (
          <div
            key={booking.id}
            className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl sm:rounded-2xl border-2 border-blue-100 overflow-hidden hover:shadow-xl hover:scale-[1.01] transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -z-0"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-3xl -z-0"></div>

            <div className="relative z-10 p-3 sm:p-4 lg:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 pb-3 sm:pb-4 border-b-2 border-dashed border-blue-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  {logo && (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-md">
                      <div className="w-full h-full bg-white rounded-lg p-1.5 flex items-center justify-center">
                        <img
                          src={logo}
                          alt={airlineCode}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-0.5">
                      <Plane className="w-3 h-3" />
                      <span className="font-medium">PNR</span>
                    </div>
                    <div className="text-base sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {booking.pnrLocator}
                    </div>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs font-bold whitespace-nowrap self-start sm:self-auto shadow-md ${
                    booking.status === "TICKETED" || booking.status === "PAID"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                      : booking.status === "CANCELED"
                        ? "bg-gradient-to-r from-red-500 to-pink-600 text-white"
                        : "bg-gradient-to-r from-yellow-500 to-orange-600 text-white"
                  }`}
                >
                  {booking.status}
                </span>
              </div>

              <div className="py-3 sm:py-4 border-b-2 border-dashed border-purple-200">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 relative">
                    <div className="flex-1 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg p-2 sm:p-3">
                      <div className="flex items-center gap-1.5 text-blue-600 mb-0.5">
                        <MapPin className="w-3 h-3" />
                        <span className="text-xs font-medium">Отправление</span>
                      </div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent mb-0.5">
                        {booking.flight?.from}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-blue-700 font-medium">
                        <Clock className="w-3 h-3" />
                        {booking.flight?.departureDate
                          ? new Date(
                              booking.flight.departureDate,
                            ).toLocaleString("ru-RU", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
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
                        <span className="text-xs font-medium">Прибытие</span>
                      </div>
                      <div className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-transparent mb-0.5">
                        {booking.flight?.to}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-purple-700 font-medium">
                        <Clock className="w-3 h-3" />
                        {booking.flight?.arrivalDate
                          ? new Date(booking.flight.arrivalDate).toLocaleString(
                              "ru-RU",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-gradient-to-r from-indigo-50 to-pink-50 rounded-lg p-2 sm:p-3">
                  <div className="flex flex-col gap-2">
                    {booking.travelers?.map((traveler: any) => (
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

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-bold shadow-sm">
                      {booking.cabin}
                    </span>
                    {booking.seatNumber && (
                      <span className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-bold shadow-sm">
                        💺 {booking.seatNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 py-3 sm:py-4 border-b-2 border-dashed border-pink-200">
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-xs text-cyan-600 mb-1">
                    <CreditCard className="w-3 h-3" />
                    <span className="font-medium">Номер заказа</span>
                  </div>
                  <div className="text-xs font-bold text-gray-900 break-all">
                    {booking.flightOrderId}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-xs text-emerald-600 mb-1">
                    <span className="font-medium">💰 Сумма</span>
                  </div>
                  <div className="text-base sm:text-lg lg:text-xl font-black bg-gradient-to-r from-emerald-700 to-green-800 bg-clip-text text-transparent">
                    {booking.totalPrice} {booking.currency}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-2 sm:p-3">
                  <div className="flex items-center gap-1 text-xs text-violet-600 mb-1">
                    <Calendar className="w-3 h-3" />
                    <span className="font-medium">Бронирование</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-gray-900">
                    {booking.createdAt
                      ? new Date(booking.createdAt).toLocaleDateString("ru-RU")
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
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span className="font-medium">Оплачено</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">Оплатить до</span>
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
                        ? new Date(
                            booking.lastTicketingDate,
                          ).toLocaleDateString("ru-RU")
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {booking.status === "TICKETED" && booking.tickets?.length > 0 && (
                <div className="pt-4 border-t-2 border-dashed border-blue-200">
                  <div className="mb-3 text-sm font-bold text-gray-800">
                    Электронные билеты
                  </div>

                  <div className="space-y-3">
                    {booking.tickets.map((ticket: any) => {
                      const traveler = booking.travelers?.find(
                        (t: any) => t.id === ticket.travelerId,
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
                              Ticket: {ticket.ticketNumber}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold"
                              onClick={() =>
                                window.open(ticket.previewUrl, "_blank")
                              }
                            >
                              Открыть
                            </button>

                            <button
                              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold"
                              onClick={async () => {
                                try {
                                  const response = await fetch(
                                    ticket.downloadUrl,
                                  );

                                  if (!response.ok) {
                                    throw new Error("Ошибка скачивания");
                                  }

                                  const blob = await response.blob();

                                  const blobUrl =
                                    window.URL.createObjectURL(blob);

                                  const link = document.createElement("a");

                                  link.href = blobUrl;
                                  link.download = `${ticket.ticketNumber}.pdf`;

                                  document.body.appendChild(link);

                                  link.click();

                                  link.remove();

                                  window.URL.revokeObjectURL(blobUrl);
                                } catch (error) {
                                  console.error(error);
                                  alert("Не удалось скачать билет");
                                }
                              }}
                            >
                              Скачать
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
