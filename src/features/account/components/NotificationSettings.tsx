"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  loadNotificationPreferences,
  saveNotificationPreferences,
  type NotificationChannelSettings,
  type NotificationPreferences,
} from "@/features/account/lib/notification-preferences";

interface NotificationToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function NotificationToggle({
  label,
  description,
  enabled,
  onChange,
}: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <div className="text-gray-900">{label}</div>
        {description && (
          <div className="text-sm text-gray-500 mt-1">{description}</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ml-4 flex-shrink-0 ${
          enabled ? "bg-blue-600" : "bg-gray-300"
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

interface NotificationSectionProps {
  title: string;
  description?: string;
  settings: NotificationChannelSettings;
  onEmailChange: (enabled: boolean) => void;
  onPushChange: (enabled: boolean) => void;
}

function NotificationSection({
  title,
  description,
  settings,
  onEmailChange,
  onPushChange,
}: NotificationSectionProps) {
  return (
    <div className="border-b border-gray-100 py-5 last:border-b-0">
      <h2 className="text-base font-semibold text-gray-900 mb-1">{title}</h2>
      {description && (
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      )}

      <div className="space-y-0">
        <NotificationToggle
          label="Email notifications"
          enabled={settings.email}
          onChange={onEmailChange}
        />
        <NotificationToggle
          label="In-app notifications"
          description="Sign in to the MaxAirline app the same way you do on the website"
          enabled={settings.push}
          onChange={onPushChange}
        />
      </div>
    </div>
  );
}

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPreferences(loadNotificationPreferences());
    setHydrated(true);
  }, []);

  const updatePreferences = (
    updater: (prev: NotificationPreferences) => NotificationPreferences,
  ) => {
    setPreferences((prev) => {
      const next = updater(prev);
      saveNotificationPreferences(next);
      return next;
    });
  };

  if (!hydrated) {
    return <p className="text-gray-500 text-sm">Loading settings...</p>;
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">
        Settings are saved on this device. Server sync will be available later.
      </p>

      <NotificationSection
        title="Favorite prices"
        settings={preferences.favorites}
        onEmailChange={(enabled) =>
          updatePreferences((prev) => ({
            ...prev,
            favorites: { ...prev.favorites, email: enabled },
          }))
        }
        onPushChange={(enabled) =>
          updatePreferences((prev) => ({
            ...prev,
            favorites: { ...prev.favorites, push: enabled },
          }))
        }
      />

      <NotificationSection
        title="Traveler newsletter"
        description="Cheap flights from your city, travel giveaways, and tips for the road"
        settings={preferences.travelers}
        onEmailChange={(enabled) =>
          updatePreferences((prev) => ({
            ...prev,
            travelers: { ...prev.travelers, email: enabled },
          }))
        }
        onPushChange={(enabled) =>
          updatePreferences((prev) => ({
            ...prev,
            travelers: { ...prev.travelers, push: enabled },
          }))
        }
      />

      <NotificationSection
        title="Pre-flight tips"
        description="Reminders and useful offers"
        settings={preferences.flightTips}
        onEmailChange={(enabled) =>
          updatePreferences((prev) => ({
            ...prev,
            flightTips: { ...prev.flightTips, email: enabled },
          }))
        }
        onPushChange={(enabled) =>
          updatePreferences((prev) => ({
            ...prev,
            flightTips: { ...prev.flightTips, push: enabled },
          }))
        }
      />
    </div>
  );
}
