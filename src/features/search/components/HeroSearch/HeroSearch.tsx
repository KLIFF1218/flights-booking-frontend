"use client";

import {
  Calendar,
  User,
  PlaneTakeoff,
  PlaneLanding,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useState, useMemo, useTransition } from "react";
import { format, isValid, parseISO } from "date-fns";
import { enUS, ru } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";

import { AirportInput } from "@/features/search/components/AirportInput/AirportInput";
import { PassengerClassDialog } from "@/features/search/components/PassengerClassDialog/PassengerClassDialog";
import { DatePicker } from "@/features/search/components/DatePicker/DatePicker";
import type { Passengers, TravelClass } from "@/shared/types/passengers";
import {
  formatTravelClassLabel,
  normalizeTravelClass,
} from "@/shared/utils/travel-class";
import {
  validatePassengerCounts,
  getPassengerTotal,
} from "@/shared/utils/passenger-counts";

import styles from "./HeroSearch.module.css";

function formatPassengers(
  passengers: Passengers,
  travelClass: TravelClass,
  t: ReturnType<typeof useTranslations<"search">>,
) {
  const total = getPassengerTotal(passengers);
  const label =
    total === 1 ? t("passenger_one") : t("passenger_other");
  return `${total} ${label}, ${formatTravelClassLabel(travelClass, (key) => t(key))}`;
}

function toNumber(value: string | null, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

type HeroSearchProps = {
  compact?: boolean;
};

type HeroSearchFormProps = {
  compact: boolean;
  searchQueryKey: string;
  searchParams: URLSearchParams;
};

function HeroSearchForm({
  compact,
  searchQueryKey,
  searchParams,
}: HeroSearchFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("search");
  const dateFnsLocale = locale === "ru" ? ru : enUS;

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
  const [travelClass, setTravelClass] = useState<TravelClass>(() =>
    normalizeTravelClass(searchParams.get("travelClass")),
  );
  const [passengers, setPassengers] = useState<Passengers>(() => ({
    adults: Math.max(1, toNumber(searchParams.get("adults"), 1)),
    children: toNumber(searchParams.get("children"), 0),
    infants: toNumber(searchParams.get("infants"), 0),
    seatedInfants: toNumber(searchParams.get("seatedInfants"), 0),
  }));

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(!compact);

  const passengersLabel = useMemo(
    () => formatPassengers(passengers, travelClass, t),
    [passengers, travelClass, t],
  );

  const summaryLabel = useMemo(() => {
    const fromLabel = origin || t("from");
    const toLabel = destination || t("to");
    return `${fromLabel} → ${toLabel}`;
  }, [origin, destination, t]);

  function isIata(value: string) {
    return /^[A-Z]{3}$/.test(value);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isIata(origin)) {
      setError(t("errors.selectDepartureAirport"));
      return;
    }

    if (!isIata(destination)) {
      setError(t("errors.selectDestinationAirport"));
      return;
    }

    if (origin === destination) {
      setError(t("errors.airportsMustDiffer"));
      return;
    }

    if (!departureDate) {
      setError(t("errors.selectDepartureDate"));
      return;
    }

    if (returnDate && returnDate < departureDate) {
      setError(t("errors.returnBeforeDeparture"));
      return;
    }

    const passengerError = validatePassengerCounts(passengers, t);
    if (passengerError) {
      setError(passengerError);
      return;
    }

    const params = new URLSearchParams();

    params.set("from", origin);
    params.set("to", destination);
    params.set("dateFrom", format(departureDate, "yyyy-MM-dd"));

    if (returnDate) {
      params.set("dateTo", format(returnDate, "yyyy-MM-dd"));
    }

    params.set("adults", passengers.adults.toString());
    params.set("children", passengers.children.toString());
    params.set("infants", passengers.infants.toString());
    params.set("seatedInfants", passengers.seatedInfants.toString());
    params.set("travelClass", travelClass);

    startTransition(() => {
      setIsExpanded(false);
      router.push(`/search?${params.toString()}#search-results`);
    });
  }

  const summaryDates = useMemo(() => {
    if (!departureDate) {
      return t("departure");
    }

    const departureLabel = format(departureDate, "d MMM", { locale: dateFnsLocale });
    if (!returnDate) {
      return departureLabel;
    }

    return `${departureLabel} – ${format(returnDate, "d MMM", { locale: dateFnsLocale })}`;
  }, [departureDate, returnDate, t, dateFnsLocale]);

  const searchForm = (
    <form
      className={`${styles.form} ${compact ? styles.compactForm : ""}`}
      onSubmit={onSubmit}
    >
      <div className={styles.formInner}>
        <div className={styles.field}>
          <PlaneTakeoff className={styles.icon} />
          <AirportInput
            key={`${searchQueryKey}-from-${origin}`}
            listboxId="hero-search-airport-from"
            value={origin}
            placeholder={t("from")}
            onSelect={setOrigin}
            exclude={destination}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <PlaneLanding className={styles.icon} />
          <AirportInput
            key={`${searchQueryKey}-to-${destination}`}
            listboxId="hero-search-airport-to"
            value={destination}
            placeholder={t("to")}
            exclude={origin}
            onSelect={setDestination}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <Calendar className={styles.icon} />
          <DatePicker
            value={departureDate}
            placeholder={t("departure")}
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
            placeholder={t("return")}
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
                {t("searching")}
              </>
            ) : (
              t("searchFlights")
            )}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </form>
  );

  if (compact) {
    return (
      <section className={styles.compactRoot}>
        <div className={styles.compactStickyWrap}>
          <button
            type="button"
            className={styles.summaryToggle}
            onClick={() => setIsExpanded((value) => !value)}
            aria-expanded={isExpanded}
          >
            <div className={styles.summaryContent}>
              <span className={styles.summaryRoute}>{summaryLabel}</span>
              <span className={styles.summaryDivider} aria-hidden />
              <span className={styles.summaryMeta}>{summaryDates}</span>
              <span className={styles.summaryDivider} aria-hidden />
              <span className={styles.summaryMeta}>{passengersLabel}</span>
            </div>

            <span className={styles.summaryAction}>
              {isExpanded ? t("collapse") : t("edit")}
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>
        </div>

        {isExpanded && (
          <div className={styles.compactExpanded}>{searchForm}</div>
        )}
      </section>
    );
  }

  return (
    <section className={styles.hero}>
      <div className={styles.panel}>{searchForm}</div>
    </section>
  );
}

export function HeroSearch({ compact = false }: HeroSearchProps) {
  const searchParams = useSearchParams();
  const searchQueryKey = searchParams.toString();

  return (
    <HeroSearchForm
      key={searchQueryKey}
      compact={compact}
      searchQueryKey={searchQueryKey}
      searchParams={searchParams}
    />
  );
}
