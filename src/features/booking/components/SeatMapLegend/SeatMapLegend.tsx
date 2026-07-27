"use client";

import { useTranslations } from "next-intl";

type SeatMapLegendProps = {
  defaultOpen?: boolean;
  className?: string;
};

export function SeatMapLegend({ defaultOpen = true, className }: SeatMapLegendProps) {
  const t = useTranslations("booking");

  return (
    <details
      className={[
        "bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-5 group",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      open={defaultOpen}
    >
      <summary className="font-semibold text-gray-900 cursor-pointer list-none marker:content-none flex items-center justify-between gap-2">
        <span>{t("legend")}</span>
        <span className="text-xs text-gray-400 group-open:hidden">{t("legendExpand")}</span>
      </summary>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border rounded flex items-center justify-center shrink-0">
            12A
          </div>
          <span className="text-gray-700">{t("available")}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 text-white rounded flex items-center justify-center shrink-0">
            12B
          </div>
          <span className="text-gray-700">{t("selected")}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500 shrink-0">
            12C
          </div>
          <span className="text-gray-700">{t("occupied")}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-t-4 border-t-sky-400 border rounded flex items-center justify-center text-xs shrink-0">
            1A
          </div>
          <span className="text-gray-700">{t("window")}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-amber-400 rounded flex items-center justify-center text-xs relative shrink-0">
            2A
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 text-[8px] text-white flex items-center justify-center">
              P
            </span>
          </div>
          <span className="text-gray-700">{t("premium")}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-l-4 border-l-green-500 border rounded flex items-center justify-center text-xs relative shrink-0">
            11C
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 text-[8px] text-white flex items-center justify-center">
              E
            </span>
          </div>
          <span className="text-gray-700">{t("exitRow")}</span>
        </div>
      </div>
    </details>
  );
}
