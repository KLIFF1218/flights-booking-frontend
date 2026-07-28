"use client";

import styles from "./FlightCard.module.css";
import clsx from "clsx";
import { useTranslations, useLocale } from "next-intl";

import {
  formatDuration,
  formatAirportArrivalDate,
  formatAirportArrivalTime,
  formatAirportDepartureDate,
  formatAirportDepartureTime,
} from "@/shared/utils/formatDate";
import { ChevronRight, Heart } from "lucide-react";

import { formatPrice } from "@/shared/utils/formatPrice";
import { formatTransfers } from "@/shared/utils/formatTransfers";
import { getCurrencySymbol } from "@/shared/utils/getCurrencySymbol";
import type { FlightCardResponse } from "@/shared/types/search-response";
import { formatCabinLabel } from "@/shared/utils/travel-class";
import {
  formatFlightNumberLabel,
  resolveSegmentAirlineCode,
  resolveSegmentAirlineName,
} from "@/shared/utils/airline-display";
import {
  getAirlineLogoUrl,
  handleAirlineLogoError,
} from "@/shared/utils/airline-logo";
import { useState, type CSSProperties } from "react";
import Image from "next/image";

interface Props {
  flights: FlightCardResponse[];
  searchId: string;
  onSelect: (args: { id: string; searchId: string }) => void;
  disabled?: boolean;
  sortBy?: string;
}

const LOW_SEATS_THRESHOLD = 20;

type SeatsHint = {
  text: string;
  urgent: boolean;
};

