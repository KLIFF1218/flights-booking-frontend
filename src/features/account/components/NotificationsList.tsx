"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  AlertTriangle,
  Check,
  CheckCheck,
  CheckCircle2,
  Info,
  Ticket,
  XCircle,
} from "lucide-react";
import type { UserNotification } from "@/features/account/api/user-notifications.api";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/features/account/hooks/useUserNotifications";
import { getNotificationAction } from "@/features/account/lib/notification-navigation";

type NotificationsListProps = {
  notifications: UserNotification[];
  compact?: boolean;
  emptyTone?: "empty" | "caught-up";
  onNavigate?: () => void;
};

function formatNotificationTime(value: string) {
  return new Date(value).toLocaleString("en-US", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getNotificationStyle(type: UserNotification["type"]) {
  switch (type) {
    case "FLIGHT_CANCELLED":
    case "BOOKING_CANCELED":
    case "BOOKING_EXPIRED":
    case "PAYMENT_FAILED":
      return {
        container: "border-red-200 bg-red-50",
        icon: XCircle,
        iconClass: "text-red-600",
      };
    case "TICKETING_FAILED":
    case "FLIGHT_DELAYED":
      return {
        container: "border-amber-200 bg-amber-50",
        icon: AlertTriangle,
        iconClass: "text-amber-600",
      };
    case "PAYMENT_SUCCEEDED":
    case "TICKET_ISSUED":
      return {
        container: "border-green-200 bg-green-50",
        icon: type === "TICKET_ISSUED" ? Ticket : CheckCircle2,
        iconClass: "text-green-600",
      };
    case "BOOKING_CREATED":
      return {
        container: "border-blue-200 bg-blue-50",
        icon: Info,
        iconClass: "text-blue-600",
      };
    default:
      return {
        container: "border-gray-200 bg-gray-50",
        icon: Info,
        iconClass: "text-gray-600",
      };
  }
}

export function NotificationsList({
  notifications,
  compact = false,
  emptyTone = "empty",
  onNavigate,
}: NotificationsListProps) {
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleMarkRead(notificationId: string) {
    setActionError(null);

    try {
      await markRead.mutateAsync(notificationId);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to mark notification as read",
      );
    }
  }

  async function handleMarkAllRead() {
    setActionError(null);

    try {
      await markAllRead.mutateAsync();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Failed to mark notifications as read",
      );
    }
  }

  if (notifications.length === 0) {
    const isCaughtUp = compact && emptyTone === "caught-up";

    return (
      <div
        className={`text-center text-gray-500 ${compact ? "py-8" : "py-16"}`}
      >
        <p className="text-sm font-medium text-gray-700">
          {isCaughtUp ? "You're all caught up" : "No notifications yet"}
        </p>
        <p className="text-xs mt-1 text-gray-500">
          {isCaughtUp
            ? "New booking and flight updates will appear here."
            : "Booking and flight updates will show up here."}
        </p>
        {isCaughtUp && (
          <Link
            href="/my/notifications"
            onClick={onNavigate}
            className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            View notification history
          </Link>
        )}
      </div>
    );
  }

  const unreadCount = notifications.filter((item) => !item.readAt).length;

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      {actionError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {actionError}
        </p>
      )}

      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => void handleMarkAllRead()}
            disabled={markAllRead.isPending}
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        </div>
      )}

      {notifications.map((notification) => {
        const isUnread = !notification.readAt;
        const style = getNotificationStyle(notification.type);
        const Icon = style.icon;
        const action = getNotificationAction(notification);

        return (
          <div
            key={notification.id}
            className={`rounded-xl border ${compact ? "p-3" : "p-4"} ${style.container} ${
              isUnread ? "ring-1 ring-blue-200" : "opacity-90"
            }`}
          >
            <div className="flex gap-3">
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconClass}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900">
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                  {isUnread && (
                    <button
                      type="button"
                      aria-label="Mark as read"
                      title="Mark as read"
                      onClick={() => void handleMarkRead(notification.id)}
                      disabled={
                        markRead.isPending &&
                        markRead.variables === notification.id
                      }
                      className="p-1 rounded-md hover:bg-black/5 text-gray-500 shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p
                  className={`text-gray-800 mt-2 ${compact ? "text-xs line-clamp-3" : "text-sm"}`}
                >
                  {notification.message}
                </p>

                {action && (
                  <Link
                    href={action.href}
                    onClick={onNavigate}
                    className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {action.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
