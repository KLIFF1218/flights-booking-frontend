"use client";

import { useBookingStore } from "@/features/booking/store/booking.store";
import { formatPrice } from "@/shared/utils/formatPrice";
import { getCurrencySymbol } from "@/shared/utils/getCurrencySymbol";

type PriceSidebarProps = {
  onContinue?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  buttonLabel?: string;
};

export function PriceSidebar({
  onContinue,
  disabled,
  isLoading,
  buttonLabel,
}: PriceSidebarProps) {
  const flight = useBookingStore((s) => s.flight);
  const pricing = useBookingStore((s) => s.pricing);
  const travelers = useBookingStore((s) => s.travelers);

  if (!flight || !pricing) {
    return null;
  }

  const base = pricing?.baseTotal ?? 0;
  const seats = pricing?.seatsTotal ?? 0;
  const total = pricing?.finalTotal ?? 0;
  const currency = pricing?.currency ?? "USD";

  const symbol = getCurrencySymbol(currency);

  return (
    <aside className="w-full lg:sticky lg:top-6 lg:self-start">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 overflow-hidden">
        <div className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 break-words">
          {flight.outbound.from} — {flight.outbound.to}
        </div>

        <div className="text-sm text-gray-600 mb-4 sm:mb-6">
          {travelers?.length} пассажир
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-start gap-2 text-sm sm:text-base">
            <span className="text-gray-700 flex-shrink-0">Билет</span>
            <span className="text-gray-900 font-medium text-right break-words">
              {formatPrice(base)} {symbol}
            </span>
          </div>

          <div className="flex justify-between items-start gap-2 text-sm sm:text-base">
            <span className="text-gray-700 flex-shrink-0">Места</span>
            <span className="text-gray-900 font-medium text-right break-words">
              {formatPrice(seats)} {symbol}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 my-4"></div>

        <div className="flex justify-between items-start gap-2 mb-6">
          <span className="text-base sm:text-lg font-semibold text-gray-900 flex-shrink-0">
            Итого
          </span>
          <span className="text-base sm:text-lg font-bold text-gray-900 text-right break-words">
            {formatPrice(total)} {symbol}
          </span>
        </div>

        {onContinue && (
          <button
            disabled={disabled}
            onClick={onContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-sm sm:text-base"
          >
            {isLoading ? "Бронирование..." : (buttonLabel ?? "Продолжить")}
          </button>
        )}
      </div>
    </aside>
  );
}
