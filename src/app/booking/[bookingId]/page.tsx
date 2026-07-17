"use client";

import { useRouter, useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBookingStore } from "@/features/booking/store/booking.store";
import { PassengerModal } from "@/features/booking/components/PassengerModal";

import { TravelersForm } from "@/features/booking/components/TravelersForm/TravelersForm";
import {
  getBooking,
  confirmTravelers,
  priceFlight,
} from "@/features/booking/api/booking.api";

import type { PricedFlight } from "@/shared/types/flight";
import {
  storedTravelersSchema,
  travelersFormSchema,
  type TravelerForm,
  type TravelersFormValues,
} from "@/features/booking/validation/traveler.schema";

import { PriceSidebar } from "@/features/booking/components/PriceSidebar/PriceSidebar";
import BookingLayout from "./BookingLayout";

const SAVED_TRAVELERS_KEY = "booking-lastTravelers";

function isMeaningfulTraveler(value: unknown): value is TravelerForm {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const meaningfulFields = [
    "firstName",
    "lastName",
    "email",
    "phoneCountryCode",
    "phoneNumber",
    "passportNumber",
    "passportIssuanceDate",
    "passportExpiry",
    "dateOfBirth",
    "birthPlace",
  ];

  const hasMeaningfulData = meaningfulFields.some((field) => {
    const fieldValue = candidate[field];
    return typeof fieldValue === "string" && fieldValue.trim().length > 0;
  });

  if (!hasMeaningfulData) {
    return false;
  }

  return storedTravelersSchema.safeParse([candidate]).success;
}

function parseStoredTravelers(raw: string | null): TravelerForm[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      console.warn("Saved travelers payload is not an array");
      return null;
    }

    const validTravelers = parsed.filter(isMeaningfulTraveler);

    if (!validTravelers.length) {
      try {
        localStorage.removeItem(SAVED_TRAVELERS_KEY);
      } catch (error) {
        console.error("Failed to clear invalid saved travelers", error);
      }

      return null;
    }

    return validTravelers;
  } catch (error) {
    console.error("Failed to parse saved travelers", error);
    return null;
  }
}

