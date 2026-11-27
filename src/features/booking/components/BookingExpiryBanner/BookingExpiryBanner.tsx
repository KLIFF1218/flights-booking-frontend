"use client";

import { Clock3 } from "lucide-react";
import { useTranslations } from "next-intl";

type Props = {
  countdown: string | null;
  urgent?: boolean;
};

export function BookingExpiryBanner({ countdown, urgent = false }: Props) {
  const t = useTranslations("booking.expiry");

  if (!countdown) {
    return null;
  }

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-lg border px-4 py-3 ${
        urgent
          ? "border-amber-300 bg-amber-50 text-amber-950"
          : "border-blue-200 bg-blue-50 text-blue-950"
      }`}
    >
      <Clock3 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <div>
        <p className="font-medium">{t("title")}</p>
        <p className="text-sm">{t("countdown", { time: countdown })}</p>
      </div>
    </div>
  );
}
