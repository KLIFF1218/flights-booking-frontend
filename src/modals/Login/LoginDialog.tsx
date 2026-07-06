"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import styles from "./LoginDialog.module.css";
import { useVkLogin } from "@/hooks/useVkLogin";
import { useEmailAuth } from "@/hooks/useEmailAuth";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const LoginDialog = ({ open, onOpenChange }: Props) => {
  const [mode, setMode] = React.useState<"login" | "register">("login");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const { login: vkLogin, loading: vkLoading } = useVkLogin();
  const { login, register, loading: emailLoading } = useEmailAuth();

  const resetState = React.useCallback(() => {
    setError(null);
    setSuccess(null);
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
  }, []);

  React.useEffect(() => {
    if (!open) {
      resetState();
      setMode("login");
    }
  }, [open, resetState]);

  const handleEmailSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "register") {
      if (password.length < 8) {
        setError("Password should be at least 8 characters long.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
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
          });

    if (result.success) {
      setSuccess(
        mode === "login"
          ? "Signed in successfully"
          : "Account created successfully",
      );
      onOpenChange(false);
    } else {
      setError(result.error || "Authentication failed");
    }
  };

  const handleVkLogin = async () => {
    setError(null);
    setSuccess(null);

    const user = await vkLogin();

    if (user) {
      onOpenChange(false);
    } else {
      setError("VK login failed. Please try again.");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>
            {mode === "login" ? "Sign in to your account" : "Create an account"}
          </Dialog.Title>

          <Dialog.Description className={styles.description}>
            Use email and password or continue with VK.
          </Dialog.Description>

          <form className={styles.form} onSubmit={handleEmailSubmit}>
            {mode === "register" && (
              <div className={styles.nameRow}>
                <input
                  className={styles.input}
                  placeholder="First name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="Last name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </div>
            )}

            <input
              className={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />

            <div className={styles.passwordWrap}>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((value) => !value)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
              </button>
            </div>

            {mode === "register" && (
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            )}

            {error ? <p className={styles.error}>{error}</p> : null}
            {success ? <p className={styles.success}>{success}</p> : null}

            <button
              className={styles.primaryButton}
              type="submit"
              disabled={emailLoading}
            >
              {emailLoading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <div className={styles.switchRow}>
            <span>
              {mode === "login" ? "No account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              className={styles.switchButton}
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError(null);
                setSuccess(null);
              }}
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </div>

          <div className={styles.divider}>or</div>

          <div className={styles.buttons}>
            <button
              className={`${styles.oauthButton} ${styles.google}`}
              type="button"
            >
              Continue with Google
            </button>

            <button
              className={`${styles.oauthButton} ${styles.vk}`}
              onClick={handleVkLogin}
              disabled={vkLoading}
              type="button"
            >
              {vkLoading ? "Loading..." : "Continue with VK ID"}
            </button>
          </div>

          <div className={styles.footer}>
            <p className={styles.agreement}>
              By continuing, you agree to the Terms and Privacy Policy.
            </p>
          </div>

          <Dialog.Close asChild>
            <button className={styles.closeButton} aria-label="Close">
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
