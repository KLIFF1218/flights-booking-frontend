"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X, Plus, Minus } from "lucide-react";
import { useState } from "react";
import styles from "./PassengerClassDialog.module.css";
import type { Passengers, TravelClass } from "@/shared/types/passengers";

interface Props {
  value: {
    passengers: Passengers;
    travelClass: TravelClass;
  };
  label: string;
  onApply: (value: {
    passengers: Passengers;
    travelClass: TravelClass;
  }) => void;
}

export function PassengerClassDialog({ value, label, onApply }: Props) {
  const [open, setOpen] = useState(false);

  const [draftPassengers, setDraftPassengers] = useState<Passengers>(
    value.passengers,
  );
  const [draftClass, setDraftClass] = useState<TravelClass>(value.travelClass);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraftPassengers(value.passengers);
      setDraftClass(value.travelClass);
    }
    setOpen(nextOpen);
  }

  function change(key: keyof Passengers, delta: number, min = 0) {
    setDraftPassengers((prev) => ({
      ...prev,
      [key]: Math.max(min, prev[key] + delta),
    }));
  }

  function apply() {
    onApply({
      passengers: draftPassengers,
      travelClass: draftClass,
    });
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button type="button" className={styles.trigger}>
          {label}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={styles.dialogOverlay} />

        <Dialog.Content className={styles.dialogContent}>
          <VisuallyHidden>
            <Dialog.Title>Пассажиры и класс обслуживания</Dialog.Title>
          </VisuallyHidden>

          <Dialog.Close className={styles.close} aria-label="Закрыть">
            <X />
          </Dialog.Close>

          <h3 className={styles.title}>Пассажиры и класс</h3>

          <div className={styles.block}>
            {(
              [
                ["adults", "Взрослые", "12 лет и старше", 1],
                ["children", "Дети", "2–11 лет", 0],
                ["infants", "Младенцы", "до 2 лет", 0],
              ] as const
            ).map(([key, rowLabel, hint, min]) => (
              <div key={key} className={styles.row}>
                <div>
                  <div className={styles.label}>{rowLabel}</div>
                  <div className={styles.hint}>{hint}</div>
                </div>

                <div className={styles.counter}>
                  <button type="button" onClick={() => change(key, -1, min)}>
                    <Minus />
                  </button>

                  <span>{draftPassengers[key]}</span>

                  <button type="button" onClick={() => change(key, +1)}>
                    <Plus />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.block}>
            {(
              [
                ["ECONOMY", "Эконом"],
                ["COMFORT", "Комфорт"],
                ["BUSINESS", "Бизнес"],
                ["FIRST", "Первый класс"],
              ] as const
            ).map(([value, rowLabel]) => (
              <label key={value} className={styles.radio}>
                <input
                  type="radio"
                  name="travelClass"
                  checked={draftClass === value}
                  onChange={() => setDraftClass(value)}
                />
                <span>{rowLabel}</span>
              </label>
            ))}
          </div>

          <button type="button" className={styles.apply} onClick={apply}>
            Готово
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
