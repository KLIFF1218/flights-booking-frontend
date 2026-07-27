"use client";

import { useCallback, useState } from "react";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useEmailAuth } from "@/hooks/useEmailAuth";
import { useVkLogin } from "@/hooks/useVkLogin";
import { isStrongPassword } from "@/shared/auth/password-policy";
import { resolveDefaultCurrencyForLocale } from "@/shared/utils/currency-policy";
import styles from "./AuthForm.module.css";

export type AuthFormMode = "login" | "register";

type Props = {
  variant?: "page" | "dialog";
  allowModeSwitch?: boolean;
  initialMode?: AuthFormMode;
  onSuccess?: () => void;
};

export function AuthForm({
  variant = "dialog",
  allowModeSwitch = true,
  initialMode = "login",
  onSuccess,
}: Props) {
  const [mode, setMode] = useState<AuthFormMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { login, register, loading: emailLoading } = useEmailAuth();
  const { login: vkLogin, loading: vkLoading } = useVkLogin();
  const locale = useLocale();
  const t = useTranslations("auth");

  const resetSensitiveFields = useCallback(() => {
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
  }, []);

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password.trim()) {
      setError(t("emailPasswordRequired"));
      return;
    }

    if (mode === "register") {
      if (!isStrongPassword(password)) {
        setError(t("passwordPolicy"));
        return;
      }

      if (password !== confirmPassword) {
        setError(t("passwordMismatch"));
        return;
      }
    }

    const result =
      mode === "login"
        ? await login({ email, password })
        : await register({
            email,
            password,
            firstName,
            lastName,
            locale,
            currency: resolveDefaultCurrencyForLocale(locale),
          });

    if (result.success) {
      setSuccess(mode === "login" ? t("loginSuccess") : t("registerSuccess"));
      onSuccess?.();
      return;
    }

    setError(result.error || t("authFailed"));
  };

  const handleVkLogin = async () => {
    setError(null);
    setSuccess(null);

    const result = await vkLogin();

    if (result.success) {
      onSuccess?.();
      return;
    }

    setError(result.error || t("vkLoginFailed"));
  };

  const isPage = variant === "page";

  return (
    <div className={isPage ? styles.pageRoot : undefined}>
      {isPage ? (
        <>
          <h1 className={styles.pageTitle}>{t("pageTitle")}</h1>
          <p className={styles.pageSubtitle}>{t("pageSubtitle")}</p>
        </>
      ) : (
        <>
          <h2 className={styles.title}>
            {mode === "login" ? t("dialogLoginTitle") : t("dialogRegisterTitle")}
          </h2>
          <p className={styles.description}>{t("dialogDescription")}</p>
        </>
      )}

      <form className={styles.form} onSubmit={handleEmailSubmit}>
        {mode === "register" && (
          <div className={styles.nameRow}>
            <input
              className={styles.input}
              placeholder={t("firstName")}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              autoComplete="given-name"
            />
            <input
              className={styles.input}
              placeholder={t("lastName")}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              autoComplete="family-name"
            />
          </div>
        )}

        <input
          className={styles.input}
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <div className={styles.passwordWrap}>
          <input
            className={styles.input}
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((value) => !value)}
            aria-label={t("togglePassword")}
          >
            {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </button>
        </div>

        {mode === "register" && (
          <input
            className={styles.input}
            type={showPassword ? "text" : "password"}
            placeholder={t("confirmPassword")}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
        )}

        {mode === "login" ? (
          <div className={styles.switchRow}>
            <Link href="/auth/forgot-password" className={styles.switchButton}>
              {t("forgotPassword")}
            </Link>
          </div>
        ) : null}

        {error ? (
          <p className={styles.error} role="alert">
            {error}
          </p>
        ) : null}
        {success ? <p className={styles.success}>{success}</p> : null}

        <button
          className={styles.primaryButton}
          type="submit"
          disabled={emailLoading}
        >
          {emailLoading
            ? t("pleaseWait")
            : mode === "login"
              ? t("login")
              : t("createAccount")}
        </button>
      </form>

      {allowModeSwitch ? (
        <div className={styles.switchRow}>
          <span>{mode === "login" ? t("noAccount") : t("hasAccount")}</span>
          <button
            type="button"
            className={styles.switchButton}
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              resetSensitiveFields();
            }}
          >
            {mode === "login" ? t("createOne") : t("login")}
          </button>
        </div>
      ) : null}

      <div className={styles.divider}>{t("dividerOr")}</div>

      <button
        className={`${styles.oauthButton} ${styles.vk}`}
        onClick={handleVkLogin}
        disabled={vkLoading}
        type="button"
      >
        {vkLoading ? t("vkLoading") : t("vkSignIn")}
      </button>

      {!isPage ? (
        <p className={styles.agreement}>{t("agreement")}</p>
      ) : null}
    </div>
  );
}
