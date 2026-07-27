"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AlertCircle } from "lucide-react";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";
import { fetchTransactionStatus } from "@/features/payments/api/payments.api";
import { getBookingPaymentPath } from "@/features/account/lib/booking-navigation";
import styles from "@/app/[locale]/payment/[transactionId]/success/success.module.css";

type Props = {
  transactionId: string;
};

export function PaymentCanceledView({ transactionId }: Props) {
  const router = useRouter();
  const t = useTranslations("payment");
  const tCanceled = useTranslations("payment.canceled");
  const { isChecking, isReady } = useRequireAuth();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    let cancelled = false;

    async function loadTransaction() {
      try {
        const transaction = await fetchTransactionStatus(transactionId);
        if (!cancelled) {
          setBookingId(transaction.bookingId || transaction.booking?.id || null);
        }
      } catch {
        if (!cancelled) {
          setBookingId(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTransaction();

    return () => {
      cancelled = true;
    };
  }, [isReady, transactionId]);

  if (isChecking || !isReady) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loadingBox}>
            <div className={styles.spinner} />
            <div>{tCanceled("preparingPage")}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.warningIcon}>
              <AlertCircle size={34} />
            </div>

            <div>
              <div className={styles.heroTitle}>{tCanceled("title")}</div>
              <div className={styles.heroSubtitle}>{tCanceled("subtitle")}</div>
            </div>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <div className={styles.detailLabel}>{t("transaction")}</div>
            <div className={styles.detailValue}>{transactionId}</div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          {bookingId ? (
            <button
              type="button"
              className={styles.primaryBigButton}
              onClick={() => router.push(getBookingPaymentPath(bookingId))}
              disabled={isLoading}
            >
              {t("continuePayment")}
            </button>
          ) : null}

          <button
            type="button"
            className={styles.secondaryBigButton}
            onClick={() => router.push("/my/orders")}
          >
            {t("myBookings")}
          </button>

          <button
            type="button"
            className={styles.secondaryBigButton}
            onClick={() => router.push("/search")}
          >
            {t("searchFlights")}
          </button>
        </div>
      </div>
    </div>
  );
}
