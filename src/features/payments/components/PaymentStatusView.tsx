"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  Plane,
  Ticket,
  User,
  XCircle,
} from "lucide-react";

import {
  formatAirlineLabel,
  formatFlightNumberLabel,
  resolveSegmentAirlineCode,
  resolveSegmentAirlineName,
} from "@/shared/utils/airline-display";
import {
  getAirlineLogoUrl,
  handleAirlineLogoError,
} from "@/shared/utils/airline-logo";
import { useAuthStore } from "@/lib/auth-store";
import { useTransactionStatus } from "@/features/payments/hooks/useTransactionStatus";
import {
  extractCabinClass,
  extractFlightSegments,
} from "@/features/payments/lib/booking-snapshot";
import {
  getPaymentPhaseCopy,
  resolvePaymentUiPhase,
} from "@/features/payments/lib/payment-status";
import { getBookingPaymentPath } from "@/features/account/lib/booking-navigation";
import type { PaymentUiPhase } from "@/features/payments/types/payment.types";
import {
  downloadTicketFromUrl,
  getTicketPreviewUrl,
} from "@/features/payments/lib/ticket-download";
import styles from "@/app/[locale]/payment/[transactionId]/success/success.module.css";

type Props = {
  transactionId: string;
};

function PhaseIcon({ phase }: { phase: PaymentUiPhase }) {
  if (phase === "ticketed") {
    return <CheckCircle2 size={34} />;
  }

  if (
    phase === "payment_failed" ||
    phase === "booking_failed" ||
    phase === "error"
  ) {
    return <XCircle size={34} />;
  }

  if (
    phase === "payment_canceled" ||
    phase === "booking_canceled" ||
    phase === "booking_expired" ||
    phase === "auth_required"
  ) {
    return <AlertCircle size={34} />;
  }

  return <Clock3 size={34} />;
}

function heroClassName(phase: PaymentUiPhase): string {
  if (phase === "ticketed") {
    return styles.successIcon;
  }

  if (
    phase === "payment_failed" ||
    phase === "booking_failed" ||
    phase === "error"
  ) {
    return styles.errorIcon;
  }

  if (
    phase === "payment_canceled" ||
    phase === "booking_canceled" ||
    phase === "booking_expired" ||
    phase === "auth_required"
  ) {
    return styles.warningIcon;
  }

  return styles.pendingIcon;
}

function getLoadingCopy(
  authChecked: boolean,
  isLoadingAuth: boolean,
  t: ReturnType<typeof useTranslations<"payment">>,
): { title: string; message: string; hint?: string } {
  if (!authChecked || isLoadingAuth) {
    return {
      title: t("phases.loading.title"),
      message: t("phases.loading.subtitle"),
    };
  }

  return {
    title: t("loadingPaymentTitle"),
    message: t("loadingPaymentMessage"),
    hint: t("loadingPaymentHint"),
  };
}

