"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  ExternalLink,
  Plane,
  Ticket,
  User,
} from "lucide-react";

import { apiFetch } from "@/shared/api/apiClient";
import styles from "./success.module.css";

type Props = {
  transactionId: string;
};

type TicketItem = {
  id: string;
  travelerId: string;
  ticketNumber: string;
  status: string;
  previewUrl: string;
  downloadUrl: string;
};

export default function PaymentSuccessClient({ transactionId }: Props) {
  const router = useRouter();

  const [status, setStatus] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [booking, setBooking] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchStatus() {
    try {
      const data = await apiFetch<any>(`/payment/transaction/${transactionId}`);

      setStatus(data.bookingStatus ?? data.status ?? null);

      setBookingId(data.bookingId ?? null);

      const snap =
        typeof data.booking?.snapshot === "string"
          ? JSON.parse(data.booking.snapshot)
          : data.booking?.snapshot;

      setBooking({
        ...data.booking,
        snapshot: snap,
      });

      if (data.bookingStatus === "TICKETED" && intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();

    intervalRef.current = setInterval(fetchStatus, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [transactionId]);

  const segment = useMemo(() => {
    return booking?.snapshot?.flightOffers?.[0]?.itineraries?.[0]
      ?.segments?.[0];
  }, [booking]);

  const travelers = useMemo(() => {
    return booking?.travelers ?? [];
  }, [booking]);

  const tickets: TicketItem[] = booking?.tickets ?? [];

  const airlineLogo = segment?.carrierCode
    ? `https://content.airhex.com/content/logos/airlines_${segment.carrierCode}_200_200_s.png`
    : null;

  function copy(text: string) {
    navigator.clipboard.writeText(text);
  }

  async function downloadTicket(url: string, fileName: string) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = blobUrl;
      link.download = `${fileName}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      alert("Не удалось скачать билет");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.successIcon}>
              <CheckCircle2 size={34} />
            </div>

            <div>
              <div className={styles.heroTitle}>Оплата завершена</div>

              <div className={styles.heroSubtitle}>
                Ваше бронирование подтверждено
              </div>
            </div>
          </div>

          {booking?.pnr && (
            <div className={styles.heroPnr}>
              <div className={styles.heroPnrLabel}>PNR</div>

              <div className={styles.heroPnrValue}>{booking.pnr}</div>
            </div>
          )}
        </div>

        <div className={styles.statusTimeline}>
          <div className={styles.timelineItemActive}>
            <CheckCircle2 size={16} />
            Оплата
          </div>

          <div className={styles.timelineDivider} />

          <div className={styles.timelineItemActive}>
            <CheckCircle2 size={16} />
            Бронь
          </div>

          <div className={styles.timelineDivider} />

          <div
            className={
              status === "TICKETED"
                ? styles.timelineItemActive
                : styles.timelineItemPending
            }
          >
            {status === "TICKETED" ? (
              <CheckCircle2 size={16} />
            ) : (
              <Clock3 size={16} />
            )}

            {status === "TICKETED" ? "Билет выпущен" : "Выпуск билета"}
          </div>
        </div>

        {loading && (
          <div className={styles.loadingBox}>
            <div className={styles.spinner}></div>

            <div>Проверяем статус оформления билета...</div>
          </div>
        )}

        {!loading && error && <div className={styles.error}>{error}</div>}

        {!loading && !error && (
          <>
            <div className={styles.flightCard}>
              <div className={styles.flightTop}>
                <div className={styles.airlineBlock}>
                  {airlineLogo && (
                    <img
                      src={airlineLogo}
                      alt="airline"
                      className={styles.airlineLogo}
                    />
                  )}

                  <div>
                    <div className={styles.airlineName}>
                      {segment?.carrierCode}
                      {segment?.number}
                    </div>

                    <div className={styles.airlineClass}>
                      {
                        booking?.snapshot?.flightOffers?.[0]
                          ?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]
                          ?.cabin
                      }
                    </div>
                  </div>
                </div>

                <div className={styles.routeDate}>
                  {segment?.departure?.at
                    ? new Date(segment.departure.at).toLocaleDateString(
                        "ru-RU",
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
                          "ru-RU",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "—"}
                  </div>
                </div>

                <div className={styles.routeCenter}>
                  <div className={styles.routeLine}></div>

                  <Plane size={18} className={styles.routePlane} />
                </div>

                <div className={styles.airport}>
                  <div className={styles.airportCode}>
                    {segment?.arrival?.iataCode}
                  </div>

                  <div className={styles.airportTime}>
                    {segment?.arrival?.at
                      ? new Date(segment.arrival.at).toLocaleTimeString(
                          "ru-RU",
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

            <div className={styles.section}>
              <div className={styles.sectionTitle}>Пассажиры</div>

              <div className={styles.passengerGrid}>
                {travelers.map((traveler: any) => {
                  const ticket = tickets.find(
                    (t) => t.travelerId === traveler.id,
                  );

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
                            Seat {traveler.seatNumber ?? "—"}
                          </div>
                        </div>
                      </div>

                      {ticket && (
                        <>
                          <div className={styles.ticketNumber}>
                            <Ticket size={15} />

                            {ticket.ticketNumber}
                          </div>

                          <div className={styles.ticketActions}>
                            <button
                              className={styles.primaryButton}
                              onClick={() =>
                                window.open(ticket.previewUrl, "_blank")
                              }
                            >
                              <ExternalLink size={16} />
                              Открыть
                            </button>

                            <button
                              className={styles.secondaryButton}
                              onClick={() =>
                                downloadTicket(
                                  ticket.downloadUrl,
                                  ticket.ticketNumber,
                                )
                              }
                            >
                              <Download size={16} />
                              Скачать
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <div className={styles.detailLabel}>Transaction</div>

                <div className={styles.detailValue}>{transactionId}</div>

                <button
                  className={styles.copyButton}
                  onClick={() => copy(transactionId)}
                >
                  <Copy size={14} />
                </button>
              </div>

              {booking?.pnr && (
                <div className={styles.detailCard}>
                  <div className={styles.detailLabel}>PNR</div>

                  <div className={styles.detailValue}>{booking.pnr}</div>

                  <button
                    className={styles.copyButton}
                    onClick={() => copy(booking.pnr)}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        <div className={styles.bottomBar}>
          <button
            className={styles.primaryBigButton}
            onClick={() => router.push("/my/orders")}
          >
            Мои бронирования
          </button>

          <button
            className={styles.secondaryBigButton}
            onClick={() => router.push("/")}
          >
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}
