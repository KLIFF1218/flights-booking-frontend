"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  User2Icon,
  LogOut,
  Settings,
  Bell,
  Package,
  FileText,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

import styles from "./Profile-popover.module.css";
import { LoginDialog } from "@/modals/Login/LoginDialog";
import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "@/i18n/navigation";
import type { User } from "@/lib/auth-store";

const accountMenu = [
  {
    icon: Settings,
    labelKey: "settings" as const,
    path: "/my/settings",
  },
  {
    icon: Bell,
    labelKey: "notifications" as const,
    path: "/my/notifications",
  },
  {
    icon: Package,
    labelKey: "orders" as const,
    path: "/my/orders",
  },
  {
    icon: FileText,
    labelKey: "documents" as const,
    path: "/my/documents",
  },
] as const;

export const ProfilePopover = () => {
  const router = useRouter();
  const tNav = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tHeader = useTranslations("header");

  const [open, setOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const { user, isAuthorized, logout } = useAuth();

  const handleMenuItemClick = (path: string) => {
    setOpen(false);

    if (isAuthorized) {
      router.push(path);
      return;
    }

    setLoginOpen(true);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button className={styles.trigger} aria-label={tHeader("accountMenu")}>
            <User2Icon />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className={styles.content}
            side="bottom"
            align="end"
            sideOffset={8}
          >
            <div className={styles.menu}>
              {isAuthorized && <UserInfo user={user} />}

              {accountMenu.map((item) => {
                const Icon = item.icon;

                return (
                  <MenuItem
                    key={item.path}
                    icon={<Icon size={18} />}
                    onClick={() => handleMenuItemClick(item.path)}
                  >
                    {tNav(item.labelKey)}
                  </MenuItem>
                );
              })}

              {isAuthorized ? (
                <button
                  className={styles.logoutButton}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut size={18} />
                  <span>
                    {isLoggingOut ? tCommon("signingOut") : tCommon("signOut")}
                  </span>
                </button>
              ) : (
                <button
                  className={styles.loginButton}
                  onClick={() => {
                    setOpen(false);
                    setLoginOpen(true);
                  }}
                >
                  {tCommon("signIn")}
                </button>
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
};

const UserInfo = ({ user }: { user: User | null }) => (
  <div className={styles.userInfo}>
    <p className={styles.userName}>{user?.firstName || user?.email}</p>
    <p className={styles.userEmail}>{user?.email}</p>
  </div>
);

const MenuItem = ({
  icon,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <button className={styles.menuItem} onClick={onClick} type="button">
    <span className={styles.iconWrap}>{icon}</span>
    <span>{children}</span>
  </button>
);
