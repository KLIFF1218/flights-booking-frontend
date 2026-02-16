import { buildApiUrl } from "@/shared/api/buildApiUrl";
import type { TravelerForm } from "@/features/booking/components/TravelersForm/TravelersForm";

/**
 * Структура для отправки на бэкенд при бронировании рейса
 */
export type CreateFlightOrderRequest = {
  searchId: string;
  offerId: string;
  paymentProvider: "YOOKASSA" | "AMADEUS";
  travelers: TravelerInputDto[];
  seats?: string[];
};

export type TravelerInputDto = {
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

/**
 * Ответ от бэкенда при успешном бронировании
 */
export type FlightBookingResponse = {
  bookingId: string;
  paymentRedirectUrl: string;
};

/**
 * Ответ от бэкенда при получении seatmap
 */
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

/**
 * Преобразовать TravelerForm в TravelerInputDto для отправки на бэкенд
 */
function transformTravelerToDto(traveler: TravelerForm): TravelerInputDto {
  return {
    id: traveler.id,
    dateOfBirth: traveler.dateOfBirth,
    gender: traveler.gender,
    name: {
      firstName: traveler.firstName,
      lastName: traveler.lastName,
    },
    contact: {
      emailAddress: traveler.email,
      phones:
        [
            {
              deviceType: "MOBILE",
              countryCallingCode: traveler.phoneCountryCode,
              number: traveler.phoneNumber.replace(/\D/g, ""),
            },
          ],
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

/**
 * Получить карту мест для рейса по offer
 */
export async function getSeatmap(
  searchId: string,
  offerId: string,
): Promise<SeatMapUi[]> {
  const url = buildApiUrl("/seatmaps/by-offer");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      searchId,
      offerId,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Failed to get seatmap: ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Отправить запрос на бронирование рейса на бэкенд (без мест)
 */
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
    travelers: travelers.map(transformTravelerToDto),
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Failed to book flight: ${response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Подтвердить бронирование с выбранными местами и получить ссылку на оплату
 */
export async function confirmBookingWithSeats(
  travelers: TravelerForm[],
  searchId: string,
  offerId: string,
  selectedSeats: string[],
  paymentProvider: "YOOKASSA" | "AMADEUS" = "YOOKASSA",
): Promise<FlightBookingResponse> {
  const url = buildApiUrl("/booking/confirm");

  const request: CreateFlightOrderRequest = {
    searchId,
    offerId,
    paymentProvider,
    travelers: travelers.map(transformTravelerToDto),
    seats: selectedSeats,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || `Failed to confirm booking: ${response.statusText}`,
    );
  }

  return response.json();
}
