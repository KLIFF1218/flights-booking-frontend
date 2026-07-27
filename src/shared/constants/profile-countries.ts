export const PROFILE_COUNTRY_CODES = ["RU", "KZ", "BY", "UA"] as const;

export type ProfileCountryCode = (typeof PROFILE_COUNTRY_CODES)[number];

const LEGACY_COUNTRY_NAMES: Record<string, ProfileCountryCode> = {
  Russia: "RU",
  Kazakhstan: "KZ",
  Belarus: "BY",
  Ukraine: "UA",
};

export const DEFAULT_PROFILE_COUNTRY: ProfileCountryCode = "RU";

export function normalizeCountryCode(
  value?: string | null,
): ProfileCountryCode {
  if (!value) {
    return DEFAULT_PROFILE_COUNTRY;
  }

  if (PROFILE_COUNTRY_CODES.includes(value as ProfileCountryCode)) {
    return value as ProfileCountryCode;
  }

  return LEGACY_COUNTRY_NAMES[value] ?? DEFAULT_PROFILE_COUNTRY;
}

export const PROFILE_COUNTRY_LABEL_KEYS: Record<
  ProfileCountryCode,
  "countryRU" | "countryKZ" | "countryBY" | "countryUA"
> = {
  RU: "countryRU",
  KZ: "countryKZ",
  BY: "countryBY",
  UA: "countryUA",
};

export const PROFILE_CITIES = [
  "Moscow",
  "Saint Petersburg",
  "Novosibirsk",
  "Yekaterinburg",
] as const;

export type ProfileCity = (typeof PROFILE_CITIES)[number];

export const PROFILE_CITY_LABEL_KEYS: Record<
  ProfileCity,
  "cityMoscow" | "citySaintPetersburg" | "cityNovosibirsk" | "cityYekaterinburg"
> = {
  Moscow: "cityMoscow",
  "Saint Petersburg": "citySaintPetersburg",
  Novosibirsk: "cityNovosibirsk",
  Yekaterinburg: "cityYekaterinburg",
};
