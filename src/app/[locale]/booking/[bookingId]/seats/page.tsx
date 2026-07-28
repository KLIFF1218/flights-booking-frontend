"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import BookingLayout from "../BookingLayout";
import { PriceSidebar } from "@/features/booking/components/PriceSidebar/PriceSidebar";
import { Users, Check, AlertCircle } from "lucide-react";
import { useBookingStore } from "@/features/booking/store/booking.store";
import {
  confirmSeatsAndPay,
  fetchFlightPricing,
  getBooking,
  getSeatmap,
  mergeApiTravelersIntoFormSlots,
  restoreBookingSearchContext,
  type SeatMapGridCell,
  type SeatMapSegment,
  type SeatSelection,
} from "@/features/booking/api/booking.api";
import { loadBookingTravelersConfirmed, loadBookingPricing, loadBookingFlight, saveBookingFlight, saveBookingPricing } from "@/features/booking/lib/booking-travelers-draft";
import { SeatMapGrid } from "@/features/booking/components/SeatMapGrid/SeatMapGrid";
import { SeatMapLegend } from "@/features/booking/components/SeatMapLegend/SeatMapLegend";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import type { TravelerForm } from "@/features/booking/validation/traveler.schema";
import {
  isPricingQuoteExpired,
  mapPricingResponseToFlight,
  mapPricingResponseToState,
} from "@/features/booking/lib/pricing.mapper";
import { useBookingStatusGuard } from "@/features/booking/hooks/useBookingStatusGuard";
import { BookingInactiveView } from "@/features/booking/components/BookingInactiveView/BookingInactiveView";
import { useSearchCurrency } from "@/features/search/hooks/useSearchCurrency";
import { getCurrency, toCurrencyCode, setCurrency } from "@/shared/utils/currency";
import {
  currencyForPaymentProvider,
  isPaymentProviderCurrencyCompatible,
} from "@/features/payments/utils/payment-provider-policy";
import type { PaymentProviderCode } from "@/features/payments/types/payment-provider";
import {
  getSeatMapSegmentLabel,
  getSeatMapSegmentLabelById,
} from "@/features/booking/lib/seat-map-labels";
import { formatCabinLabel } from "@/shared/utils/travel-class";
import type { CabinClass } from "@/shared/types/search-response";

type AssignedSeats = Record<string, Record<string, string>>;

function isLapInfant(traveler: TravelerForm) {
  return traveler.type === "infant";
}

function mapTravelerTypeToForm(
  travelerType: string,
): "adult" | "child" | "infant" | "seated_infant" {
  if (travelerType === "CHILD") return "child";
  if (travelerType === "HELD_INFANT") return "infant";
  if (travelerType === "SEATED_INFANT") return "seated_infant";
  return "adult";
}

function createTravelerForm(
  type: "adult" | "child" | "infant" | "seated_infant",
): TravelerForm {
  return {
    id: crypto.randomUUID(),
    type,
    accompanyingAdultId: "",
    firstName: "",
    lastName: "",
    gender: "MALE",
    dateOfBirth: "",
    email: "",
    phoneCountryCode: "",
    phoneNumber: "",
    passportNumber: "",
    passportIssuanceDate: "",
    passportExpiry: "",
    birthPlace: "",
    nationality: "RU",
  };
}

function getSeatableTravelerIndexes(travelers: TravelerForm[]) {
  return travelers
    .map((traveler, index) => (isLapInfant(traveler) ? -1 : index))
    .filter((index) => index >= 0);
}

function buildSeatsPayload(
  travelers: TravelerForm[],
  seatMaps: SeatMapSegment[],
  assignedSeats: AssignedSeats,
): SeatSelection[] {
  return travelers
    .filter((traveler) => !isLapInfant(traveler))
    .flatMap((traveler) =>
      seatMaps
        .map((map) => ({
          travelerId: traveler.id,
          segmentId: map.segmentId,
          seatNumber: assignedSeats[traveler.id]?.[map.segmentId] ?? "",
        }))
        .filter((seat) => seat.seatNumber),
    );
}

