import type { BookingSnapshot, BookingSnapshotSegment } from "@/shared/types/booking-snapshot";

export type PaymentTicket = {
  id: string;
  travelerId: string;
  ticketNumber: string;
  status: string;
  previewUrl: string | null;
  downloadUrl: string | null;
};

export type PaymentTraveler = {
  id: string;
  firstName: string;
  lastName: string;
  seatNumber?: string | null;
};

export type PaymentBooking = {
  id: string;
  pnr: string;
  snapshot: BookingSnapshot | null;
  travelers: PaymentTraveler[];
  tickets: PaymentTicket[];
};

export type PaymentTransaction = {
  transactionId: string;
  status: string;
  externalId: string | null;
  bookingId: string;
  bookingStatus: string | null;
  booking: PaymentBooking | null;
};

export type PaymentUiPhase =
  | "loading"
  | "auth_required"
  | "payment_pending"
  | "payment_failed"
  | "payment_canceled"
  | "ticketing"
  | "ticketed"
  | "booking_failed"
  | "booking_expired"
  | "booking_canceled"
  | "error";

export type { BookingSnapshotSegment };
