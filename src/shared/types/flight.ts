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
    seats?: number;
  };

  travelers: Array<{
    travelerId: string;
    travelerType: string;
  }>;

  outbound: {
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    durationMinutes: number;
    stops: number;
    segments: Array<{
      from: string;
      to: string;
      departureTime: string;
      arrivalTime: string;
      airline: string;
      flightNumber: string;
    }>;
  };

  inbound?: PricedFlight["outbound"];
}
