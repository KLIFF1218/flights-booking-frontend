"use client";

import styles from "./FlightCard.module.css";
import clsx from "clsx";

import {
  formatDuration,
  formatTime,
  formatDate,
} from "@/shared/utils/formatDate";
import { Heart } from "lucide-react";

import { formatPrice } from "@/shared/utils/formatPrice";
import { formatTransfers } from "@/shared/utils/formatTransfers";
import { getCurrencySymbol } from "@/shared/utils/getCurrencySymbol";
import type { FlightCardResponse } from "@/shared/types/search-response";
import { useState } from "react";
import Image from "next/image";

interface Props {
  flights: FlightCardResponse[];
  searchId: string;
  onSelect: (args: { id: string; searchId: string }) => void;
  disabled?: boolean;
  sortBy?: string;
}

export function FlightCard({
  flights,
  searchId,
  onSelect,
  disabled = false,
  sortBy
}: Props) {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  if (!flights || flights.length === 0) {
    return (
      <div className={styles.results}>
        <div className={styles.empty}>Ничего не найдено</div>
      </div>
    );
  }

  function getBadge(sortBy?: string) {
  switch (sortBy) {
    case "cheapest":
      return { label: "Самый дешёвый", type: "cheapest" };
    case "fastest":
      return { label: "Самый быстрый", type: "default" };
    case "departure":
      return { label: "Ранний вылет", type: "default" };
    case "arrival":
      return { label: "Ранний прилёт", type: "default" };
    default:
      return null;
  }
}

  return (
    <main className={styles.resultsSection}>
      {flights.map((flight, index) => {
      const badge = index === 0 ? getBadge(sortBy) : null;
      return (
        <article
          key={flight.offerId}
          className={clsx(styles.ticketCard, disabled && styles.disabled)}
          onClick={() =>
            !disabled && onSelect({ id: flight.offerId, searchId })
          }
        >{badge && (
        <div
          className={clsx(
            styles.badge,
            badge.type === "cheapest" && styles.badgeGreen
          )}
        >
          {badge.label}
        </div>
      )}
          <header className={styles.cardHeader}>
            <div className={styles.leftHeader}>
              <p className={styles.seats}>
                {flight.routes[0].availableSeats} мест доступно
              </p>

              <h3 className={styles.price}>
                {formatPrice(flight.price.total)}{" "}
                {getCurrencySymbol(flight.price.currency)}
              </h3>

              <div className={styles.baggage}>Багаж включен</div>
            </div>

            <button
              className={clsx(
                styles.favoriteBtn,
                favorites[flight.offerId] && styles.active,
              )}
              onClick={(e) => {
                e.stopPropagation();

                setFavorites((prev) => ({
                  ...prev,
                  [flight.offerId]: !prev[flight.offerId],
                }));
              }}
            >
              <Heart
                size={18}
                strokeWidth={2}
                className={styles.heartIcon}
                fill={favorites[flight.offerId] ? "#ef4444" : "none"}
                color={favorites[flight.offerId] ? "#ef4444" : "#6b7280"}
              />
            </button>
          </header>

          {flight.routes.map((route, idx) => (
            <div key={idx} className={styles.routeRow}>
              <div className={styles.airlineInfo}>
                {" "}
                <Image
                  className={styles.airlineLogo}
                  src={`/api/airline-logo/${route.airlineIata}`}
                  alt={route.airline}
                  width={32}
                  height={32}
                  onError={(e) => {
                    e.currentTarget.src = "/airlines/default.png";
                  }}
                />
              </div>

              <div className={styles.routeGrid}>
                <div className={styles.timeBlock}>
                  <time className={styles.time}>
                    {formatTime(route.departure.time)}
                  </time>
                  <div className={styles.city}>{route.departure.airport}</div>
                  <div className={styles.date}>
                    {formatDate(route.departure.date)}
                  </div>
                </div>

                <div className={styles.pathContainer}>
                  <div className={styles.pathMeta}>
                    {formatDuration(route.durationMinutes)} в пути,{" "}
                    {formatTransfers(route.stops)}
                  </div>
                  <div className={styles.pathVisual}>
                    <div className={styles.pathLine} />
                    {route.segments.length > 1 &&
                      route.segments.slice(0, -1).map((seg, i) => (
                        <span key={i} className={styles.transferDot}>
                          {seg.to}
                        </span>
                      ))}
                  </div>
                </div>

                <div
                  className={clsx(styles.timeBlock, styles.timeBlockArrival)}
                >
                  <time className={styles.time}>
                    {formatTime(route.arrival.time)}
                  </time>
                  <div className={styles.city}>{route.arrival.airport}</div>
                  <div className={styles.date}>
                    {formatDate(route.arrival.date)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className={styles.mobileInfo}>
            Всего в пути: {formatDuration(flight.totalDurationMinutes)}
          </div>
        </article>
      )})}
    </main>
  );
}
