"use client";

import { useEffect, useState } from "react";
import {
  Plane,
  Calendar,
  DollarSign,
  PlaneTakeoff,
} from "lucide-react";

import { Label } from "./ui/label";
import { Input } from "./ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import { Card, CardContent } from "./ui/card";

import { apiFetch } from "@/shared/api/apiClient";
import { AirportCombobox } from "./AirportCombobox";

interface FlightFormProps {
  onFormChange: (data: FlightFormData) => void;
}

export interface FlightFormData {
  fromAirportId: string;
  toAirportId: string;
  airlineId: string;
  flightNumber: string;
  durationMinutes: string;
  aircraftId: string;
  departureDate: string;
  departureTime: string;
  basePrice: string;
  currency: string;
}

type Aircraft = {
  id: string;
  code: string;
  name?: string;
};

type Airline = {
  id: string;
  name: string;
  iataCode?: string;
};

export function FlightForm({ onFormChange }: FlightFormProps) {
  const [formData, setFormData] = useState<FlightFormData>({
    fromAirportId: "",
    toAirportId: "",
    airlineId: "",
    flightNumber: "",
    durationMinutes: "",
    aircraftId: "",
    departureDate: "",
    departureTime: "",
    basePrice: "",
    currency: "EUR",
  });

  const [aircrafts, setAircrafts] = useState<Aircraft[]>([]);
  const [airlines, setAirlines] = useState<Airline[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch("/aircrafts")
      .then(setAircrafts)
      .catch(console.error);
    apiFetch("/airlines")
      .then(setAirlines)
      .catch(console.error);
  }, []);

  useEffect(() => {
    onFormChange(formData);
  }, [formData, onFormChange]);

  const updateField = (
    field: keyof FlightFormData,
    value: string,
  ) => {
    const newData = {
      ...formData,
      [field]: value,
    };

    setFormData(newData);

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateField = (field: keyof FlightFormData) => {
    const newErrors = { ...errors };

    if (field === "departureDate" && formData.departureDate) {
      const selectedDate = new Date(formData.departureDate);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.departureDate =
          "Cannot select a past date";
      } else {
        delete newErrors.departureDate;
      }
    }

    if (field === "basePrice") {
      if (
        formData.basePrice &&
        parseFloat(formData.basePrice) <= 0
      ) {
        newErrors.basePrice =
          "Price must be greater than 0";
      } else {
        delete newErrors.basePrice;
      }
    }

    setErrors(newErrors);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <Plane className="h-5 w-5 text-indigo-600" />
            </div>

            <div className="flex-1 space-y-3">
              <Label className="text-sm font-medium text-gray-900">
                Route
              </Label>

              <div className="grid grid-cols-2 gap-3">
                <AirportCombobox
                  value={formData.fromAirportId}
                  onChange={(v) =>
                    updateField("fromAirportId", v)
                  }
                  placeholder="From airport"
                />

                <AirportCombobox
                  value={formData.toAirportId}
                  onChange={(v) =>
                    updateField("toAirportId", v)
                  }
                  placeholder="To airport"
                />
              </div>

              <p className="text-xs text-gray-500">
                Start typing to search airports
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
              <Plane className="h-5 w-5 text-indigo-600" />
            </div>

            <div className="flex-1 space-y-3">
              <Label className="text-sm font-medium text-gray-900">
                Flight Details
              </Label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">Airline</Label>
                  <Select
                    value={formData.airlineId}
                    onValueChange={(v) => updateField("airlineId", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select airline" />
                    </SelectTrigger>
                    <SelectContent>
                      {airlines.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.name} {a.iataCode ? `(${a.iataCode})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-gray-600">Flight Number</Label>
                  <Input
                    value={formData.flightNumber}
                    onChange={(e) => updateField("flightNumber", e.target.value)}
                    placeholder="e.g. SU123"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-gray-600">Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.durationMinutes}
                  onChange={(e) => updateField("durationMinutes", e.target.value)}
                  placeholder="e.g. 120"
                  className="mt-1"
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
              <PlaneTakeoff className="h-5 w-5 text-indigo-600" />
            </div>

            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-900">
                Aircraft
              </Label>

              <Select
                value={formData.aircraftId}
                onValueChange={(v) =>
                  updateField("aircraftId", v)
                }
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select aircraft" />
                </SelectTrigger>

                <SelectContent>
                  {aircrafts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.code} {a.name || ""}
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
                Departure
              </Label>

              <div className="mt-2 grid grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) =>
                    updateField(
                      "departureDate",
                      e.target.value,
                    )
                  }
                  onBlur={() =>
                    validateField("departureDate")
                  }
                  className={
                    errors.departureDate
                      ? "border-red-500"
                      : ""
                  }
                />

                <Input
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) =>
                    updateField(
                      "departureTime",
                      e.target.value,
                    )
                  }
                />
              </div>

              {errors.departureDate && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.departureDate}
                </p>
              )}
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

            <div className="flex-1">
              <Label className="text-sm font-medium text-gray-900">
                Base Price
              </Label>

              <div className="mt-2 grid grid-cols-[1fr_140px] gap-3">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) =>
                    updateField(
                      "basePrice",
                      e.target.value,
                    )
                  }
                  onBlur={() =>
                    validateField("basePrice")
                  }
                  className={
                    errors.basePrice
                      ? "border-red-500"
                      : ""
                  }
                />

                <Select
                  value={formData.currency}
                  onValueChange={(v) =>
                    updateField("currency", v)
                  }
                >
                  <SelectTrigger>
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
              </div>

              {errors.basePrice && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.basePrice}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}