export default function BookingPage() {
  console.log("BookingPage render");
  const router = useRouter();
  const params = useParams();
  const searchId = useBookingStore((s) => s.searchId);
  const offerId = useBookingStore((s) => s.offerId);

  useEffect(() => {
    console.log("BookingPage mounted");

    return () => {
      console.log("BookingPage unmounted");
    };
  }, []);

  const bookingId = params.bookingId as string;
  console.log("bookingId: ", bookingId);

  const [isPassengerModalOpen, setPassengerModalOpen] = useState(false);

  const setFlight = useBookingStore((s) => s.setFlight);
  const setTravelers = useBookingStore((s) => s.setTravelers);
  const setPricing = useBookingStore((s) => s.setPricing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [bookingLoaded, setBookingLoaded] = useState(false);
  const [passengerCountChanged, setPassengerCountChanged] = useState(false);

  const form = useForm<TravelersFormValues>({
    defaultValues: { travelers: [] },
    resolver: zodResolver(travelersFormSchema),
  });
  const {
    control,
    handleSubmit: handleFormSubmit,
    reset,
    setValue,
    getValues,
  } = form;
  const travelers = (useWatch<TravelersFormValues>({
    control,
    name: "travelers",
  }) ?? []) as TravelerForm[];

  useEffect(() => {
    setTravelers(travelers);
  }, [travelers, setTravelers]);

  const travelerCounts = useMemo(() => {
    return {
      adults: travelers.filter((t) => t.type === "adult").length,
      children: travelers.filter((t) => t.type === "child").length,
      infants: travelers.filter((t) => t.type === "infant").length,
    };
  }, [travelers]);

  const travelersRef = useRef<TravelerForm[]>(travelers);
  const [initialized, setInitialized] = useState(false);

  const createTravelerForm = (
    type: "adult" | "child" | "infant",
  ): TravelerForm => ({
    id: crypto.randomUUID(),
    type,
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
  });

  const refreshPrice = useCallback(
    async (currentTravelers: TravelerForm[]) => {
      if (!searchId || !offerId) {
        console.log("Pricing skipped: searchId or offerId missing");
        return;
      }

      if (!currentTravelers.length) {
        console.log("Pricing skipped: no travelers");
        return;
      }

      try {
        const priced = (await priceFlight(
          searchId,
          offerId,
          currentTravelers,
        )) as unknown as PricedFlight;

        setFlight(priced);

        setPricing({
          baseTotal: priced.price.base ?? 0,
          seatsTotal: priced.price.seats ?? 0,
          finalTotal: priced.price.total ?? 0,
          currency: priced.price.currency,
        });
      } catch (e) {
        console.error("Pricing failed", e);
      }
    },
    [searchId, offerId, setFlight, setPricing],
  );

  const handleDeletePassenger = useCallback(
    (passengerId: string) => {
      const currentTravelers = getValues("travelers") ?? [];
      const passenger = currentTravelers.find((p) => p.id === passengerId);
      if (!passenger) return;

      if (currentTravelers[0]?.id === passengerId) return;

      const adults = currentTravelers.filter((p) => p.type === "adult");
      const hasChildrenOrInfants = currentTravelers.some(
        (p) => p.type === "child" || p.type === "infant",
      );

      if (
        passenger.type === "adult" &&
        adults.length === 1 &&
        hasChildrenOrInfants
      ) {
        return;
      }

      const updated = currentTravelers.filter((p) => p.id !== passengerId);
      setValue("travelers", updated);
      setPassengerCountChanged(true);
    },
    [getValues, setValue],
  );

  const handleAddPassengers = useCallback(
    (adults: number, children: number, infants: number) => {
      const newPassengers: TravelerForm[] = [];

      function createTraveler(
        type: "adult" | "child" | "infant",
        index: number,
      ): TravelerForm {
        return {
          id: `${type}-${Date.now()}-${index}`,
          type,
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

      for (let i = 0; i < adults; i++)
        newPassengers.push(createTraveler("adult", i));

      for (let i = 0; i < children; i++)
        newPassengers.push(createTraveler("child", i));

      for (let i = 0; i < infants; i++)
        newPassengers.push(createTraveler("infant", i));

      const currentTravelers = getValues("travelers") ?? [];
      setValue("travelers", [...currentTravelers, ...newPassengers]);
      setPassengerCountChanged(true);

      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    },
    [getValues, setValue],
  );

  useEffect(() => {
    travelersRef.current = travelers;
  }, [travelers]);

  useEffect(() => {
    if (!bookingLoaded) return;

    if (!passengerCountChanged) return;

    refreshPrice(travelersRef.current);
  }, [
    bookingLoaded,
    passengerCountChanged,
    travelerCounts.adults,
    travelerCounts.children,
    travelerCounts.infants,
    refreshPrice,
  ]);

  const handleLoadSavedTravelers = useCallback(() => {
    const parsedTravelers = parseStoredTravelers(
      localStorage.getItem(SAVED_TRAVELERS_KEY),
    );

    if (!parsedTravelers?.length) return;

    reset({ travelers: parsedTravelers });
    setTravelers(parsedTravelers);
  }, [reset, setTravelers]);

  useEffect(() => {
    const parsedTravelers = parseStoredTravelers(
      localStorage.getItem(SAVED_TRAVELERS_KEY),
    );

    if (!parsedTravelers?.length) {
      setInitialized(true);
      return;
    }

    const hasRealData = parsedTravelers.some(
      (t) => t.firstName || t.lastName || t.passportNumber || t.email,
    );

    if (hasRealData) {
      reset({ travelers: parsedTravelers });
      setTravelers(parsedTravelers);
    }

    setInitialized(true);
  }, [reset, setTravelers]);

  useEffect(() => {
    if (!initialized) return;

    if (!travelers.length) return;

    const formValidationResult = travelersFormSchema.safeParse({ travelers });
    if (!formValidationResult.success) {
      return;
    }

    try {
      localStorage.setItem(SAVED_TRAVELERS_KEY, JSON.stringify(travelers));
    } catch (error) {
      console.error("Failed to save travelers", error);
    }
  }, [travelers, initialized]);

  useEffect(() => {
    if (!bookingId) {
      console.log("возрат на главную");
      router.replace("/");
    }
  }, [bookingId, router]);

  useEffect(() => {
    async function loadBooking() {
      try {
        console.log("Загрузка брони ", bookingId);

        const booking = (await getBooking(bookingId)) as unknown as {
          totalPrice: string;
          currency: string;
          snapshot: {
            flightOffers?: Array<{
              itineraries?: Array<{
                segments?: Array<{
                  departure: { iataCode: string; at: string };
                  arrival: { iataCode: string; at: string };
                  carrierCode: string;
                  number: string;
                }>;
              }>;
            }>;
            travelers?: Array<Record<string, unknown>>;
          };
        };

        console.log("BOOKING:", booking);

        const offer = booking.snapshot.offer;

        const travelerPricings = offer?.travelerPricings ?? [];

        console.log("travelerPricings", travelerPricings);

        if (!travelerPricings.length) {
          return;
        }

        const mappedTravelers = travelerPricings.map((traveler) => {
          const travelerType = traveler.travelerType;

          if (travelerType === "CHILD") {
            return createTravelerForm("child");
          }

          if (
            travelerType === "HELD_INFANT" ||
            travelerType === "SEATED_INFANT"
          ) {
            return createTravelerForm("infant");
          }

          return createTravelerForm("adult");
        });

        reset({ travelers: mappedTravelers });
        setTravelers(mappedTravelers);

        if (!offer) {
          throw new Error("Flight offer not found");
        }

        if (!offer) {
          throw new Error("Flight offer not found");
        }

        const itinerary = offer.itineraries?.[0];
        const segment = itinerary?.segments?.[0];

        if (!segment) {
          throw new Error("Segment not found");
        }

        const segments =
          itinerary.segments?.map((segment) => ({
            from: segment.departure.iataCode,
            to: segment.arrival.iataCode,
            departureTime: segment.departure.at,
            arrivalTime: segment.arrival.at,
            airline: segment.carrierCode,
            flightNumber: segment.number,
          })) ?? [];

        const mappedFlight = {
          id: bookingId,
          outbound: {
            from: segment.departure.iataCode,
            to: segment.arrival.iataCode,
            departureTime: segment.departure.at,
            arrivalTime: segment.arrival.at,
            durationMinutes: 0,
            stops: segments.length - 1,
            segments,
          },
          travelers: [],
          price: {
            total: Number(booking.totalPrice),
            currency: booking.currency,
            base: Number(booking.totalPrice),
            seats: 0,
          },
        } as unknown as PricedFlight;

        setFlight(mappedFlight);

        setPricing({
          baseTotal: Number(booking.totalPrice) ?? 0,
          seatsTotal: 0,
          finalTotal: Number(booking.totalPrice) ?? 0,
          currency: booking.currency,
        });

        setBookingLoaded(true);
        setPassengerCountChanged(false);
      } catch (error) {
        console.error("LOAD BOOKING ERROR:", error);

        router.replace("/");
      }
    }

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId, reset, setFlight, setPricing, router]);

  const handleSubmit = handleFormSubmit(async (values) => {
    const travelers = values.travelers ?? [];
    setError(null);

    setIsLoading(true);

    setLoadingMessage("Сохраняем пассажиров...");

    try {
      setTravelers(travelers);

      const formValidationResult = travelersFormSchema.safeParse({ travelers });
      if (formValidationResult.success) {
        localStorage.setItem(SAVED_TRAVELERS_KEY, JSON.stringify(travelers));
      }

      const res = (await confirmTravelers(bookingId, travelers)) as unknown as {
        travelers: TravelerForm[];
      };

      setTravelers(res.travelers);
      reset({ travelers: res.travelers });
      router.push(`/booking/${bookingId}/seats`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setIsLoading(false);
    }
  });

  const existingAdults = travelers.filter((t) => t.type === "adult").length;

  return (
    <FormProvider {...form}>
      <BookingLayout
        sidebar={
          <PriceSidebar
            onContinue={handleSubmit}
            disabled={isLoading}
            isLoading={isLoading}
          />
        }
      >
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 lg:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Оформление бронирования
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
              ⚠️ {error}
            </div>
          )}

          <TravelersForm
            travelers={travelers}
            onDeletePassenger={handleDeletePassenger}
          />

          <button
            onClick={() => setPassengerModalOpen(true)}
            className="mt-6 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Добавить пассажиров
          </button>

          <button
            type="button"
            onClick={handleLoadSavedTravelers}
            className="mt-4 w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Загрузить сохранённые данные пассажиров
          </button>

          {isLoading && (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mt-6">
              ⏳ {loadingMessage}
            </div>
          )}
        </div>

        <PassengerModal
          key={isPassengerModalOpen ? "open" : "closed"}
          isOpen={isPassengerModalOpen}
          onClose={() => setPassengerModalOpen(false)}
          onConfirm={handleAddPassengers}
          existingAdults={existingAdults}
        />
      </BookingLayout>
    </FormProvider>
  );
}
