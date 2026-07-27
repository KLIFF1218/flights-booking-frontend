import { apiFetch, ApiRequestError } from "@/shared/api/apiClient";
import { getCurrency, type CurrencyCode } from "@/shared/utils/currency";
import { readClientLocale } from "@/shared/utils/locale";
import type { TravelerForm } from "@/features/booking/validation/traveler.schema";
import type { BookingSnapshot } from "@/shared/types/booking-snapshot";
import type { FlightPricingApiResponse } from "@/features/booking/types/pricing.types";
import {
  clearInitBookingIdempotencyKey,
  resolveInitBookingIdempotencyKey,
} from "@/features/booking/lib/booking-init-idempotency";
import type { PaymentProviderCode } from "@/features/payments/types/payment-provider";

export type SeatSelection = {
  travelerId: string;
  segmentId: string;
  seatNumber: string;
};

export enum SeatFeature {
  EXIT_ROW = "EXIT_ROW",
  EXTRA_LEGROOM = "EXTRA_LEGROOM",
  PREMIUM = "PREMIUM",
}

export type SeatMapGridCell =
  | { type: "EMPTY" }
  | { type: "FACILITY"; code: string }
  | {
      type: "SEAT";
      seatNumber: string;
      isAvailable: boolean;
      minPrice: number | null;
      seatType: string;
      deck: number;
      status: string;
      travelClass: string;
      features: SeatFeature[];
    };

export type SeatMapSegment = {
  segmentId: string;
  aircraft: string;
  cabin: string;
  availableSeatsCount: number;
  grid: SeatMapGridCell[][];
};

export type SeatMapResponse = {
  seatMaps: SeatMapSegment[];
  unavailable: boolean;
};

export type BookingCheckoutResponse = {
  paymentRedirectUrl: string;
};

export type SeatMapUi = {
  segmentId: string;
  aircraft: string;
  cabin: string;
  grid: Array<
    Array<{
      type: "SEAT" | "FACILITY" | "EMPTY";
      seatNumber?: string;
      code?: string;
      label?: string;
    }>
  >;
};


export async function getSeatmap(
  searchId: string,
  offerId: string,
): Promise<SeatMapResponse> {
  return apiFetch<SeatMapResponse>("/seatmaps/by-offer", {
    method: "POST",
    body: JSON.stringify({
      searchId,
      offerId,
    }),
  });
}

export type InitBookingResponse = {
  id: string;
};

const BOOKING_SEARCH_CONTEXT_KEY = "booking-search-context";

export function persistBookingSearchContext(
  bookingId: string,
  searchId: string,
  offerId: string,
) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(
    BOOKING_SEARCH_CONTEXT_KEY,
    JSON.stringify({ bookingId, searchId, offerId }),
  );
}

export function restoreBookingSearchContext(bookingId: string): {
  searchId: string;
  offerId: string;
} | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(BOOKING_SEARCH_CONTEXT_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      bookingId?: string;
      searchId?: string;
      offerId?: string;
    };

    if (
      parsed.bookingId !== bookingId ||
      !parsed.searchId ||
      !parsed.offerId
    ) {
      return null;
    }

    return { searchId: parsed.searchId, offerId: parsed.offerId };
  } catch {
    return null;
  }
}

const INIT_BOOKING_IN_PROGRESS_MAX_ATTEMPTS = 5;
const INIT_BOOKING_IN_PROGRESS_DELAY_MS = 400;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function initBooking(
  searchId: string,
  offerId: string,
  paymentProvider?: PaymentProviderCode,
): Promise<InitBookingResponse> {
  const idempotencyKey = resolveInitBookingIdempotencyKey(searchId, offerId);

  for (let attempt = 0; attempt < INIT_BOOKING_IN_PROGRESS_MAX_ATTEMPTS; attempt += 1) {
    try {
      const booking = await apiFetch<InitBookingResponse>("/booking/", {
        method: "POST",
        headers: {
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          searchId,
          offerId,
          ...(paymentProvider ? { paymentProvider } : {}),
        }),
      });

      persistBookingSearchContext(booking.id, searchId, offerId);
      clearInitBookingIdempotencyKey(searchId, offerId);

      return booking;
    } catch (error) {
      const isInProgress =
        error instanceof ApiRequestError &&
        error.status === 409 &&
        attempt < INIT_BOOKING_IN_PROGRESS_MAX_ATTEMPTS - 1;

      if (isInProgress) {
        await sleep(INIT_BOOKING_IN_PROGRESS_DELAY_MS * (attempt + 1));
        continue;
      }

      throw error;
    }
  }

  throw new Error("Failed to create booking");
}

