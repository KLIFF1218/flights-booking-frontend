"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth-store";
import { connectNotificationStream } from "@/features/account/lib/notification-stream";
import { useNotificationStreamStore } from "@/features/account/lib/notification-stream-store";
import {
  USER_NOTIFICATIONS_QUERY_KEY,
  USER_NOTIFICATIONS_UNREAD_COUNT_KEY,
  isMarkingNotifications,
} from "@/features/account/hooks/useUserNotifications";

export function NotificationStreamListener() {
  const authChecked = useAuthStore((state) => state.authChecked);
  const isAuthorized = useAuthStore((state) => state.isAuthorized);
  const setConnected = useNotificationStreamStore((state) => state.setConnected);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!authChecked || !isAuthorized) {
      setConnected(false);
      return;
    }

    const disconnect = connectNotificationStream({
      onOpen: () => setConnected(true),
      onClose: () => setConnected(false),
      onEvent: () => {
        if (isMarkingNotifications(queryClient)) {
          return;
        }

        queryClient.invalidateQueries({ queryKey: USER_NOTIFICATIONS_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: USER_NOTIFICATIONS_UNREAD_COUNT_KEY });
      },
    });

    return () => {
      disconnect();
      setConnected(false);
    };
  }, [authChecked, isAuthorized, queryClient, setConnected]);

  return null;
}
