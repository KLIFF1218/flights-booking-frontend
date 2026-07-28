import type { PaymentTransaction, PaymentUiPhase } from "../types/payment.types";

const TERMINAL_TRANSACTION_STATUSES = new Set(["SUCCEED", "FAILED", "CANCELED"]);
const TERMINAL_BOOKING_STATUSES = new Set([
  "TICKETED",
  "FAILED",
  "EXPIRED",
  "CANCELED",
]);

type PaymentPhaseTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

export function resolvePaymentUiPhase(
  transaction: PaymentTransaction | null | undefined,
): PaymentUiPhase {
  if (!transaction) {
    return "loading";
  }

  const txStatus = transaction.status;
  const bookingStatus = transaction.bookingStatus;

  if (txStatus === "FAILED") {
    return "payment_failed";
  }

  if (txStatus === "CANCELED") {
    return "payment_canceled";
  }

  if (bookingStatus === "FAILED") {
    return "booking_failed";
  }

  if (bookingStatus === "EXPIRED") {
    return "booking_expired";
  }

  if (bookingStatus === "CANCELED") {
    return "booking_canceled";
  }

  if (bookingStatus === "TICKETED") {
    return "ticketed";
  }

  if (
    txStatus === "SUCCEED" ||
    bookingStatus === "PAID" ||
    bookingStatus === "TICKETING"
  ) {
    return "ticketing";
  }

  if (
    txStatus === "PENDING" ||
    txStatus === "AUTHORIZED" ||
    bookingStatus === "PAYMENT_PENDING"
  ) {
    return "payment_pending";
  }

  return "payment_pending";
}

export function isTerminalPaymentPhase(phase: PaymentUiPhase): boolean {
  return (
    phase === "payment_failed" ||
    phase === "payment_canceled" ||
    phase === "ticketed" ||
    phase === "booking_failed" ||
    phase === "booking_expired" ||
    phase === "booking_canceled" ||
    phase === "error"
  );
}

export function shouldPollTransaction(
  transaction: PaymentTransaction | null | undefined,
): boolean {
  if (!transaction) {
    return true;
  }

  const phase = resolvePaymentUiPhase(transaction);

  if (isTerminalPaymentPhase(phase)) {
    return false;
  }

  if (TERMINAL_TRANSACTION_STATUSES.has(transaction.status)) {
    return transaction.bookingStatus !== "TICKETING";
  }

  if (
    transaction.bookingStatus &&
    TERMINAL_BOOKING_STATUSES.has(transaction.bookingStatus)
  ) {
    return false;
  }

  return true;
}

function getPhaseTranslationKey(phase: PaymentUiPhase): string {
  if (phase === "loading") {
    return "loading";
  }

  return phase;
}

export function getPaymentPhaseCopy(
  phase: PaymentUiPhase,
  t: PaymentPhaseTranslator,
): {
  title: string;
  subtitle: string;
} {
  const key = getPhaseTranslationKey(phase);

  return {
    title: t(`phases.${key}.title`),
    subtitle: t(`phases.${key}.subtitle`),
  };
}
