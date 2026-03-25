import { FlightCardResponse } from "./search-response";

export interface SearchFlightsResponse {
  searchId: string;
  flights: FlightCardResponse[];
}

