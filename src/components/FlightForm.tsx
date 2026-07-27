"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  DollarSign,
  PlaneTakeoff,
} from "lucide-react";

import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { Card, CardContent } from "./ui/card";

import {
  fetchAircrafts,
  FARE_CLASS_MULTIPLIERS,
  type AdminAircraft,
} from "@/features/flights/api/admin-flights.api";

interface FlightFormProps {
  onFormChange: (data: FlightFormData) => void;
  airlineId?: string | null;
  supportsFirstClass?: boolean;
}

export interface FlightFormData {
  aircraftId: string;
  aircraftLabel: string;
  departureDate: string;
  departureTime: string;
  economyPrice: string;
  premiumEconomyPrice: string;
  businessPrice: string;
  firstPrice: string;
  currency: string;
}

const EMPTY_FORM: FlightFormData = {
  aircraftId: "",
  aircraftLabel: "",
  departureDate: "",
  departureTime: "",
  economyPrice: "",
  premiumEconomyPrice: "",
  businessPrice: "",
  firstPrice: "",
  currency: "USD",
};

function parsePositivePrice(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function FlightForm({
  onFormChange,
  airlineId,
  supportsFirstClass = false,
}: FlightFormProps) {
  const [formData, setFormData] = useState<FlightFormData>(EMPTY_FORM);
  const [aircrafts, setAircrafts] = useState<AdminAircraft[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!airlineId) {
      setAircrafts([]);
      setFormData((prev) => ({
        ...prev,
        aircraftId: "",
        aircraftLabel: "",
      }));
      return;
    }

    let cancelled = false;

    fetchAircrafts(airlineId)
      .then((list) => {
        if (cancelled) return;
        const usable = list.filter((a) => (a.seatsCount ?? 0) > 0);
        setAircrafts(usable);
        setFormData((prev) => {
          if (usable.some((a) => a.id === prev.aircraftId)) {
            return prev;
          }
          return { ...prev, aircraftId: "", aircraftLabel: "" };
        });
      })
      .catch(console.error);

    return () => {
      cancelled = true;
    };
  }, [airlineId]);

  useEffect(() => {
    onFormChange(formData);
  }, [formData, onFormChange]);

  useEffect(() => {
    if (!supportsFirstClass) {
      setFormData((prev) =>
        prev.firstPrice === "" ? prev : { ...prev, firstPrice: "" },
      );
    }
  }, [supportsFirstClass]);

  const updateField = (field: keyof FlightFormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };

      if (field === "aircraftId") {
        const aircraft = aircrafts.find((a) => a.id === value);
        next.aircraftLabel = aircraft
          ? `${aircraft.code}${aircraft.name ? ` · ${aircraft.name}` : ""}`
          : "";
      }

      return next;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validatePriceField = (field: keyof FlightFormData, value: string) => {
    if (value.trim() === "") {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
      return;
    }

    if (parsePositivePrice(value) == null) {
      setErrors((prev) => ({
        ...prev,
        [field]: "Price must be greater than 0",
      }));
    } else {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const fillFromEconomy = () => {
    const economy = parsePositivePrice(formData.economyPrice);
    if (economy == null) {
      setErrors((prev) => ({
        ...prev,
        economyPrice: "Enter a valid Economy price first",
      }));
      return;
    }

    const round = (n: number) => String(Math.round(n * 100) / 100);

    setFormData((prev) => ({
      ...prev,
      premiumEconomyPrice: round(economy * FARE_CLASS_MULTIPLIERS.premiumEconomy),
      businessPrice: round(economy * FARE_CLASS_MULTIPLIERS.business),
      firstPrice: supportsFirstClass
        ? round(economy * FARE_CLASS_MULTIPLIERS.first)
        : "",
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <PlaneTakeoff className="h-5 w-5 text-indigo-600" />
            </div>

            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-900">Aircraft</Label>
              <Select
                value={formData.aircraftId}
                onValueChange={(v) => updateField("aircraftId", v)}
                disabled={!airlineId}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue
                    placeholder={
                      airlineId
                        ? "Select aircraft"
                        : "Select a flight template first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {aircrafts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.code}
                      {a.name ? ` · ${a.name}` : ""}
                      {typeof a.seatsCount === "number"
                        ? ` (${a.seatsCount} seats)`
                        : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <Calendar className="h-5 w-5 text-indigo-600" />
            </div>

            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-900">
                Departure (origin airport local time)
              </Label>

              <div className="mt-2 grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => updateField("departureDate", e.target.value)}
                />
                <Input
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => updateField("departureTime", e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <DollarSign className="h-5 w-5 text-indigo-600" />
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label className="text-sm font-medium text-gray-900">
                  Adult fares by class
                </Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={formData.currency}
                    onValueChange={(v) => updateField("currency", v)}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["EUR", "USD", "RUB"].map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="sm" onClick={fillFromEconomy}>
                    Fill from Economy
                  </Button>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Child and infant prices are calculated automatically from each class adult fare.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(
                  [
                    ["economyPrice", "Economy"],
                    ["premiumEconomyPrice", "Premium Economy"],
                    ["businessPrice", "Business"],
                  ] as const
                ).map(([field, label]) => (
                  <div key={field}>
                    <Label className="text-xs text-gray-600">{label}</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData[field]}
                      onChange={(e) => updateField(field, e.target.value)}
                      onBlur={() => validatePriceField(field, formData[field])}
                      className={`mt-1 ${errors[field] ? "border-red-500" : ""}`}
                    />
                    {errors[field] && (
                      <p className="mt-1 text-sm text-red-500">{errors[field]}</p>
                    )}
                  </div>
                ))}

                {supportsFirstClass && (
                  <div>
                    <Label className="text-xs text-gray-600">First</Label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.firstPrice}
                      onChange={(e) => updateField("firstPrice", e.target.value)}
                      onBlur={() =>
                        validatePriceField("firstPrice", formData.firstPrice)
                      }
                      className={`mt-1 ${errors.firstPrice ? "border-red-500" : ""}`}
                    />
                    {errors.firstPrice && (
                      <p className="mt-1 text-sm text-red-500">{errors.firstPrice}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
