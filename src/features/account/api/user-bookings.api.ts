import { apiFetch } from "@/shared/api/apiClient";
import type {
  UserBooking,
  UserBookingsPageResponse,
  UserBookingsResult,
} from "@/features/account/types/user-booking.types";

const MAX_PAGES = 10;

export async function fetchUserBookingsPage(
  page = 1,
  limit = 50,
): Promise<UserBookingsPageResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiFetch<UserBookingsPageResponse>(`/booking?${query.toString()}`);
}

export async function fetchAllUserBookings(): Promise<UserBookingsResult> {
  const first = await fetchUserBookingsPage(1, 50);
  const bookings: UserBooking[] = [...first.bookings];

  const pagesToFetch = Math.min(first.totalPages, MAX_PAGES);
  for (let page = 2; page <= pagesToFetch; page += 1) {
    const next = await fetchUserBookingsPage(page, 50);
    bookings.push(...next.bookings);
  }

  return { bookings, total: first.total };
}

export async function cancelUserBooking(bookingId: string): Promise<void> {
  await apiFetch(`/booking/${bookingId}/cancel`, { method: "POST" });
}

export type ResumeBookingPaymentResponse = {
  paymentRedirectUrl: string;
  transactionId: string;
  expiresAt: string;
};

export async function resumeBookingPayment(
  bookingId: string,
): Promise<ResumeBookingPaymentResponse> {
  return apiFetch<ResumeBookingPaymentResponse>(
    `/booking/${bookingId}/payment/resume`,
    { method: "POST" },
  );
}
