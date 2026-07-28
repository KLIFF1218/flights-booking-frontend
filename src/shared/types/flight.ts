export interface Flight {
  id: string;
  origin: string;
  destination: string;
  route: {
    departureTime: string;
    arrivalTime: string;
  };
  price: {
    withoutBaggage: number;
    currency: string;
  };
  baggage: {
    weightKg: number;
  };
}

export interface FlightsSearchResponse {
  searchId: string;
  flights: Flight[];
}

export interface PricedFlight {
  id: string;
  price: {
    total: number;
    currency: string;
    base?: number;
    taxes?: number;
    fees?: number;
    seats?: number;
  };

  travelers: Array<{
    travelerId: string;
    travelerType: string;
    fareDetailsBySegment?: Array<{
      cabin?: string;
      includedCheckedBags?: {
        quantity?: number;
      };
    }>;
  }>;

  outbound: {
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
    durationMinutes: number;
    stops: number;
    segments: Array<{
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
    }>;
  };

  inbound?: PricedFlight["outbound"];
}
