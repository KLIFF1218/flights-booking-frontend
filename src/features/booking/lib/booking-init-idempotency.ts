const INIT_BOOKING_IDEMPOTENCY_PREFIX = "booking-init-idempotency";

function buildStorageKey(searchId: string, offerId: string): string {
  return `${INIT_BOOKING_IDEMPOTENCY_PREFIX}:${searchId}:${offerId}`;
}

export function createInitBookingIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getStoredInitBookingIdempotencyKey(
  searchId: string,
  offerId: string,
): string | null {
  if (typeof window === "undefined") return null;

  return sessionStorage.getItem(buildStorageKey(searchId, offerId));
}

export function storeInitBookingIdempotencyKey(
  searchId: string,
  offerId: string,
  idempotencyKey: string,
): void {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(buildStorageKey(searchId, offerId), idempotencyKey);
}

export function clearInitBookingIdempotencyKey(
  searchId: string,
  offerId: string,
): void {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem(buildStorageKey(searchId, offerId));
}

export function resolveInitBookingIdempotencyKey(
  searchId: string,
  offerId: string,
): string {
  const existing = getStoredInitBookingIdempotencyKey(searchId, offerId);
  if (existing) {
    return existing;
  }

  const idempotencyKey = createInitBookingIdempotencyKey();
  storeInitBookingIdempotencyKey(searchId, offerId, idempotencyKey);
  return idempotencyKey;
}