export async function confirmSeatsAndPay(
  bookingId: string,
  seats: SeatSelection[],
  searchId: string,
  offerId: string,
  pricingQuoteId?: string,
  paymentProvider?: PaymentProviderCode,
): Promise<BookingCheckoutResponse> {
  return apiFetch<BookingCheckoutResponse>(`/booking/${bookingId}/seats/confirm`, {
    method: "POST",
    body: JSON.stringify({
      searchId,
      offerId,
      seats,
      ...(pricingQuoteId ? { pricingQuoteId } : {}),
      ...(paymentProvider ? { paymentProvider } : {}),
    }),
  });
}

export type { FlightPricingApiResponse } from "@/features/booking/types/pricing.types";

export async function fetchFlightPricing(
  searchId: string,
  offerId: string,
  options?: {
    seats?: SeatSelection[];
    adults?: number;
    children?: number;
    infants?: number;
    seatedInfants?: number;
    fareBrand?: "LIGHT" | "FLEX";
    currencyCode?: CurrencyCode;
  },
): Promise<FlightPricingApiResponse> {
  const {
    currencyCode = getCurrency(readClientLocale()),
    ...pricingOptions
  } = options ?? {};

  return apiFetch<FlightPricingApiResponse>("/flight/pricing", {
    method: "POST",
    body: JSON.stringify({
      searchId,
      offerId,
      options: {
        ...pricingOptions,
        currencyCode,
      },
    }),
  });
}

export async function priceFlight(
  searchId: string,
  offerId: string,
  travelers: TravelerForm[],
): Promise<FlightPricingApiResponse> {
  const adults = travelers.filter((t) => t.type === "adult").length;
  const children = travelers.filter((t) => t.type === "child").length;
  const infants = travelers.filter((t) => t.type === "infant").length;
  const seatedInfants = travelers.filter((t) => t.type === "seated_infant").length;

  return fetchFlightPricing(searchId, offerId, {
    adults,
    children,
    infants,
    seatedInfants,
  });
}

export interface BookingResponse {
  id: string;
  status: string;
  totalPrice: number | string;
  currency: string;
  snapshot: BookingSnapshot;
  travelers?: BookingTravelerResponse[];
  transaction?: {
    id: string;
    paymentExpiresAt?: string | null;
  } | null;
}

export async function getBooking(bookingId: string): Promise<BookingResponse> {
  return apiFetch<BookingResponse>(`/booking/${bookingId}`, {
    method: "GET",
  });
}

function transformTravelerToAddTravelerDto(traveler: TravelerForm) {
  const dto: Record<string, string | undefined> = {
    id: traveler.id,
    firstName: traveler.firstName,
    lastName: traveler.lastName,
    gender: traveler.gender,
    dateOfBirth: traveler.dateOfBirth,
    accompanyingTravelerId: traveler.accompanyingAdultId || undefined,
  };

  const optionalFields: Array<[keyof TravelerForm, string]> = [
    ["email", "email"],
    ["phoneCountryCode", "phoneCountryCode"],
    ["phoneNumber", "phoneNumber"],
    ["passportNumber", "passportNumber"],
    ["passportIssuanceDate", "passportIssuanceDate"],
    ["passportExpiry", "passportExpiry"],
    ["birthPlace", "birthPlace"],
    ["nationality", "nationality"],
  ];

  for (const [formKey, dtoKey] of optionalFields) {
    const value = traveler[formKey]?.toString().trim();
    if (value) {
      dto[dtoKey] =
        formKey === "phoneNumber" ? value.replace(/\D/g, "") : value;
    }
  }

  return dto;
}

export type BookingTravelerResponse = {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  birthDate?: string;
  email?: string | null;
  phoneCountryCode?: string | null;
  phoneNumber?: string | null;
  passportNumber?: string;
  passportIssuanceDate?: string;
  passportExpiry?: string;
  birthPlace?: string | null;
  nationality?: string;
  passengerType?: string;
  accompanyingTravelerId?: string | null;
};

function formatTravelerDate(value?: string | null): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function isSyntheticInfantPassport(passportNumber?: string | null): boolean {
  return Boolean(passportNumber?.trim().toUpperCase().startsWith("INF-"));
}

