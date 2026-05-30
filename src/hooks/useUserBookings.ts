"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/shared/api/apiClient";
export type Booking = {
  id: string;
  pnrLocator: string;
  flightOrderId: string;
  status:
    | "PNR_CREATED"
    | "PAYMENT_PENDING"
    | "PAID"
    | "TICKETED"
    | "CANCELED"
    | "FAILED"
    | "EXPIRED";
  totalPrice: number;
  currency: string;
  provider: string;
  createdAt: string;
  updatedAt?: string;
  lastTicketingDate: string;
  cabin: string;
  seatNumber?: string | null;
  passengersCount: number;
  user: { firstName: string; lastName: string };
  flight: {
    number: string;
    from: string;
    to: string;
    departureDate: string | null;
    arrivalDate: string | null;
    airline: string;
  };
  travelers: { id: string; firstName: string; lastName: string }[];
  tickets: {
    id: string;
    travelerId: string;
    ticketNumber: string;
    status: string;
    url: string;
  }[];
  transaction?: { id: string } | null;
};
export type UserBookingsResponse = { bookings: Booking[]; total: number };
export function useUserBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<UserBookingsResponse>("/booking");
      setBookings(data.bookings);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch bookings"),
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBookings();
  }, []);
  return { bookings, loading, error, refetch: fetchBookings };
}
export function filterActiveBookings(bookings: Booking[]): Booking[] {
  return bookings.filter(
    (booking) =>
      booking.status !== "CANCELED" &&
      booking.status !== "EXPIRED" &&
      booking.status !== "FAILED",
  );
}
export function filterArchivedBookings(bookings: Booking[]): Booking[] {
  return bookings.filter(
    (booking) =>
      booking.status === "CANCELED" ||
      booking.status === "EXPIRED" ||
      booking.status === "FAILED",
  );
}
