"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { X, Plus, Minus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import styles from "./PassengerClassDialog.module.css";
import type { Passengers, TravelClass } from "@/shared/types/passengers";
import {
  MAX_PASSENGERS_PER_BOOKING,
  getPassengerTotal,
  getTotalInfants,
  validatePassengerCounts,
} from "@/shared/utils/passenger-counts";
import { TRAVEL_CLASS_OPTIONS } from "@/shared/utils/travel-class";

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
  const t = useTranslations("search");
  const [open, setOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [draftPassengers, setDraftPassengers] = useState<Passengers>(
    value.passengers,
  );
  const [draftClass, setDraftClass] = useState<TravelClass>(value.travelClass);

  const passengerRows = [
    ["adults", "adults", "adultsHint", 1],
    ["children", "children", "childrenHint", 0],
    ["infants", "infants", "infantsHint", 0],
    ["seatedInfants", "seatedInfants", "seatedInfantsHint", 0],
  ] as const;

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraftPassengers(value.passengers);
      setDraftClass(value.travelClass);
      setValidationError(null);
    }
    setOpen(nextOpen);
  }

  function change(key: keyof Passengers, delta: number, min = 0) {
    setValidationError(null);
    setDraftPassengers((prev) => {
      const nextValue = Math.max(min, prev[key] + delta);
      const next = { ...prev, [key]: nextValue };

      if (key === "infants" || key === "seatedInfants") {
        if (getTotalInfants(next) > next.adults) {
          return prev;
        }
      }

      if (key === "adults") {
        const totalInfants = getTotalInfants(next);
        if (totalInfants > next.adults) {
          let remaining = next.adults;
          const seated = Math.min(next.seatedInfants, remaining);
          remaining -= seated;
          const lap = Math.min(next.infants, remaining);
          next.seatedInfants = seated;
          next.infants = lap;
        }
      }

      return next;
    });
  }

  function apply() {
    const error = validatePassengerCounts(draftPassengers, t);
    if (error) {
      setValidationError(error);
      return;
    }

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
            <Dialog.Title>{t("passengerDialog.ariaTitle")}</Dialog.Title>
          </VisuallyHidden>

          <Dialog.Close
            className={styles.close}
            aria-label={t("passengerDialog.close")}
          >
            <X />
          </Dialog.Close>

          <h3 className={styles.title}>{t("passengerDialog.title")}</h3>

          <div className={styles.block}>
            {passengerRows.map(([key, labelKey, hintKey, min]) => (
              <div key={key} className={styles.row}>
                <div>
                  <div className={styles.label}>
                    {t(`passengerDialog.${labelKey}`)}
                  </div>
                  <div className={styles.hint}>
                    {t(`passengerDialog.${hintKey}`)}
                  </div>
                </div>

                <div className={styles.counter}>
                  <button type="button" onClick={() => change(key, -1, min)}>
                    <Minus />
                  </button>

                  <span>{draftPassengers[key]}</span>

                  <button
                    type="button"
                    onClick={() => change(key, +1)}
                    disabled={
                      key !== "adults" &&
                      getPassengerTotal(draftPassengers) >=
                        MAX_PASSENGERS_PER_BOOKING
                    }
                  >
                    <Plus />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.block}>
            {TRAVEL_CLASS_OPTIONS.map(({ value: classValue }) => (
              <label key={classValue} className={styles.radio}>
                <input
                  type="radio"
                  name="travelClass"
                  checked={draftClass === classValue}
                  onChange={() => setDraftClass(classValue)}
                />
                <span>{t(`travelClass.${classValue}`)}</span>
              </label>
            ))}
          </div>

          {validationError ? (
            <p className="text-sm text-red-600 mb-3">{validationError}</p>
          ) : null}

          <button type="button" className={styles.apply} onClick={apply}>
            {t("passengerDialog.done")}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
