import { apiFetch } from "@/shared/api/apiClient";

export type AdminFlightStatus = "on-time" | "delayed" | "cancelled" | "completed";

export type AdminFlightInstance = {
  id: string;
  flightNumber?: string;
  airline?: string;
  from?: string;
  to?: string;
  departureDate?: string;
  arrivalDate?: string;
  departureTimezone?: string;
  arrivalTimezone?: string;
  departureLocalDate?: string;
  durationMinutes?: number;
  price?: number;
  currency?: string | null;
  totalSeats?: number;
  availableSeats?: number;
  bookingsCount?: number;
  status: string;
  delayMinutes?: number;
};

export type AdminFlightsStats = {
  total: number;
  onTime: number;
  delayed: number;
  completed: number;
  cancelled: number;
  occupancy: number;
};

export type AdminFlightsListResponse = {
  data: AdminFlightInstance[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: AdminFlightsStats;
};

export type AdminFlightTemplate = {
  id: string;
  flightNumber: string;
  durationMinutes: number;
  airlineId: string;
  departureAirportId: string;
  arrivalAirportId: string;
  supportsFirstClass: boolean;
  airline: { id: string; name: string; code: string };
  departureAirport: {
    id: string;
    name: string;
    iataCode: string;
    city: string;
    timezone: string;
  };
  arrivalAirport: {
    id: string;
    name: string;
    iataCode: string;
    city: string;
    timezone?: string;
  };
};

export type CreateFlightInstanceFares = {
  economy: number;
  premiumEconomy: number;
  business: number;
  first?: number;
};

export type CreateFlightInstancePayload = {
  flightId: string;
  aircraftId: string;
  departureLocalDate: string;
  departureLocalTime: string;
  currency: string;
  fares: CreateFlightInstanceFares;
};

export type AdminAircraft = {
  id: string;
  code: string;
  name?: string;
  airlineId: string;
  seatsCount?: number;
};

export async function fetchAdminFlights(params: {
  page?: number;
  limit?: number;
  status?: AdminFlightStatus | "all";
  search?: string;
}): Promise<AdminFlightsListResponse> {
  const query = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 20),
  });

  if (params.status && params.status !== "all") {
    query.set("status", params.status);
  }

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  return apiFetch<AdminFlightsListResponse>(`/admin/flights?${query.toString()}`);
}

export async function updateAdminFlightStatus(
  flightId: string,
  body: { status: AdminFlightStatus; delayMinutes?: number },
): Promise<AdminFlightInstance> {
  return apiFetch<AdminFlightInstance>(`/admin/flights/${flightId}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function fetchFlightTemplates(
  search: string,
): Promise<AdminFlightTemplate[]> {
  if (search.trim().length < 2) {
    return [];
  }

  const query = new URLSearchParams({ search: search.trim() });
  return apiFetch<AdminFlightTemplate[]>(
    `/admin/flights/flight-templates?${query.toString()}`,
  );
}

export async function fetchAircrafts(airlineId?: string): Promise<AdminAircraft[]> {
  const query = new URLSearchParams();
  if (airlineId) {
    query.set("airlineId", airlineId);
  }

  const suffix = query.toString() ? `?${query.toString()}` : "";
  return apiFetch<AdminAircraft[]>(`/aircrafts${suffix}`);
}

export async function createFlightInstance(
  payload: CreateFlightInstancePayload,
): Promise<AdminFlightInstance> {
  return apiFetch<AdminFlightInstance>("/admin/flights", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function formatFlightPrice(
  price: number,
  currency?: string | null,
): string {
  const code = currency ?? "RUB";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    return `${price.toLocaleString("en-US")} ${code}`;
  }
}

/** Draft helpers only — not used as server source of truth. */
export const FARE_CLASS_MULTIPLIERS = {
  premiumEconomy: 1.6,
  business: 2.8,
  first: 4.5,
} as const;
