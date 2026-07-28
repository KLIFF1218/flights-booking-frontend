"use client";

import { useEffect, useState } from "react";
import { Check, Info, LogOut } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { apiFetch } from "@/shared/api/apiClient";
import { Link } from "@/i18n/navigation";
import { useAuth } from "@/providers/auth-provider";
import { useThemeStore } from "@/lib/theme-store";
import { changePassword } from "@/features/auth/api/auth.api";
import { ApiRequestError } from "@/shared/api/apiClient";
import { SessionsPanel } from "@/features/account/components/SessionsPanel";
import {
  isStrongPassword,
  PASSWORD_POLICY_MESSAGE,
} from "@/shared/auth/password-policy";
import { resolveDefaultCurrencyForLocale } from "@/shared/utils/currency-policy";

import {
  CurrencyCode,
  setCurrencyWithUserOverride,
  syncCurrencyFromUserProfile,
  toCurrencyCode,
} from "@/shared/utils/currency";
import {
  DEFAULT_PROFILE_COUNTRY,
  normalizeCountryCode,
  PROFILE_CITIES,
  PROFILE_CITY_LABEL_KEYS,
  PROFILE_COUNTRY_CODES,
  PROFILE_COUNTRY_LABEL_KEYS,
  type ProfileCountryCode,
} from "@/shared/constants/profile-countries";

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
  emailVerifiedAt?: string | null;
};

