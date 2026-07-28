import PaymentCancelClient from "./PaymentCancel.client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment canceled",
};

type PageProps = {
  params: Promise<{
    transactionId: string;
  }>;
};

export default async function PaymentCancelPage({ params }: PageProps) {
  const { transactionId } = await params;

  if (!transactionId) {
    return <div>Transaction ID not found</div>;
  }

  return <PaymentCancelClient transactionId={transactionId} />;
}
