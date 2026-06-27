import type { TravelerForm } from "@/features/booking/components/TravelersForm/TravelersForm";

export function mapTravelerFormToApi(travelers: TravelerForm[]) {
  return travelers.map((t) => ({
    id: t.id,
    dateOfBirth: t.dateOfBirth,
    gender: t.gender,

    name: {
      firstName: t.firstName.toUpperCase(),
      lastName: t.lastName.toUpperCase(),
    },

    contact: {
      emailAddress: t.email,
    },

    documents: [
      {
        documentType: "PASSPORT",
        number: t.passportNumber,
        expiryDate: t.passportExpiry,
        issuanceCountry: t.nationality,
        nationality: t.nationality,
      },
    ],
  }));
}
