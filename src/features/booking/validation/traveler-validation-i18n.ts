export type ValidationTranslator = (key: string) => string;

const EN_MESSAGES = {
  latinOnly: "Latin letters, spaces, and hyphens only",
  passportMin: "Passport number must contain at least 5 characters",
  passportMax: "Passport number must contain at most 20 characters",
  passportFormat: "Latin letters and digits only, no special characters",
  idRequired: "ID is required",
  firstNameRequired: "First name is required",
  lastNameRequired: "Last name is required",
  selectGender: "Select a gender",
  dobRequired: "Date of birth is required",
  dobInvalid: "Enter a valid date of birth",
  dobFuture: "Date of birth cannot be in the future",
  adultMinAge:
    "Adult passengers must be at least 12 years old on the departure date",
  childAgeRange:
    "Child passengers must be between 2 and 11 years old on the departure date",
  infantMaxAge: "Infants must be under 2 years old on the departure date",
  selectAccompanyingAdult: "Select an accompanying adult",
  nationalityRequired: "Nationality is required",
  documentNumberRequired: "Enter the document number",
  documentExpiryRequired: "Document expiry date is required",
  dateInvalid: "Enter a valid date",
  documentExpiryBeforeDeparture:
    "Document expiry date cannot be before the departure date",
  birthPlaceRequired: "Place of birth is required",
  passportNumberRequired: "Enter the passport number",
  passportIssueRequired: "Passport issue date is required",
  passportIssueInvalid: "Enter a valid passport issue date",
  passportIssueAfterDeparture:
    "Passport issue date cannot be after the departure date",
  passportExpiryRequired: "Passport expiry date is required",
  passportExpiryInvalid: "Enter a valid passport expiry date",
  passportExpiryBeforeDeparture:
    "Passport expiry date cannot be before the departure date",
  passportExpiryBeforeIssue:
    "Passport expiry date must be after the issue date",
  addPassenger: "Add at least one passenger",
  adultRequired: "At least one adult passenger is required",
  tooManyInfants: "There cannot be more infants than adults",
  childWithoutAdult: "A child or infant cannot travel without an adult",
  passportUnique: "Passport number must be unique for each passenger",
  accompanyingAdultNotFound:
    "Accompanying adult was not found in the booking",
  oneInfantPerAdult: "An adult can accompany only one infant",
  emailRequired: "Email is required for the first adult passenger",
  emailInvalid: "Enter a valid email",
  phoneCountryRequired:
    "Country code is required for the first adult passenger",
  phoneCountryInvalid: "Enter a valid country code",
  phoneRequired: "Phone number is required for the first adult passenger",
  phoneInvalid: "Enter a valid phone number",
} as const;

export type ValidationMessageKey = keyof typeof EN_MESSAGES;

export function validationMessage(
  t: ValidationTranslator | undefined,
  key: ValidationMessageKey,
): string {
  return t ? t(key) : EN_MESSAGES[key];
}
