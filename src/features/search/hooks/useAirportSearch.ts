"use client";

import { useEffect, useState } from "react";
import type { AirportLocation } from "@/shared/types/airport";
import { apiFetch } from "@/shared/api/apiClient";

export function useAirportSearch(keyword: string) {
  const [data, setData] = useState<AirportLocation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (keyword.length < 2) {
      setData([]);
      return;
    }

    const controller = new AbortController();

    async function fetchAirports() {
      setLoading(true);

      try {
        const json = await apiFetch<{ data: AirportLocation[] }>(
          `/airports/search?q=${encodeURIComponent(keyword)}`,
          {
            signal: controller.signal,
          },
        );

        setData(json.data ?? []);
      } catch (err) {
        if (!(err instanceof DOMException)) {
          console.error(err);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAirports();

    return () => controller.abort();
  }, [keyword]);

  return { data, loading };
}
