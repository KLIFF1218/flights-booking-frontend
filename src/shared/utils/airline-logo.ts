import type { SyntheticEvent } from "react";

export const AIRLINE_LOGO_DEFAULT =
  "https://images.kiwi.com/airlines/64/ZZ.png";

const IATA_CODE_PATTERN = /^[A-Z0-9]{2,3}$/;

export function normalizeAirlineCode(code?: string | null): string | null {
  if (!code) {
    return null;
  }

  const normalized = code.trim().toUpperCase();
  return IATA_CODE_PATTERN.test(normalized) ? normalized : null;
}

export function getKiwiAirlineLogoUrl(code: string): string {
  return `https://images.kiwi.com/airlines/64/${code}.png`;
}

export function getAirlineLogoUrl(code?: string | null): string {
  const airlineCode = normalizeAirlineCode(code);

  if (!airlineCode) {
    return AIRLINE_LOGO_DEFAULT;
  }

  return getKiwiAirlineLogoUrl(airlineCode);
}

export function handleAirlineLogoError(
  event: SyntheticEvent<HTMLImageElement, Event>,
): void {
  const image = event.currentTarget;

  if (image.dataset.fallbackApplied === "true") {
    image.src = AIRLINE_LOGO_DEFAULT;
    return;
  }

  image.dataset.fallbackApplied = "true";
  image.src = AIRLINE_LOGO_DEFAULT;
}
