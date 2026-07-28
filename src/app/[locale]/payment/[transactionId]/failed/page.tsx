import PaymentFailedClient from "./PaymentFailed.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment failed",
};

type PageProps = {
  params: Promise<{
    transactionId: string;
  }>;
};

export default async function PaymentFailedPage({ params }: PageProps) {
  const { transactionId } = await params;

  if (!transactionId) {
    return <div>Transaction ID not found</div>;
  }

  return <PaymentFailedClient transactionId={transactionId} />;
}
