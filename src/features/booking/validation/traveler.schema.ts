import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver } from "react-hook-form";
import {
  validationMessage,
  type ValidationTranslator,
} from "@/features/booking/validation/traveler-validation-i18n";

export function isInfantFormType(type: string) {
  return type === "infant" || type === "seated_infant";
}

const optionalLatinString = z.string().trim().default("");

function parseLocalDate(value: string): Date | null {
  const normalized = value.trim().slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

const isValidDateString = (value: string) => parseLocalDate(value) !== null;

const isPastOrPresentDate = (value: string, referenceDate = new Date()) => {
  const date = parseLocalDate(value);
  if (!date) return false;

  const reference = new Date(referenceDate);
  reference.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date <= reference;
};

const isTodayOrFutureDate = (value: string, referenceDate = new Date()) => {
  const date = parseLocalDate(value);
  if (!date) return false;

  const reference = new Date(referenceDate);
  reference.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date >= reference;
};

const ageInYears = (birthDate: Date, referenceDate: Date) => {
  let years = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  const dayDiff = referenceDate.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years -= 1;
  }

  return years;
};

function resolveReferenceDate(referenceDate?: string): Date {
  if (!referenceDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  return parseLocalDate(referenceDate) ?? new Date(referenceDate);
}

type TravelerSchemaOptions = {
  referenceDate?: string;
  isInternational?: boolean;
};

function buildTravelerSchema(
  options: TravelerSchemaOptions = {},
  t?: ValidationTranslator,
) {
  const reference = resolveReferenceDate(options.referenceDate);
  const isInternational = options.isInternational ?? true;
  const m = (key: Parameters<typeof validationMessage>[1]) =>
    validationMessage(t, key);

  const requiredString = (message: string) =>
    z
      .string()
      .trim()
      .min(1, message)
      .regex(/^[A-Za-z -]+$/, {
        message: m("latinOnly"),
      });

  const passportNumberSchema = z
    .string()
    .trim()
    .min(5, m("passportMin"))
    .max(20, m("passportMax"))
    .regex(/^[A-Za-z0-9]+$/, {
      message: m("passportFormat"),
    });

  return z
    .object({
      id: z.string().trim().min(1, m("idRequired")),
      type: z.enum(["adult", "child", "infant", "seated_infant"]),
      accompanyingAdultId: z.string().trim().optional(),
      firstName: requiredString(m("firstNameRequired")),
      lastName: requiredString(m("lastNameRequired")),
      gender: z.enum(["MALE", "FEMALE"], { message: m("selectGender") }),
      dateOfBirth: z
        .string()
        .trim()
        .min(1, m("dobRequired"))
        .refine(isValidDateString, {
          message: m("dobInvalid"),
        })
        .refine((value) => isPastOrPresentDate(value, reference), {
          message: m("dobFuture"),
        }),
      email: z.string().trim().default(""),
      phoneCountryCode: z.string().trim().default(""),
      phoneNumber: z.string().trim().default(""),
      passportNumber: optionalLatinString,
      passportIssuanceDate: optionalLatinString,
      passportExpiry: optionalLatinString,
      birthPlace: optionalLatinString,
      nationality: z.enum(["RU", "UA", "KZ", "BY"]).default("RU"),
    })
    .superRefine((traveler, ctx) => {
      const birthDate = parseLocalDate(traveler.dateOfBirth);
      const infant = isInfantFormType(traveler.type);

      if (birthDate) {
        const age = ageInYears(birthDate, reference);

        if (traveler.type === "adult" && age < 12) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["dateOfBirth"],
            message: m("adultMinAge"),
          });
        }

        if (traveler.type === "child" && (age < 2 || age > 11)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["dateOfBirth"],
            message: m("childAgeRange"),
          });
        }

        if (infant && age >= 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["dateOfBirth"],
            message: m("infantMaxAge"),
          });
        }
      }

      if (infant) {
        if (!traveler.accompanyingAdultId?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["accompanyingAdultId"],
            message: m("selectAccompanyingAdult"),
          });
        }

        if (!isInternational) {
          return;
        }

        if (!traveler.nationality) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["nationality"],
            message: m("nationalityRequired"),
          });
        }

        const passportResult = passportNumberSchema.safeParse(
          traveler.passportNumber,
        );
        if (!passportResult.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["passportNumber"],
            message:
              passportResult.error.issues[0]?.message ??
              m("documentNumberRequired"),
          });
        }

        if (!traveler.passportExpiry.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["passportExpiry"],
            message: m("documentExpiryRequired"),
          });
        } else if (!isValidDateString(traveler.passportExpiry)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["passportExpiry"],
            message: m("dateInvalid"),
          });
        } else if (!isTodayOrFutureDate(traveler.passportExpiry, reference)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["passportExpiry"],
            message: m("documentExpiryBeforeDeparture"),
          });
        }

        return;
      }

      if (!traveler.birthPlace.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["birthPlace"],
          message: m("birthPlaceRequired"),
        });
      } else if (!/^[A-Za-z -]+$/.test(traveler.birthPlace.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["birthPlace"],
          message: m("latinOnly"),
        });
      }

      const passportResult = passportNumberSchema.safeParse(
        traveler.passportNumber,
      );
      if (!passportResult.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["passportNumber"],
          message:
            passportResult.error.issues[0]?.message ??
            m("passportNumberRequired"),
        });
      }

      if (!traveler.passportIssuanceDate.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["passportIssuanceDate"],
          message: m("passportIssueRequired"),
        });
      } else if (!isValidDateString(traveler.passportIssuanceDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["passportIssuanceDate"],
          message: m("passportIssueInvalid"),
        });
      } else if (!isPastOrPresentDate(traveler.passportIssuanceDate, reference)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["passportIssuanceDate"],
          message: m("passportIssueAfterDeparture"),
        });
      }

      if (!traveler.passportExpiry.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["passportExpiry"],
          message: m("passportExpiryRequired"),
        });
      } else if (!isValidDateString(traveler.passportExpiry)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["passportExpiry"],
          message: m("passportExpiryInvalid"),
        });
      } else if (!isTodayOrFutureDate(traveler.passportExpiry, reference)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["passportExpiry"],
          message: m("passportExpiryBeforeDeparture"),
        });
      }

      const issueDate = parseLocalDate(traveler.passportIssuanceDate);
      const expiryDate = parseLocalDate(traveler.passportExpiry);

      if (issueDate && expiryDate && issueDate >= expiryDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["passportExpiry"],
          message: m("passportExpiryBeforeIssue"),
        });
      }
    });
}

