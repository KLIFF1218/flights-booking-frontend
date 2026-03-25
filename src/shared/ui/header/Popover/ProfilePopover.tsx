import * as React from "react";
import { useRouter } from "next/navigation";
import * as Popover from "@radix-ui/react-popover";
import {
  User2Icon,
  LogOut,
  Settings,
  Bell,
  Package,
  FileText,
} from "lucide-react";

import styles from "./Profile-popover.module.css";
import { LoginDialog } from "@/modals/Login/LoginDialog";
import { useAuth } from "@/providers/auth-provider";

export const ProfilePopover = () => {
  const router = useRouter();

  const [open, setOpen] = React.useState(false);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const { user, isAuthorized, logout } = useAuth();

  const navigate = (url: string) => {
    router.push(url);
    setOpen(false);
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

  const authMenu = [
    {
      icon: <Settings size={18} />,
      label: "Настройки",
      path: "/my/settings",
    },
    {
      icon: <Bell size={18} />,
      label: "Уведомления",
      path: "/my/notifications",
    },
    {
      icon: <Package size={18} />,
      label: "Мои заказы",
      path: "/my/orders",
    },
    {
      icon: <FileText size={18} />,
      label: "Документы",
      path: "/my/documents",
    },
  ];

  const guestMenu = [
    {
      icon: <Settings size={18} />,
      label: "Настройки",
    },
    {
      icon: <Bell size={18} />,
      label: "Уведомления",
    },
    {
      icon: <Package size={18} />,
      label: "Мои заказы",
      path: "/my/orders",
    },
    {
      icon: <FileText size={18} />,
      label: "Документы",
    },
  ];

  const menu = isAuthorized ? authMenu : guestMenu;

  return (
    <>
      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button className={styles.trigger}>
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

              {menu.map((item) => (
                <MenuItem
                  key={item.label}
                  icon={item.icon}
                  onClick={() => item.path && navigate(item.path)}
                >
                  {item.label}
                </MenuItem>
              ))}

              {isAuthorized ? (
                <button
                  className={styles.logoutButton}
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut size={18} />
                  <span>{isLoggingOut ? "Выход..." : "Выйти"}</span>
                </button>
              ) : (
                <button
                  className={styles.loginButton}
                  onClick={() => setLoginOpen(true)}
                >
                  Войти
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

const UserInfo = ({ user }: any) => (
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
  <button className={styles.menuItem} onClick={onClick}>
    <span className={styles.iconWrap}>{icon}</span>
    <span>{children}</span>
  </button>
);
