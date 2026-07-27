"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import type { BookingInactiveReason } from "@/features/booking/hooks/useBookingStatusGuard";

type Props = {
  reason: BookingInactiveReason;
  title?: string;
};

export function BookingInactiveView({ reason, title }: Props) {
  const t = useTranslations("booking");
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">
        {title ?? t(`inactive.${reason}.title`)}
      </h1>

      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        <p className="mb-4">⚠️ {t(`inactive.${reason}.message`)}</p>

        <div className="flex flex-wrap gap-4">
          <button
            type="button"
            onClick={() => router.push("/search")}
            className="text-sm font-medium text-red-700 underline hover:text-red-900"
          >
            {t("backToSearch")}
          </button>

          {(reason === "canceled" || reason === "failed") && (
            <button
              type="button"
              onClick={() => router.push("/my/orders")}
              className="text-sm font-medium text-red-700 underline hover:text-red-900"
            >
              {t("myBookings")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
