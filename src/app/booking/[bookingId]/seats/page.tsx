"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import BookingLayout from "../BookingLayout";
import { PriceSidebar } from "@/features/booking/components/PriceSidebar/PriceSidebar";

import { Users, Check, AlertCircle } from "lucide-react";

import { useBookingStore } from "@/features/booking/store/booking.store";
import {
  confirmBookingWithSeats,
  confirmSeats,
  confirmSeatsAndPay,
} from "@/features/booking/api/booking.api";
import { apiFetch } from "@/shared/api/apiClient";
import { useParams, useRouter } from "next/navigation";

type SeatSelection = {
  travelerId: string;
  segmentId: string;
  seatNumber: string;
};

export default function SeatsPage() {
  const params = useParams();
  const travelers = useBookingStore((s) => s.travelers);
  const searchId = useBookingStore((s) => s.searchId);
  const offerId = useBookingStore((s) => s.offerId);
  const setSeats = useBookingStore((s) => s.setSeats);
  const setPricing = useBookingStore((s) => s.setPricing);
  const pricing = useBookingStore((s) => s.pricing);
  const bookingId = params.bookingId as string;
  const router = useRouter();
  const [seatMaps, setSeatMaps] = useState<any[]>([]);
  const [seatMapUnavailable, setSeatMapUnavailable] = useState(false);

  const [assignedSeats, setAssignedSeats] = useState<
    Record<string, { seatNumber: string; segmentId: string }>
  >({});
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
  );

  const [activeTravelerIndex, setActiveTravelerIndex] = useState(0);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);


  useEffect(() => {
    if (!travelers || travelers.length === 0) {
      if (bookingId) {
        router.replace(`/booking/${bookingId}`);
      } else {
        router.replace("/");
      }
    }
  }, [travelers, bookingId, router]);

  useEffect(() => {
    async function loadSeatMaps() {
      try {
        const data = await apiFetch("/seatmaps/by-offer", {
          method: "POST",
          body: JSON.stringify({ searchId, offerId }),
        });

        console.log("seats: ", data);

        if (data.unavailable) {
          setSeatMapUnavailable(true);
          setSeatMaps([]);
          return;
        }

        setSeatMaps(data.seatMaps ?? []);
      } catch {
        setSeatMapUnavailable(true);
        setSeatMaps([]);
      }
    }

    if (searchId && offerId) loadSeatMaps();
  }, [searchId, offerId]);

  async function recalculatePrice(
    newSeats: Record<string, { seatNumber: string; segmentId: string }>,
  ) {
    try {
      setIsRecalculating(true);

      const seatsPayload = Object.entries(newSeats).map(
        ([travelerId, value]) => ({
          travelerId,
          segmentId: value.segmentId,
          seatNumber: value.seatNumber,
        }),
      );

      const data = await apiFetch("/flight/pricing", {
        method: "POST",
        body: JSON.stringify({
          searchId,
          offerId,
          options: {
            seats: seatsPayload,
          },
        }),
      });

      setPricing({
        baseTotal: data.price.base ?? 0,
        seatsTotal: data.price.seats ?? 0,
        finalTotal: data.price.total ?? 0,
        currency: data.price.currency ?? "USD",
      });
    } finally {
      setIsRecalculating(false);
    }
  }

  function handleSeatSelect(cell: any, segmentId: string) {
    const travelerId = travelers[activeTravelerIndex].id;

    const newSeats = {
      ...assignedSeats,
      [travelerId]: {
        seatNumber: cell.seatNumber,
        segmentId,
      },
    };

    setAssignedSeats(newSeats);

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      recalculatePrice(newSeats);
    }, 400);

    setDebounceTimer(timer);

    if (activeTravelerIndex < travelers.length - 1) {
      setActiveTravelerIndex((prev) => prev + 1);
    }
  }

  async function handleBooking() {
    console.log("bookingId: ", bookingId);
    if (!bookingId) return;

    setIsBooking(true);

    const seats: SeatSelection[] = Object.entries(assignedSeats).map(
      ([travelerId, value]) => ({
        travelerId,
        segmentId: value.segmentId,
        seatNumber: value.seatNumber,
      }),
    );

    try {
      const payment = await confirmSeatsAndPay(
        bookingId,
        seats,
        searchId,
        offerId,
      );
      console.log("payment: ", payment);
      console.log("paymentRedirectUrl: ", payment.paymentRedirectUrl);

      window.location.href = payment.paymentRedirectUrl.redirectUrl;
    } finally {
      setIsBooking(false);
    }
  }

  const allAssigned =
    seatMapUnavailable ||
    Object.keys(assignedSeats).length === travelers.length;

  const selectedSeatNumbers = useMemo(
    () => Object.values(assignedSeats).map((s) => s.seatNumber),
    [assignedSeats],
  );

  return (
    <BookingLayout
      sidebar={
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">Пассажиры</h3>
            </div>

            <div className="space-y-2">
              {travelers.map((traveler, index) => {
                const isActive = index === activeTravelerIndex;
                const seat = assignedSeats[traveler.id];

                return (
                  <button
                    key={traveler.id}
                    onClick={() => setActiveTravelerIndex(index)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                      isActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {traveler.firstName} {traveler.lastName}
                        </div>

                        <div className="text-sm text-gray-500">
                          {seat ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="w-3 h-3" />
                              Место {seat.seatNumber}
                            </span>
                          ) : (
                            "Место не выбрано"
                          )}
                        </div>
                      </div>

                      {isActive && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border p-6">
            <h3 className="font-semibold mb-4">Легенда</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border rounded flex items-center justify-center">
                  12A
                </div>
                Доступно
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 text-white rounded flex items-center justify-center">
                  12B
                </div>
                Выбрано
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                  12C
                </div>
                Занято
              </div>
            </div>
          </div>

          <PriceSidebar
            onContinue={handleBooking}
            disabled={!allAssigned || isBooking}
            isLoading={isBooking}
            buttonLabel="Перейти к оплате"
          />
          {isRecalculating && (
            <div className="text-sm text-gray-500">Пересчёт цены...</div>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h1 className="text-3xl font-bold mb-2">Выбор мест</h1>

          <p className="text-gray-600">
            Выберите места для {travelers.length} пассажиров
          </p>

          <div className="mt-4 p-3 bg-blue-50 border rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <div className="text-sm">
              Выбираем место для{" "}
              <span className="font-semibold">
                {travelers[activeTravelerIndex]?.firstName}{" "}
                {travelers[activeTravelerIndex]?.lastName}
              </span>
            </div>
          </div>
        </div>

        {seatMaps.map((map, mi) => (
          <div
            key={mi}
            className="bg-white rounded-lg shadow-md border p-8 overflow-x-auto"
          >
            <div className="space-y-2 min-w-max mx-auto">
              {map.grid.map((row: any[], ri: number) => (
                <div key={ri} className="flex justify-center gap-2">
                  {row.map((cell: any, ci: number) => {
                    if (cell.type === "EMPTY") {
                      return <div key={ci} className="w-12 h-12" />;
                    }

                    if (cell.type === "FACILITY") {
                      return (
                        <div
                          key={ci}
                          className="w-12 h-12 bg-gray-100 border rounded flex items-center justify-center"
                        >
                          {cell.code === "LA" ? "🚻" : "☕"}
                        </div>
                      );
                    }

                    const isSelected = selectedSeatNumbers.includes(
                      cell.seatNumber,
                    );

                    const isDisabled =
                      !cell.isAvailable ||
                      (isSelected &&
                        assignedSeats[travelers[activeTravelerIndex].id]
                          ?.seatNumber !== cell.seatNumber);

                    return (
                      <button
                        key={ci}
                        disabled={isDisabled}
                        onClick={() => handleSeatSelect(cell, map.segmentId)}
                        className={`
                        w-12 h-12 rounded border-2 text-sm font-medium
                        transition
                        ${
                          isSelected
                            ? "bg-blue-500 border-blue-600 text-white scale-105"
                            : !cell.isAvailable
                              ? "bg-gray-200 border-gray-300 text-gray-500"
                              : "bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                        }
                      `}
                      >
                        {cell.seatNumber}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(assignedSeats).length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Check className="w-5 h-5" />
              Выбранные места
            </h3>

            <div className="space-y-2">
              {travelers.map((traveler) => {
                const seat = assignedSeats[traveler.id];
                if (!seat) return null;

                return (
                  <div
                    key={traveler.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-gray-700">
                      {traveler.firstName} {traveler.lastName}
                    </span>

                    <span className="font-semibold text-green-700 bg-white px-3 py-1 rounded-full">
                      Место {seat.seatNumber}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </BookingLayout>
  );
}
