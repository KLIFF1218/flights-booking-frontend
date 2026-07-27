"use client";

import { Link } from "@/i18n/navigation";
import { Settings } from "lucide-react";
import { useUserNotifications } from "@/features/account/hooks/useUserNotifications";
import { NotificationsList } from "@/features/account/components/NotificationsList";

export function NotificationsPageClient() {
  const { notifications, loading, error } = useUserNotifications({
    unreadOnly: false,
    limit: 50,
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Notifications
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Updates on flights and order statuses
          </p>
        </div>

        <Link
          href="/my/notifications/settings"
          className="inline-flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
        >
          <Settings className="w-4 h-4" />
          Notification settings
        </Link>
      </div>

      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-600">
          Loading...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          {error.message}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <NotificationsList notifications={notifications} />
        </div>
      )}
    </>
  );
}
