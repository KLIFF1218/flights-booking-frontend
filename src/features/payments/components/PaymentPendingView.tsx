"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AlertCircle, Clock3 } from "lucide-react";
import { useRequireAuth } from "@/features/auth/hooks/useRequireAuth";
import { resumeBookingPayment } from "@/features/account/api/user-bookings.api";
import { useCancelBooking } from "@/features/account/hooks/useCancelBooking";
import { getCancelBookingCopy } from "@/features/account/lib/booking-navigation";
import { getBooking } from "@/features/booking/api/booking.api";
import { useBookingStatusGuard } from "@/features/booking/hooks/useBookingStatusGuard";
import { fetchTransactionStatus } from "@/features/payments/api/payments.api";
import { resolvePaymentUiPhase } from "@/features/payments/lib/payment-status";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import styles from "@/app/[locale]/payment/[transactionId]/success/success.module.css";

type Props = {
  bookingId: string;
};

function formatCountdown(
  expiresAt: Date | null,
  t: ReturnType<typeof useTranslations<"payment.pending">>,
): string | null {
  if (!expiresAt) {
    return null;
  }

  const diffMs = expiresAt.getTime() - Date.now();
  if (diffMs <= 0) {
    return t("expired");
  }

  const totalMinutes = Math.ceil(diffMs / 60_000);
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return t("countdownHours", { hours, minutes });
  }

  return t("countdownMinutes", { count: totalMinutes });
}

function isPaymentWindowExpiredMessage(message: string): boolean {
  return message.toLowerCase().includes("payment window has expired");
}

export function PaymentPendingView({ bookingId }: Props) {
  const router = useRouter();
  const t = useTranslations("payment");
  const tPending = useTranslations("payment.pending");
  const tCancel = useTranslations("orders.cancel");
  const tActions = useTranslations("orders.actions");
  const { isChecking, isReady } = useRequireAuth();
  const { isRouting } = useBookingStatusGuard(bookingId, "payment");
  const cancelMutation = useCancelBooking();
  const cancelCopy = getCancelBookingCopy("PAYMENT_PENDING", tCancel);

  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [pnr, setPnr] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);

  const loadPaymentState = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const booking = await getBooking(bookingId);

      const txId = booking.transaction?.id;
      if (!txId) {
        setError(tPending("sessionNotFound"));
        return;
      }

      setTransactionId(txId);

      if (booking.transaction?.paymentExpiresAt) {
        setExpiresAt(new Date(booking.transaction.paymentExpiresAt));
      }

      const transaction = await fetchTransactionStatus(txId);
      const phase = resolvePaymentUiPhase(transaction);

      if (phase === "ticketed" || phase === "ticketing") {
        router.replace(`/payment/${txId}/success`);
        return;
      }

      if (
        phase === "booking_expired" ||
        phase === "booking_canceled" ||
        phase === "payment_canceled"
      ) {
        setError(tPending("sessionInactive"));
        return;
      }

      setPnr(transaction.booking?.pnr ?? null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : tPending("loadFailed"),
      );
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, router, tPending]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void loadPaymentState();
  }, [isReady, loadPaymentState]);

  useEffect(() => {
    if (!expiresAt) {
      return;
    }

    const updateCountdown = () => {
      setCountdown(formatCountdown(expiresAt, tPending));
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 30_000);
    return () => window.clearInterval(timer);
  }, [expiresAt, tPending]);

  const isExpired = useMemo(() => {
    if (!expiresAt) {
      return false;
    }

    return expiresAt.getTime() <= Date.now();
  }, [expiresAt, countdown]);

  const handlePay = async () => {
    setIsPaying(true);
    setError(null);

    try {
      const payment = await resumeBookingPayment(bookingId);
      setExpiresAt(new Date(payment.expiresAt));
      setTransactionId(payment.transactionId);
      window.location.href = payment.paymentRedirectUrl;
    } catch (payError) {
      const message =
        payError instanceof Error ? payError.message : tPending("startFailed");

      if (isPaymentWindowExpiredMessage(message)) {
        router.replace("/search");
        return;
      }

      setError(message);
      setIsPaying(false);
    }
  };

  const handleCancel = async () => {
    setCancelError(null);

    try {
      await cancelMutation.mutateAsync(bookingId);
      setCancelOpen(false);
      router.push("/my/orders");
    } catch (cancelErr) {
      setCancelError(
        cancelErr instanceof Error
          ? cancelErr.message
          : tActions("cancelFailed"),
      );
    }
  };

  if (isChecking || !isReady || isRouting) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loadingBox}>
            <div className={styles.spinner} />
            <div>{tPending("preparingPage")}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.hero}>
            <div className={styles.heroLeft}>
              <div className={styles.pendingIcon}>
                <Clock3 size={34} />
              </div>

              <div>
                <div className={styles.heroTitle}>{tPending("title")}</div>
                <div className={styles.heroSubtitle}>{tPending("subtitle")}</div>
              </div>
            </div>

            {pnr ? (
              <div className={styles.heroPnr}>
                <div className={styles.heroPnrLabel}>{t("pnr")}</div>
                <div className={styles.heroPnrValue}>{pnr}</div>
              </div>
            ) : null}
          </div>

          {isLoading ? (
            <div className={styles.loadingBox}>
              <div className={styles.spinner} />
              <div>{tPending("loadingDetails")}</div>
            </div>
          ) : null}

          {!isLoading && countdown ? (
            <div className={styles.detailCard}>
              <div className={styles.detailLabel}>{tPending("timeLeft")}</div>
              <div className={styles.detailValue}>{countdown}</div>
            </div>
          ) : null}

          {!isLoading && isExpired ? (
            <p className={styles.error} role="status">
              {tPending("windowEnded")}
            </p>
          ) : null}

          {error ? (
            <div className={styles.error} role="alert">
              <AlertCircle size={16} className="inline mr-2" />
              {error}
            </div>
          ) : null}

          {transactionId ? (
            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>{t("transaction")}</div>
                <div className={styles.detailValue}>{transactionId}</div>
              </div>
            </div>
          ) : null}

          <div className={styles.bottomBar}>
            {!isExpired ? (
              <button
                type="button"
                className={styles.primaryBigButton}
                onClick={() => void handlePay()}
                disabled={isLoading || isPaying}
              >
                {isPaying
                  ? tPending("redirecting")
                  : tPending("continueToPayment")}
              </button>
            ) : (
              <button
                type="button"
                className={styles.primaryBigButton}
                onClick={() => router.push("/search")}
              >
                {t("searchFlights")}
              </button>
            )}

            {!isExpired ? (
              <button
                type="button"
                className={styles.secondaryBigButton}
                onClick={() => {
                  setCancelError(null);
                  setCancelOpen(true);
                }}
                disabled={cancelMutation.isPending}
              >
                {tPending("cancelBooking")}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title={cancelCopy.title}
        description={cancelCopy.description}
        confirmLabel={tPending("cancelBooking")}
        cancelLabel={tPending("keepBooking")}
        isLoading={cancelMutation.isPending}
        error={cancelError}
        onConfirm={handleCancel}
        destructive
      />
    </>
  );
}