export function FlightCard({
  flights,
  searchId,
  onSelect,
  disabled = false,
  sortBy,
}: Props) {
  const t = useTranslations("results");
  const tSearch = useTranslations("search");
  const locale = useLocale();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  function formatSeatsHint(count: number): SeatsHint | null {
    if (count > LOW_SEATS_THRESHOLD) {
      return null;
    }

    if (count <= 1) {
      return { text: t("lastSeatLeft"), urgent: true };
    }

    return { text: t("seatsLeft", { count }), urgent: false };
  }

  function formatBaggageLabel(flight: FlightCardResponse): string {
    const cabin = formatCabinLabel(flight.cabin ?? "ECONOMY", (key) =>
      tSearch(key),
    );
    const bags = flight.checkedBags ?? 0;

    if (bags > 0) {
      return t(bags === 1 ? "baggageWithBags_one" : "baggageWithBags_other", {
        cabin,
        count: bags,
      });
    }

    return t("baggageNoChecked", { cabin });
  }

  function getBadge(sort?: string) {
    switch (sort) {
      case "cheapest":
        return { label: t("badgeCheapest"), type: "cheapest" as const };
      case "fastest":
        return { label: t("badgeFastest"), type: "default" as const };
      case "departure":
        return { label: t("badgeEarliestDeparture"), type: "default" as const };
      case "arrival":
        return { label: t("badgeEarliestArrival"), type: "default" as const };
      default:
        return null;
    }
  }

  if (!flights || flights.length === 0) {
    return (
      <div className={styles.results}>
        <div className={styles.empty}>{t("empty")}</div>
      </div>
    );
  }

  return (
    <main className={styles.resultsSection}>
      {flights.map((flight, index) => {
        const badge = index === 0 ? getBadge(sortBy) : null;
        const seatsHint = formatSeatsHint(
          flight.routes[0]?.availableSeats ?? 0,
        );
        const routeCount = flight.routes.length;

        return (
          <article
            key={flight.offerId}
            className={clsx(styles.ticketCard, disabled && styles.disabled)}
            onClick={() =>
              !disabled && onSelect({ id: flight.offerId, searchId })
            }
          >
            {badge && (
              <div
                className={clsx(
                  styles.badge,
                  badge.type === "cheapest" && styles.badgeGreen,
                )}
              >
                {badge.label}
              </div>
            )}

            <div
              className={styles.cardLayout}
              style={
                {
                  "--route-count": routeCount,
                } as CSSProperties
              }
            >
              {flight.routes.map((route, idx) => {
                const primarySegment = route.segments[0];
                const airlineCode =
                  route.airlineIata ??
                  primarySegment?.airlineIata ??
                  resolveSegmentAirlineCode(primarySegment);
                const airlineName = resolveSegmentAirlineName({
                  airlineName: primarySegment?.airline,
                  airline: route.airline,
                  airlineIata: airlineCode,
                });
                const flightNumber = formatFlightNumberLabel(
                  airlineCode,
                  primarySegment?.flightNumber,
                );

                return (
                  <div key={idx} className={styles.routeBlock}>
                    <div className={styles.airlineInfo}>
                      <Image
                        className={styles.airlineLogo}
                        src={getAirlineLogoUrl(airlineCode)}
                        alt={airlineName}
                        width={36}
                        height={36}
                        unoptimized
                        onError={handleAirlineLogoError}
                      />
                      <div className={styles.airlineText}>
                        <span className={styles.airlineName}>{airlineName}</span>
                        <span className={styles.flightNumber}>{flightNumber}</span>
                      </div>
                    </div>

                    <div className={styles.routeGrid}>
                      <div className={styles.timeBlock}>
                        <time className={styles.time}>
                          {formatAirportDepartureTime(route.departure, locale)}
                        </time>
                        <div className={styles.city}>{route.departure.airport}</div>
                        <div className={styles.metaLine}>
                          {formatAirportDepartureDate(route.departure, locale)}
                        </div>
                      </div>

                      <div className={styles.pathContainer}>
                        <div className={styles.pathMeta}>
                          {formatDuration(route.durationMinutes, locale)} ·{" "}
                          {formatTransfers(route.stops, t)}
                        </div>
                        <div className={styles.pathVisual}>
                          <div className={styles.pathLine} />
                          {route.segments.length > 1 &&
                            route.segments.slice(0, -1).map((seg, segIndex) => (
                              <span key={segIndex} className={styles.transferDot}>
                                {seg.to}
                              </span>
                            ))}
                        </div>
                      </div>

                      <div
                        className={clsx(styles.timeBlock, styles.timeBlockArrival)}
                      >
                        <time className={styles.time}>
                          {formatAirportArrivalTime(route.arrival, route.to, locale)}
                        </time>
                        <div className={styles.city}>{route.arrival.airport}</div>
                        <div className={styles.metaLine}>
                          {formatAirportArrivalDate(route.arrival, route.to, locale)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className={styles.priceColumn}>
                <div className={styles.priceHeader}>
                  <h3 className={styles.price}>
                    {formatPrice(flight.price.total, locale)}{" "}
                    <span className={styles.currency}>
                      {getCurrencySymbol(flight.price.currency)}
                    </span>
                  </h3>

                  <button
                    type="button"
                    className={clsx(
                      styles.favoriteBtn,
                      favorites[flight.offerId] && styles.favoriteActive,
                    )}
                    aria-label={t("addToFavorites")}
                    onClick={(event) => {
                      event.stopPropagation();
                      setFavorites((prev) => ({
                        ...prev,
                        [flight.offerId]: !prev[flight.offerId],
                      }));
                    }}
                  >
                    <Heart
                      size={18}
                      strokeWidth={2}
                      fill={favorites[flight.offerId] ? "#ef4444" : "none"}
                      color={favorites[flight.offerId] ? "#ef4444" : "#6b7280"}
                    />
                  </button>
                </div>

                <div className={styles.baggage}>{formatBaggageLabel(flight)}</div>

                <p className={styles.indicativeLabel}>{t("indicativePrice")}</p>

                <div className={styles.selectBtn} aria-hidden>
                  {t("selectFlight")}
                  <ChevronRight size={16} strokeWidth={2.5} aria-hidden />
                </div>
              </div>
            </div>

            {(seatsHint || routeCount > 1) && (
              <footer className={styles.cardFooter}>
                {seatsHint && (
                  <span
                    className={clsx(
                      styles.seatsHint,
                      seatsHint.urgent && styles.seatsHintUrgent,
                    )}
                  >
                    {seatsHint.text}
                  </span>
                )}
                {routeCount > 1 && (
                  <span className={styles.totalDuration}>
                    {t("totalTravelTime", {
                      duration: formatDuration(flight.totalDurationMinutes, locale),
                    })}
                  </span>
                )}
              </footer>
            )}
          </article>
        );
      })}
    </main>
  );
}