export type AddTravelersResponse = {
  travelers: BookingTravelerResponse[];
};

export function mergeTravelersWithApiIds(
  formTravelers: TravelerForm[],
  apiTravelers: BookingTravelerResponse[],
): TravelerForm[] {
  return mergeApiTravelersIntoFormSlots(formTravelers, apiTravelers);
}

export function mergeApiTravelersIntoFormSlots(
  slots: TravelerForm[],
  apiTravelers: BookingTravelerResponse[],
): TravelerForm[] {
  return slots.map((slot, index) => {
    const apiTraveler = apiTravelers[index];
    if (!apiTraveler?.id) {
      return slot;
    }

    const passportNumber = isSyntheticInfantPassport(apiTraveler.passportNumber)
      ? ""
      : (apiTraveler.passportNumber ?? slot.passportNumber);

    return {
      ...slot,
      id: apiTraveler.id,
      firstName: apiTraveler.firstName || slot.firstName,
      lastName: apiTraveler.lastName || slot.lastName,
      gender: (apiTraveler.gender as TravelerForm["gender"]) || slot.gender,
      dateOfBirth:
        formatTravelerDate(apiTraveler.birthDate) || slot.dateOfBirth,
      nationality:
        (apiTraveler.nationality as TravelerForm["nationality"]) ||
        slot.nationality,
      birthPlace: apiTraveler.birthPlace ?? slot.birthPlace,
      passportNumber,
      passportIssuanceDate:
        formatTravelerDate(apiTraveler.passportIssuanceDate) ||
        slot.passportIssuanceDate,
      passportExpiry:
        formatTravelerDate(apiTraveler.passportExpiry) || slot.passportExpiry,
      email: apiTraveler.email ?? slot.email ?? "",
      phoneCountryCode: apiTraveler.phoneCountryCode ?? slot.phoneCountryCode ?? "",
      phoneNumber: apiTraveler.phoneNumber ?? slot.phoneNumber ?? "",
      accompanyingAdultId:
        apiTraveler.accompanyingTravelerId ?? slot.accompanyingAdultId ?? "",
    };
  });
}

export async function confirmTravelers(
  bookingId: string,
  travelers: TravelerForm[],
) {
  return apiFetch<AddTravelersResponse>(`/booking/${bookingId}/travelers`, {
    method: "POST",
    body: JSON.stringify({
      travelers: travelers.map(transformTravelerToAddTravelerDto),
    }),
  });
}

export type { BookingSnapshot } from "@/shared/types/booking-snapshot";

export interface AdminBooking {
  id: string;
  status: string;
  totalPrice: number;
  currency: string;
  passengersCount: number;
  flight: {
    number: string;
    from: string;
    to: string;
    departureDate: string | null;
    durationMinutes: number;
    airline: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
  transaction?: {
    id: string;
    status: string;
  };
}

interface AdminBookingsResponse {
  data: AdminBooking[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function fetchBookings(
  search = "",
  status?: string,
  page = 1,
  limit = 20,
): Promise<AdminBookingsResponse> {
  const query = new URLSearchParams({
    search,
    page: String(page),
    limit: String(limit),
  });

  if (status && status !== "all") {
    query.append("status", status);
  }

  return apiFetch<AdminBookingsResponse>(
    `/admin/bookings?${query.toString()}`,
    { method: "GET" },
  );
}

export async function updateBookingStatus(id: string, status: string) {
  return apiFetch(`/admin/bookings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export type BookingDomainEvent = {
  id: string;
  eventType: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  occurredAt: string;
};

interface BookingDomainEventsResponse {
  data: BookingDomainEvent[];
}

export async function fetchBookingEvents(
  bookingId: string,
): Promise<BookingDomainEventsResponse> {
  return apiFetch<BookingDomainEventsResponse>(
    `/admin/bookings/${bookingId}/events`,
    { method: "GET" },
  );
}

export type BookingTicketItem = {
  travelerId: string;
  ticketNumber: string;
  status: string;
  previewUrl: string;
  downloadUrl: string;
  url: string;
};

export async function fetchBookingTickets(
  bookingId: string,
  mode: "view" | "download" = "view",
): Promise<BookingTicketItem[]> {
  return apiFetch<BookingTicketItem[]>(`/booking/${bookingId}/tickets?mode=${mode}`);
}
