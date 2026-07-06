import { buildApiUrl } from "@/shared/api/buildApiUrl";
import type { TravelerForm } from "@/features/booking/components/TravelersForm/TravelersForm";
import { apiFetch } from "@/shared/api/apiClient";

export type SeatSelection = {
  travelerId: string;
  segmentId: string;
  seatNumber: string;
};

export type BookingTravelerInputDto = {
  id: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  name: {
    firstName: string;
    lastName: string;
  };
  contact?: {
    emailAddress?: string;
    phones?: Array<{
      deviceType: "MOBILE" | "LANDLINE";
      countryCallingCode: string;
      number: string;
    }>;
  };
  documents?: Array<{
    documentType: "PASSPORT";
    number: string;
    expiryDate: string;
    issuanceDate: string;
    issuanceCountry: string;
    birthPlace: string;
    nationality: string;
  }>;
};

export type TravelerInputDto = {
  id: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  firstName: string;
  lastName: string;
  email: string;
  phoneCountryCode: string;
  phoneNumber: string;
  passportNumber: string;
  passportIssuanceDate: string;
  passportExpiry: string;
  birthPlace: string;
  nationality: string;
};

export type CreateFlightOrderRequest = {
  searchId: string;
  offerId: string;
  paymentProvider: "YOOKASSA" | "AMADEUS";
  travelers: BookingTravelerInputDto[];
  seats?: SeatSelection[];
};

