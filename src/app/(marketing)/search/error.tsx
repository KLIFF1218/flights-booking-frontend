"use client";

import { useEffect } from "react";
import { SearchError } from "@/features/search/components/SearchError/SearchError";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Search route error:", error);
  }, [error]);

  return (
    <SearchError errorMessage={error.message} onRetry={reset} />
  );
}