export function PaymentStatusView({ transactionId }: Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("payment");
  const tCommon = useTranslations("common");
  const authChecked = useAuthStore((state) => state.authChecked);
  const isAuthorized = useAuthStore((state) => state.isAuthorized);
  const isLoadingAuth = useAuthStore((state) => state.isLoading);

  const canFetchStatus = authChecked && isAuthorized && Boolean(transactionId);

  const { transaction, loading, error, isFetching } = useTransactionStatus(
    transactionId,
    {
      enabled: canFetchStatus,
    },
  );

  const phase = useMemo((): PaymentUiPhase => {
    if (!authChecked || isLoadingAuth) {
      return "loading";
    }

    if (!isAuthorized) {
      return "auth_required";
    }

    if (error) {
      return "error";
    }

    if (loading && !transaction) {
      return "loading";
    }

    return resolvePaymentUiPhase(transaction);
  }, [
    authChecked,
    error,
    isAuthorized,
    isLoadingAuth,
    loading,
    transaction,
  ]);

  const copy = getPaymentPhaseCopy(phase, t);
  const booking = transaction?.booking ?? null;
  const snapshot = booking?.snapshot ?? null;
  const segments = useMemo(() => extractFlightSegments(snapshot), [snapshot]);
  const cabin = useMemo(() => extractCabinClass(snapshot), [snapshot]);
  const travelers = booking?.travelers ?? [];
  const tickets = booking?.tickets ?? [];
  const showFlightDetails =
    phase === "ticketed" ||
    phase === "ticketing" ||
    phase === "payment_pending";
  const showTickets = phase === "ticketed" || phase === "ticketing";

  const returnPath =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : `/payment/${transactionId}/success`;

  if (phase === "loading") {
    const loadingCopy = getLoadingCopy(authChecked, isLoadingAuth, t);

    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.loadingBox}>
            <div className={styles.loadingRow}>
              <div className={styles.spinner} />
              <div>
                <div className={styles.loadingTitle}>{loadingCopy.title}</div>
                <div className={styles.loadingMessage}>{loadingCopy.message}</div>
              </div>
            </div>
            {loadingCopy.hint ? (
              <p className={styles.loadingHint}>{loadingCopy.hint}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (phase === "auth_required") {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.hero}>
            <div className={styles.heroLeft}>
              <div className={heroClassName(phase)}>
                <PhaseIcon phase={phase} />
              </div>
              <div>
                <div className={styles.heroTitle}>{copy.title}</div>
                <div className={styles.heroSubtitle}>{copy.subtitle}</div>
              </div>
            </div>
          </div>

          <div className={styles.authBox}>
            <p className={styles.authText}>{t("authText")}</p>
            <button
              type="button"
              className={styles.primaryBigButton}
              onClick={() =>
                router.push(
                  `/auth/login?returnUrl=${encodeURIComponent(returnPath)}`,
                )
              }
            >
              {tCommon("signIn")}
            </button>
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
            <div className={heroClassName(phase)}>
              <PhaseIcon phase={phase} />
            </div>

            <div>
              <div className={styles.heroTitle}>{copy.title}</div>
              <div className={styles.heroSubtitle}>{copy.subtitle}</div>
              {isFetching && phase === "payment_pending" ? (
                <p className={styles.refreshHint}>{t("refreshingStatus")}</p>
              ) : null}
            </div>
          </div>

          {booking?.pnr && showFlightDetails ? (
            <div className={styles.heroPnr}>
              <div className={styles.heroPnrLabel}>{t("pnr")}</div>
              <div className={styles.heroPnrValue}>{booking.pnr}</div>
            </div>
          ) : null}
        </div>

        {showFlightDetails ? (
          <div className={styles.statusTimeline}>
            <div
              className={
                phase === "payment_pending"
                  ? styles.timelineItemPending
                  : styles.timelineItemActive
              }
            >
              {phase === "payment_pending" ? (
                <Clock3 size={16} />
              ) : (
                <CheckCircle2 size={16} />
              )}
              {t("timelinePayment")}
            </div>

            <div className={styles.timelineDivider} />

            <div
              className={
                phase === "ticketing" || phase === "ticketed"
                  ? styles.timelineItemActive
                  : styles.timelineItemPending
              }
            >
              {phase === "ticketing" || phase === "ticketed" ? (
                <CheckCircle2 size={16} />
              ) : (
                <Clock3 size={16} />
              )}
              {t("timelineBooking")}
            </div>

            <div className={styles.timelineDivider} />

            <div
              className={
                phase === "ticketed"
                  ? styles.timelineItemActive
                  : styles.timelineItemPending
              }
            >
              {phase === "ticketed" ? (
                <CheckCircle2 size={16} />
              ) : (
                <Clock3 size={16} />
              )}
              {phase === "ticketed"
                ? t("timelineTicketIssued")
                : t("timelineIssuingTicket")}
            </div>
          </div>
        ) : null}

        {error ? <div className={styles.error}>{error.message}</div> : null}

        {!loading && !error && showFlightDetails && segments.length > 0 ? (
          <>
            {segments.map((segment, index) => {
              const airlineCode = resolveSegmentAirlineCode(segment);
              const airlineName = resolveSegmentAirlineName(segment);
              const airlineLogo = getAirlineLogoUrl(airlineCode);

              return (
                <div key={`${segment.id ?? index}`} className={styles.flightCard}>
                  <div className={styles.flightTop}>
                    <div className={styles.airlineBlock}>
                      <Image
                        src={airlineLogo}
                        alt={airlineName}
                        width={48}
                        height={48}
                        className={styles.airlineLogo}
                        unoptimized
                        onError={handleAirlineLogoError}
                      />

                      <div>
                        <div className={styles.airlineName}>
                          {formatAirlineLabel(airlineName, airlineCode)}
                        </div>
                        <div className={styles.airlineClass}>
                          {formatFlightNumberLabel(airlineCode, segment?.number)}
                          {index === 0 && cabin ? ` · ${cabin}` : ""}
                        </div>
                      </div>
                    </div>

                    <div className={styles.routeDate}>
                      {segment?.departure?.at
                        ? new Date(segment.departure.at).toLocaleDateString(
                            locale,
                            {
                              day: "numeric",
                              month: "long",
                            },
                          )
                        : "—"}
                    </div>
                  </div>

                  <div className={styles.route}>
                    <div className={styles.airport}>
                      <div className={styles.airportCode}>
                        {segment?.departure?.iataCode}
                      </div>
                      <div className={styles.airportTime}>
                        {segment?.departure?.at
                          ? new Date(segment.departure.at).toLocaleTimeString(
                              locale,
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "—"}
                      </div>
                    </div>

                    <div className={styles.routeCenter}>
                      <div className={styles.routeLine} />
                      <Plane size={18} className={styles.routePlane} />
                    </div>

                    <div className={styles.airport}>
                      <div className={styles.airportCode}>
                        {segment?.arrival?.iataCode}
                      </div>
                      <div className={styles.airportTime}>
                        {segment?.arrival?.at
                          ? new Date(segment.arrival.at).toLocaleTimeString(
                              locale,
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className={styles.section}>
              <div className={styles.sectionTitle}>{t("passengers")}</div>

              <div className={styles.passengerGrid}>
                {travelers.map((traveler) => {
                  const ticket = tickets.find(
                    (item) => item.travelerId === traveler.id,
                  );
                  const previewUrl = ticket
                    ? getTicketPreviewUrl(ticket)
                    : null;

                  return (
                    <div key={traveler.id} className={styles.passengerCard}>
                      <div className={styles.passengerTop}>
                        <div className={styles.passengerIcon}>
                          <User size={18} />
                        </div>

                        <div>
                          <div className={styles.passengerName}>
                            {traveler.firstName} {traveler.lastName}
                          </div>
                          <div className={styles.passengerSeat}>
                            {t("seat", { seat: traveler.seatNumber ?? "—" })}
                          </div>
                        </div>
                      </div>

                      {showTickets && ticket && previewUrl ? (
                        <>
                          <div className={styles.ticketNumber}>
                            <Ticket size={15} />
                            {ticket.ticketNumber}
                          </div>

                          <div className={styles.ticketActions}>
                            <button
                              type="button"
                              className={styles.primaryButton}
                              onClick={() => window.open(previewUrl, "_blank")}
                            >
                              <ExternalLink size={16} />
                              {t("open")}
                            </button>

                            {ticket.downloadUrl ? (
                              <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() =>
                                  downloadTicketFromUrl(
                                    ticket.downloadUrl!,
                                    ticket.ticketNumber,
                                  ).catch(() => alert(t("downloadFailed")))
                                }
                              >
                                <Download size={16} />
                                {t("download")}
                              </button>
                            ) : null}
                          </div>
                        </>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}

        <div className={styles.bottomBar}>
          {phase === "payment_pending" && booking?.id ? (
            <button
              type="button"
              className={styles.primaryBigButton}
              onClick={() => router.push(getBookingPaymentPath(booking.id))}
            >
              {t("continuePayment")}
            </button>
          ) : phase === "payment_canceled" ||
            phase === "payment_failed" ||
            phase === "booking_expired" ? (
            <>
              {booking?.id ? (
                <button
                  type="button"
                  className={styles.primaryBigButton}
                  onClick={() => router.push(getBookingPaymentPath(booking.id))}
                >
                  {t("tryPaymentAgain")}
                </button>
              ) : null}
              <button
                type="button"
                className={styles.secondaryBigButton}
                onClick={() => router.push("/search")}
              >
                {t("searchFlights")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className={styles.primaryBigButton}
              onClick={() => router.push("/my/orders")}
            >
              {t("myBookings")}
            </button>
          )}

          {phase !== "payment_canceled" &&
          phase !== "payment_failed" &&
          phase !== "booking_expired" ? (
            <button
              type="button"
              className={styles.secondaryBigButton}
              onClick={() => router.push("/")}
            >
              {tCommon("home")}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
