"use client";

import { HeroSearch } from "@/features/search/components/HeroSearch/HeroSearch";
import { SearchResultsClient } from "@/features/search/components/SearchResultsClient/SearchResultsClient";
export default function SearchPage() {
  return (
    <>
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <HeroSearch />
      </div>

      <SearchResultsClient />
    </>
  );
}