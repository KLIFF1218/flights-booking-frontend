"use client";

import styles from "@/features/search/components/FlightCard/FlightCard.module.css"
import skeleton from "./FlightCardSkeleton.module.css";

export function FlightCardSkeleton() {
  return (
    <article className={styles.ticketCard}>
      <header className={styles.cardHeader}>
        <div className={styles.leftHeader}>
          <div className={`${skeleton.smallLine} ${skeleton.skeleton}`} />
          <div className={`${skeleton.price} ${skeleton.skeleton}`} />
          <div className={`${skeleton.badge} ${skeleton.skeleton}`} />
        </div>

        <div className={`${skeleton.circle} ${skeleton.skeleton}`} />
      </header>

      <div className={styles.routeRow}>
        <div className={`${skeleton.logo} ${skeleton.skeleton}`} />

        <div className={styles.routeGrid}>
          <div className={styles.timeBlock}>
            <div className={`${skeleton.time} ${skeleton.skeleton}`} />
            <div className={`${skeleton.text} ${skeleton.skeleton}`} />
            <div className={`${skeleton.textSmall} ${skeleton.skeleton}`} />
          </div>

          <div className={`${skeleton.line} ${skeleton.skeleton}`} />

          <div className={styles.timeBlock}>
            <div className={`${skeleton.time} ${skeleton.skeleton}`} />
            <div className={`${skeleton.text} ${skeleton.skeleton}`} />
            <div className={`${skeleton.textSmall} ${skeleton.skeleton}`} />
          </div>
        </div>
      </div>
    </article>
  );
}