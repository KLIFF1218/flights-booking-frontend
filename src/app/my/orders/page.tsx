"use client";

import { useState } from "react";
import { ProfileSidebar } from "@/components/Orders/ProfileSidebar";
import {
  useUserBookings,
  filterActiveBookings,
  filterArchivedBookings,
} from "@/hooks/useUserBookings";
import { BookingListDisplay } from "@/components/UserBookingsList";
type TabKey = "active" | "archived";

export default function OrdersPage() {
  const [tab, setTab] = useState<TabKey>("active");
  const { bookings, loading, error } = useUserBookings();

  const activeOrders = filterActiveBookings(bookings);
  const archivedOrders = filterArchivedBookings(bookings);

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          <ProfileSidebar />

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8">
              Мои заказы
            </h1>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-1.5 sm:p-2 mb-4 sm:mb-6 inline-flex w-full sm:w-auto">
              <button
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
                  tab === "active"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setTab("active")}
              >
                Активные ({activeOrders.length})
              </button>
              <button
                className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm sm:text-base font-medium transition-all whitespace-nowrap ${
                  tab === "archived"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setTab("archived")}
              >
                Архив ({archivedOrders.length})
              </button>
            </div>

            {loading && (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-8 sm:p-12 text-center">
                <div className="inline-block w-8 h-8 sm:w-10 sm:h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base">
                  Загрузка...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <p className="text-red-700 text-sm sm:text-base">
                  Ошибка: {error.message}
                </p>
              </div>
            )}

            {!loading && tab === "active" && (
              <>
                {activeOrders.length === 0 ? (
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-8 sm:p-12 lg:p-16 text-center">
                    <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6">
                      👀
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                      Пока нет активных заказов
                    </h2>
                    <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                      Но скоро наверняка появятся! Если вы уже сделали заказ, а
                      его здесь нет, подождите немного — он сам загрузится в
                      течение 2 дней после покупки
                    </p>
                  </div>
                ) : (
                  <BookingListDisplay bookings={activeOrders} />
                )}
              </>
            )}

            {!loading && tab === "archived" && (
              <>
                {archivedOrders.length === 0 ? (
                  <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-8 sm:p-12 lg:p-16 text-center">
                    <div className="text-5xl sm:text-6xl lg:text-7xl mb-4 sm:mb-6">
                      👀
                    </div>
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      Архив пуст
                    </h2>
                  </div>
                ) : (
                  <BookingListDisplay bookings={archivedOrders} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
