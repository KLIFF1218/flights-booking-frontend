import type { Metadata } from "next";

import { SearchPageClient } from "./SearchPage.client";

export const metadata: Metadata = {
  title: "Search results | MaxAirline",
  description: "Search for cheap flights",
};

export default function SearchPage() {
  return <SearchPageClient />;
}
