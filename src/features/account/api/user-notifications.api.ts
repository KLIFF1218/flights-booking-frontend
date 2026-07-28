import { apiFetch } from "@/shared/api/apiClient";

export type UserNotificationType =
  | "FLIGHT_DELAYED"
  | "FLIGHT_CANCELLED"
  | "BOOKING_CREATED"
  | "PAYMENT_SUCCEEDED"
  | "PAYMENT_FAILED"
  | "TICKET_ISSUED"
  | "BOOKING_CANCELED"
  | "BOOKING_EXPIRED"
  | "TICKETING_FAILED";

export type UserNotification = {
  id: string;
  userId: string;
  bookingId: string | null;
  type: UserNotificationType;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
};

export async function fetchUnreadNotificationCount(): Promise<number> {
  const result = await apiFetch<{ count: number }>("/users/me/notifications/unread-count");
  return result.count;
}

export async function fetchUserNotifications(options?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<UserNotification[]> {
  const query = new URLSearchParams();

  if (options?.unreadOnly) {
    query.set("unreadOnly", "true");
  }

  if (options?.limit) {
    query.set("limit", String(options.limit));
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";

  return apiFetch<UserNotification[]>(`/users/me/notifications${suffix}`);
}

export async function markNotificationRead(notificationId: string): Promise<UserNotification> {
  return apiFetch<UserNotification>(`/users/me/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead(): Promise<{ updated: number }> {
  return apiFetch<{ updated: number }>("/users/me/notifications/read-all", {
    method: "POST",
  });
}
