import { apiFetch } from "@/shared/api/apiClient";
import type { TravelerForm } from "@/features/booking/validation/traveler.schema";
import { isInfantFormType } from "@/features/booking/validation/traveler.schema";

export type SavedPassengerProfile = {
  id: string;
  label?: string | null;
  isPrimary: boolean;
  passengerType: "ADULT" | "CHILD" | "HELD_INFANT";
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  birthPlace?: string | null;
  passportNumber: string;
  passportIssuanceDate: string;
  passportExpiry: string;
  email?: string | null;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
};

export type CreateSavedPassengerInput = {
  label?: string;
  isPrimary?: boolean;
  passengerType: "ADULT" | "CHILD" | "HELD_INFANT";
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  nationality?: string;
  birthPlace?: string;
  passportNumber?: string;
  passportIssuanceDate?: string;
  passportExpiry?: string;
  email?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
};

export async function fetchSavedPassengers(): Promise<SavedPassengerProfile[]> {
  return apiFetch<SavedPassengerProfile[]>("/users/me/passengers", {
    method: "GET",
  });
}

export async function createSavedPassenger(
  input: CreateSavedPassengerInput,
): Promise<SavedPassengerProfile> {
  return apiFetch<SavedPassengerProfile>("/users/me/passengers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function syncSavedPassengers(
  travelers: CreateSavedPassengerInput[],
): Promise<SavedPassengerProfile[]> {
  return apiFetch<SavedPassengerProfile[]>("/users/me/passengers/sync", {
    method: "POST",
    body: JSON.stringify({ travelers }),
  });
}

export type SyncSavedPassengersResult = {
  profiles: SavedPassengerProfile[];
  syncedCount: number;
  failedCount: number;
};

/** Syncs each traveler separately so one invalid row does not block the rest. */
export async function syncSavedPassengersSafely(
  travelers: CreateSavedPassengerInput[],
): Promise<SyncSavedPassengersResult> {
  let syncedCount = 0;
  let failedCount = 0;

  for (const traveler of travelers) {
    try {
      await syncSavedPassengers([traveler]);
      syncedCount += 1;
    } catch {
      failedCount += 1;
    }
  }

  const profiles = await fetchSavedPassengers();
  return { profiles, syncedCount, failedCount };
}

export async function deleteSavedPassenger(id: string): Promise<void> {
  await apiFetch(`/users/me/passengers/${id}`, { method: "DELETE" });
}

export function canSyncTravelerToSavedProfile(traveler: TravelerForm): boolean {
  if (isInfantFormType(traveler.type)) {
    return Boolean(
      traveler.passportNumber.trim() && traveler.passportExpiry.trim(),
    );
  }

  return Boolean(
    traveler.passportNumber.trim() &&
      traveler.passportIssuanceDate.trim() &&
      traveler.passportExpiry.trim(),
  );
}

export function travelerFormToSavedPassengerInput(
  traveler: TravelerForm,
  options?: { label?: string; isPrimary?: boolean },
): CreateSavedPassengerInput | null {
  if (!canSyncTravelerToSavedProfile(traveler)) {
    return null;
  }

  const passengerType =
    traveler.type === "child"
      ? "CHILD"
      : traveler.type === "infant" || traveler.type === "seated_infant"
        ? "HELD_INFANT"
        : "ADULT";

  const input: CreateSavedPassengerInput = {
    label: options?.label,
    isPrimary: options?.isPrimary,
    passengerType,
    firstName: traveler.firstName,
    lastName: traveler.lastName,
    gender: traveler.gender,
    dateOfBirth: traveler.dateOfBirth,
    passportNumber: traveler.passportNumber.trim(),
    passportExpiry: traveler.passportExpiry.trim(),
  };

  if (traveler.nationality.trim()) {
    input.nationality = traveler.nationality;
  }

  if (traveler.birthPlace.trim()) {
    input.birthPlace = traveler.birthPlace;
  }

  if (traveler.passportIssuanceDate.trim()) {
    input.passportIssuanceDate = traveler.passportIssuanceDate;
  }

  if (traveler.email.trim()) {
    input.email = traveler.email;
  }

  if (traveler.phoneCountryCode.trim()) {
    input.phoneCountryCode = traveler.phoneCountryCode;
  }

  if (traveler.phoneNumber.trim()) {
    input.phoneNumber = traveler.phoneNumber;
  }

  return input;
}
