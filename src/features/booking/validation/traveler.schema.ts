import { z } from "zod";

const requiredString = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .regex(/^[A-Za-z -]+$/, {
      message: "Только латинские буквы, пробел и дефис",
    });

const passportNumberSchema = z
  .string()
  .trim()
  .min(5, "Номер паспорта должен содержать минимум 5 символов")
  .max(20, "Номер паспорта должен содержать не более 20 символов")
  .regex(/^[A-Za-z0-9]+$/, {
    message: "Только латинские буквы и цифры без спецсимволов",
  });

const isValidDateString = (value: string) => {
  const date = new Date(value);
  return !!value && !Number.isNaN(date.getTime());
};

const isPastOrPresentDate = (value: string) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date <= new Date();
};

const isTodayOrFutureDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date >= today;
};

const ageInYears = (birthDate: Date, now = new Date()) => {
  let years = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();
  const dayDiff = now.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    years -= 1;
  }

  return years;
};

const travelerSchema = z
  .object({
    id: z.string().trim().min(1, "Идентификатор обязателен"),
    type: z.enum(["adult", "child", "infant"]),
    firstName: requiredString("Имя обязательно"),
    lastName: requiredString("Фамилия обязательна"),
    gender: z.enum(["MALE", "FEMALE"], { message: "Выберите пол" }),
    dateOfBirth: z
      .string()
      .trim()
      .min(1, "Дата рождения обязательна")
      .refine(isValidDateString, {
        message: "Введите корректную дату рождения",
      })
      .refine(isPastOrPresentDate, {
        message: "Дата рождения не может быть в будущем",
      }),
    email: z.string().trim().default(""),
    phoneCountryCode: z.string().trim().default(""),
    phoneNumber: z.string().trim().default(""),
    passportNumber: passportNumberSchema,
    passportIssuanceDate: z
      .string()
      .trim()
      .min(1, "Дата выдачи паспорта обязательна")
      .refine(isValidDateString, {
        message: "Введите корректную дату выдачи паспорта",
      })
      .refine(isPastOrPresentDate, {
        message: "Дата выдачи паспорта не может быть в будущем",
      }),
    passportExpiry: z
      .string()
      .trim()
      .min(1, "Срок действия паспорта обязателен")
      .refine(isValidDateString, {
        message: "Введите корректную дату истечения паспорта",
      })
      .refine(isTodayOrFutureDate, {
        message: "Срок действия паспорта не может быть в прошлом",
      }),
    birthPlace: requiredString("Место рождения обязательно"),
    nationality: z.enum(["RU", "UA", "KZ", "BY"], {
      errorMap: () => ({ message: "Выберите гражданство" }),
    }),
  })
  .superRefine((traveler, ctx) => {
    const birthDate = new Date(traveler.dateOfBirth);

    if (!Number.isNaN(birthDate.getTime())) {
      const age = ageInYears(birthDate);

      if (traveler.type === "adult" && age < 12) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateOfBirth"],
          message:
            "Для взрослого пассажира возраст должен быть не менее 12 лет",
        });
      }

      if (traveler.type === "child" && (age < 2 || age > 11)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateOfBirth"],
          message: "Для ребенка возраст должен быть от 2 до 11 лет",
        });
      }

      if (traveler.type === "infant" && age >= 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["dateOfBirth"],
          message: "Для младенца возраст должен быть меньше 2 лет",
        });
      }
    }

    const issueDate = new Date(traveler.passportIssuanceDate);
    const expiryDate = new Date(traveler.passportExpiry);

    if (
      !Number.isNaN(issueDate.getTime()) &&
      !Number.isNaN(expiryDate.getTime())
    ) {
      if (issueDate >= expiryDate) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["passportExpiry"],
          message: "Срок действия паспорта должен быть позже даты выдачи",
        });
      }
    }
  });

export const travelersFormSchema = z
  .object({
    travelers: z
      .array(travelerSchema)
      .min(1, "Добавьте хотя бы одного пассажира"),
  })
  .superRefine((value, ctx) => {
    const travelers = value.travelers;
    const adults = travelers.filter((traveler) => traveler.type === "adult");
    const children = travelers.filter((traveler) => traveler.type === "child");
    const infants = travelers.filter((traveler) => traveler.type === "infant");

    if (!adults.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["travelers", 0, "type"],
        message: "Должен быть минимум один взрослый пассажир",
      });
    }

    if (infants.length > adults.length) {
      travelers.forEach((traveler, index) => {
        if (traveler.type === "infant") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["travelers", index, "type"],
            message: "Младенцев не может быть больше взрослых",
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
            message: "Ребенок или младенец не может существовать без взрослого",
          });
        }
      });
    }

    const firstAdultIndex = travelers.findIndex(
      (traveler) => traveler.type === "adult",
    );

    if (firstAdultIndex >= 0) {
      const firstAdult = travelers[firstAdultIndex];

      if (!firstAdult.email.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["travelers", firstAdultIndex, "email"],
          message: "Email обязателен для первого взрослого пассажира",
        });
      } else if (!z.string().email().safeParse(firstAdult.email).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["travelers", firstAdultIndex, "email"],
          message: "Введите корректный email",
        });
      }

      if (!firstAdult.phoneCountryCode.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["travelers", firstAdultIndex, "phoneCountryCode"],
          message: "Код страны обязателен для первого взрослого пассажира",
        });
      } else if (!/^\d{1,3}$/.test(firstAdult.phoneCountryCode.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["travelers", firstAdultIndex, "phoneCountryCode"],
          message: "Введите корректный код страны",
        });
      }

      if (!firstAdult.phoneNumber.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["travelers", firstAdultIndex, "phoneNumber"],
          message: "Номер телефона обязателен для первого взрослого пассажира",
        });
      } else if (!/^\d{5,15}$/.test(firstAdult.phoneNumber.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["travelers", firstAdultIndex, "phoneNumber"],
          message: "Введите корректный номер телефона",
        });
      }
    }
  });

export const storedTravelersSchema = z.array(travelerSchema);

export type TravelerForm = z.infer<typeof travelerSchema>;
export type TravelersFormValues = z.infer<typeof travelersFormSchema>;
