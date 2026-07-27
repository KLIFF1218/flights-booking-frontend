"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { HeroSearch } from "@/features/search/components/HeroSearch/HeroSearch";
import { SearchResultsClient } from "@/features/search/components/SearchResultsClient/SearchResultsClient";
import { SearchResultsErrorBoundary } from "@/features/search/components/SearchError/SearchResultsErrorBoundary";

function SearchResultsSection() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <SearchResultsErrorBoundary onReset={reset}>
          <SearchResultsClient />
        </SearchResultsErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}

export function SearchPageClient() {
  const t = useTranslations("search");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Suspense
            fallback={
              <div className="h-[4.5rem] animate-pulse rounded-xl bg-gray-100" />
            }
          >
            <HeroSearch compact />
          </Suspense>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-10 text-center text-slate-500">
            {t("loadingResults")}
          </div>
        }
      >
        <SearchResultsSection />
      </Suspense>
    </div>
  );
}
