import { FlightFormData } from "./FlightForm";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Plane, Calendar, DollarSign } from "lucide-react";
import type { AdminFlightTemplate } from "@/features/flights/api/admin-flights.api";

interface FlightSummaryProps {
  formData: FlightFormData;
  selectedTemplate?: AdminFlightTemplate | null;
}

function formatMoney(currency: string, value: string) {
  if (!value.trim()) return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${currency} ${n.toFixed(2)}`;
}

export function FlightSummary({ formData, selectedTemplate }: FlightSummaryProps) {
  const getRouteDisplay = () => {
    if (selectedTemplate) {
      return `${selectedTemplate.departureAirport.iataCode} → ${selectedTemplate.arrivalAirport.iataCode}`;
    }
    return "—";
  };

  const getDateTimeDisplay = () => {
    if (!formData.departureDate || !formData.departureTime) return "—";
    const tz = selectedTemplate?.departureAirport.timezone;
    return `${formData.departureDate} ${formData.departureTime}${tz ? ` (${tz})` : ""}`;
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-lg">Flight Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <Plane className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Route</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">
              {getRouteDisplay()}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <Plane className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Flight</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">
              {selectedTemplate?.flightNumber || "—"} ·{" "}
              {formData.aircraftLabel || "—"}
            </p>
            {selectedTemplate && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedTemplate.airline.name} · {selectedTemplate.durationMinutes} min
              </p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Departure (local)</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">
              {getDateTimeDisplay()}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-xs text-gray-500">Adult fares</p>
            <p className="text-sm text-gray-900">
              Economy: {formatMoney(formData.currency, formData.economyPrice)}
            </p>
            <p className="text-sm text-gray-900">
              Premium: {formatMoney(formData.currency, formData.premiumEconomyPrice)}
            </p>
            <p className="text-sm text-gray-900">
              Business: {formatMoney(formData.currency, formData.businessPrice)}
            </p>
            {selectedTemplate?.supportsFirstClass && (
              <p className="text-sm text-gray-900">
                First: {formatMoney(formData.currency, formData.firstPrice)}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
