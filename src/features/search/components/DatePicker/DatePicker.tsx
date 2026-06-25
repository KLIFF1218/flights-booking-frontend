"use client";

import * as Popover from "@radix-ui/react-popover";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useState } from "react";
import { X } from "lucide-react";

import "react-day-picker/dist/style.css";
import styles from "./DatePicker.module.css";

type Props = {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  fromDate?: Date | undefined;
  placeholder: string;
};

export function DatePicker({ value, onChange, fromDate, placeholder }: Props) {
  const [open, setOpen] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`${styles.trigger} ${value ? styles.filled : ""}`}
        >
          <span className={styles.label}>
            {value ? format(value, "d MMMM, EEE", { locale: ru }) : placeholder}
          </span>

          {value && (
            <span
              className={styles.clear}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();

                onChange(undefined);
              }}
            >
              <X size={16} />
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Content align="start" sideOffset={8} className={styles.popover}>
        <DayPicker
          mode="single"
          selected={value}
          locale={ru}
          disabled={{
            before: fromDate ?? today,
          }}
          onSelect={(date) => {
            if (!date) return;
            if (fromDate && date < fromDate) return;

            onChange(date);
            setOpen(false);
          }}
        />
      </Popover.Content>
    </Popover.Root>
  );
}
