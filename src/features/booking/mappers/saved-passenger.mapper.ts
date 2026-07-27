import type { SavedPassengerProfile } from "@/features/booking/api/saved-passengers.api";
import type { TravelerForm } from "@/features/booking/validation/traveler.schema";
import { isInfantFormType } from "@/features/booking/validation/traveler.schema";

export function savedPassengerTypeMatchesSlot(
  profile: SavedPassengerProfile,
  slotType: TravelerForm["type"],
): boolean {
  if (slotType === "adult") {
    return profile.passengerType === "ADULT";
  }

  if (slotType === "child") {
    return profile.passengerType === "CHILD";
  }

  return profile.passengerType === "HELD_INFANT";
}

export function savedProfileToTravelerSlot(
  profile: SavedPassengerProfile,
  slot: TravelerForm,
): TravelerForm {
  return {
    ...slot,
    firstName: profile.firstName,
    lastName: profile.lastName,
    gender: profile.gender as TravelerForm["gender"],
    dateOfBirth: profile.dateOfBirth,
    nationality: profile.nationality as TravelerForm["nationality"],
    birthPlace: profile.birthPlace ?? "",
    passportNumber: profile.passportNumber,
    passportIssuanceDate: profile.passportIssuanceDate,
    passportExpiry: profile.passportExpiry,
    email: profile.email ?? "",
    phoneCountryCode: profile.phoneCountryCode ?? "",
    phoneNumber: profile.phoneNumber ?? "",
  };
}

export function isTravelerSlotEmpty(traveler: TravelerForm): boolean {
  if (isInfantFormType(traveler.type)) {
    return (
      !traveler.firstName.trim() &&
      !traveler.lastName.trim() &&
      !traveler.dateOfBirth.trim()
    );
  }

  return (
    !traveler.firstName.trim() &&
    !traveler.lastName.trim() &&
    !traveler.passportNumber.trim() &&
    !traveler.dateOfBirth.trim()
  );
}

export function isTravelerSlotComplete(traveler: TravelerForm): boolean {
  if (isInfantFormType(traveler.type)) {
    return Boolean(
      traveler.firstName.trim() &&
        traveler.lastName.trim() &&
        traveler.dateOfBirth.trim(),
    );
  }

  return Boolean(
    traveler.firstName.trim() &&
      traveler.lastName.trim() &&
      traveler.passportNumber.trim() &&
      traveler.dateOfBirth.trim() &&
      traveler.passportIssuanceDate.trim() &&
      traveler.passportExpiry.trim(),
  );
}

export function canAutofillTravelerSlot(traveler: TravelerForm): boolean {
  return !isTravelerSlotComplete(traveler);
}

export function hasTravelersDraftContent(travelers: TravelerForm[] | null): boolean {
  if (!travelers?.length) return false;
  return travelers.some((traveler) => isTravelerSlotComplete(traveler));
}

export function resolveDefaultAdultProfile(
  profiles: SavedPassengerProfile[],
): SavedPassengerProfile | undefined {
  const primary = profiles.find(
    (profile) => profile.passengerType === "ADULT" && profile.isPrimary,
  );
  if (primary) return primary;

  const labeledMe = profiles.find(
    (profile) =>
      profile.passengerType === "ADULT" &&
      profile.label?.trim().toLowerCase() === "me",
  );
  if (labeledMe) return labeledMe;

  // API returns profiles sorted by isPrimary desc, then updatedAt desc.
  return profiles.find((profile) => profile.passengerType === "ADULT");
}

export function findProfileForTraveler(
  traveler: TravelerForm,
  profiles: SavedPassengerProfile[],
): SavedPassengerProfile | undefined {
  const passport = traveler.passportNumber.trim();
  if (!passport) return undefined;

  return profiles.find((profile) => profile.passportNumber === passport);
}

export function applyPrimaryProfileToFirstAdult(
  travelers: TravelerForm[],
  profiles: SavedPassengerProfile[],
): TravelerForm[] {
  const defaultProfile = resolveDefaultAdultProfile(profiles);
  if (!defaultProfile) return travelers;

  const firstAdultIndex = travelers.findIndex((t) => t.type === "adult");
  if (firstAdultIndex < 0) return travelers;

  const slot = travelers[firstAdultIndex];
  if (!canAutofillTravelerSlot(slot)) return travelers;

  return travelers.map((traveler, index) =>
    index === firstAdultIndex
      ? savedProfileToTravelerSlot(defaultProfile, traveler)
      : traveler,
  );
}

export function shouldApplySavedProfileAutofill(
  travelers: TravelerForm[],
  draft: TravelerForm[] | null,
): boolean {
  if (!travelers.length) return false;
  if (!draft?.length || draft.length !== travelers.length) return true;
  return !hasTravelersDraftContent(draft);
}

export function formatSavedPassengerLabel(profile: SavedPassengerProfile): string {
  if (profile.label?.trim()) {
    return `${profile.label} — ${profile.firstName} ${profile.lastName}`;
  }

  return `${profile.firstName} ${profile.lastName}`;
}

export function formatSavedPassengerSubtitle(
  profile: SavedPassengerProfile,
  passportMask?: (tail: string) => string,
): string {
  const passportTail = profile.passportNumber.slice(-4);
  return passportMask
    ? passportMask(passportTail)
    : `Passport ••${passportTail}`;
}

export function getSavedPassengerInitials(profile: SavedPassengerProfile): string {
  const first = profile.firstName.trim().charAt(0);
  const last = profile.lastName.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || "?";
}

export function assignDefaultAccompanyingAdults(
  travelers: TravelerForm[],
): TravelerForm[] {
  const adultIds = travelers
    .filter((traveler) => traveler.type === "adult")
    .map((traveler) => traveler.id);

  let infantIndex = 0;

  return travelers.map((traveler) => {
    if (traveler.type !== "infant" && traveler.type !== "seated_infant") {
      return traveler;
    }

    if (traveler.accompanyingAdultId) {
      return traveler;
    }

    const adultId = adultIds[infantIndex] ?? adultIds[0];
    infantIndex += 1;

    return {
      ...traveler,
      accompanyingAdultId: adultId,
    };
  });
}

export function formatAdultTravelerLabel(
  traveler: TravelerForm,
  index: number,
  adultFallback?: (index: number) => string,
): string {
  const name = `${traveler.firstName} ${traveler.lastName}`.trim();
  return name ? name : (adultFallback?.(index + 1) ?? `Adult ${index + 1}`);
}

