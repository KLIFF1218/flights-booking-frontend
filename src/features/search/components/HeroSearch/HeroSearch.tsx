"use client";

import { Calendar, User, PlaneTakeoff, PlaneLanding, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useTransition } from "react";
import { format, isValid, parseISO } from "date-fns";

import { AirportInput } from "@/features/search/components/AirportInput/AirportInput";
import { PassengerClassDialog } from "@/features/search/components/PassengerClassDialog/PassengerClassDialog";
import { DatePicker } from "@/features/search/components/DatePicker/DatePicker";
import type { Passengers, TravelClass } from "@/shared/types/passengers";

import styles from "./HeroSearch.module.css";

function formatPassengers(passengers: Passengers, travelClass: TravelClass) {
  const total = passengers.adults + passengers.children + passengers.infants;

  const classMap: Record<TravelClass, string> = {
    ECONOMY: "эконом",
    COMFORT: "комфорт",
    BUSINESS: "бизнес",
    FIRST: "первый класс",
  };

  return `${total} ${pluralizePassengers(total)}, ${classMap[travelClass]}`;
}
function pluralizePassengers(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return "пассажир";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) {
    return "пассажира";
  }
  return "пассажиров";
}

export function HeroSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [origin, setOrigin] = useState(
    () => searchParams.get("from")?.toUpperCase() ?? "",
  );
  const [destination, setDestination] = useState(
    () => searchParams.get("to")?.toUpperCase() ?? "",
  );
  const [departureDate, setDepartureDate] = useState<Date | undefined>(() => {
    const fromParam = searchParams.get("dateFrom");
    if (!fromParam) return undefined;
    const parsed = parseISO(fromParam);
    return isValid(parsed) ? parsed : undefined;
  });
  const [returnDate, setReturnDate] = useState<Date | undefined>(() => {
    const toParam = searchParams.get("dateTo");
    if (!toParam) return undefined;
    const parsed = parseISO(toParam);
    return isValid(parsed) ? parsed : undefined;
  });
  const travelClasses: TravelClass[] = [
    "ECONOMY",
    "COMFORT",
    "BUSINESS",
    "FIRST",
  ];

  function toNumber(value: string | null, fallback: number) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  }

  const [passengers, setPassengers] = useState<Passengers>(() => ({
    adults: Math.max(1, toNumber(searchParams.get("adults"), 1)),
    children: toNumber(searchParams.get("children"), 0),
    infants: toNumber(searchParams.get("infants"), 0),
  }));
  const [travelClass, setTravelClass] = useState<TravelClass>(() => {
    const value = searchParams.get("travelClass");
    return travelClasses.includes(value as TravelClass)
      ? (value as TravelClass)
      : "BUSINESS";
  });
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const passengersLabel = useMemo(
    () => formatPassengers(passengers, travelClass),
    [passengers, travelClass],
  );

  function isIata(value: string) {
    return /^[A-Z]{3}$/.test(value);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isIata(origin)) {
      setError("Выберите аэропорт отправления из списка.");
      return;
    }

    if (!isIata(destination)) {
      setError("Выберите аэропорт назначения из списка.");
      return;
    }

    if (origin === destination) {
      setError("Аэропорт отправления и назначения не должны совпадать.");
      return;
    }

    if (!departureDate) {
      setError("Укажите дату вылета.");
      return;
    }

    if (returnDate && returnDate < departureDate) {
      setError("Дата обратного перелета не может быть раньше даты вылета.");
      return;
    }

    const params = new URLSearchParams();

    params.set("from", origin);
    params.set("to", destination);

    if (departureDate) {
      params.set("dateFrom", format(departureDate, "yyyy-MM-dd"));
    }

    if (returnDate) {
      params.set("dateTo", format(returnDate, "yyyy-MM-dd"));
    }

    params.set("adults", passengers.adults.toString());
    params.set("children", passengers.children.toString());
    params.set("infants", passengers.infants.toString());
    params.set("travelClass", travelClass);

    startTransition(() => {
      router.push(`/search?${params.toString()}#search-results`);
    });
  }

  return (
    <section className={styles.hero}>

      <form className={styles.form} onSubmit={onSubmit}>
        <div className={styles.formInner}>
          <div className={styles.field}>
            <PlaneTakeoff className={styles.icon} />
            <AirportInput
              value={origin}
              placeholder="Откуда"
              onSelect={setOrigin}
              exclude={destination}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <PlaneLanding className={styles.icon} />
            <AirportInput
              value={destination}
              placeholder="Куда"
              exclude={origin}
              onSelect={setDestination}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <Calendar className={styles.icon} />
            <DatePicker
              value={departureDate}
              placeholder="Дата вылета"
              onChange={(date) => {
                setDepartureDate(date);

                if (returnDate && date && returnDate < date) {
                  setReturnDate(undefined);
                }
              }}
            />
          </div>

          <div className={styles.field}>
            <Calendar className={styles.icon} />
            <DatePicker
              value={returnDate}
              fromDate={departureDate}
              placeholder="Обратно"
              onChange={setReturnDate}
            />
          </div>

          <div className={styles.field}>
            <User className={styles.icon} />
            <PassengerClassDialog
              value={{ passengers, travelClass }}
              label={passengersLabel}
              onApply={({ passengers, travelClass }) => {
                setPassengers(passengers);
                setTravelClass(travelClass);
              }}
            />
          </div>

          <button
            type="submit"
            className={styles.submit}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className={styles.spinner} />
                Поиск...
              </>
            ) : (
              "Найти билеты"
            )}
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
      </form>
    </section>
  );
}
