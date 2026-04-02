"use client";

import { useEffect } from "react";
import { Trash2 } from "lucide-react";

export type TravelerForm = {
  id: string;
  type: "adult" | "child" | "infant";

  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;

  email: string;
  phoneCountryCode: string;
  phoneNumber: string;

  passportNumber: string;
  passportIssuanceDate: string;
  passportExpiry: string;

  birthPlace: string;
  nationality: string;
};

const inputClass =
  "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

const selectClass =
  "block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

export function TravelersForm({
  travelers,
  setTravelers,
  onDeletePassenger,
}: {
  travelers: TravelerForm[];
  setTravelers: React.Dispatch<React.SetStateAction<TravelerForm[]>>;
  onDeletePassenger: (id: string) => void;
}) {
  function updateTraveler(
    index: number,
    field: keyof TravelerForm,
    value: string,
  ) {
    setTravelers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  const counters = {
    adult: 0,
    child: 0,
    infant: 0,
  };

  return (
    <div className="space-y-6">
      {travelers.map((t, i) => {
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
              <Field label="Место рождения (латиницей)">
                <input
                  className={inputClass}
                  value={t.birthPlace}
                  onChange={(e) =>
                    updateTraveler(
                      i,
                      "birthPlace",
                      e.target.value.toUpperCase(),
                    )
                  }
                  placeholder="MOSCOW"
                />
              </Field>

              <Field label="Гражданство">
                <select
                  className={selectClass}
                  value={t.nationality}
                  onChange={(e) =>
                    updateTraveler(i, "nationality", e.target.value)
                  }
                >
                  <option value="RU">Россия</option>
                  <option value="UA">Украина</option>
                  <option value="KZ">Казахстан</option>
                  <option value="BY">Беларусь</option>
                </select>
              </Field>

              <Field label="Имя">
                <input
                  className={inputClass}
                  value={t.firstName}
                  onChange={(e) =>
                    updateTraveler(i, "firstName", e.target.value)
                  }
                  placeholder="IVAN"
                />
              </Field>

              <Field label="Фамилия">
                <input
                  className={inputClass}
                  value={t.lastName}
                  onChange={(e) =>
                    updateTraveler(i, "lastName", e.target.value)
                  }
                  placeholder="IVANOV"
                />
              </Field>

              <Field label="Дата рождения">
                <input
                  type="date"
                  className={inputClass}
                  value={t.dateOfBirth}
                  onChange={(e) =>
                    updateTraveler(i, "dateOfBirth", e.target.value)
                  }
                />
              </Field>

              <Field label="Пол">
                <select
                  className={selectClass}
                  value={t.gender}
                  onChange={(e) =>
                    updateTraveler(i, "gender", e.target.value as any)
                  }
                >
                  <option value="MALE">Мужской</option>
                  <option value="FEMALE">Женский</option>
                </select>
              </Field>

              {i === 0 && (
                <div className="sm:col-span-2">
                  <Field label="Email">
                    <input
                      type="email"
                      className={inputClass}
                      value={t.email}
                      onChange={(e) =>
                        updateTraveler(i, "email", e.target.value)
                      }
                      placeholder="example@email.com"
                    />
                  </Field>
                </div>
              )}

              {i === 0 && (
                <div className="sm:col-span-2">
                  <Field label="Телефон">
                    <div className="flex gap-2">
                      <div className="flex items-center border border-gray-300 rounded-md shadow-sm px-3 py-2 w-20">
                        <span className="text-gray-500">+</span>
                        <input
                          maxLength={3}
                          value={t.phoneCountryCode}
                          onChange={(e) =>
                            updateTraveler(
                              i,
                              "phoneCountryCode",
                              e.target.value.replace(/\D/g, ""),
                            )
                          }
                          placeholder="7"
                          className="w-full focus:outline-none"
                        />
                      </div>

                      <input
                        className={inputClass}
                        value={t.phoneNumber}
                        onChange={(e) =>
                          updateTraveler(
                            i,
                            "phoneNumber",
                            e.target.value.replace(/\D/g, ""),
                          )
                        }
                        placeholder="9991234567"
                      />
                    </div>
                  </Field>
                </div>
              )}

              <Field label="Номер паспорта">
                <input
                  className={inputClass}
                  value={t.passportNumber}
                  onChange={(e) =>
                    updateTraveler(i, "passportNumber", e.target.value)
                  }
                  placeholder="1234 567890"
                />
              </Field>

              <Field label="Дата выдачи паспорта">
                <input
                  type="date"
                  className={inputClass}
                  value={t.passportIssuanceDate}
                  onChange={(e) =>
                    updateTraveler(i, "passportIssuanceDate", e.target.value)
                  }
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Срок действия паспорта">
                  <input
                    type="date"
                    className={inputClass}
                    value={t.passportExpiry}
                    onChange={(e) =>
                      updateTraveler(i, "passportExpiry", e.target.value)
                    }
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
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col text-sm font-medium text-gray-700">
      <span className="h-10 flex items-end">{label}</span>
      {children}
    </label>
  );
}
