"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Trash2 } from "lucide-react";
import type { FieldError } from "react-hook-form";
import type {
  TravelerForm,
  TravelersFormValues,
} from "@/features/booking/validation/traveler.schema";

const inputClass =
  "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const selectClass =
  "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export function TravelersForm({
  travelers,
  onDeletePassenger,
}: {
  travelers: TravelerForm[];
  onDeletePassenger: (id: string) => void;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TravelersFormValues>();
  const watchedTravelers = useWatch<TravelersFormValues>({ name: "travelers" });
  const currentTravelers = (watchedTravelers ?? travelers) as TravelerForm[];

  return (
    <div className="space-y-6">
      {currentTravelers.map((t, i) => {
        const typeLabels: Record<TravelerForm["type"], string> = {
          adult: "взрослый",
          child: "ребенок",
          infant: "младенец",
        };

        const label = `${i + 1}-й пассажир, ${typeLabels[t.type]}`;

        return (
          <div
            key={t.id}
            className="border border-gray-200 rounded-lg p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{label}</h3>

              {i !== 0 && (
                <button
                  type="button"
                  onClick={() => onDeletePassenger(t.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 size={20} />
                  <span className="text-sm font-medium">Удалить</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Место рождения (латиницей)"
                error={errors.travelers?.[i]?.birthPlace}
              >
                <input
                  {...register(`travelers.${i}.birthPlace`)}
                  className={inputClass}
                  placeholder="MOSCOW"
                />
              </Field>

              <Field
                label="Гражданство"
                error={errors.travelers?.[i]?.nationality}
              >
                <select
                  {...register(`travelers.${i}.nationality`)}
                  className={selectClass}
                >
                  <option value="RU">Россия</option>
                  <option value="UA">Украина</option>
                  <option value="KZ">Казахстан</option>
                  <option value="BY">Беларусь</option>
                </select>
              </Field>

              <Field label="Имя" error={errors.travelers?.[i]?.firstName}>
                <input
                  {...register(`travelers.${i}.firstName`)}
                  className={inputClass}
                  placeholder="IVAN"
                />
              </Field>

              <Field label="Фамилия" error={errors.travelers?.[i]?.lastName}>
                <input
                  {...register(`travelers.${i}.lastName`)}
                  className={inputClass}
                  placeholder="IVANOV"
                />
              </Field>

              <Field
                label="Дата рождения"
                error={errors.travelers?.[i]?.dateOfBirth}
              >
                <input
                  type="date"
                  {...register(`travelers.${i}.dateOfBirth`)}
                  className={inputClass}
                />
              </Field>

              <Field label="Пол" error={errors.travelers?.[i]?.gender}>
                <select
                  {...register(`travelers.${i}.gender`)}
                  className={selectClass}
                >
                  <option value="MALE">Мужской</option>
                  <option value="FEMALE">Женский</option>
                </select>
              </Field>

              {i === 0 && (
                <div className="sm:col-span-2">
                  <Field label="Email" error={errors.travelers?.[i]?.email}>
                    <input
                      type="email"
                      {...register(`travelers.${i}.email`)}
                      className={inputClass}
                      placeholder="example@email.com"
                    />
                  </Field>
                </div>
              )}

              {i === 0 && (
                <div className="sm:col-span-2">
                  <Field
                    label="Телефон"
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
                          placeholder="7"
                        />
                      </div>

                      <input
                        {...register(`travelers.${i}.phoneNumber`)}
                        className={inputClass}
                        placeholder="9991234567"
                      />
                    </div>
                  </Field>
                </div>
              )}

              <Field
                label="Номер паспорта"
                error={errors.travelers?.[i]?.passportNumber}
              >
                <input
                  {...register(`travelers.${i}.passportNumber`)}
                  className={inputClass}
                  placeholder="1234 567890"
                />
              </Field>

              <Field
                label="Дата выдачи паспорта"
                error={errors.travelers?.[i]?.passportIssuanceDate}
              >
                <input
                  type="date"
                  {...register(`travelers.${i}.passportIssuanceDate`)}
                  className={inputClass}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field
                  label="Срок действия паспорта"
                  error={errors.travelers?.[i]?.passportExpiry}
                >
                  <input
                    type="date"
                    {...register(`travelers.${i}.passportExpiry`)}
                    className={inputClass}
                  />
                </Field>
              </div>
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
