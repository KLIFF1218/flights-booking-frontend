export function resolveBookingLoadError(
  error: unknown,
  t: (key: string) => string,
): string {
  const message =
    error instanceof Error ? error.message : String(error ?? "").trim();
  const normalized = message.toLowerCase();

  if (
    normalized.includes("booking not found") ||
    normalized.includes("booking has expired")
  ) {
    return t("inactive.not_found.message");
  }

  if (normalized.includes("traveler pricing not found")) {
    return t("pricingNotFound");
  }

  if (normalized.includes("flight offer not found")) {
    return t("offerNotFound");
  }

  return message || t("failedLoadBooking");
}
