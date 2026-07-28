import { apiFetch } from "@/shared/api/apiClient";
import { parseBookingSnapshot } from "../lib/booking-snapshot";
import type { PaymentTransaction } from "../types/payment.types";

type PaymentTransactionResponse = {
  transactionId?: string;
  status?: string;
  externalId?: string | null;
  bookingId?: string;
  bookingStatus?: string | null;
  booking?: {
    id?: string;
    pnr?: string;
    snapshot?: unknown;
    travelers?: Array<{
      id: string;
      firstName: string;
      lastName: string;
      seatNumber?: string | null;
    }>;
    tickets?: Array<{
      id: string;
      travelerId: string;
      ticketNumber: string;
      status: string;
      previewUrl: string | null;
      downloadUrl: string | null;
    }>;
  } | null;
};

function mapTransactionResponse(
  data: PaymentTransactionResponse,
  transactionId: string,
): PaymentTransaction {
  const booking = data.booking;

  return {
    transactionId: data.transactionId ?? transactionId,
    status: data.status ?? "PENDING",
    externalId: data.externalId ?? null,
    bookingId: data.bookingId ?? booking?.id ?? "",
    bookingStatus: data.bookingStatus ?? null,
    booking: booking
      ? {
          id: booking.id ?? data.bookingId ?? "",
          pnr: booking.pnr ?? "",
          snapshot: parseBookingSnapshot(booking.snapshot),
          travelers: booking.travelers ?? [],
          tickets: booking.tickets ?? [],
        }
      : null,
  };
}

export async function fetchTransactionStatus(
  transactionId: string,
): Promise<PaymentTransaction> {
  const data = await apiFetch<PaymentTransactionResponse>(
    `/payment/transaction/${transactionId}`,
  );

  return mapTransactionResponse(data, transactionId);
}

export async function confirmPayment(transactionId: string) {
  return apiFetch(`/admin/payments/${transactionId}/confirm`, {
    method: "POST",
  });
}

export async function cancelPayment(transactionId: string) {
  return apiFetch(`/admin/payments/${transactionId}/cancel`, {
    method: "POST",
  });
}
