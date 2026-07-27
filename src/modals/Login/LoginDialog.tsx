"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import styles from "./LoginDialog.module.css";
import { AuthForm } from "@/features/auth/components/AuthForm/AuthForm";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  elevated?: boolean;
  onSuccess?: () => void;
};

export const LoginDialog = ({
  open,
  onOpenChange,
  elevated = false,
  onSuccess,
}: Props) => {
  const t = useTranslations("auth");

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={elevated ? styles.overlayElevated : styles.overlay}
        />
        <Dialog.Content
          className={elevated ? styles.contentElevated : styles.content}
        >
          {open ? (
            <AuthForm
              variant="dialog"
              onSuccess={() => {
                onSuccess?.();
                onOpenChange(false);
              }}
            />
          ) : null}

          <Dialog.Close asChild>
            <button className={styles.closeButton} aria-label={t("close")}>
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
