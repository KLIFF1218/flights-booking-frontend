"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/shared/api/apiClient";

type Airport = {
  id: string;
  name: string;
  city: string | null;
  iataCode: string | null;
};

type Props = {
  value: string;
  onChange: (id: string) => void;
  placeholder: string;
};

export function AirportCombobox({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Airport[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await apiFetch(`/airports/search?q=${query}`);
        setResults(res.data);
        setOpen(true);
      } catch (e) {
        console.error(e);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelect = (airport: Airport) => {
    onChange(airport.id);
    setQuery(`${airport.city || airport.name} (${airport.iataCode || "—"})`);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
      />

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded shadow">
          {results.map((a) => (
            <div
              key={a.id}
              onClick={() => handleSelect(a)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {a.city || a.name} ({a.iataCode || "—"})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
