"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FieldError } from "react-hook-form";
import type { SavedPassengerProfile } from "@/features/booking/api/saved-passengers.api";
import { SavedPassengerPicker } from "@/features/booking/components/SavedPassengerPicker/SavedPassengerPicker";
import {
  findProfileForTraveler,
  formatAdultTravelerLabel,
  savedPassengerTypeMatchesSlot,
} from "@/features/booking/mappers/saved-passenger.mapper";
import type {
  TravelerForm,
  TravelersFormValues,
} from "@/features/booking/validation/traveler.schema";
import { isInfantFormType } from "@/features/booking/validation/traveler.schema";

const inputClass =
  "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const selectClass =
  "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export function TravelersForm({
  travelers,
  onDeletePassenger,
  allowDelete = false,
  savedProfiles = [],
  onSelectSavedProfile,
  isInternational = true,
}: {
  travelers: TravelerForm[];
  onDeletePassenger?: (id: string) => void;
  allowDelete?: boolean;
  savedProfiles?: SavedPassengerProfile[];
  onSelectSavedProfile?: (travelerIndex: number, profileId: string) => void;
  isInternational?: boolean;
}) {
  const t = useTranslations("booking.travelersForm");
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<TravelersFormValues>();
  const watchedTravelers = useWatch<TravelersFormValues>({ name: "travelers" });
  const currentTravelers = (watchedTravelers ?? travelers) as TravelerForm[];

  const typeLabels: Record<TravelerForm["type"], string> = {
    adult: t("typeAdult"),
    child: t("typeChild"),
    infant: t("typeInfant"),
    seated_infant: t("typeSeatedInfant"),
  };

  return (
    <div className="space-y-6">
      {currentTravelers.map((traveler, i) => {
        const label = t("passengerTitle", {
          index: i + 1,
          type: typeLabels[traveler.type],
        });
        const adultTravelers = currentTravelers
          .map((item, index) => ({ traveler: item, index }))
          .filter(({ traveler: item }) => item.type === "adult");
        const isInfant = isInfantFormType(traveler.type);
        const matchingProfiles = savedProfiles.filter((profile) =>
          savedPassengerTypeMatchesSlot(profile, traveler.type),
        );
        const selectedProfile = findProfileForTraveler(traveler, matchingProfiles);
        const usedProfileIds = currentTravelers
          .map((item, index) => {
            if (index === i) return null;
            return findProfileForTraveler(item, savedProfiles)?.id ?? null;
          })
          .filter((id): id is string => Boolean(id));

        return (
          <div
            key={traveler.id}
            className="border border-gray-200 rounded-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{label}</h3>
                {traveler.type === "infant" ? (
                  <p className="mt-1 text-sm text-gray-500">{t("infantLapHint")}</p>
                ) : null}
                {traveler.type === "seated_infant" ? (
                  <p className="mt-1 text-sm text-gray-500">{t("infantSeatHint")}</p>
                ) : null}
              </div>

              {allowDelete && i !== 0 && onDeletePassenger && (
                <button
                  type="button"
                  onClick={() => onDeletePassenger(traveler.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={20} />
                  <span className="text-sm font-medium">{t("delete")}</span>
                </button>
              )}
            </div>

            {matchingProfiles.length > 0 && onSelectSavedProfile && (
              <SavedPassengerPicker
                profiles={matchingProfiles}
                selectedProfileId={selectedProfile?.id}
                usedProfileIds={usedProfileIds}
                onSelect={(profileId) => onSelectSavedProfile(i, profileId)}
              />
            )}

            {isInfant ? (
              <div className="mb-4">
                <label className="flex flex-col text-sm font-medium text-gray-700">
                  <span className="h-10 flex items-end">{t("accompanyingAdult")}</span>
                  <select
                    {...register(`travelers.${i}.accompanyingAdultId`)}
                    className={selectClass}
                    onChange={(event) => {
                      setValue(`travelers.${i}.accompanyingAdultId`, event.target.value, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                    }}
                  >
                    <option value="">{t("selectAdult")}</option>
                    {adultTravelers.map(({ traveler: adult, index: adultIndex }) => (
                      <option key={adult.id} value={adult.id}>
                        {formatAdultTravelerLabel(adult, adultIndex, (index) =>
                          t("adultFallback", { index }),
                        )}
                      </option>
                    ))}
                  </select>
                  {errors.travelers?.[i]?.accompanyingAdultId?.message ? (
                    <span className="mt-1 text-sm text-red-600">
                      {errors.travelers[i]?.accompanyingAdultId?.message}
                    </span>
                  ) : null}
                </label>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isInfant ? (
                <Field label={t("birthPlace")} error={errors.travelers?.[i]?.birthPlace}>
                  <input
                    {...register(`travelers.${i}.birthPlace`)}
                    className={inputClass}
                    placeholder={t("placeholderBirthPlace")}
                  />
                </Field>
              ) : null}

              {!isInfant || isInternational ? (
                <Field label={t("nationality")} error={errors.travelers?.[i]?.nationality}>
                  <select
                    {...register(`travelers.${i}.nationality`)}
                    className={selectClass}
                  >
                    <option value="RU">{t("countryRU")}</option>
                    <option value="UA">{t("countryUA")}</option>
                    <option value="KZ">{t("countryKZ")}</option>
                    <option value="BY">{t("countryBY")}</option>
                  </select>
                </Field>
              ) : null}

              <Field label={t("firstName")} error={errors.travelers?.[i]?.firstName}>
                <input
                  {...register(`travelers.${i}.firstName`)}
                  className={inputClass}
                  placeholder={t("placeholderFirstName")}
                />
              </Field>

              <Field label={t("lastName")} error={errors.travelers?.[i]?.lastName}>
                <input
                  {...register(`travelers.${i}.lastName`)}
                  className={inputClass}
                  placeholder={t("placeholderLastName")}
                />
              </Field>

              <Field
                label={t("dateOfBirth")}
                error={errors.travelers?.[i]?.dateOfBirth}
              >
                <input
                  type="date"
                  {...register(`travelers.${i}.dateOfBirth`)}
                  className={inputClass}
                />
              </Field>

              <Field label={t("gender")} error={errors.travelers?.[i]?.gender}>
                <select
                  {...register(`travelers.${i}.gender`)}
                  className={selectClass}
                >
                  <option value="MALE">{t("male")}</option>
                  <option value="FEMALE">{t("female")}</option>
                </select>
              </Field>

              {i === 0 && (
                <div className="sm:col-span-2">
                  <Field label={t("email")} error={errors.travelers?.[i]?.email}>
                    <input
                      type="email"
                      {...register(`travelers.${i}.email`)}
                      className={inputClass}
                      placeholder={t("placeholderEmail")}
                    />
                  </Field>
                </div>
              )}

              {i === 0 && (
                <div className="sm:col-span-2">
                  <Field
                    label={t("phone")}
                    error={
                      errors.travelers?.[i]?.phoneNumber ||
                      errors.travelers?.[i]?.phoneCountryCode
                    }
                  >
                    <div className="flex gap-2">
                      <div className="flex items-center border border-gray-300 rounded-md shadow-sm px-3 py-2 w-20">
                        <span className="text-gray-500">+</span>
                        <input
                          maxLength={3}
                          {...register(`travelers.${i}.phoneCountryCode`)}
                          className="w-full focus:outline-none"
                          placeholder={t("placeholderPhoneCountryCode")}
                        />
                      </div>

                      <input
                        {...register(`travelers.${i}.phoneNumber`)}
                        className={inputClass}
                        placeholder={t("placeholderPhoneNumber")}
                      />
                    </div>
                  </Field>
                </div>
              )}

              {!isInfant || isInternational ? (
                <>
                  <Field
                    label={isInfant ? t("documentNumber") : t("passportNumber")}
                    error={errors.travelers?.[i]?.passportNumber}
                  >
                    <input
                      {...register(`travelers.${i}.passportNumber`)}
                      className={inputClass}
                      placeholder={
                        isInfant
                          ? t("placeholderDocumentNumber")
                          : t("placeholderPassportNumber")
                      }
                    />
                  </Field>

                  {!isInfant ? (
                    <Field
                      label={t("passportIssueDate")}
                      error={errors.travelers?.[i]?.passportIssuanceDate}
                    >
                      <input
                        type="date"
                        {...register(`travelers.${i}.passportIssuanceDate`)}
                        className={inputClass}
                      />
                    </Field>
                  ) : null}

                  <div className={isInfant ? "" : "sm:col-span-2"}>
                    <Field
                      label={isInfant ? t("documentExpiry") : t("passportExpiry")}
                      error={errors.travelers?.[i]?.passportExpiry}
                    >
                      <input
                        type="date"
                        {...register(`travelers.${i}.passportExpiry`)}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </>
              ) : (
                <p className="sm:col-span-2 text-sm text-gray-500">
                  {t("domesticInfantNote")}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: FieldError;
}) {
  return (
    <label className="flex flex-col text-sm font-medium text-gray-700">
      <span className="h-10 flex items-end">{label}</span>
      {children}
      {error?.message ? (
        <span className="mt-1 text-sm text-red-600">{error.message}</span>
      ) : null}
    </label>
  );
}
