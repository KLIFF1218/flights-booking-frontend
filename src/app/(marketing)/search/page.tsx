import { SearchResultsClient } from "@/features/search/components/SearchResultsClient/SearchResultsClient";
import { notFound } from "next/navigation";
import { buildApiUrl } from "@/shared/api/buildApiUrl";
type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;

  const from = first(params.from);
  const to = first(params.to);
  const dateFrom = first(params.dateFrom);
  const dateTo = first(params.dateTo);
  const adults = first(params.adults);
  const travelClass = first(params.travelClass);

  if (!from || !to || !dateFrom || !adults || !travelClass) {
    return <div />;
  }

  const payload = {
    directions: [{ origin: from, destination: to, dateFrom, dateTo }],
    passengers: {
      adults: Number(adults),
      children: 0,
      infants: 0,
    },
    travelClass,
  };

  const res = await fetch(buildApiUrl("/flights/search"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    notFound();
  }

  const flights = await res.json();

  return (
    <div id="search-results">
      <SearchResultsClient flights={flights} />
    </div>
  );
}
