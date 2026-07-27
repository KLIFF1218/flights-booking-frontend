"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/auth-store";
import { fetchTransactionStatus } from "../api/payments.api";
import { shouldPollTransaction } from "../lib/payment-status";

export const TRANSACTION_STATUS_QUERY_KEY = ["transaction-status"] as const;

export function useTransactionStatus(
  transactionId: string,
  options: { enabled?: boolean } = {},
) {
  const authChecked = useAuthStore((state) => state.authChecked);
  const isAuthorized = useAuthStore((state) => state.isAuthorized);

  const enabled =
    options.enabled ?? (authChecked && isAuthorized && Boolean(transactionId));

  const query = useQuery({
    queryKey: [...TRANSACTION_STATUS_QUERY_KEY, transactionId],
    queryFn: () => fetchTransactionStatus(transactionId),
    enabled,
    refetchInterval: (query) =>
      shouldPollTransaction(query.state.data) ? 5000 : false,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    transaction: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error : null,
    refetch: query.refetch,
    isFetching: query.isFetching,
  };
}
