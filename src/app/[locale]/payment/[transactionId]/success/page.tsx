import PaymentSuccessClient from "./PaymentSuccess.client";

type PageProps = {
  params: Promise<{
    transactionId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { transactionId } = await params;

  if (!transactionId) {
    return <div>Transaction ID not found</div>;
  }

  return <PaymentSuccessClient transactionId={transactionId} />;
}
