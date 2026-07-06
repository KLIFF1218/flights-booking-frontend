"use client";

import { useEffect, useState } from "react";
import { Check, Info, LogOut } from "lucide-react";
import { clearAuthData, apiFetch } from "@/shared/api/apiClient";
import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { useThemeStore } from "@/lib/theme-store";

import {
  CurrencyCode,
  setCurrency as persistCurrency,
} from "@/shared/utils/currency";

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  country?: string;
  citizenship?: string;
  city?: string;
  currency?: CurrencyCode;
};

export function SettingsPage() {
  const { user, setUser } = useAuth();

  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [country, setCountry] = useState("Россия");
  const [citizenship, setCitizenship] = useState("Россия");

  const [currency, setCurrency] = useState<CurrencyCode>("RUB");

  const [city, setCity] = useState("");

  const [profileInitialized, setProfileInitialized] = useState(false);

  const [settingsInitialized, setSettingsInitialized] = useState(false);

  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      clearAuthData();
    }
  };

  const handleSave = async () => {
    try {
      const updatedSettings = await apiFetch<User>("/users/settings", {
        method: "PATCH",
        body: JSON.stringify({
          country,
          citizenship,
          currency,
          city,
        }),
      });

      if (updatedSettings.currency) {
        persistCurrency(updatedSettings.currency);
      }

      setUser({
        ...user,
        ...updatedSettings,
      });

      setShowSavedToast(true);

      setTimeout(() => {
        setShowSavedToast(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleProfileSave = async () => {
    try {
      const updatedUser = await apiFetch<User>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
        }),
      });

      const nextUser: User = {
        id: updatedUser.id || user?.id || "",
        email: updatedUser.email || email,
        firstName: updatedUser.firstName || firstName,
        lastName: updatedUser.lastName || lastName,
        phone: updatedUser.phone || phone,
        country: updatedUser.country ?? user?.country,
        citizenship: updatedUser.citizenship ?? user?.citizenship,
        city: updatedUser.city ?? user?.city,
        currency: updatedUser.currency ?? user?.currency,
      };

      setUser(nextUser);

      setShowSavedToast(true);

      setTimeout(() => {
        setShowSavedToast(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user || profileInitialized) return;

    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");

    setProfileInitialized(true);
  }, [user, profileInitialized]);

  useEffect(() => {
    if (settingsInitialized) return;

    const hasSettingsFromUser =
      user?.country !== undefined ||
      user?.citizenship !== undefined ||
      user?.currency !== undefined ||
      user?.city !== undefined;

    if (hasSettingsFromUser) {
      setCountry(user?.country || "Россия");

      setCitizenship(user?.citizenship || "Россия");

      setCurrency(user?.currency || "RUB");

      setCity(user?.city || "");

      persistCurrency(user?.currency || "RUB");

      setSettingsInitialized(true);

      return;
    }

    const loadSettings = async () => {
      try {
        const data = await apiFetch<{
          country?: string;
          citizenship?: string;
          currency?: CurrencyCode;
          city?: string;
        }>("/users/settings");

        setCountry(data.country || "Россия");

        setCitizenship(data.citizenship || "Россия");

        setCurrency(data.currency || "RUB");

        setCity(data.city || "");

        persistCurrency(data.currency || "RUB");
      } catch (error) {
        console.error(error);
      } finally {
        setSettingsInitialized(true);
      }
    };

    loadSettings();
  }, [settingsInitialized, user]);

  return (
    <div className="flex-1">
      <h1 className="text-3xl font-bold mb-6">Настройки</h1>

      {user ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Личные данные</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Имя</label>

              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Фамилия
              </label>

              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Номер телефона
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">Почта</label>

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg"
                />

                <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleProfileSave}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg"
            >
              Сохранить изменения
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-3">Войдите в аккаунт</h2>

          <p className="text-blue-100 mb-6">
            Сохраняйте настройки и бронирования.
          </p>

          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-5 py-3 rounded-xl bg-white text-blue-700 font-semibold"
            >
              Войти
            </Link>

            <Link
              href="/register"
              className="px-5 py-3 rounded-xl border border-white/30"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Региональные</h2>

        <p className="text-sm text-gray-500 mb-4">
          Нужны для отображения билетов
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 flex items-center gap-1">
              Страна
              <Info className="w-4 h-4 text-gray-400" />
            </label>

            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
            >
              <option>Россия</option>
              <option>Казахстан</option>
              <option>Беларусь</option>
              <option>Украина</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Гражданство
            </label>

            <select
              value={citizenship}
              onChange={(e) => setCitizenship(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
            >
              <option>Россия</option>
              <option>Казахстан</option>
              <option>Беларусь</option>
              <option>Украина</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Валюта</label>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
            >
              <option value="RUB">Российский рубль</option>

              <option value="USD">Доллар США</option>

              <option value="EUR">Евро</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">
              Город проживания
            </label>

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">Город проживания</option>

              <option>Москва</option>
              <option>Санкт-Петербург</option>
              <option>Новосибирск</option>
              <option>Екатеринбург</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg"
          >
            Сохранить изменения
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Тема оформления</h2>

        <div className="flex gap-3">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 px-6 py-2.5 border rounded-lg ${
              theme === "light"
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-300"
            }`}
          >
            Светлая
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 px-6 py-2.5 border rounded-lg ${
              theme === "dark"
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-300"
            }`}
          >
            Тёмная
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600"
        >
          <LogOut className="w-4 h-4" />

          <span>Выйти из профиля</span>
        </button>
      </div>

      {showSavedToast && (
        <div className="fixed bottom-6 left-6 bg-[#0F172A] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>

          <span className="text-sm font-medium">Изменения сохранены</span>
        </div>
      )}
    </div>
  );
}
