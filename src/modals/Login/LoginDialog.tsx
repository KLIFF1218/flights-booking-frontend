"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import styles from "./LoginDialog.module.css";
import { useVkLogin } from "@/hooks/useVkLogin";
import { useAuth } from "@/providers/auth-provider";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const LoginDialog = ({ open, onOpenChange }: Props) => {
  const { login, loading } = useVkLogin();
  const { setUser } = useAuth();

  const handleVkLogin = async () => {
    const user = await login();

    if (user) {
      setUser(user); // Обновляем состояние авторизации
      onOpenChange(false); // закрываем модалку
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content className={styles.content}>
          <Dialog.Title className={styles.title}>
            Войдите в профиль
          </Dialog.Title>

          <Dialog.Description className={styles.description}>
            Чтобы обращаться в поддержку и следить за ценами на нужные билеты
          </Dialog.Description>

          <div className={styles.buttons}>
            <button className={`${styles.oauthButton} ${styles.google}`}>
              Войти через Google
            </button>

            <button
              className={`${styles.oauthButton} ${styles.vk}`}
              onClick={handleVkLogin}
              disabled={loading}
            >
              {loading ? "Загрузка..." : "Войти с VK ID"}
            </button>

            <button className={styles.more}>Ещё 4 способа</button>
          </div>

          <div className={styles.footer}>
            <label className={styles.checkboxRow}>
              <input type="checkbox" defaultChecked />
              <span>Соглашаюсь получать рекламу и подборки билетов</span>
            </label>

            <p className={styles.agreement}>
              Авторизуясь, вы соглашаетесь с Лицензионным соглашением и
              Политикой конфиденциальности
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
