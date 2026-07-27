"use client";

import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { FormProvider, useForm, useWatch, type Resolver } from "react-hook-form";
import { useBookingStore } from "@/features/booking/store/booking.store";
import { TravelersForm } from "@/features/booking/components/TravelersForm/TravelersForm";
import {
  getBooking,
  confirmTravelers,
  mergeTravelersWithApiIds,
  mergeApiTravelersIntoFormSlots,
  restoreBookingSearchContext,
  type BookingResponse,
} from "@/features/booking/api/booking.api";
import {
  fetchSavedPassengers,
  syncSavedPassengersSafely,
  travelerFormToSavedPassengerInput,
  type SavedPassengerProfile,
} from "@/features/booking/api/saved-passengers.api";
import {
  applyPrimaryProfileToFirstAdult,
  assignDefaultAccompanyingAdults,
  hasTravelersDraftContent,
  savedProfileToTravelerSlot,
  shouldApplySavedProfileAutofill,
} from "@/features/booking/mappers/saved-passenger.mapper";
import {
  loadBookingTravelersDraft,
  loadBookingTravelersConfirmed,
  mergeTravelersWithDraft,
  saveBookingPricing,
  saveBookingFlight,
  saveBookingTravelersConfirmed,
  saveBookingTravelersDraft,
} from "@/features/booking/lib/booking-travelers-draft";

import type { PricedFlight } from "@/shared/types/flight";
import {
  createTravelersFormResolver,
  type TravelerForm,
  type TravelersFormValues,
  type TravelersValidationContext,
} from "@/features/booking/validation/traveler.schema";

import { PriceSidebar } from "@/features/booking/components/PriceSidebar/PriceSidebar";
import BookingLayout from "./BookingLayout";
import { useBookingStatusGuard } from "@/features/booking/hooks/useBookingStatusGuard";
import { BookingInactiveView } from "@/features/booking/components/BookingInactiveView/BookingInactiveView";
import { resolveBookingLoadError } from "@/features/booking/lib/booking-errors";
import { isInternationalItinerary } from "@/shared/utils/flight-route";
import { mapSnapshotPriceToState } from "@/features/booking/lib/pricing.mapper";
import { formatPassengerSummary } from "@/features/search/components/BuySheet/buy-sheet.utils";
import { useLocale } from "next-intl";

