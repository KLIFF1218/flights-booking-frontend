"use client";

import styles from "./BuySheet.module.css";
import {
  formatFlightArrivalDate,
  formatFlightArrivalTime,
  formatFlightDepartureDate,
  formatFlightDepartureTime,
  formatDuration,
} from "@/shared/utils/formatDate";
import { formatTransfers } from "@/shared/utils/formatTransfers";
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
import type { PricedFlight } from "@/shared/types/flight";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

type Leg = PricedFlight["outbound"];

type Props = {
  label?: string;
  leg: Leg;
};

export function FlightLegSummary({ label, leg }: Props) {
  const t = useTranslations("results");
  const locale = useLocale();
  const primarySegment = leg.segments[0];
  const airlineCode = resolveSegmentAirlineCode(primarySegment);
  const airlineName = resolveSegmentAirlineName(primarySegment);
  const flightNumber = formatFlightNumberLabel(
    airlineCode,
    primarySegment?.flightNumber,
  );

  return (
    <section className={styles.legSection}>
      {label && <h3 className={styles.legLabel}>{label}</h3>}

      <div className={styles.legRoute}>
        {leg.from} → {leg.to}
      </div>

      {primarySegment && (
        <div className={styles.legAirline}>
          <Image
            src={getAirlineLogoUrl(airlineCode)}
            alt={airlineName}
            width={24}
            height={24}
            className={styles.legAirlineLogo}
            unoptimized
            onError={handleAirlineLogoError}
          />
          <span>{formatAirlineLabel(airlineName, airlineCode)}</span>
          <span className={styles.legFlightNumber}>· {flightNumber}</span>
        </div>
      )}

      <div className={styles.legDate}>{formatFlightDepartureDate(leg, locale)}</div>

      <div className={styles.legTimeline}>
        <div className={styles.legTimeBlock}>
          <time className={styles.legTime}>
            {formatFlightDepartureTime(leg, locale)}
          </time>
          <span className={styles.legAirport}>{leg.from}</span>
        </div>

        <div className={styles.legPath}>
          <span className={styles.legPathMeta}>
            {formatDuration(leg.durationMinutes, locale)} · {formatTransfers(leg.stops, t)}
          </span>
          <div className={styles.legPathLine} />
        </div>

        <div className={`${styles.legTimeBlock} ${styles.legTimeBlockArrival}`}>
          <time className={styles.legTime}>
            {formatFlightArrivalTime(leg, locale)}
          </time>
          <span className={styles.legAirport}>{leg.to}</span>
          <span className={styles.legArrivalDate}>
            {formatFlightArrivalDate(leg, locale)}
          </span>
        </div>
      </div>
    </section>
  );
}
