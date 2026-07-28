"use client";

import { Check, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import type { SavedPassengerProfile } from "@/features/booking/api/saved-passengers.api";
import {
  formatSavedPassengerLabel,
  formatSavedPassengerSubtitle,
  getSavedPassengerInitials,
} from "@/features/booking/mappers/saved-passenger.mapper";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";

type SavedPassengerPickerProps = {
  profiles: SavedPassengerProfile[];
  selectedProfileId?: string;
  usedProfileIds?: string[];
  onSelect: (profileId: string) => void;
};

export function SavedPassengerPicker({
  profiles,
  selectedProfileId,
  usedProfileIds = [],
  onSelect,
}: SavedPassengerPickerProps) {
  const t = useTranslations("booking.travelersForm");

  if (!profiles.length) return null;

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{t("savedPassengers")}</p>
          <p className="text-xs text-gray-500">{t("savedPassengersHint")}</p>
        </div>
        <UserRound className="size-4 text-gray-400" aria-hidden />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1">
        {profiles.map((profile) => {
          const isSelected = profile.id === selectedProfileId;
          const isUsedElsewhere =
            usedProfileIds.includes(profile.id) && !isSelected;

          return (
            <button
              key={profile.id}
              type="button"
              disabled={isUsedElsewhere}
              onClick={() => onSelect(profile.id)}
              className={cn(
                "group relative min-w-[220px] max-w-[260px] shrink-0 rounded-xl border bg-white p-3 text-left transition-all",
                "hover:border-blue-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                isSelected
                  ? "border-blue-500 bg-blue-50/60 shadow-sm ring-1 ring-blue-500/30"
                  : "border-gray-200",
                isUsedElsewhere && "cursor-not-allowed opacity-45 hover:border-gray-200 hover:shadow-none",
              )}
            >
              <div className="flex items-start gap-3">
                <Avatar className="size-10 border border-white shadow-sm">
                  <AvatarFallback
                    className={cn(
                      "text-sm font-semibold",
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700",
                    )}
                  >
                    {getSavedPassengerInitials(profile)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {formatSavedPassengerLabel(profile)}
                    </p>
                    {isSelected ? (
                      <Check className="size-4 shrink-0 text-blue-600" aria-hidden />
                    ) : null}
                  </div>

                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {formatSavedPassengerSubtitle(profile, (tail) =>
                      t("passportMask", { tail }),
                    )}
                  </p>

                  {profile.isPrimary ? (
                    <Badge
                      variant="secondary"
                      className="mt-2 bg-blue-100 text-blue-700 hover:bg-blue-100"
                    >
                      {t("primaryProfile")}
                    </Badge>
                  ) : null}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
