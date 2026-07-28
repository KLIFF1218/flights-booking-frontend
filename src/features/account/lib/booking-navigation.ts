import type {
  BookingStatus,
  UserBooking,
} from "@/features/account/types/user-booking.types";

export type BookingFlowStep = "travelers" | "seats" | "payment";
export type BookingRouteTarget = BookingFlowStep | "orders" | "search";

const BOOKING_STEP_ACCESS: Record<BookingStatus, readonly BookingFlowStep[]> = {
  PNR_CREATED: ["travelers", "seats"],
  SEATS_SELECTED: ["seats"],
  PAYMENT_PENDING: ["payment"],
  PAID: [],
  TICKETING: [],
  TICKETED: [],
  CANCELED: [],
  EXPIRED: [],
  FAILED: [],
};

export function isBookingStepAllowed(
  status: BookingStatus,
  step: BookingFlowStep,
): boolean {
  return BOOKING_STEP_ACCESS[status]?.includes(step) ?? false;
}

export function getBookingPaymentPath(bookingId: string): string {
  return `/booking/${bookingId}/payment`;
}

export function getRequiredBookingRoute(status: BookingStatus): BookingRouteTarget {
  switch (status) {
    case "PNR_CREATED":
      return "travelers";
    case "SEATS_SELECTED":
      return "seats";
    case "PAYMENT_PENDING":
      return "payment";
    case "PAID":
    case "TICKETING":
    case "TICKETED":
      return "orders";
    case "EXPIRED":
    case "CANCELED":
    case "FAILED":
      return "search";
    default:
      return "search";
  }
}

export function getBookingStepPath(
  bookingId: string,
  target: BookingRouteTarget,
): string {
  switch (target) {
    case "travelers":
      return `/booking/${bookingId}`;
    case "seats":
      return `/booking/${bookingId}/seats`;
    case "payment":
      return getBookingPaymentPath(bookingId);
    case "orders":
      return "/my/orders";
    case "search":
      return "/search";
  }
}

export function resolveBookingRoute(bookingId: string, status: BookingStatus): string {
  return getBookingStepPath(bookingId, getRequiredBookingRoute(status));
}

export type InactiveBookingReason = "expired" | "canceled" | "failed";

export function getInactiveBookingReason(
  status: BookingStatus,
): InactiveBookingReason | null {
  switch (status) {
    case "EXPIRED":
      return "expired";
    case "CANCELED":
      return "canceled";
    case "FAILED":
      return "failed";
    default:
      return null;
  }
}

export function getBookingResumePath(booking: UserBooking): string | null {
  const target = getRequiredBookingRoute(booking.status);

  if (target === "search" || target === "orders") {
    return null;
  }

  return getBookingStepPath(booking.id, target);
}

export function getCancelBookingCopy(
  status: BookingStatus,
  t: (key: string) => string,
): {
  title: string;
  description: string;
} {
  if (status === "PAYMENT_PENDING") {
    return {
      title: t("unpaidTitle"),
      description: t("unpaidDescription"),
    };
  }

  return {
    title: t("defaultTitle"),
    description: t("defaultDescription"),
  };
}

export type BookingSecondaryLink = {
  label: string;
  href: string;
};

export function getBookingSecondaryLink(
  booking: UserBooking,
  t: (key: string) => string,
): BookingSecondaryLink | null {
  if (
    (booking.status === "PAID" || booking.status === "TICKETING") &&
    booking.transaction?.id
  ) {
    return {
      label: t("paymentStatus"),
      href: `/payment/${booking.transaction.id}/success`,
    };
  }

  return null;
}