export function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const locale = useLocale();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");

  const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [country, setCountry] = useState<ProfileCountryCode>(DEFAULT_PROFILE_COUNTRY);
  const [citizenship, setCitizenship] = useState<ProfileCountryCode>(
    DEFAULT_PROFILE_COUNTRY,
  );

  const [currency, setCurrency] = useState<CurrencyCode>(
    resolveDefaultCurrencyForLocale(locale),
  );

  const [city, setCity] = useState("");

  const [profileInitialized, setProfileInitialized] = useState(false);

  const [settingsInitialized, setSettingsInitialized] = useState(false);

  const [showSavedToast, setShowSavedToast] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleLogout = () => logout();

  const handleChangePassword = async () => {
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError(t("passwordCurrentRequired"));
      return;
    }

    if (!isStrongPassword(newPassword)) {
      setPasswordError(PASSWORD_POLICY_MESSAGE);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError(t("passwordMismatch"));
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(t("passwordSameAsCurrent"));
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      await logout();
    } catch (error) {
      setPasswordError(
        error instanceof ApiRequestError || error instanceof Error
          ? error.message
          : t("passwordChangeFailed"),
      );
    } finally {
      setPasswordLoading(false);
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
        setCurrencyWithUserOverride(toCurrencyCode(updatedSettings.currency));
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
        currency: toCurrencyCode(updatedUser.currency ?? user?.currency),
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
      setCountry(normalizeCountryCode(user?.country));
      setCitizenship(normalizeCountryCode(user?.citizenship));

      setCurrency(toCurrencyCode(user?.currency));

      setCity(user?.city || "");

      syncCurrencyFromUserProfile(
        toCurrencyCode(user?.currency),
        user?.country,
        locale,
      );

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

        setCountry(normalizeCountryCode(data.country));
        setCitizenship(normalizeCountryCode(data.citizenship));

        setCurrency(toCurrencyCode(data.currency));

        setCity(data.city || "");

        syncCurrencyFromUserProfile(
          toCurrencyCode(data.currency),
          data.country,
          locale,
        );
      } catch (error) {
        console.error(error);
      } finally {
        setSettingsInitialized(true);
      }
    };

    loadSettings();
  }, [settingsInitialized, user, locale]);

  return (
    <div className="flex-1">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      {user ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t("personalInfo")}</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                {t("firstName")}
              </label>

              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">
                {t("lastName")}
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
                {t("phone")}
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-2">{t("email")}</label>

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg"
                />

                {user.emailVerifiedAt ? (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                ) : null}
              </div>
              {!user.emailVerifiedAt ? (
                <p className="mt-1 text-xs text-amber-700">{t("emailNotVerified")}</p>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleProfileSave}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg"
            >
              {t("saveProfile")}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 mb-6 text-white">
          <h2 className="text-2xl font-bold mb-3">{t("loginPromptTitle")}</h2>

          <p className="text-blue-100 mb-6">{t("loginPromptSubtitle")}</p>

          <div className="flex gap-3">
            <Link
              href="/auth/login"
              className="px-5 py-3 rounded-xl bg-white text-blue-700 font-semibold"
            >
              {tAuth("login")}
            </Link>

            <Link
              href="/auth/login"
              className="px-5 py-3 rounded-xl border border-white/30"
            >
              {tAuth("register")}
            </Link>
          </div>
        </div>
      )}

      {user ? <SessionsPanel /> : null}

      {user ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">{t("changePassword")}</h2>
          <p className="text-sm text-gray-500 mb-4">{t("passwordSignOutHint")}</p>
          <form
            className="max-w-md space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleChangePassword();
            }}
          >
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm text-gray-600 mb-2"
              >
                {t("currentPassword")}
              </label>
              <input
                id="current-password"
                name="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                autoComplete="current-password"
                required
              />
            </div>
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm text-gray-600 mb-2"
              >
                {t("newPassword")}
              </label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                autoComplete="new-password"
                minLength={8}
                required
              />
              <p className="text-xs text-gray-500 mt-1.5">{t("passwordMinHint")}</p>
            </div>
            <div>
              <label
                htmlFor="confirm-new-password"
                className="block text-sm text-gray-600 mb-2"
              >
                {t("confirmPassword")}
              </label>
              <input
                id="confirm-new-password"
                name="confirm-new-password"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            {passwordError ? (
              <p className="text-sm text-red-600" role="alert">
                {passwordError}
              </p>
            ) : null}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg disabled:opacity-60"
              >
                {passwordLoading ? t("updatingPassword") : t("updatePassword")}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">{t("regional")}</h2>

        <p className="text-sm text-gray-500 mb-4">{t("regionalHint")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="profile-country"
              className="text-sm text-gray-600 mb-2 flex items-center gap-1"
              title={t("countryHint")}
            >
              {t("country")}
              <Info className="w-4 h-4 text-gray-400" aria-hidden />
            </label>

            <select
              id="profile-country"
              value={country}
              onChange={(e) =>
                setCountry(e.target.value as ProfileCountryCode)
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
            >
              {PROFILE_COUNTRY_CODES.map((code) => (
                <option key={code} value={code}>
                  {t(PROFILE_COUNTRY_LABEL_KEYS[code])}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="profile-citizenship"
              className="block text-sm text-gray-600 mb-2"
            >
              {t("citizenship")}
            </label>

            <select
              id="profile-citizenship"
              value={citizenship}
              onChange={(e) =>
                setCitizenship(e.target.value as ProfileCountryCode)
              }
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
            >
              {PROFILE_COUNTRY_CODES.map((code) => (
                <option key={code} value={code}>
                  {t(PROFILE_COUNTRY_LABEL_KEYS[code])}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">{t("currency")}</label>

            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
            >
              <option value="RUB">{tCommon("currencyRUB")}</option>

              <option value="USD">{tCommon("currencyUSD")}</option>

              <option value="EUR">{tCommon("currencyEUR")}</option>
            </select>
            <p className="mt-2 text-xs text-gray-500">{t("currencyHint")}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">{t("city")}</label>

            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white"
            >
              <option value="">{t("cityPlaceholder")}</option>

              {PROFILE_CITIES.map((cityName) => (
                <option key={cityName} value={cityName}>
                  {t(PROFILE_CITY_LABEL_KEYS[cityName])}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg"
          >
            {t("saveSettings")}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">{t("theme")}</h2>

        <div className="flex gap-3">
          <button
            onClick={() => setTheme("light")}
            className={`flex-1 px-6 py-2.5 border rounded-lg ${
              theme === "light"
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-300"
            }`}
          >
            {t("themeLight")}
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`flex-1 px-6 py-2.5 border rounded-lg ${
              theme === "dark"
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-300"
            }`}
          >
            {t("themeDark")}
          </button>
        </div>
      </div>

      <div className="flex justify-center mt-10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-red-200 bg-red-50 text-red-600"
        >
          <LogOut className="w-4 h-4" />

          <span>{t("logout")}</span>
        </button>
      </div>

      {showSavedToast && (
        <div className="fixed bottom-6 left-6 bg-[#0F172A] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>

          <span className="text-sm font-medium">{t("changesSaved")}</span>
        </div>
      )}
    </div>
  );
}
