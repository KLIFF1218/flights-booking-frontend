"use client";

import { useEffect, useRef, useState, useId } from "react";
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

  const selectedIataRef = useRef<string | null>(value || null);
  const { data, loading } = useAirportSearch(debouncedQuery);
  const [activeIndex, setActiveIndex] = useState(0);
  const id = useId();
  const hasSearched = debouncedQuery.length >= 2;

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
    selectedIataRef.current = item.iataCode;
    onSelect(item.iataCode);
    setQuery(`${item.city ?? item.name} (${item.iataCode})`);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }

    if (!open || data.length === 0) {
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((index) => (index + 1) % data.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((index) =>
        data.length === 0 ? 0 : (index - 1 + data.length) % data.length,
      );
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = data[activeIndex];
      if (selected && selected.iataCode !== exclude) {
        handleSelect(selected);
      }
    }
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <input
        role="combobox"
        aria-autocomplete="list"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`airport-list-${id}`}
        aria-activedescendant={
          open && data[activeIndex]
            ? `airport-option-${id}-${activeIndex}`
            : undefined
        }
        className={`${styles.input} ${className ?? ""}`}
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActiveIndex(0);
          if (selectedIataRef.current) {
            selectedIataRef.current = null;
            onSelect("");
          }
        }}
        onKeyDown={handleKeyDown}
      />

      {open && query.length >= 2 && (
        <div
          className={styles.dropdown}
          role="listbox"
          id={`airport-list-${id}`}
        >
          {loading && <div className={styles.itemMuted}>Поиск…</div>}

          {!loading && hasSearched && data.length === 0 && (
            <div className={styles.itemMuted}>Ничего не найдено</div>
          )}

          {data.map((item, index) => {
            const disabled = item.iataCode === exclude;
            const isActive = index === activeIndex;

            return (
              <button
                key={item.id}
                id={`airport-option-${id}-${index}`}
                type="button"
                disabled={disabled}
                className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelect(item)}
                role="option"
                aria-selected={isActive}
                aria-disabled={disabled}
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
