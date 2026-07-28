import type { Metadata } from "next";
import { OrderDetailClient } from "@/features/account/components/OrderDetailClient";

export const metadata: Metadata = {
  title: "Order Details",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = await params;

  return <OrderDetailClient bookingId={bookingId} />;
}
