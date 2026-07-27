import styles from "@/features/search/components/SearchResultsClient/SearchResultsClient.module.css";
import { FlightCardSkeleton } from "@/features/search/components/Skeleton/FlightCardSkeleton";

export default function Loading() {
  return (
    <div className={styles.cardsWrapper}>
      <div className={styles.cardsDiv}>
        <div className={styles.cardContainer}>
          <FlightCardSkeleton />
          <FlightCardSkeleton />
          <FlightCardSkeleton />
        </div>
      </div>
    </div>
  );
}