export type FlightBookingResponse = {
  bookingId: string;
  paymentRedirectUrl: {
    redirectUrl: string;
  };
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


function transformTravelerToDto(traveler: TravelerForm): TravelerInputDto {
  return {
    id: traveler.id,
    firstName: traveler.firstName,
    lastName: traveler.lastName,
    gender: traveler.gender,
    dateOfBirth: traveler.dateOfBirth,
    email: traveler.email,
    phoneCountryCode: traveler.phoneCountryCode,
    phoneNumber: traveler.phoneNumber.replace(/\D/g, ""),
    passportNumber: traveler.passportNumber,
    passportIssuanceDate: traveler.passportIssuanceDate,
    passportExpiry: traveler.passportExpiry,
    birthPlace: traveler.birthPlace,
    nationality: traveler.nationality,
  };
}

function transformTravelerToOrderDto(
  traveler: TravelerForm,
): BookingTravelerInputDto {
  const phoneNumber = traveler.phoneNumber.replace(/\D/g, "");

  return {
    id: traveler.id,
    dateOfBirth: traveler.dateOfBirth,
    gender: traveler.gender,
    name: {
      firstName: traveler.firstName,
      lastName: traveler.lastName,
    },
    contact: {
      emailAddress: traveler.email || undefined,
      phones:
        traveler.phoneCountryCode && phoneNumber
          ? [
              {
                deviceType: "MOBILE",
                countryCallingCode: traveler.phoneCountryCode,
                number: phoneNumber,
              },
            ]
          : undefined,
    },
    documents: [
      {
        documentType: "PASSPORT",
        number: traveler.passportNumber,
        expiryDate: traveler.passportExpiry,
        issuanceDate: traveler.passportIssuanceDate,
        issuanceCountry: traveler.nationality,
        birthPlace: traveler.birthPlace,
        nationality: traveler.nationality,
      },
    ],
  };
}


type GridCell =
  | { type: "EMPTY" }
  | {
      type: "FACILITY";
      code: string;
      label?: string;
    }
  | {
      type: "SEAT";
      seatNumber: string;
      isAvailable: boolean;
      minPrice: number | null;
      features: {
        exitRow: boolean;
        extraLegroom: boolean;
        premium: boolean;
      };
    };

type SeatMapResponse = {
  seatMaps: Array<{
    segmentId: string;
    aircraft: string;
    cabin: string;
    availableSeatsCount: number;
    grid: GridCell[][];
  }>;
  unavailable: boolean;
};

export async function getSeatmap(
  searchId: string,
  offerId: string,
): Promise<SeatMapResponse[]> {
  const response = await apiFetch<SeatMapResponse[]>("/seatmaps/by-offer", {
    method: "POST",
    body: JSON.stringify({
      searchId,
      offerId,
    }),
  });

  return response;
}

export async function bookFlight(
  travelers: TravelerForm[],
  searchId: string,
  offerId: string,
  paymentProvider: "YOOKASSA" | "AMADEUS" = "YOOKASSA",
): Promise<FlightBookingResponse> {
  const url = buildApiUrl("/booking");

  const request: CreateFlightOrderRequest = {
    searchId,
    offerId,
    paymentProvider,
    travelers: travelers.map(transformTravelerToOrderDto),
  };

  return apiFetch<FlightBookingResponse>(url, {
    method: "POST",
    body: JSON.stringify(request),
  });
}

export async function initBooking(
  searchId: string,
  offerId: string,
): Promise<{ bookingId: string }> {
  return apiFetch("/booking/", {
    method: "POST",
    body: JSON.stringify({
      searchId,
      offerId,
    }),
  });
}

export async function confirmSeatsAndPay(
  bookingId: string,
  seats: SeatSelection[],
  searchId: string,
  offerId: string,
) {
  return apiFetch(`/booking/${bookingId}/seats/confirm`, {
    method: "POST",
    body: JSON.stringify({
      searchId,
      offerId,
      seats,
    }),
  });
}

export async function priceFlight(
  searchId: string,
  offerId: string,
  travelers: TravelerForm[],
) {
  const adults = travelers.filter((t) => t.type === "adult").length;
  const children = travelers.filter((t) => t.type === "child").length;
  const infants = travelers.filter((t) => t.type === "infant").length;

  return apiFetch("/flight/pricing", {
    method: "POST",
    body: JSON.stringify({
      searchId,
      offerId,
      options: {
        adults,
        children,
        infants,
      },
    }),
  });
}

export async function getBooking(bookingId: string) {
  return apiFetch(`/booking/${bookingId}`, {
    method: "GET",
  });
}

export async function confirmBookingWithSeats(
  travelers: TravelerForm[],
  searchId: string,
  offerId: string,
  selectedSeats: SeatSelection[],
  paymentProvider: "YOOKASSA" | "AMADEUS" = "YOOKASSA",
): Promise<FlightBookingResponse> {
  const url = buildApiUrl("/booking/confirm");

  const request: CreateFlightOrderRequest = {
    searchId,
    offerId,
    paymentProvider,
    travelers: travelers.map(transformTravelerToOrderDto),
    seats: selectedSeats,
  };

  const response = await apiFetch<FlightBookingResponse>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  return response;
}

function transformTravelerToAddTravelerDto(traveler: TravelerForm) {
  return {
    firstName: traveler.firstName,
    lastName: traveler.lastName,
    gender: traveler.gender,
    dateOfBirth: traveler.dateOfBirth,
    email: traveler.email,
    phoneCountryCode: traveler.phoneCountryCode,
    phoneNumber: traveler.phoneNumber.replace(/\D/g, ""),
    passportNumber: traveler.passportNumber,
    passportIssuanceDate: traveler.passportIssuanceDate,
    passportExpiry: traveler.passportExpiry,
    birthPlace: traveler.birthPlace,
    nationality: traveler.nationality,
  };
}

export async function confirmTravelers(
  bookingId: string,
  travelers: TravelerForm[],
) {
  return apiFetch(`/booking/${bookingId}/travelers`, {
    method: "POST",
    body: JSON.stringify({
      travelers: travelers.map(transformTravelerToAddTravelerDto),
    }),
  });
}

export async function confirmSeats(bookingId: string, seats: SeatSelection[]) {
  return apiFetch(`/booking/${bookingId}/seats`, {
    method: "POST",
    body: JSON.stringify({
      seats,
    }),
  });
}

export interface BookingSnapshot {
  travelers: {
    id: string;
    dateOfBirth: string;
    name: {
      firstName: string;
      lastName: string;
    };
  }[];

  flightOffers: {
    id: string;
    price: {
      total: string;
      currency: string;
    };
    itineraries: {
      duration: string;
      segments: {
        id: string;
        number: string;
        departure: {
          at: string;
          iataCode: string;
        };
        arrival: {
          at: string;
          iataCode: string;
        };
        carrierCode: string;
      }[];
    }[];
  }[];
}

export interface AdminBooking {
  id: string;
  status: string;
  totalPrice: number;
  currency: string;
  createdAt: string;
  pnrLocator: string;

  transaction: {
    id: string;
    status: string;
  } | null;

  snapshot: BookingSnapshot;

  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
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