export function createTravelersFormSchema(
  referenceDate?: string,
  isInternational = true,
  t?: ValidationTranslator,
) {
  const travelerSchema = buildTravelerSchema(
    { referenceDate, isInternational },
    t,
  );
  const m = (key: Parameters<typeof validationMessage>[1]) =>
    validationMessage(t, key);

  return z
    .object({
      travelers: z.array(travelerSchema).min(1, m("addPassenger")),
    })
    .superRefine((value, ctx) => {
      const travelers = value.travelers;
      const adults = travelers.filter((traveler) => traveler.type === "adult");
      const children = travelers.filter((traveler) => traveler.type === "child");
      const infants = travelers.filter((traveler) =>
        isInfantFormType(traveler.type),
      );

      if (!adults.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["travelers", 0, "type"],
          message: m("adultRequired"),
        });
      }

      if (infants.length > adults.length) {
        travelers.forEach((traveler, index) => {
          if (isInfantFormType(traveler.type)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["travelers", index, "type"],
              message: m("tooManyInfants"),
            });
          }
        });
      }

      if (!adults.length && (children.length || infants.length)) {
        travelers.forEach((traveler, index) => {
          if (traveler.type !== "adult") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["travelers", index, "type"],
              message: m("childWithoutAdult"),
            });
          }
        });
      }

      const passportOwners = new Map<string, number>();
      travelers.forEach((traveler, index) => {
        const passport = traveler.passportNumber.trim().toUpperCase();
        if (!passport || passport.startsWith("INF-")) return;

        const firstIndex = passportOwners.get(passport);
        if (firstIndex !== undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", index, "passportNumber"],
            message: m("passportUnique"),
          });
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", firstIndex, "passportNumber"],
            message: m("passportUnique"),
          });
          return;
        }

        passportOwners.set(passport, index);
      });

      const adultIds = new Set(adults.map((traveler) => traveler.id));
      const accompanimentCount = new Map<string, number>();

      travelers.forEach((traveler, index) => {
        if (!isInfantFormType(traveler.type)) {
          return;
        }

        if (!traveler.accompanyingAdultId?.trim()) {
          return;
        }

        if (!adultIds.has(traveler.accompanyingAdultId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", index, "accompanyingAdultId"],
            message: m("accompanyingAdultNotFound"),
          });
          return;
        }

        const nextCount =
          (accompanimentCount.get(traveler.accompanyingAdultId) ?? 0) + 1;
        if (nextCount > 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", index, "accompanyingAdultId"],
            message: m("oneInfantPerAdult"),
          });
          return;
        }

        accompanimentCount.set(traveler.accompanyingAdultId, nextCount);
      });

      const firstAdultIndex = travelers.findIndex(
        (traveler) => traveler.type === "adult",
      );

      if (firstAdultIndex >= 0) {
        const firstAdult = travelers[firstAdultIndex];

        if (!firstAdult.email.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", firstAdultIndex, "email"],
            message: m("emailRequired"),
          });
        } else if (!z.string().email().safeParse(firstAdult.email).success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", firstAdultIndex, "email"],
            message: m("emailInvalid"),
          });
        }

        if (!firstAdult.phoneCountryCode.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", firstAdultIndex, "phoneCountryCode"],
            message: m("phoneCountryRequired"),
          });
        } else if (!/^\d{1,3}$/.test(firstAdult.phoneCountryCode.trim())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", firstAdultIndex, "phoneCountryCode"],
            message: m("phoneCountryInvalid"),
          });
        }

        if (!firstAdult.phoneNumber.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", firstAdultIndex, "phoneNumber"],
            message: m("phoneRequired"),
          });
        } else if (!/^\d{5,15}$/.test(firstAdult.phoneNumber.trim())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", firstAdultIndex, "phoneNumber"],
            message: m("phoneInvalid"),
          });
        }
      }
    });
}

export type TravelersValidationContext = {
  departureDate?: string;
  isInternational: boolean;
};

export function createTravelersFormResolver(
  getContext: () => TravelersValidationContext,
  getTranslator?: () => ValidationTranslator,
): Resolver<TravelersFormValues> {
  return ((values, context, options) => {
    const { departureDate, isInternational } = getContext();
    const schema = createTravelersFormSchema(
      departureDate,
      isInternational,
      getTranslator?.(),
    );

    return (zodResolver(schema) as Resolver<TravelersFormValues>)(
      values,
      context,
      options,
    );
  }) as Resolver<TravelersFormValues>;
}

export const travelersFormSchema = createTravelersFormSchema();

export const storedTravelersSchema = z.array(buildTravelerSchema());

export type TravelerForm = z.output<ReturnType<typeof buildTravelerSchema>>;
export type TravelersFormValues = z.output<
  ReturnType<typeof createTravelersFormSchema>
>;

export type { ValidationTranslator } from "@/features/booking/validation/traveler-validation-i18n";
