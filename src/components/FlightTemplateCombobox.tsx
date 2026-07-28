"use client";

import { useEffect, useState } from "react";
import {
  fetchFlightTemplates,
  type AdminFlightTemplate,
} from "@/features/flights/api/admin-flights.api";

type Props = {
  value: AdminFlightTemplate | null;
  onChange: (template: AdminFlightTemplate | null) => void;
};

export function FlightTemplateCombobox({ value, onChange }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminFlightTemplate[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const templates = await fetchFlightTemplates(query);
        setResults(templates);
        setOpen(true);
      } catch (error) {
        console.error(error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const displayValue =
    value != null
      ? `${value.flightNumber} · ${value.departureAirport.iataCode} → ${value.arrivalAirport.iataCode}`
      : query;

  const handleSelect = (template: AdminFlightTemplate) => {
    onChange(template);
    setQuery(
      `${template.flightNumber} · ${template.departureAirport.iataCode} → ${template.arrivalAirport.iataCode}`,
    );
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Search flight template (number, airline, IATA)..."
        value={displayValue}
        onChange={(e) => {
          setQuery(e.target.value);
          if (value) {
            onChange(null);
          }
        }}
        onFocus={() => query.length >= 2 && setOpen(true)}
      />

      {loading && (
        <p className="mt-1 text-xs text-slate-500">Searching templates...</p>
      )}

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-y-auto bg-white border rounded shadow">
          {results.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleSelect(template)}
              className="w-full px-3 py-2 text-left hover:bg-gray-100"
            >
              <div className="font-medium">{template.flightNumber}</div>
              <div className="text-sm text-slate-500">
                {template.airline.name} · {template.departureAirport.iataCode} →{" "}
                {template.arrivalAirport.iataCode} · {template.durationMinutes} min
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
