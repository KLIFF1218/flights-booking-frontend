"use client";

import { useBookingStore } from "@/features/booking/store/booking.store";
import { formatPrice } from "@/shared/utils/formatPrice";
import { getCurrencySymbol } from "@/shared/utils/getCurrencySymbol";
import styles from "./PriceSidebar.module.css";

export function PriceSidebar() {
  const flight = useBookingStore((s) => s.flight);
  const pricing = useBookingStore((s) => s.pricing);

  if (!flight) return null;

  const base = pricing?.baseTotal ?? flight.price.base ?? flight.price.total;
  const seats = pricing?.seatsTotal ?? 0;
  const total = pricing?.finalTotal ?? flight.price.total;
  const currency = pricing?.currency ?? flight.price.currency;

  const symbol = getCurrencySymbol(currency);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.card}>
        <div className={styles.route}>
          {flight.outbound.from} — {flight.outbound.to}
        </div>

        <div className={styles.meta}>{flight.travelers.length} пассажир</div>

        <div className={styles.row}>
          <span>Билет</span>
          <span>
            {formatPrice(base)} {symbol}
          </span>
        </div>

        {seats > 0 && (
          <div className={styles.row}>
            <span>Места</span>
            <span>
              {formatPrice(seats)} {symbol}
            </span>
          </div>
        )}

        <div className={styles.divider} />

        <div className={styles.total}>
          <span>Итого</span>
          <span>
            {formatPrice(total)} {symbol}
          </span>
        </div>
      </div>
    </aside>
  );
}