function mapTravelerTypeToForm(
  travelerType: string,
): "adult" | "child" | "infant" | "seated_infant" {
  if (travelerType === "CHILD") return "child";
  if (travelerType === "HELD_INFANT") {
    return "infant";
  }
  if (travelerType === "SEATED_INFANT") {
    return "seated_infant";
  }
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

function formatPassengerSummaryFromPricings(
  travelerPricings: Array<{ travelerType: string }>,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
  locale: string,
) {
  return formatPassengerSummary(
    travelerPricings.map((traveler) => ({
      travelerId: "",
      travelerType: traveler.travelerType,
      fareDetailsBySegment: [],
    })),
    t,
    locale,
  );
}

function mapBookingToFlight(
  booking: BookingResponse,
  bookingId: string,
): PricedFlight {
  const offer = booking.snapshot.offer;
  const offerSegments =
    offer?.itineraries?.flatMap((itinerary) => itinerary.segments ?? []) ?? [];
  const segment = offerSegments[0];
  const lastSegment = offerSegments[offerSegments.length - 1];

  if (
    !segment?.departure?.iataCode ||
    !segment?.arrival?.iataCode ||
    !segment.departure.at ||
    !segment.arrival.at
  ) {
    throw new Error("Flight offer not found");
  }

  const segments = offerSegments
    .filter(
      (seg) =>
        seg?.departure?.iataCode &&
        seg?.arrival?.iataCode &&
        seg?.departure?.at &&
        seg?.arrival?.at,
    )
    .map((seg) => ({
      from: seg.departure!.iataCode!,
      to: seg.arrival!.iataCode!,
      departureTime: seg.departure!.at!,
      arrivalTime: seg.arrival!.at!,
      airline: seg.carrierCode ?? "",
      flightNumber: seg.number ?? "",
    }));

  const durationMinutes =
    segment.departure.at && lastSegment?.arrival?.at
      ? Math.max(
          0,
          Math.round(
            (new Date(lastSegment.arrival.at).getTime() -
              new Date(segment.departure.at).getTime()) /
              60000,
          ),
        )
      : 0;

  return {
    id: bookingId,
    outbound: {
      from: segment.departure.iataCode,
      to: segment.arrival.iataCode,
      departureTime: segment.departure.at,
      arrivalTime: segment.arrival.at,
      durationMinutes,
      stops: Math.max(0, segments.length - 1),
      segments,
    },
    travelers: [],
    price: {
      total: Number(booking.totalPrice),
      currency: booking.currency,
      base: Number(booking.totalPrice),
      seats: 0,
    },
  };
}

function mapBookingToPricing(booking: BookingResponse) {
  return mapSnapshotPriceToState(
    booking.snapshot.pricing?.price,
    booking.totalPrice,
    booking.currency,
    booking.snapshot.pricing,
  );
}

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.bookingId as string;
  const t = useTranslations("booking");
  const tBuySheet = useTranslations("buySheet");
  const tValidation = useTranslations("booking.validation");
  const locale = useLocale();

  const { isRouting, inactiveReason } = useBookingStatusGuard(bookingId, "travelers");

  const setFlight = useBookingStore((s) => s.setFlight);
  const setTravelers = useBookingStore((s) => s.setTravelers);
  const setPricing = useBookingStore((s) => s.setPricing);
  const setOrder = useBookingStore((s) => s.setOrder);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileSyncWarning, setProfileSyncWarning] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [bookingLoaded, setBookingLoaded] = useState(false);
  const [passengerSummary, setPassengerSummary] = useState("");
  const [savedProfiles, setSavedProfiles] = useState<SavedPassengerProfile[]>([]);
  const [saveProfilesToAccount, setSaveProfilesToAccount] = useState(true);
  const [isInternationalFlight, setIsInternationalFlight] = useState(true);
  const validationContextRef = useRef<TravelersValidationContext>({
    isInternational: true,
  });
  const draftSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const confirmedTravelersRef = useRef<TravelerForm[] | null>(null);

  const validationTranslatorRef = useRef(tValidation);
  validationTranslatorRef.current = tValidation;

  const travelersResolver = useMemo(
    () =>
      createTravelersFormResolver(
        () => validationContextRef.current,
        () => validationTranslatorRef.current,
      ),
    [],
  );

  const form = useForm<TravelersFormValues>({
    defaultValues: { travelers: [] },
    resolver: travelersResolver as Resolver<TravelersFormValues>,
  });

  const { control, handleSubmit: handleFormSubmit, reset, getValues } = form;

  const watchedTravelers = useWatch<TravelersFormValues>({
    control,
    name: "travelers",
  });

  const travelers = useMemo(
    () => (watchedTravelers ?? []) as TravelerForm[],
    [watchedTravelers],
  );

  useEffect(() => {
    setTravelers(travelers);
  }, [travelers, setTravelers]);

  useEffect(() => {
    if (!bookingLoaded || !bookingId || !travelers.length) return;
    if (!hasTravelersDraftContent(travelers)) return;

    if (draftSaveTimerRef.current) {
      clearTimeout(draftSaveTimerRef.current);
    }

    draftSaveTimerRef.current = setTimeout(() => {
      saveBookingTravelersDraft(bookingId, travelers);
    }, 400);

    return () => {
      if (draftSaveTimerRef.current) {
        clearTimeout(draftSaveTimerRef.current);
      }
    };
  }, [travelers, bookingId, bookingLoaded]);

  const handleSelectSavedProfile = useCallback(
    (travelerIndex: number, profileId: string) => {
      const profile = savedProfiles.find((item) => item.id === profileId);
      if (!profile) return;

      const current = getValues("travelers") ?? [];
      const slot = current[travelerIndex];
      if (!slot) return;

      const next = [...current];
      next[travelerIndex] = savedProfileToTravelerSlot(profile, slot);
      reset({ travelers: next });
      setTravelers(next);
    },
    [savedProfiles, getValues, reset, setTravelers],
  );

  useEffect(() => {
    setBookingLoaded(false);
    setIsPageLoading(true);
    setLoadError(null);
    setError(null);
    setProfileSyncWarning(null);
    confirmedTravelersRef.current = null;
    reset({ travelers: [] });
  }, [bookingId, reset]);

  useEffect(() => {
    if (!bookingId) {
      router.replace("/");
    }
  }, [bookingId, router]);

  useEffect(() => {
    if (isRouting || inactiveReason) {
      return;
    }

    let cancelled = false;

    async function loadBooking() {
      setIsPageLoading(true);
      setLoadError(null);

      try {
        const booking = await getBooking(bookingId);

        const snapshotSearchId = booking.snapshot.searchId;
        const snapshotOfferId =
          booking.snapshot.offerId ?? booking.snapshot.offer?.id;
        const sessionContext = restoreBookingSearchContext(bookingId);
        const storeContext = useBookingStore.getState();

        if (snapshotSearchId && snapshotOfferId) {
          setOrder({ searchId: snapshotSearchId, offerId: snapshotOfferId });
        } else if (sessionContext) {
          setOrder(sessionContext);
        } else if (storeContext.searchId && storeContext.offerId) {
          setOrder({
            searchId: storeContext.searchId,
            offerId: storeContext.offerId,
          });
        }

        const offer = booking.snapshot.offer;
        const travelerPricings = offer?.travelerPricings ?? [];

        if (!travelerPricings.length) {
          throw new Error("Traveler pricing not found in booking snapshot");
        }

        setPassengerSummary(
          formatPassengerSummaryFromPricings(travelerPricings, tBuySheet, locale),
        );

        const offerSegments =
          offer?.itineraries?.flatMap((itinerary) => itinerary.segments ?? []) ??
          [];
        const international = isInternationalItinerary(
          offerSegments
            .filter((segment) => segment?.departure?.iataCode && segment?.arrival?.iataCode)
            .map((segment) => ({
              from: segment.departure!.iataCode!,
              to: segment.arrival!.iataCode!,
            })),
        );
        validationContextRef.current = {
          departureDate: offerSegments[0]?.departure?.at,
          isInternational: international,
        };
        setIsInternationalFlight(international);

        const slots = travelerPricings.map((traveler) =>
          createTravelerForm(mapTravelerTypeToForm(traveler.travelerType)),
        );

        const rawConfirmed = loadBookingTravelersConfirmed(bookingId);
        const confirmed = hasTravelersDraftContent(rawConfirmed)
          ? rawConfirmed
          : null;
        const rawDraft = loadBookingTravelersDraft(bookingId);
        const draft = hasTravelersDraftContent(rawDraft) ? rawDraft : null;
        let travelersWithDraft = mergeTravelersWithDraft(
          slots,
          confirmed ?? draft,
        );

        if (booking.travelers?.length) {
          travelersWithDraft = mergeApiTravelersIntoFormSlots(
            travelersWithDraft,
            booking.travelers,
          );
        }

        let profiles: SavedPassengerProfile[] = [];
        try {
          profiles = await fetchSavedPassengers();
          if (!cancelled) {
            setSavedProfiles(profiles);
          }
        } catch {
          profiles = [];
        }

        if (shouldApplySavedProfileAutofill(travelersWithDraft, draft)) {
          travelersWithDraft = applyPrimaryProfileToFirstAdult(
            travelersWithDraft,
            profiles,
          );
        }

        travelersWithDraft = assignDefaultAccompanyingAdults(travelersWithDraft);

        if (cancelled) return;

        reset({ travelers: travelersWithDraft });
        setTravelers(travelersWithDraft);

        const mappedFlight = mapBookingToFlight(booking, bookingId);
        const pricingState = mapBookingToPricing(booking);

        if (cancelled) return;

        setFlight(mappedFlight);
        saveBookingFlight(bookingId, mappedFlight);
        setPricing(pricingState);
        saveBookingPricing(bookingId, pricingState);

        if (cancelled) return;

        setBookingLoaded(true);
      } catch (loadError) {
        if (cancelled) return;
        console.error("LOAD BOOKING ERROR:", loadError);
        setLoadError(resolveBookingLoadError(loadError, t));
      } finally {
        if (!cancelled) {
          setIsPageLoading(false);
        }
      }
    }

    if (bookingId) {
      loadBooking();
    }

    return () => {
      cancelled = true;
    };
  }, [bookingId, reset, setFlight, setPricing, setOrder, setTravelers, isRouting, inactiveReason, t]);

  const proceedToSeats = useCallback(
    (travelersWithDbIds: TravelerForm[]) => {
      saveBookingTravelersDraft(bookingId, travelersWithDbIds);
      saveBookingTravelersConfirmed(bookingId, travelersWithDbIds);
      setTravelers(travelersWithDbIds);
      reset({ travelers: travelersWithDbIds });
      router.push(`/booking/${bookingId}/seats`);
    },
    [bookingId, reset, router, setTravelers],
  );

  const handleSubmit = handleFormSubmit(async (values) => {
    const submittedTravelers = values.travelers ?? [];
    setError(null);
    setProfileSyncWarning(null);
    setIsSubmitting(true);
    setLoadingMessage(t("savingPassengers"));

    try {
      setTravelers(submittedTravelers);

      const res = await confirmTravelers(bookingId, submittedTravelers);
      const travelersWithDbIds = mergeTravelersWithApiIds(
        submittedTravelers,
        res.travelers,
      );
      confirmedTravelersRef.current = travelersWithDbIds;

      let profileWarning: string | null = null;

      if (saveProfilesToAccount) {
        setLoadingMessage(t("savingPassengersToProfile"));
        try {
          const firstAdultIndex = submittedTravelers.findIndex(
            (t) => t.type === "adult",
          );
          const payload = submittedTravelers
            .map((traveler, index) =>
              travelerFormToSavedPassengerInput(traveler, {
                isPrimary:
                  traveler.type === "adult" && index === firstAdultIndex,
                label:
                  traveler.type === "adult" && index === firstAdultIndex
                    ? t("me")
                    : undefined,
              }),
            )
            .filter(
              (traveler): traveler is NonNullable<typeof traveler> =>
                traveler !== null,
            );

          if (payload.length) {
            const { profiles, syncedCount, failedCount } =
              await syncSavedPassengersSafely(payload);
            setSavedProfiles(profiles);

            if (failedCount > 0) {
              profileWarning = `Saved ${syncedCount} passenger(s) to your profile. Failed to save ${failedCount}.`;
            }
          }
        } catch (syncError) {
          console.warn("Failed to sync saved passengers", syncError);
          profileWarning =
            syncError instanceof Error
              ? t("syncProfileFailedWithMessage", { message: syncError.message })
              : t("syncProfileFailed");
        }
      }

      if (profileWarning) {
        setProfileSyncWarning(profileWarning);
        return;
      }

      proceedToSeats(travelersWithDbIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleContinueAfterProfileWarning = useCallback(() => {
    const travelersWithDbIds = confirmedTravelersRef.current;
    if (!travelersWithDbIds) return;
    proceedToSeats(travelersWithDbIds);
  }, [proceedToSeats]);

  if (isRouting) {
    return (
      <BookingLayout
        sidebar={
          <PriceSidebar
            onContinue={() => {}}
            disabled
            isInitialLoading
          />
        }
      >
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 lg:p-8">
          <p className="text-gray-500">{t("loadingBooking")}</p>
        </div>
      </BookingLayout>
    );
  }

  if (inactiveReason) {
    return (
      <BookingLayout
        sidebar={
          <PriceSidebar
            onContinue={() => {}}
            disabled
            isInitialLoading
          />
        }
      >
        <BookingInactiveView reason={inactiveReason} />
      </BookingLayout>
    );
  }

  return (
    <FormProvider {...form}>
      <BookingLayout
        sidebar={
          <PriceSidebar
            onContinue={handleSubmit}
            disabled={isPageLoading || isSubmitting || Boolean(loadError)}
            isLoading={isSubmitting}
            isInitialLoading={isPageLoading}
          />
        }
      >
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 lg:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("checkout")}
          </h1>

          {isPageLoading && (
            <div className="space-y-4 py-4" aria-busy="true">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-32 bg-gray-100 rounded animate-pulse" />
              <div className="h-32 bg-gray-100 rounded animate-pulse" />
            </div>
          )}

          {loadError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              <p className="mb-3">⚠️ {loadError}</p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-sm font-medium text-red-700 underline hover:text-red-900"
              >
                {t("backToSearch")}
              </button>
            </div>
          )}

          {!isPageLoading && !loadError && (
            <>
          {passengerSummary && (
            <p className="text-sm text-gray-600 mb-6">
              {t("passengerMixFixed", { summary: passengerSummary })}
            </p>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              ⚠️ {error}
            </div>
          )}

          {profileSyncWarning && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg mb-6">
              <p className="mb-3">⚠️ {profileSyncWarning}</p>
              <button
                type="button"
                onClick={handleContinueAfterProfileWarning}
                className="text-sm font-medium text-amber-800 underline hover:text-amber-950"
              >
                {t("continueToSeatSelection")}
              </button>
            </div>
          )}

          <TravelersForm
            travelers={travelers}
            allowDelete={false}
            savedProfiles={savedProfiles}
            onSelectSavedProfile={handleSelectSavedProfile}
            isInternational={isInternationalFlight}
          />

          <label className="mt-6 flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={saveProfilesToAccount}
              onChange={(event) => setSaveProfilesToAccount(event.target.checked)}
              className="rounded border-gray-300"
            />
            {t("savePassengersToAccount")}
          </label>

          {isSubmitting && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mt-6">
              ⏳ {loadingMessage}
            </div>
          )}
            </>
          )}
        </div>
      </BookingLayout>
    </FormProvider>
  );
}
