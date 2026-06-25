"use client"

import { RotateCcw } from "lucide-react"
import { useState, useEffect } from "react"

export type FiltersState = {
  maxPrice: number
  stops: number[]
  airlines: string[]
  durations: string[]
}

type Props = {
  onChange: (filters: FiltersState) => void
  flightsData?: any
}

export function FilterSidebar({ onChange, flightsData }: Props) {

  const [filters, setFilters] = useState<FiltersState>({
    maxPrice: 0,
    stops: [],
    airlines: [],
    durations: [],
  })

  useEffect(() => {
    if (!flightsData?.filters) return

    setFilters((prev) => ({
      ...prev,
      maxPrice: flightsData.filters.maxPrice,
    }))
  }, [flightsData])

  useEffect(() => {
    onChange(filters)
  }, [filters, onChange])

  function toggleArrayFilter(key: keyof FiltersState, value: string | number) {
    setFilters((prev) => {
      const list = prev[key] as any[]

      return {
        ...prev,
        [key]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      }
    })
  }

  function resetFilters() {
    if (!flightsData?.filters) return

    setFilters({
      maxPrice: flightsData.filters.maxPrice,
      stops: [],
      airlines: [],
      durations: [],
    })
  }

  if (!flightsData?.filters) {
    return (
      <div className="w-full lg:w-80 bg-white rounded-2xl border border-gray-200 p-6">
        Loading filters...
      </div>
    )
  }

  return (
    <div className="w-full lg:w-80 bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
      
      <div className="flex justify-between mb-6">
        <h3 className="font-semibold">Фильтры</h3>
        <button
          className="flex items-center gap-2 text-sm text-blue-600"
          onClick={resetFilters}
        >
          <RotateCcw className="w-4 h-4" />
          Сброс
        </button>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Цена до</h4>
        <input
          type="range"
          min="0"
          max={flightsData.filters.maxPrice}
          value={filters.maxPrice}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              maxPrice: Number(e.target.value),
            }))
          }
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-sm">
          <span>0</span>
          <span>{filters.maxPrice}</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Пересадки</h4>

        {flightsData.filters.stops.map((stop: any) => (
          <label key={stop.stops} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.stops.includes(stop.stops)}
              onChange={() => toggleArrayFilter("stops", stop.stops)}
            />

            {stop.stops === 0
              ? "Без пересадок"
              : `${stop.stops} пересадка(-и)`} ({stop.count})
          </label>
        ))}
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Авиакомпании</h4>

        {flightsData.filters.airlines.map((airline: any) => (
          <label key={airline.name} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.airlines.includes(airline.name)}
              onChange={() => toggleArrayFilter("airlines", airline.name)}
            />

            {airline.name} ({airline.count})
          </label>
        ))}
      </div>

      <div className="mb-6">
        <h4 className="font-medium mb-2">Длительность рейса</h4>

        {["до 5ч", "5–10ч", "10–15ч", "15ч+"].map((d) => (
          <label key={d} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.durations.includes(d)}
              onChange={() => toggleArrayFilter("durations", d)}
            />

            {d}
          </label>
        ))}
      </div>
    </div>
  )
}