import { Suspense } from "react";
import type { Metadata } from "next";
import { OrdersPageClient } from "./OrdersPageClient";

export const metadata: Metadata = {
  title: "My Orders",
};

function OrdersLoading() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
      <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-gray-600 text-sm sm:text-base">Loading...</p>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<OrdersLoading />}>
      <OrdersPageClient />
    </Suspense>
  );
}
