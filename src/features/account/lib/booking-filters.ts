import type {
  BookingStatus,
  UserBooking,
} from "@/features/account/types/user-booking.types";

const ARCHIVED_STATUSES: BookingStatus[] = [
  "CANCELED",
  "EXPIRED",
  "FAILED",
];

const CANCELLABLE_STATUSES: BookingStatus[] = [
  "PNR_CREATED",
  "SEATS_SELECTED",
  "PAYMENT_PENDING",
];

const COMPLETED_TRIP_STATUSES: BookingStatus[] = ["TICKETED", "PAID"];

const STATUS_LABEL_KEYS: Record<BookingStatus, string> = {
  PNR_CREATED: "draft",
  SEATS_SELECTED: "seatsSelected",
  PAYMENT_PENDING: "awaitingPayment",
  PAID: "paid",
  TICKETING: "ticketing",
  TICKETED: "ticketed",
  CANCELED: "canceled",
  FAILED: "failed",
  EXPIRED: "expired",
};

type StatusTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

/**
 * Last leg arrival (return flight for round-trip). Matches airline "past trips" semantics.
 */
function getLastArrivalInstant(booking: UserBooking): Date | null {
  const routes = booking.routes;
  if (routes?.length) {
    const lastRoute = routes[routes.length - 1];
    if (lastRoute.arrivalDate) {
      return new Date(lastRoute.arrivalDate);
    }
  }

  const fallback = booking.flight?.arrivalDate;
  return fallback ? new Date(fallback) : null;
}

/** Trip moves to archive after the final segment has arrived, not after departure. */
function isTripCompleted(booking: UserBooking): boolean {
  const arrival = getLastArrivalInstant(booking);
  return arrival ? arrival.getTime() < Date.now() : false;
}

export function getBookingStatusLabel(
  status: BookingStatus,
  t: StatusTranslator,
): string {
  return t(STATUS_LABEL_KEYS[status]);
}

export function isBookingCancellable(booking: UserBooking): boolean {
  return CANCELLABLE_STATUSES.includes(booking.status);
}

export {
  getBookingResumePath,
  getBookingPaymentPath,
  getRequiredBookingRoute,
  getBookingStepPath,
  resolveBookingRoute,
  isBookingStepAllowed,
  getCancelBookingCopy,
  getBookingSecondaryLink,
  type BookingSecondaryLink,
} from "./booking-navigation";

export function filterActiveBookings(bookings: UserBooking[]): UserBooking[] {
  return bookings.filter((booking) => {
    if (ARCHIVED_STATUSES.includes(booking.status)) {
      return false;
    }

    if (
      COMPLETED_TRIP_STATUSES.includes(booking.status) &&
      isTripCompleted(booking)
    ) {
      return false;
    }

    return true;
  });
}

export function filterArchivedBookings(bookings: UserBooking[]): UserBooking[] {
  return bookings.filter((booking) => {
    if (ARCHIVED_STATUSES.includes(booking.status)) {
      return true;
    }

    return (
      COMPLETED_TRIP_STATUSES.includes(booking.status) &&
      isTripCompleted(booking)
    );
  });
}
