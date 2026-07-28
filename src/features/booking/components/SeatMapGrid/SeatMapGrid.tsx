import { SeatFeature, type SeatFeature as SeatFeatureType, type SeatMapGridCell, type SeatMapSegment } from "@/features/booking/api/booking.api";
import { getCurrencySymbol } from "@/shared/utils/getCurrencySymbol";
import styles from "./SeatMapGrid.module.css";

type SeatCell = Extract<SeatMapGridCell, { type: "SEAT" }>;

type Props = {
  map: SeatMapSegment;
  activeTravelerId: string;
  selectedSeatNumbers: string[];
  assignedSeats: Record<string, Record<string, string>>;
  travelers: Array<{ id: string }>;
  currency?: string;
  onSeatSelect: (cell: SeatCell, segmentId: string) => void;
};

function seatTypeLabel(seatType: string) {
  switch (seatType) {
    case "WINDOW":
      return "Window";
    case "AISLE":
      return "Aisle";
    default:
      return "Middle";
  }
}

function featureLabel(feature: SeatFeatureType) {
  switch (feature) {
    case "PREMIUM":
      return "Premium";
    case "EXIT_ROW":
      return "Exit row";
    case "EXTRA_LEGROOM":
      return "Extra legroom";
    default:
      return feature;
  }
}

function buildSeatTitle(cell: SeatCell, currency: string) {
  const parts = [seatTypeLabel(cell.seatType)];

  for (const feature of cell.features) {
    parts.push(featureLabel(feature));
  }

  if (cell.minPrice != null) {
    parts.push(`${cell.minPrice} ${getCurrencySymbol(currency)}`);
  }

  return parts.join(" · ");
}

export function SeatMapGrid({
  map,
  activeTravelerId,
  selectedSeatNumbers,
  assignedSeats,
  travelers,
  currency = "USD",
  onSeatSelect,
}: Props) {
  const firstSeatRow = map.grid.find((row) => row.some((cell) => cell.type === "SEAT"));

  return (
    <div className={styles.wrapper}>
      <div className={styles.cabin}>
        <div className={styles.nose}>✈ Nose</div>

        {firstSeatRow && (
          <div className={styles.columnHeaderRow}>
            <div className={styles.rowNumberSpacer} />
            {firstSeatRow.map((cell, index) => (
              <div
                key={`col-${index}`}
                className={
                  cell.type === "EMPTY" ? styles.aisleHeader : styles.columnHeader
                }
              >
                {cell.type === "SEAT" ? cell.seatNumber.replace(/^\d+/, "") : ""}
              </div>
            ))}
          </div>
        )}

        {map.grid.map((row, rowIndex) => {
          const rowLabel =
            row.find((cell): cell is SeatCell => cell.type === "SEAT")?.seatNumber.replace(
              /[A-Z]+$/,
              "",
            ) ?? String(rowIndex + 1);

          return (
            <div key={rowIndex} className={styles.row}>
              <div className={styles.rowNumber}>{rowLabel}</div>

              {row.map((cell, cellIndex) => {
                if (cell.type === "EMPTY") {
                  return <div key={cellIndex} className={styles.aisle} />;
                }

                if (cell.type === "FACILITY") {
                  return (
                    <div key={cellIndex} className={styles.facility} title={cell.code}>
                      {cell.code === "LAVATORY"
                        ? "🚻"
                        : cell.code === "EXIT"
                          ? "⛔"
                          : "☕"}
                    </div>
                  );
                }

                const isSelected = selectedSeatNumbers.includes(cell.seatNumber);
                const isTakenByOther = travelers.some(
                  (traveler) =>
                    traveler.id !== activeTravelerId &&
                    assignedSeats[traveler.id]?.[map.segmentId] === cell.seatNumber,
                );
                const isCurrentTravelerSeat =
                  assignedSeats[activeTravelerId]?.[map.segmentId] === cell.seatNumber;

                const isDisabled =
                  !cell.isAvailable ||
                  (isSelected && !isCurrentTravelerSeat) ||
                  isTakenByOther;

                const seatClasses = [
                  styles.seat,
                  styles[`seatType_${cell.seatType}`],
                  cell.features.includes(SeatFeature.EXTRA_LEGROOM) ? styles.extraLegroom : "",
                  cell.features.includes(SeatFeature.PREMIUM) ? styles.premium : "",
                  cell.features.includes(SeatFeature.EXIT_ROW) ? styles.exitRow : "",
                  isSelected ? styles.selected : "",
                  !cell.isAvailable ? styles.unavailable : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={cellIndex}
                    type="button"
                    disabled={isDisabled}
                    title={buildSeatTitle(cell, currency)}
                    onClick={() => onSeatSelect(cell, map.segmentId)}
                    className={seatClasses}
                  >
                    <span className={styles.seatLabel}>{cell.seatNumber}</span>
                    {cell.features.includes(SeatFeature.PREMIUM) && (
                      <span className={styles.badgePremium}>P</span>
                    )}
                    {cell.features.includes(SeatFeature.EXIT_ROW) && (
                      <span className={styles.badgeExit}>E</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
