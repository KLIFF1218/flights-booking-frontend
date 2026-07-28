export type BookingStatus =
  | "PNR_CREATED"
  | "SEATS_SELECTED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "TICKETING"
  | "TICKETED"
  | "CANCELED"
  | "FAILED"
  | "EXPIRED";

export type UserBooking = {
  id: string;
  pnrLocator: string;
  flightOrderId: string;
  status: BookingStatus;
  totalPrice: number;
  currency: string;
  provider: string;
  createdAt: string;
  updatedAt?: string;
  lastTicketingDate: string;
  cabin: string;
  seatNumber?: string | null;
  passengersCount: number;
  user: { firstName: string; lastName: string };
  flight: {
    number: string;
    from: string;
    to: string;
    departureDate: string | null;
    arrivalDate: string | null;
    airline: string;
    departureLocalDate?: string;
    departureLocalTime?: string;
    departureTimezone?: string;
    arrivalLocalDate?: string;
    arrivalLocalTime?: string;
    arrivalTimezone?: string;
  };
  routes?: {
    from: string;
    to: string;
    departureDate: string;
    arrivalDate: string;
    departureLocalDate?: string;
    departureLocalTime?: string;
    departureTimezone?: string;
    arrivalLocalDate?: string;
    arrivalLocalTime?: string;
    arrivalTimezone?: string;
    number: string;
    airline: string;
    stops: number;
  }[];
  travelers: {
    id: string;
    firstName: string;
    lastName: string;
    seatNumber?: string | null;
  }[];
  tickets: {
    id: string;
    travelerId: string;
    ticketNumber: string;
    status: string;
    url?: string;
  }[];
  transaction?: { id: string } | null;
  operationalAlert?: {
    type: "DELAYED" | "CANCELLED";
    message: string;
    delayMinutes: number | null;
  } | null;
};

export type UserBookingsPageResponse = {
  bookings: UserBooking[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type UserBookingsResult = {
  bookings: UserBooking[];
  total: number;
};
