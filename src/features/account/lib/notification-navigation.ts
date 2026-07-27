import type { UserNotification, UserNotificationType } from "@/features/account/api/user-notifications.api";

export function getNotificationAction(
  notification: Pick<UserNotification, "type" | "bookingId">,
): { href: string; label: string } | null {
  if (!notification.bookingId) {
    return null;
  }

  const { bookingId, type } = notification;

  switch (type) {
    case "BOOKING_CREATED":
      return { href: `/booking/${bookingId}`, label: "Continue booking" };
    case "PAYMENT_FAILED":
      return { href: `/booking/${bookingId}/payment`, label: "Retry payment" };
    case "BOOKING_CANCELED":
    case "BOOKING_EXPIRED":
      return { href: "/search", label: "Search flights" };
    default:
      return { href: `/my/orders/${bookingId}`, label: "Open order" };
  }
}

export function isNegativeNotificationType(type: UserNotificationType): boolean {
  return (
    type === "FLIGHT_CANCELLED" ||
    type === "BOOKING_CANCELED" ||
    type === "BOOKING_EXPIRED" ||
    type === "PAYMENT_FAILED"
  );
}

export function isPositiveNotificationType(type: UserNotificationType): boolean {
  return type === "PAYMENT_SUCCEEDED" || type === "TICKET_ISSUED";
}
