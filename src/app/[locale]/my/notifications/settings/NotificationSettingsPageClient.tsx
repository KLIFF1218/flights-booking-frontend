"use client";

import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { NotificationSettings } from "@/features/account/components/NotificationSettings";

export function NotificationSettingsPageClient() {
  return (
    <>
      <Link
        href="/my/notifications"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to notifications
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Notification settings
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Choose how you want to receive updates about flights and orders
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <NotificationSettings />
      </div>
    </>
  );
}
