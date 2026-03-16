'use client'

import { useState } from "react";

interface NotificationToggleProps {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

function NotificationToggle({ label, description, enabled, onChange }: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <div className="text-gray-900">{label}</div>
        {description && (
          <div className="text-sm text-gray-500 mt-1">{description}</div>
        )}
      </div>
      <button
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
  settings: {
    email: boolean;
    push: boolean;
  };
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
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      
      <div className="space-y-0">
        <NotificationToggle
          label="Письма на почту"
          enabled={settings.email}
          onChange={onEmailChange}
        />
        <NotificationToggle
          label="Уведомления в приложении"
          description="Войдите в профиль в приложении CheapTickets таким же способом, что и на сайте"
          enabled={settings.push}
          onChange={onPushChange}
        />
      </div>
    </div>
  );
}

export function NotificationSettings() {
  const [favorites, setFavorites] = useState({ email: true, push: true });
  const [travelers, setTravelers] = useState({ email: true, push: true });
  const [flightTips, setFlightTips] = useState({ email: true, push: true });

  return (
    <div className="flex-1">
      <h1 className="text-3xl font-bold mb-6">Уведомления</h1>

      <NotificationSection
        title="Цены в избранном"
        settings={favorites}
        onEmailChange={(enabled) => setFavorites({ ...favorites, email: enabled })}
        onPushChange={(enabled) => setFavorites({ ...favorites, push: enabled })}
      />

      <NotificationSection
        title="Рассылка для путешественников"
        description="Дешёвые билеты из вашего города, розыгрыши путешествий и советы на дорожку"
        settings={travelers}
        onEmailChange={(enabled) => setTravelers({ ...travelers, email: enabled })}
        onPushChange={(enabled) => setTravelers({ ...travelers, push: enabled })}
      />

      <NotificationSection
        title="Подсказки перед рейсом"
        description="Напоминалки и полезные предложения"
        settings={flightTips}
        onEmailChange={(enabled) => setFlightTips({ ...flightTips, email: enabled })}
        onPushChange={(enabled) => setFlightTips({ ...flightTips, push: enabled })}
      />
    </div>
  );
}
