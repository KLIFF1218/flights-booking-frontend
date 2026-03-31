"use client";

import { useEffect, useRef, useState } from "react";
import { useAirportSearch } from "@/features/search/hooks/useAirportSearch";
import type { AirportLocation } from "@/shared/types/airport";
import styles from "./AirportInput.module.css";
import { useDebounce } from "../../hooks/useDebounce";

type Props = {
  value: string;
  onSelect: (iata: string) => void;
  placeholder: string;
  exclude?: string;
  className?: string;
};

export function AirportInput({
  value,
  onSelect,
  placeholder,
  exclude,
  className,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState(value ?? "");
  const [open, setOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setQuery(value ?? "");
  }, [value]);

  const { data, loading } = useAirportSearch(debouncedQuery);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  

  function handleSelect(item: AirportLocation) {
    onSelect(item.iataCode);
    setQuery(`${item.city ?? item.name} (${item.iataCode})`);
    setOpen(false);
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <input
        className={`${styles.input} ${className ?? ""}`}
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
      />

      {open && query.length >= 2 && (
        <div className={styles.dropdown}>
          {loading && <div className={styles.itemMuted}>Поиск…</div>}

          {!loading && data.length === 0 && (
            <div className={styles.itemMuted}>Ничего не найдено</div>
          )}

          {data.map((item) => {
            const disabled = item.iataCode === exclude;

            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                className={styles.item}
                onClick={() => handleSelect(item)}
              >
                <div className={styles.row}>
                  <span className={styles.city}>{item.city ?? item.name}</span>
                  <span className={styles.code}>{item.iataCode}</span>
                </div>

                <div className={styles.sub}>
                  {item.name} · {item.country}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
