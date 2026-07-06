export type PopularDestination = {
  id: string;
  city: string;
  country: string;
  origin: string;
  destination: string;
  image: string;
};

function getDefaultSearchDates() {
  const departure = new Date();
  departure.setDate(departure.getDate() + 14);

  const returnDate = new Date(departure);
  returnDate.setDate(returnDate.getDate() + 7);

  return {
    dateFrom: departure.toISOString().slice(0, 10),
    dateTo: returnDate.toISOString().slice(0, 10),
  };
}

export const popularDestinations: PopularDestination[] = [
  {
    id: "paris",
    city: "Paris",
    country: "France",
    origin: "LED",
    destination: "CDG",
    image: "/destinations/paris.jpg",
  },
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    origin: "LED",
    destination: "NRT",
    image: "/destinations/tokyo.jpg",
  },
  {
    id: "new-york",
    city: "New York",
    country: "USA",
    origin: "LED",
    destination: "JFK",
    image: "/destinations/newyork.jpg",
  },
  {
    id: "london",
    city: "London",
    country: "UK",
    origin: "LED",
    destination: "LHR",
    image: "/destinations/london.jpg",
  },
  {
    id: "dubai",
    city: "Dubai",
    country: "UAE",
    origin: "LED",
    destination: "DXB",
    image: "/destinations/dubai.jpg",
  },
  {
    id: "barcelona",
    city: "Barcelona",
    country: "Spain",
    origin: "LED",
    destination: "BCN",
    image: "/destinations/barcelona.jpg",
  },
];

export function buildSearchUrl(destination: PopularDestination) {
  const { dateFrom, dateTo } = getDefaultSearchDates();

  const params = new URLSearchParams({
    from: destination.origin,
    to: destination.destination,
    dateFrom,
    dateTo,
    adults: "1",
    children: "0",
    infants: "0",
    travelClass: "ECONOMY",
  });

  return `/search?${params.toString()}#search-results`;
}
