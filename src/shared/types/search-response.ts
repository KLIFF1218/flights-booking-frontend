export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type FlightSegment = {
  segmentId: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  departureLocalDate?: string;
  departureLocalTime?: string;
  departureTimezone?: string;
  arrivalLocalDate?: string;
  arrivalLocalTime?: string;
  arrivalTimezone?: string;
  airline: string;
  airlineName?: string;
  airlineIata?: string;
  flightNumber: string;
  aircraft?: string;
  operatingCarrier?: string;
  durationMinutes: number;
};

export type FlightRoute = {
  availableSeats: number;
  from: string;
  to: string;

  departure: {
    airport: string;
    time: string;
    date: string;
    localDate?: string;
    localTime?: string;
    timezone?: string;
  };

  arrival: {
    airport: string;
    time: string;
    date: string;
    localDate?: string;
    localTime?: string;
    timezone?: string;
  };

  durationMinutes: number;
  stops: number;
  stopCodes: string[];
  airline: string;
  airlineIata?: string;
  segments: FlightSegment[];
};

export type FlightCardResponse = {
  offerId: string;
  price: {
    total: number;
    currency: string;
  };
  cabin?: CabinClass;
  checkedBags?: number;
  routes: FlightRoute[];
  totalDurationMinutes: number;
};
