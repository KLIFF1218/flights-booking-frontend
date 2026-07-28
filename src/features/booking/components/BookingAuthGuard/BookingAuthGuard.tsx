"use client";

import { useTranslations } from "next-intl";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";

type Props = {
  children: React.ReactNode;
};

export function BookingAuthGuard({ children }: Props) {
  const { isChecking, isReady } = useRequireAuth();
  const t = useTranslations("booking");

  if (isChecking) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">{t("preparingCheckout")}</p>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
