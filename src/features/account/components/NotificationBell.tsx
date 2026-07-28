"use client";

import * as Popover from "@radix-ui/react-popover";
import { Bell } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import {
  useUnreadNotificationCount,
  useUserNotifications,
} from "@/features/account/hooks/useUserNotifications";
import { NotificationsList } from "@/features/account/components/NotificationsList";
import styles from "./NotificationBell.module.css";

function formatBadgeCount(count: number): string {
  if (count > 99) {
    return "99+";
  }

  if (count > 9) {
    return "9+";
  }

  return String(count);
}

export function NotificationBell() {
  const authChecked = useAuthStore((state) => state.authChecked);
  const isAuthorized = useAuthStore((state) => state.isAuthorized);
  const [open, setOpen] = useState(false);
  const notificationsEnabled = authChecked && isAuthorized;
  const { unreadCount, isError: unreadCountError, refetch: refetchUnreadCount } =
    useUnreadNotificationCount({ enabled: notificationsEnabled });
  const { notifications, loading } = useUserNotifications({
    unreadOnly: true,
    limit: 8,
    enabled: notificationsEnabled,
  });

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.readAt),
    [notifications],
  );

  const badgeCount =
    !loading || unreadNotifications.length > 0
      ? unreadNotifications.length
      : unreadCountError
        ? 0
        : unreadCount;

  useEffect(() => {
    if (!notificationsEnabled) {
      return;
    }

    void refetchUnreadCount();
  }, [notificationsEnabled, refetchUnreadCount]);

  // Hide only for confirmed guests. While auth is restoring, keep the bell visible
  // for users with a persisted session (same as profile menu).
  if (authChecked && !isAuthorized) {
    return null;
  }

  const ariaLabel =
    badgeCount > 0
      ? `Notifications, ${badgeCount} unread`
      : "Notifications";

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={styles.trigger}
        >
          <Bell />
          {badgeCount > 0 && (
            <span className={styles.badge}>{formatBadgeCount(badgeCount)}</span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={styles.content}
          side="bottom"
          align="end"
          sideOffset={8}
          collisionPadding={12}
        >
          <div className={styles.header}>
            <h3 className={styles.title}>Notifications</h3>
            {badgeCount > 0 && (
              <span className={styles.count}>{badgeCount} unread</span>
            )}
          </div>

          <div className={styles.body}>
            {!notificationsEnabled || loading ? (
              <p className={styles.loading}>Loading...</p>
            ) : (
              <NotificationsList
                notifications={unreadNotifications}
                compact
                emptyTone="caught-up"
                onNavigate={() => setOpen(false)}
              />
            )}
          </div>

          <div className={styles.footer}>
            <Link
              href="/my/notifications"
              className={styles.footerLink}
              onClick={() => setOpen(false)}
            >
              All notifications
            </Link>
            <Link
              href="/my/notifications/settings"
              className={styles.footerLink}
              onClick={() => setOpen(false)}
            >
              Settings
            </Link>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
