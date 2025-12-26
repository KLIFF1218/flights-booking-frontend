import { formatDuration, formatTime } from "@/utils/formatDate";
import { formatPrice } from "@/utils/formatePrice";
import styles from "./card.module.css";

export function FlightCard({ flights, searchId, onSelect }) {
  return (
    <div className={styles.results}>
      {flights.flights.map((flight) => {
        const duration = formatDuration(
          flight.route.departureTime,
          flight.route.arrivalTime
        );

        return (
          <div
            key={flight.id}
            className={styles.flightCard}
            role="button"
            tabIndex={0}
            onClick={() =>
              onSelect({
                id: flight.id,
                searchId,
              })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSelect({
                  id: flight.id,
                  searchId,
                });
              }
            }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.price}>
                {formatPrice(flight.price.withoutBaggage)} {flight.price.currency}
              </div>

              <button
                className={styles.favorite}
                onClick={(e) => {
                  e.stopPropagation(); // ❗ важно
                  console.log("favorite click");
                }}
              >
                ♡
              </button>
            </div>

            <div className={styles.baggage}>
              Багаж {flight.baggage.weightKg} кг — 1 шт
            </div>

            <div className={styles.route}>
              <div className={styles.timeBlock}>
                <span className={styles.time}>
                  {formatTime(flight.route.departureTime)}
                </span>
                <span className={styles.city}>{flight.origin}</span>
              </div>

              <div className={styles.routeInfo}>
                <span className={styles.duration}>{duration}</span>
                <span className={styles.stops}>Без пересадок</span>
              </div>

              <div className={styles.timeBlock}>
                <span className={styles.time}>
                  {formatTime(flight.route.arrivalTime)}
                </span>
                <span className={styles.city}>{flight.destination}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