function isTravelerFullyAssigned(
  travelerId: string,
  seatMaps: SeatMapSegment[],
  assignedSeats: AssignedSeats,
) {
  return seatMaps.every((map) => Boolean(assignedSeats[travelerId]?.[map.segmentId]));
}

export default function SeatsPage() {
  const params = useParams();
  const travelers = useBookingStore((s) => s.travelers);
  const setTravelers = useBookingStore((s) => s.setTravelers);
  const setFlight = useBookingStore((s) => s.setFlight);
  const searchId = useBookingStore((s) => s.searchId);
  const offerId = useBookingStore((s) => s.offerId);
  const setOrder = useBookingStore((s) => s.setOrder);
  const setPricing = useBookingStore((s) => s.setPricing);
  const pricing = useBookingStore((s) => s.pricing);
  const flight = useBookingStore((s) => s.flight);
  const paymentProvider = useBookingStore((s) => s.paymentProvider);
  const setPaymentProvider = useBookingStore((s) => s.setPaymentProvider);
  const bookingId = params.bookingId as string;
  const router = useRouter();
  const t = useTranslations("booking");
  const tSearch = useTranslations("search");
  const locale = useLocale();
  const searchCurrency = useSearchCurrency();
  const pricingCurrency = toCurrencyCode(pricing?.currency ?? searchCurrency);

  const { isRouting, inactiveReason } = useBookingStatusGuard(bookingId, "seats");

  const [seatMaps, setSeatMaps] = useState<SeatMapSegment[]>([]);
  const [seatMapUnavailable, setSeatMapUnavailable] = useState(false);
  const [assignedSeats, setAssignedSeats] = useState<AssignedSeats>({});
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pricingRequestIdRef = useRef(0);
  const [activeSeatableIndex, setActiveSeatableIndex] = useState(0);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isSeatMapsLoading, setIsSeatMapsLoading] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [pricingError, setPricingError] = useState<string | null>(null);
  const [isHydratingTravelers, setIsHydratingTravelers] = useState(true);
  const [isHydratingPricing, setIsHydratingPricing] = useState(true);
  const currencySyncDoneRef = useRef(false);

  const seatableTravelerIndexes = useMemo(
    () => getSeatableTravelerIndexes(travelers),
    [travelers],
  );

  const activeTravelerIndex = seatableTravelerIndexes[activeSeatableIndex] ?? 0;
  const lapInfantCount = travelers.filter(isLapInfant).length;

  useEffect(() => {
    let cancelled = false;

    async function hydrateTravelers() {
      if (travelers.length) {
        setIsHydratingTravelers(false);
        return;
      }

      const confirmed = loadBookingTravelersConfirmed(bookingId);
      if (confirmed?.length) {
        setTravelers(confirmed);
        if (!cancelled) {
          setIsHydratingTravelers(false);
        }
        return;
      }

      try {
        const booking = await getBooking(bookingId);
        if (cancelled) return;

        const travelerPricings =
          booking.snapshot.offer?.travelerPricings ?? [];

        if (booking.travelers?.length && travelerPricings.length) {
          const slots = travelerPricings.map((traveler) =>
            createTravelerForm(mapTravelerTypeToForm(traveler.travelerType)),
          );
          setTravelers(
            mergeApiTravelersIntoFormSlots(slots, booking.travelers),
          );
        } else if (booking.travelers?.length) {
          setTravelers(
            booking.travelers.map((apiTraveler) => {
              const slot = createTravelerForm(
                mapTravelerTypeToForm(apiTraveler.passengerType ?? "ADULT"),
              );
              return mergeApiTravelersIntoFormSlots([slot], [apiTraveler])[0];
            }),
          );
        }
      } catch {
        // Redirect logic handles missing travelers.
      } finally {
        if (!cancelled) {
          setIsHydratingTravelers(false);
        }
      }
    }

    void hydrateTravelers();

    return () => {
      cancelled = true;
    };
  }, [bookingId, travelers.length, setTravelers]);

  useEffect(() => {
    const storedFlight = loadBookingFlight(bookingId);
    if (storedFlight) {
      setFlight(storedFlight);
    }

    const storedPricing = loadBookingPricing(bookingId);
    if (storedPricing) {
      setPricing(storedPricing);
    }

    setIsHydratingPricing(false);
  }, [bookingId, setPricing, setFlight]);

  useEffect(() => {
    if (isRouting || isHydratingTravelers) return;

    if (!travelers || travelers.length === 0) {
      if (bookingId) {
        router.replace(`/booking/${bookingId}`);
      } else {
        router.replace("/");
      }
    }
  }, [travelers, bookingId, router, isRouting, isHydratingTravelers]);

  useEffect(() => {
    if (searchId && offerId) return;

    const context = restoreBookingSearchContext(bookingId);
    if (context) {
      setOrder(context);
    }
  }, [bookingId, searchId, offerId, setOrder]);

  useEffect(() => {
    async function loadSeatMaps() {
      setIsSeatMapsLoading(true);
      setBookingError(null);

      try {
        const data = await getSeatmap(searchId!, offerId!);

        if (data.unavailable) {
          setSeatMapUnavailable(true);
          setSeatMaps([]);
          return;
        }

        setSeatMapUnavailable(false);
        setSeatMaps(data.seatMaps ?? []);
      } catch {
        setSeatMapUnavailable(true);
        setSeatMaps([]);
      } finally {
        setIsSeatMapsLoading(false);
      }
    }

    if (searchId && offerId) {
      loadSeatMaps();
      return;
    }

    setIsSeatMapsLoading(false);
  }, [searchId, offerId]);

  useEffect(() => {
    if (!seatableTravelerIndexes.length) return;
    if (activeSeatableIndex > seatableTravelerIndexes.length - 1) {
      setActiveSeatableIndex(0);
    }
  }, [seatableTravelerIndexes, activeSeatableIndex]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const applyPricingQuote = useCallback(
    (response: Awaited<ReturnType<typeof fetchFlightPricing>>) => {
      const nextPricing = mapPricingResponseToState(
        response,
        pricingCurrency,
      );
      const nextFlight = mapPricingResponseToFlight(response, pricingCurrency);

      setPricing(nextPricing);
      setFlight(nextFlight);
      saveBookingPricing(bookingId, nextPricing);
      saveBookingFlight(bookingId, nextFlight);
      setPricingError(null);
      return nextPricing;
    },
    [bookingId, pricingCurrency, setPricing, setFlight],
  );

  useEffect(() => {
    if (
      currencySyncDoneRef.current ||
      !searchId ||
      !offerId ||
      isHydratingPricing ||
      !pricing
    ) {
      return;
    }

    const currentCurrency = toCurrencyCode(pricing.currency ?? searchCurrency);
    if (isPaymentProviderCurrencyCompatible(paymentProvider, currentCurrency)) {
      currencySyncDoneRef.current = true;
      return;
    }

    currencySyncDoneRef.current = true;
    const targetCurrency = currencyForPaymentProvider(paymentProvider, currentCurrency);

    if (targetCurrency !== searchCurrency) {
      setCurrency(targetCurrency);
    }

    const seatsPayload = buildSeatsPayload(travelers, seatMaps, assignedSeats);

    void (async () => {
      try {
        setIsRecalculating(true);
        setPricingError(null);
        const data = await fetchFlightPricing(searchId, offerId, {
          seats: seatsPayload.length > 0 ? seatsPayload : undefined,
          currencyCode: targetCurrency,
        });
        applyPricingQuote(data);
      } catch (error) {
        setPricingError(
          error instanceof Error ? error.message : t("failedUpdatePrice"),
        );
      } finally {
        setIsRecalculating(false);
      }
    })();
  }, [
    applyPricingQuote,
    assignedSeats,
    isHydratingPricing,
    offerId,
    paymentProvider,
    pricing,
    searchCurrency,
    searchId,
    seatMaps,
    t,
    travelers,
  ]);

  const recalculatePrice = useCallback(
    async (nextAssignedSeats: AssignedSeats, maps: SeatMapSegment[]) => {
      const seatsPayload = buildSeatsPayload(travelers, maps, nextAssignedSeats);

      if (!seatsPayload.length) {
        return;
      }

      const requestId = ++pricingRequestIdRef.current;

      try {
        setIsRecalculating(true);
        setPricingError(null);

        const data = await fetchFlightPricing(searchId!, offerId!, {
          seats: seatsPayload,
          currencyCode: searchCurrency,
        });

        if (requestId !== pricingRequestIdRef.current) {
          return;
        }

        applyPricingQuote(data);
      } catch (error) {
        if (requestId !== pricingRequestIdRef.current) {
          return;
        }

        setPricingError(
          error instanceof Error
            ? error.message
            : t("failedUpdatePrice"),
        );
      } finally {
        if (requestId === pricingRequestIdRef.current) {
          setIsRecalculating(false);
        }
      }
    },
    [travelers, searchId, offerId, applyPricingQuote],
  );

  const handlePaymentProviderChange = useCallback(
    async (provider: PaymentProviderCode) => {
      if (!searchId || !offerId || provider === paymentProvider || isRecalculating) {
        return;
      }

      const nextCurrency = currencyForPaymentProvider(provider, searchCurrency);
      setPaymentProvider(provider);

      if (nextCurrency !== searchCurrency) {
        setCurrency(nextCurrency);
      }

      const seatsPayload = buildSeatsPayload(travelers, seatMaps, assignedSeats);

      try {
        setIsRecalculating(true);
        setPricingError(null);

        const data = await fetchFlightPricing(searchId, offerId, {
          seats: seatsPayload.length > 0 ? seatsPayload : undefined,
          currencyCode: nextCurrency,
        });

        applyPricingQuote(data);
      } catch (error) {
        setPricingError(
          error instanceof Error
            ? error.message
            : t("failedUpdatePrice"),
        );
      } finally {
        setIsRecalculating(false);
      }
    },
    [
      applyPricingQuote,
      assignedSeats,
      isRecalculating,
      offerId,
      paymentProvider,
      searchCurrency,
      searchId,
      seatMaps,
      setPaymentProvider,
      t,
      travelers,
    ],
  );

  function handleSeatSelect(cell: Extract<SeatMapGridCell, { type: "SEAT" }>, segmentId: string) {
    const traveler = travelers[activeTravelerIndex];
    if (!traveler || isLapInfant(traveler)) return;

    const travelerId = traveler.id;

    const newSeats: AssignedSeats = {
      ...assignedSeats,
      [travelerId]: {
        ...(assignedSeats[travelerId] ?? {}),
        [segmentId]: cell.seatNumber,
      },
    };

    setAssignedSeats(newSeats);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      recalculatePrice(newSeats, seatMaps);
    }, 400);

    if (
      activeSeatableIndex < seatableTravelerIndexes.length - 1 &&
      isTravelerFullyAssigned(travelerId, seatMaps, newSeats)
    ) {
      setActiveSeatableIndex((prev) => prev + 1);
    }
  }

  async function handleBooking() {
    if (!bookingId || !searchId || !offerId) {
      setBookingError(
        t("couldNotRestoreSearch"),
      );
      return;
    }

    setIsBooking(true);
    setBookingError(null);
    setPricingError(null);

    const seats = buildSeatsPayload(travelers, seatMaps, assignedSeats);

    try {
      const checkoutCurrency = currencyForPaymentProvider(
        paymentProvider,
        searchCurrency,
      );

      const finalQuote = await fetchFlightPricing(searchId, offerId, {
        seats,
        currencyCode: checkoutCurrency,
      });
      const confirmedPricing = applyPricingQuote(finalQuote);

      if (isPricingQuoteExpired(confirmedPricing)) {
        throw new Error(t("quoteExpiredRetry"));
      }

      const payment = await confirmSeatsAndPay(
        bookingId,
        seats,
        searchId,
        offerId,
        confirmedPricing.quoteId,
        paymentProvider,
      );
      window.location.href = payment.paymentRedirectUrl;
    } catch (error) {
      setBookingError(
        error instanceof Error
          ? error.message
          : t("couldNotProceedPayment"),
      );
    } finally {
      setIsBooking(false);
    }
  }

  const hasSearchContext = Boolean(searchId && offerId);
  const needsSeatSelection = !seatMapUnavailable && seatMaps.length > 0;
  const quoteExpired = isPricingQuoteExpired(pricing);
  const allSeatsSelected =
    !needsSeatSelection ||
    travelers.every((traveler) =>
      isLapInfant(traveler)
        ? true
        : isTravelerFullyAssigned(traveler.id, seatMaps, assignedSeats),
    );
  const canProceedToPayment =
    hasSearchContext &&
    !isSeatMapsLoading &&
    !isHydratingPricing &&
    !quoteExpired &&
    !pricingError &&
    allSeatsSelected;

  const activeTravelerId = travelers[activeTravelerIndex]?.id;

  const selectedSeatsBySegment = useMemo(() => {
    const result: Record<string, string[]> = {};

    for (const map of seatMaps) {
      result[map.segmentId] = travelers
        .map((traveler) => assignedSeats[traveler.id]?.[map.segmentId])
        .filter((seatNumber): seatNumber is string => Boolean(seatNumber));
    }

    return result;
  }, [assignedSeats, seatMaps, travelers]);

  if (isRouting || isHydratingTravelers) {
    return (
      <BookingLayout
        sidebar={
          <div className="bg-white rounded-lg shadow-md border p-6">
            <p className="text-sm text-gray-500">{t("loadingBooking")}</p>
          </div>
        }
      >
        <div className="bg-white rounded-lg shadow-md border p-6">
          <p className="text-gray-500">{t("loadingBooking")}</p>
        </div>
      </BookingLayout>
    );
  }

  if (inactiveReason) {
    return (
      <BookingLayout
        sidebar={
          <div className="bg-white rounded-lg shadow-md border p-6">
            <p className="text-sm text-gray-500">{t("loadingBooking")}</p>
          </div>
        }
      >
        <BookingInactiveView reason={inactiveReason} title={t("seatSelection")} />
      </BookingLayout>
    );
  }

  return (
    <BookingLayout
      scrollableSidebar
      sidebar={
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold">{t("passengers")}</h3>
            </div>

            <div className="space-y-2">
              {travelers.map((traveler, index) => {
                const isActive = index === activeTravelerIndex;
                const travelerSeats = assignedSeats[traveler.id] ?? {};
                const assignedCount = Object.keys(travelerSeats).length;
                const lapInfant = isLapInfant(traveler);

                return (
                  <button
                    key={traveler.id}
                    type="button"
                    onClick={() => {
                      if (lapInfant) return;
                      const seatableIndex = seatableTravelerIndexes.indexOf(index);
                      if (seatableIndex >= 0) {
                        setActiveSeatableIndex(seatableIndex);
                      }
                    }}
                    disabled={lapInfant}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition ${
                      lapInfant
                        ? "border-gray-100 bg-gray-50 opacity-80 cursor-default"
                        : isActive
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {traveler.firstName} {traveler.lastName}
                        </div>

                        <div className="text-sm text-gray-500">
                          {lapInfant ? (
                            <span>{t("noLapSeat")}</span>
                          ) : assignedCount > 0 ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="w-3 h-3" />
                              {seatMaps.length > 1
                                ? t("seatsSelectedOf", {
                                    assigned: assignedCount,
                                    total: seatMaps.length,
                                  })
                                : t("seatsSelected", { count: assignedCount })}
                            </span>
                          ) : (
                            t("noSeatSelected")
                          )}
                        </div>
                      </div>

                      {isActive && !lapInfant ? (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <PriceSidebar
            variant="checkout"
            onContinue={handleBooking}
            disabled={!canProceedToPayment || isBooking}
            isLoading={isBooking}
            isPricingLoading={isRecalculating}
            isInitialLoading={isHydratingPricing}
            pricingError={pricingError}
            buttonLabel={t("proceedToPayment")}
            showPaymentMethod
            paymentProvider={paymentProvider}
            onPaymentProviderChange={handlePaymentProviderChange}
          />
          {!hasSearchContext && !isSeatMapsLoading && (
            <p className="text-sm text-red-600">{t("missingSearchContext")}</p>
          )}
          {bookingError && (
            <p className="text-sm text-red-600">{bookingError}</p>
          )}
          {isRecalculating && (
            <div className="text-sm text-gray-500 sr-only">{t("recalculatingPrice")}</div>
          )}

          <SeatMapLegend />
        </div>
      }
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h1 className="text-3xl font-bold mb-2">{t("seatSelection")}</h1>

          <p className="text-gray-600">
            {t("selectSeatsIntro", { count: seatableTravelerIndexes.length })}
            {lapInfantCount > 0 ? t("lapInfantSuffix", { count: lapInfantCount }) : ""}
            {seatMaps.length > 1 ? t("acrossSegments", { count: seatMaps.length }) : ""}
          </p>

          {travelers[activeTravelerIndex] ? (
            <div className="mt-4 p-3 bg-blue-50 border rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <div className="text-sm">
                {t("selectingSeatFor", {
                  name: `${travelers[activeTravelerIndex]?.firstName ?? ""} ${travelers[activeTravelerIndex]?.lastName ?? ""}`.trim(),
                })}
              </div>
            </div>
          ) : null}
        </div>

          {isSeatMapsLoading && (
            <p className="text-sm text-gray-500 mt-4">{t("loadingSeatMap")}</p>
          )}

          {!isSeatMapsLoading && seatMapUnavailable && (
            <p className="text-sm text-gray-600 mt-4">{t("seatMapUnavailable")}</p>
          )}

          {seatMaps.map((map, mapIndex) => (
          <div
            key={map.segmentId}
            className="bg-white rounded-lg shadow-md border p-8 overflow-x-auto"
          >
            <div className="mb-4">
              <h2 className="text-lg font-semibold">
                {getSeatMapSegmentLabel(map, mapIndex, flight, seatMaps.length, t)}
              </h2>
              <p className="text-sm text-gray-500">
                {t("segmentMeta", {
                  aircraft: map.aircraft,
                  cabin: formatCabinLabel(map.cabin as CabinClass, (key) =>
                    tSearch(key),
                  ),
                })}
              </p>
            </div>

            <SeatMapGrid
              map={map}
              activeTravelerId={activeTravelerId}
              selectedSeatNumbers={selectedSeatsBySegment[map.segmentId] ?? []}
              assignedSeats={assignedSeats}
              travelers={travelers}
              currency={pricingCurrency}
              onSeatSelect={handleSeatSelect}
            />
          </div>
        ))}

        {travelers.some((traveler) => assignedSeats[traveler.id]) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 sm:p-6">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
              <Check className="w-5 h-5" />
              {t("selectedSeats")}
            </h3>

            <div className="space-y-2">
              {travelers.map((traveler) => {
                const travelerSeats = assignedSeats[traveler.id];
                if (!travelerSeats) return null;

                return (
                  <div key={traveler.id} className="space-y-1">
                    <div className="font-medium text-gray-800">
                      {traveler.firstName} {traveler.lastName}
                    </div>
                    {Object.entries(travelerSeats).map(([segmentId, seatNumber]) => (
                      <div
                        key={`${traveler.id}-${segmentId}`}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600">
                          {getSeatMapSegmentLabelById(segmentId, seatMaps, flight, t)}
                        </span>
                        <span className="font-semibold text-green-700 bg-white px-3 py-1 rounded-full">
                          {t("seatLabel", { seat: seatNumber })}
                        </span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </BookingLayout>
  );
}
