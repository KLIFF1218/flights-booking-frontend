"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient, QueryKey } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth-store";
import { useNotificationStreamStore } from "@/features/account/lib/notification-stream-store";
import {
  fetchUserNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  type UserNotification,
} from "@/features/account/api/user-notifications.api";

export const USER_NOTIFICATIONS_QUERY_KEY = ["user-notifications"] as const;
export const USER_NOTIFICATIONS_UNREAD_COUNT_KEY = [
  ...USER_NOTIFICATIONS_QUERY_KEY,
  "unread-count",
] as const;
export const MARK_NOTIFICATIONS_MUTATION_KEY = [
  "mark-notification",
] as const;

export function userNotificationsListQueryKey(
  unreadOnly: boolean,
  limit: number,
): QueryKey {
  return [...USER_NOTIFICATIONS_QUERY_KEY, { unreadOnly, limit }];
}

function isUserNotificationsListQueryKey(queryKey: QueryKey): boolean {
  if (queryKey[0] !== USER_NOTIFICATIONS_QUERY_KEY[0]) {
    return false;
  }

  const filters = queryKey[1];

  return (
    typeof filters === "object" &&
    filters !== null &&
    "unreadOnly" in filters &&
    "limit" in filters
  );
}

function isUnreadListQueryKey(queryKey: QueryKey): boolean {
  if (!isUserNotificationsListQueryKey(queryKey)) {
    return false;
  }

  return (queryKey[1] as { unreadOnly: boolean }).unreadOnly === true;
}

function applyReadToNotificationLists(
  queryClient: QueryClient,
  notificationId: string,
  readAt: string,
) {
  queryClient.setQueriesData<UserNotification[]>(
    {
      predicate: (query) => isUnreadListQueryKey(query.queryKey),
    },
    (current) =>
      current?.filter((notification) => notification.id !== notificationId) ??
      current,
  );

  queryClient.setQueriesData<UserNotification[]>(
    {
      predicate: (query) =>
        isUserNotificationsListQueryKey(query.queryKey) &&
        !isUnreadListQueryKey(query.queryKey),
    },
    (current) =>
      current?.map((notification) =>
        notification.id === notificationId
          ? { ...notification, readAt }
          : notification,
      ) ?? current,
  );
}

function applyReadAllToNotificationLists(queryClient: QueryClient, readAt: string) {
  queryClient.setQueriesData<UserNotification[]>(
    {
      predicate: (query) => isUnreadListQueryKey(query.queryKey),
    },
    () => [],
  );

  queryClient.setQueriesData<UserNotification[]>(
    {
      predicate: (query) =>
        isUserNotificationsListQueryKey(query.queryKey) &&
        !isUnreadListQueryKey(query.queryKey),
    },
    (current) =>
      current?.map((notification) =>
        notification.readAt ? notification : { ...notification, readAt },
      ) ?? current,
  );
}

function decrementUnreadCount(queryClient: QueryClient, by = 1) {
  queryClient.setQueryData<number>(USER_NOTIFICATIONS_UNREAD_COUNT_KEY, (current) =>
    Math.max(0, (current ?? 0) - by),
  );
}

async function syncNotificationQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.refetchQueries({
      queryKey: USER_NOTIFICATIONS_UNREAD_COUNT_KEY,
    }),
    queryClient.refetchQueries({
      predicate: (query) => isUnreadListQueryKey(query.queryKey),
    }),
  ]);
}

export function isMarkingNotifications(queryClient: QueryClient) {
  return queryClient.isMutating({ mutationKey: MARK_NOTIFICATIONS_MUTATION_KEY }) > 0;
}

export function useUnreadNotificationCount(options: { enabled?: boolean } = {}) {
  const authChecked = useAuthStore((state) => state.authChecked);
  const isAuthorized = useAuthStore((state) => state.isAuthorized);
  const streamConnected = useNotificationStreamStore((state) => state.connected);
  const enabled = options.enabled ?? (authChecked && isAuthorized);

  const query = useQuery({
    queryKey: USER_NOTIFICATIONS_UNREAD_COUNT_KEY,
    queryFn: fetchUnreadNotificationCount,
    refetchInterval: streamConnected ? false : 60_000,
    refetchOnWindowFocus: true,
    enabled,
    retry: 2,
  });

  return {
    unreadCount: query.data ?? 0,
    loading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}

export function useUserNotifications(
  options: {
    unreadOnly?: boolean;
    limit?: number;
    enabled?: boolean;
  } = {},
) {
  const authChecked = useAuthStore((state) => state.authChecked);
  const isAuthorized = useAuthStore((state) => state.isAuthorized);

  const unreadOnly = options.unreadOnly ?? true;
  const limit = options.limit ?? (unreadOnly ? 10 : 50);
  const enabled = options.enabled ?? (authChecked && isAuthorized);
  const streamConnected = useNotificationStreamStore((state) => state.connected);

  const query = useQuery({
    queryKey: userNotificationsListQueryKey(unreadOnly, limit),
    queryFn: () => fetchUserNotifications({ unreadOnly, limit }),
    refetchInterval: streamConnected ? false : 60_000,
    refetchOnWindowFocus: true,
    enabled,
  });

  return {
    notifications: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch,
  };
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: MARK_NOTIFICATIONS_MUTATION_KEY,
    mutationFn: markNotificationRead,
    onSuccess: async (notification) => {
      const readAt = notification.readAt ?? new Date().toISOString();
      applyReadToNotificationLists(queryClient, notification.id, readAt);
      decrementUnreadCount(queryClient);
      await syncNotificationQueries(queryClient);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: MARK_NOTIFICATIONS_MUTATION_KEY,
    mutationFn: markAllNotificationsRead,
    onSuccess: async () => {
      const readAt = new Date().toISOString();
      applyReadAllToNotificationLists(queryClient, readAt);
      queryClient.setQueryData(USER_NOTIFICATIONS_UNREAD_COUNT_KEY, 0);
      await syncNotificationQueries(queryClient);
    },
  });
}
