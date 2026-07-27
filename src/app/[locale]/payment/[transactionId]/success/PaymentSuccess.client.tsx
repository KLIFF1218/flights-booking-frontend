"use client";

import { PaymentStatusView } from "@/features/payments/components/PaymentStatusView";

type Props = {
  transactionId: string;
};

export default function PaymentSuccessClient({ transactionId }: Props) {
  return <PaymentStatusView transactionId={transactionId} />;
}
