"use client";

import type { TravelerForm } from "@/features/booking/components/TravelersForm/TravelersForm";

type Props = {
  travelers: TravelerForm[];
  onConfirm: (seats: Record<string, string>) => void;
};

export function SeatSelection({ travelers, onConfirm }: Props) {
  const seats: Record<string, string> = {};

  travelers.forEach((t, i) => {
    seats[t.id] = `A${i + 1}`; // mock
  });

  return (
    <div>
      <h2>Выбор мест</h2>

      {travelers.map((t) => (
        <div key={t.id}>
          {t.firstName} {t.lastName} — место {seats[t.id]}
        </div>
      ))}

      <button onClick={() => onConfirm(seats)}>Подтвердить и оплатить</button>
    </div>
  );
}

