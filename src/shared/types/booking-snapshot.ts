export interface BookingSnapshotPrice {
  base?: number;
  taxes?: number;
  fees?: number;
  seats?: number;
  total?: number;
  currency?: string;
}

export interface BookingSnapshotSegment {
  id?: string;
  number?: string;
  carrierCode?: string;
  airline?: string;
  airlineName?: string;
  airlineIata?: string;
  departure?: {
    at?: string;
    iataCode?: string;
  };
  arrival?: {
    at?: string;
    iataCode?: string;
  };
}

export interface BookingSnapshotTravelerPricing {
  travelerType: string;
}

export interface BookingSnapshot {
  offer?: {
    id?: string;
    travelerPricings?: BookingSnapshotTravelerPricing[];
    itineraries?: Array<{
      segments?: BookingSnapshotSegment[];
    }>;
  };
  flightOffers?: Array<{
    id?: string;
    itineraries?: Array<{
      segments?: BookingSnapshotSegment[];
    }>;
  }>;
  pricing?: {
    quoteId?: string;
    quotedAt?: string;
    expiresAt?: string;
    price?: BookingSnapshotPrice;
    travelers?: Array<{
      travelerId?: string;
      fareDetailsBySegment?: Array<{ cabin?: string }>;
    }>;
  };
  travelers?: Array<{ id?: string }>;
  searchId?: string;
  offerId?: string;
  paymentProvider?: string;
}
