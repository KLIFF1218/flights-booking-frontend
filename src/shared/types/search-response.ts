export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export type FlightSegment = {
  segmentId: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
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
  };

  arrival: {
    airport: string;
    time: string;
    date: string;
  };

  durationMinutes: number;
  stops: number;
  stopCodes: string[];
  airline: string;
  segments: FlightSegment[];
};

export type FlightCardResponse = {
  offerId: string;
  price: {
    total: number;
    currency: string;
  };
  routes: FlightRoute[];
  totalDurationMinutes: number;
};


