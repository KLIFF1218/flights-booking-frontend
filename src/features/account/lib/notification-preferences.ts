export type NotificationChannelSettings = {
  email: boolean;
  push: boolean;
};

export type NotificationPreferences = {
  favorites: NotificationChannelSettings;
  travelers: NotificationChannelSettings;
  flightTips: NotificationChannelSettings;
};

const STORAGE_KEY = "maxairline-notification-preferences";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  favorites: { email: true, push: true },
  travelers: { email: true, push: true },
  flightTips: { email: true, push: true },
};

export function loadNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...JSON.parse(raw),
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

export function saveNotificationPreferences(
  preferences: NotificationPreferences,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}
