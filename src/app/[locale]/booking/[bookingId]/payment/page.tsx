import { PaymentPendingView } from "@/features/payments/components/PaymentPendingView";

type PageProps = {
  params: Promise<{
    bookingId: string;
  }>;
};

export default async function BookingPaymentPage({ params }: PageProps) {
  const { bookingId } = await params;

  return <PaymentPendingView bookingId={bookingId} />;
}
