import { apiFetch } from "@/shared/api/apiClient";

export async function confirmPayment(
  transactionId: string,
) {
  return apiFetch(
    `/admin/payments/${transactionId}/confirm`,
    {
      method: "POST",
    },
  );
}

export async function cancelPayment(
  transactionId: string,
) {
  return apiFetch(
    `/admin/payments/${transactionId}/cancel`,
    {
      method: "POST",
    },
  );
}