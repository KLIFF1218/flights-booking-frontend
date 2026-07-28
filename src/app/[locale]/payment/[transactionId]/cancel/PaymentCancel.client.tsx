"use client";

import { PaymentCanceledView } from "@/features/payments/components/PaymentCanceledView";

type Props = {
  transactionId: string;
};

export default function PaymentCancelClient({ transactionId }: Props) {
  return <PaymentCanceledView transactionId={transactionId} />;
}
