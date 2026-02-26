export type AirportLocation = {
  type: "location";
  subType: "CITY" | "AIRPORT";
  name: string;
  detailedName: string;
  iataCode: string;
  cityName: string;
  countryName: string;
  countryCode: string;
};
