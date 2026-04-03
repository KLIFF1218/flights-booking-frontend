export type FlightStatus = "on-time" | "delayed" | "cancelled" | "completed";

export interface Flight {
  id: string;
  flightNumber: string;
  airline: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  status: FlightStatus;
  delayMinutes?: number;
}

const statusMap: Record<string, FlightStatus> = {
  SCHEDULED: "on-time",
  DELAYED: "delayed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};


export function mapFlightFromApi(f: any): Flight {
  return {
    id: f.id,
    flightNumber: f.flightNumber,
    airline: f.airline,
    from: f.from,
    to: f.to,
    departure: new Date(f.departureDate).toLocaleString(),
    arrival: f.arrivalDate ? new Date(f.arrivalDate).toLocaleString() : "",
    duration: f.durationMinutes ? `${f.durationMinutes} мин` : "",
    price: Number(f.price ?? 0),
    totalSeats: f.totalSeats ?? 0,
    availableSeats: f.availableSeats ?? 0,
    status: statusMap[f.status] ?? "on-time",
    delayMinutes: f.delayMinutes ?? 0,
  };
}
