"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthStore } from "@/lib/auth-store";
import {
  createSavedPassenger,
  deleteSavedPassenger,
  fetchSavedPassengers,
  type SavedPassengerProfile,
} from "@/features/booking/api/saved-passengers.api";

const AUTO_SAVE_KEY = "documents-auto-save";

function SavedPassengerCard({
  passenger,
  onDelete,
  deleting,
  passportLabel,
  deleteAriaLabel,
}: {
  passenger: SavedPassengerProfile;
  onDelete: (id: string) => void;
  deleting: boolean;
  passportLabel: string;
  deleteAriaLabel: string;
}) {
  return (
    <div className="relative flex flex-col items-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <button
        type="button"
        onClick={() => onDelete(passenger.id)}
        disabled={deleting}
        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
        aria-label={deleteAriaLabel}
      >
        <Trash2 className="w-4 h-4" />
      </button>
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <User className="w-8 h-8 text-gray-400" />
      </div>
      <div className="text-xs text-gray-500 mb-1">{passportLabel}</div>
      <div className="text-sm font-medium text-gray-900 text-center">
        {passenger.lastName} {passenger.firstName.charAt(0)}.
      </div>
    </div>
  );
}

export function DocumentsPage() {
  const t = useTranslations("documents");
  const queryClient = useQueryClient();
  const authChecked = useAuthStore((state) => state.authChecked);
  const isAuthorized = useAuthStore((state) => state.isAuthorized);
  const canFetch = authChecked && isAuthorized;
  const [citizenship, setCitizenship] = useState("RU");
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [docNumber, setDocNumber] = useState("");
  const [passportIssuanceDate, setPassportIssuanceDate] = useState("");
  const [passportExpiry, setPassportExpiry] = useState("");
  const [autoSave, setAutoSave] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const passengersQuery = useQuery({
    queryKey: ["saved-passengers"],
    queryFn: fetchSavedPassengers,
    enabled: canFetch,
  });

  const createMutation = useMutation({
    mutationFn: createSavedPassenger,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-passengers"] });
      handleClearForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSavedPassenger,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-passengers"] });
    },
  });

  useEffect(() => {
    const stored = window.localStorage.getItem(AUTO_SAVE_KEY);
    if (stored !== null) {
      setAutoSave(stored === "true");
    }
  }, []);

  const handleAutoSaveChange = (enabled: boolean) => {
    setAutoSave(enabled);
    window.localStorage.setItem(AUTO_SAVE_KEY, String(enabled));
  };

  const handleClearForm = () => {
    setLastName("");
    setFirstName("");
    setBirthDate("");
    setDocNumber("");
    setPassportIssuanceDate("");
    setPassportExpiry("");
    setFormError(null);
  };

  const handleSubmit = async () => {
    setFormError(null);

    if (!lastName.trim() || !firstName.trim() || !birthDate || !docNumber.trim()) {
      setFormError(t("errors.requiredFields"));
      return;
    }

    if (!passportIssuanceDate || !passportExpiry) {
      setFormError(t("errors.passportDates"));
      return;
    }

    try {
      await createMutation.mutateAsync({
        passengerType: "ADULT",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        dateOfBirth: birthDate,
        nationality: citizenship,
        passportNumber: docNumber.trim(),
        passportIssuanceDate,
        passportExpiry,
      });
    } catch (error) {
      console.error(error);
      setFormError(t("errors.saveFailed"));
    }
  };

  const passengers = passengersQuery.data ?? [];

  return (
    <div className="flex-1">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("saved")}</h2>
        {passengersQuery.isLoading ? (
          <p className="text-gray-500 text-sm">{t("loading")}</p>
        ) : passengers.length === 0 ? (
          <p className="text-gray-500 text-sm">{t("emptySaved")}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {passengers.map((passenger) => (
              <SavedPassengerCard
                key={passenger.id}
                passenger={passenger}
                onDelete={(id) => deleteMutation.mutate(id)}
                deleting={deleteMutation.isPending}
                passportLabel={t("passport")}
                deleteAriaLabel={t("deleteAria")}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{t("newDocument")}</h2>
          <button
            type="button"
            onClick={handleClearForm}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {t("clearForm")}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">
              {t("citizenship")}
            </label>
            <input
              type="text"
              value={citizenship}
              onChange={(e) => setCitizenship(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-2">{t("gender")}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setGender("MALE")}
                className={`flex-1 px-4 py-2.5 border rounded-lg transition-colors ${
                  gender === "MALE"
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {t("genderMale")}
              </button>
              <button
                type="button"
                onClick={() => setGender("FEMALE")}
                className={`flex-1 px-4 py-2.5 border rounded-lg transition-colors ${
                  gender === "FEMALE"
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {t("genderFemale")}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            placeholder={t("lastName")}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder={t("firstName")}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="date"
            aria-label={t("dateOfBirth")}
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder={t("documentNumber")}
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="date"
            aria-label={t("dateOfIssue")}
            value={passportIssuanceDate}
            onChange={(e) => setPassportIssuanceDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            aria-label={t("expiryDate")}
            value={passportExpiry}
            onChange={(e) => setPassportExpiry(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {formError && (
          <p className="text-sm text-red-600 mb-4">{formError}</p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={createMutation.isPending}
          className="w-full sm:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors mb-4"
        >
          {createMutation.isPending ? t("saving") : t("add")}
        </button>

        <div className="flex items-start justify-between pt-6 border-t border-gray-200">
          <div className="flex-1 pr-4">
            <h3 className="font-semibold mb-1">{t("autoSaveTitle")}</h3>
            <p className="text-sm text-gray-500">{t("autoSaveHint")}</p>
          </div>
          <button
            type="button"
            onClick={() => handleAutoSaveChange(!autoSave)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex-shrink-0 ${
              autoSave ? "bg-blue-600" : "bg-gray-300"
            }`}
            role="switch"
            aria-checked={autoSave}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoSave ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
